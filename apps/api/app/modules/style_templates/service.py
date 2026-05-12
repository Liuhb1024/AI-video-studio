from __future__ import annotations

import json
import re

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.ai.dmx import AIProviderError, DMXAIProvider
from app.core.config import get_settings
from app.modules.assets.models import Asset
from app.modules.generation.models import GenerateTask
from app.modules.style_templates.models import StyleTemplate
from app.modules.style_templates.schemas import (
    StyleTemplateAnalysisTaskDetail,
    StyleTemplateAnalysisTaskListItem,
    StyleTemplateAnalyzeRequest,
    StyleTemplateCreate,
    StyleTemplateRead,
    StyleTemplateUpdate,
)


LOCKED_TEMPLATE_CATEGORIES = {"角色模板", "场景模板"}


class StyleTemplateService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list(self, query: str | None = None, style_category: str | None = None) -> list[StyleTemplateRead]:
        statement = select(StyleTemplate)
        if style_category:
            statement = statement.where(StyleTemplate.style_category == style_category)
        if query:
            like = f"%{query}%"
            statement = statement.where(
                or_(
                    StyleTemplate.name.ilike(like),
                    StyleTemplate.style_category.ilike(like),
                    StyleTemplate.visual_summary.ilike(like),
                    StyleTemplate.image_prompt_template.ilike(like),
                )
            )
        statement = statement.order_by(StyleTemplate.updated_at.desc(), StyleTemplate.created_at.desc())
        return [StyleTemplateRead.model_validate(item) for item in self.session.scalars(statement).all()]

    def get(self, template_id: str) -> StyleTemplateRead | None:
        template = self.session.get(StyleTemplate, template_id)
        if template is None:
            return None
        return StyleTemplateRead.model_validate(template)

    def list_analysis_tasks(self, template_id: str) -> list[StyleTemplateAnalysisTaskListItem] | None:
        if self.session.get(StyleTemplate, template_id) is None:
            return None
        statement = (
            select(GenerateTask)
            .where(
                GenerateTask.task_type == "style_template_analysis",
                GenerateTask.style_template_id == template_id,
            )
            .order_by(GenerateTask.created_at.desc(), GenerateTask.updated_at.desc())
        )
        return [StyleTemplateAnalysisTaskListItem.model_validate(item) for item in self.session.scalars(statement).all()]

    def get_analysis_task(self, template_id: str, task_id: str) -> StyleTemplateAnalysisTaskDetail | None:
        if self.session.get(StyleTemplate, template_id) is None:
            return None
        statement = select(GenerateTask).where(
            GenerateTask.id == task_id,
            GenerateTask.task_type == "style_template_analysis",
            GenerateTask.style_template_id == template_id,
        )
        task = self.session.scalars(statement).first()
        if task is None:
            return None
        return StyleTemplateAnalysisTaskDetail.model_validate(task)

    def create(self, payload: StyleTemplateCreate) -> StyleTemplateRead:
        template = StyleTemplate(**payload.model_dump())
        self.session.add(template)
        self.session.commit()
        self.session.refresh(template)
        return StyleTemplateRead.model_validate(template)

    def create_from_source_image(
        self,
        *,
        name: str,
        filename: str,
        object_key: str,
        url: str,
        provider: str,
        bucket: str | None,
        region: str | None,
        mime_type: str | None,
        size_bytes: int | None,
        style_category: str | None = None,
    ) -> StyleTemplateRead:
        asset = Asset(
            asset_type="image",
            filename=filename,
            mime_type=mime_type,
            size_bytes=size_bytes,
            provider=provider,
            bucket=bucket,
            region=region,
            object_key=object_key,
            url=url,
            title=name,
            reference_type="style_template_source",
            status="ready",
        )
        self.session.add(asset)
        self.session.flush()

        template = StyleTemplate(
            name=name,
            source_asset_id=asset.id,
            cover_asset_id=asset.id,
            source_image_url=url,
            style_category=style_category,
            visual_summary="等待 AI 识别截图风格后自动填充。",
            image_prompt_template="等待 AI 识别后生成可复用生图风格模板。",
            video_prompt_template="等待 AI 识别后生成可复用生视频风格模板。",
            negative_prompt="低清晰度、脸部崩坏、肢体畸形、服饰错乱、水印、文字乱码",
            analysis_status="pending",
            status="draft",
        )
        self.session.add(template)
        self.session.commit()
        self.session.refresh(template)
        return StyleTemplateRead.model_validate(template)

    def update(self, template_id: str, payload: StyleTemplateUpdate) -> StyleTemplateRead | None:
        template = self.session.get(StyleTemplate, template_id)
        if template is None:
            return None
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(template, key, value)
        self.session.commit()
        self.session.refresh(template)
        return StyleTemplateRead.model_validate(template)

    def analyze(self, template_id: str, payload: StyleTemplateAnalyzeRequest) -> StyleTemplateRead | None:
        template = self.session.get(StyleTemplate, template_id)
        if template is None:
            return None

        prompt = self._build_style_analysis_prompt(template)
        task = GenerateTask(
            task_type="style_template_analysis",
            style_template_id=template.id,
            model_provider=payload.model_provider,
            model_name=payload.model_name,
            model_version=payload.model_version,
            input_asset_ids=[template.source_asset_id] if template.source_asset_id else [],
            prompt_text=prompt,
            input_prompt=prompt,
            params_json={"temperature": payload.temperature},
            input_snapshot_json={
                "style_template": {
                    "id": template.id,
                    "name": template.name,
                    "source_asset_id": template.source_asset_id,
                    "source_image_url": template.source_image_url,
                    "previous_analysis_status": template.analysis_status,
                },
                "vocabulary_version": "style-template-vocab-mvp",
            },
            status="running",
            current_step="analyzing_style_screenshot",
            progress=45,
        )
        self.session.add(task)
        self.session.flush()

        template.analysis_model = payload.model_name
        template.analysis_version = "style-template-vocab-mvp"

        analysis, raw_response, task_status = self._analyze_style_template(template, payload, prompt)
        task.raw_response = raw_response
        task.status = task_status
        if task_status == "failed":
            template.analysis_status = "failed"
            task.current_step = "analysis_failed"
            task.progress = 45
            task.error_code = "STYLE_ANALYSIS_FAILED"
            task.error_message = str(raw_response.get("error") or "风格识别失败")
        else:
            for key, value in analysis.items():
                if key == "style_category" and template.style_category in LOCKED_TEMPLATE_CATEGORIES:
                    continue
                setattr(template, key, value)
            template.analysis_status = "analyzed"
            template.status = "active"
            task.current_step = "completed"
            task.progress = 100
        self.session.commit()
        self.session.refresh(template)
        return StyleTemplateRead.model_validate(template)

    def delete(self, template_id: str) -> bool:
        template = self.session.get(StyleTemplate, template_id)
        if template is None:
            return False
        self.session.delete(template)
        self.session.commit()
        return True

    def _build_style_analysis_prompt(self, template: StyleTemplate) -> str:
        return "\n".join(
            [
                "任务：从上传截图中抽取可复用的 AI 英歌漫剧视觉生产规则。",
                "你不是在描述这张图的剧情，而是在为后续 gpt-image-2 生图、Seedream 角色设定图、Seedance 生视频生成一份可迁移风格模板。",
                f"模板名称：{template.name}",
                f"截图 URL：{template.source_image_url or '未提供'}",
                "请在内部观察以下维度，但最终只输出 JSON：",
                "1. 线条与边缘：轮廓线、描边强度、细节边界、是否厚涂/赛璐璐/写实。",
                "2. 色彩层级：主色、辅助色、点缀色、饱和度、明暗对比、是否适合英歌脸谱和潮绣服饰。",
                "3. 光影方式：主光方向、边缘光、体积光、舞台光、环境光、暗部层次。",
                "4. 构图与镜头：景别、主体位置、低机位/平视/俯拍、前景遮挡、纵深、队列关系。",
                "5. 人物渲染：脸部稳定性、五官处理、服饰纹样、头饰结构、武器/道具边界。",
                "6. 背景处理：祠堂、巷口、鼓阵、舞台、烟雾、建筑纹理等背景如何服务主体。",
                "7. 质感与可控词：适合直接进入 prompt 的材质、清晰度、画面质量、负面约束。",
                "8. 英歌迁移：将该风格迁移到英歌题材时，脸谱、头饰、服饰纹样、双槌/蛇矛、鼓阵队列和战舞身段应如何保持一致。",
                "请只输出 JSON，不要输出 Markdown，不要包裹 ```。",
                "JSON 字段：style_category, visual_summary, line_style, color_palette, lighting_style, composition_style, character_rendering, background_rendering, texture_keywords, yingge_adaptation, image_prompt_template, video_prompt_template, negative_prompt。",
                "字段要求：每个字段都必须是可复用生产语言，不要写“很好看、高级、氛围感强”这类空泛词。",
                "image_prompt_template 必须包含：主体一致性、风格规则、构图规则、光影规则、细节保真、英歌约束和负面风险规避。",
                "video_prompt_template 必须包含：镜头运动、动作节奏、角色一致性、服饰/脸谱稳定、转场约束和画面连续性。",
                "negative_prompt 必须覆盖：低清晰度、脸崩、脸谱错乱、服饰错乱、武器变形、肢体/手指错误、水印、文字乱码、廉价滤镜。",
            ]
        )

    def _build_style_analysis_system_prompt(self) -> str:
        return "\n".join(
            [
                "你是 AI 英歌漫剧视觉导演、风格分析师和 gpt-image-2 提示词工程师。",
                "你必须从截图中提取可复用的视觉风格资产，而不是描述剧情。",
                "输出必须是严格 JSON，字段完整，值必须是中文自然语言短句。",
                "避免空泛词，如高级、好看、震撼。优先给可控视觉词：线条、色彩、光影、构图、人物渲染、背景处理、负面约束。",
                "你要把截图风格抽象成能迁移到英歌角色、分镜关键帧和生视频镜头的生产规则。",
            ]
        )

    def _analyze_style_template(
        self,
        template: StyleTemplate,
        payload: StyleTemplateAnalyzeRequest,
        prompt: str,
    ) -> tuple[dict[str, str], dict, str]:
        if (payload.model_provider or "").lower() == "mock" or payload.model_name.startswith("mock"):
            analysis = self._mock_style_analysis(template)
            return (
                analysis,
                {
                    "mock": True,
                    "analysis": analysis,
                    "message": "显式使用 mock 风格识别，仅用于本地开发和测试。",
                },
                "mock_completed",
            )

        settings = get_settings()
        if settings.ai_provider.lower() == "dmx" and settings.dmx_api_key and template.source_image_url:
            provider = DMXAIProvider(
                api_key=settings.dmx_api_key,
                base_url=settings.dmx_base_url,
                default_model=payload.model_name,
                timeout_seconds=settings.dmx_timeout_seconds,
            )
            try:
                content = provider.analyze_image(
                    template.source_image_url,
                    prompt,
                    system_prompt=self._build_style_analysis_system_prompt(),
                    temperature=payload.temperature,
                    model=payload.model_name,
                )
                analysis = self._parse_style_analysis_json(content)
                return analysis, {"mock": False, "content": content, "analysis": analysis}, "completed"
            except Exception as exc:
                return (
                    {},
                    {
                        "mock": False,
                        "failed": True,
                        "error": str(exc),
                        "message": "真实风格识别失败，未回填 mock 字段。",
                    },
                    "failed",
                )

        return (
            {},
            {
                "mock": False,
                "failed": True,
                "error": "未配置 DMXAPI、缺少 API Key，或模板缺少可访问截图 URL。",
                "message": "真实风格识别未满足调用条件，未回填 mock 字段。",
            },
            "failed",
        )

    def _parse_style_analysis_json(self, content: str) -> dict[str, str]:
        stripped = content.strip()
        if stripped.startswith("```"):
            stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
            stripped = re.sub(r"\s*```$", "", stripped)
        try:
            payload = json.loads(stripped)
        except json.JSONDecodeError as exc:
            raise AIProviderError("风格识别返回不是合法 JSON。") from exc
        required_keys = [
            "style_category",
            "visual_summary",
            "line_style",
            "color_palette",
            "lighting_style",
            "composition_style",
            "character_rendering",
            "background_rendering",
            "texture_keywords",
            "yingge_adaptation",
            "image_prompt_template",
            "video_prompt_template",
            "negative_prompt",
        ]
        parsed = {key: str(payload.get(key, "")).strip() for key in required_keys}
        missing_keys = [key for key, value in parsed.items() if not value]
        if missing_keys:
            raise AIProviderError(f"风格识别 JSON 缺少必要字段：{', '.join(missing_keys)}。")
        return parsed

    def _mock_style_analysis(self, template: StyleTemplate) -> dict[str, str]:
        category = template.style_category if template.style_category and template.style_category != "待识别" else "暗色电影国漫"
        return {
            "style_category": category,
            "visual_summary": "暗色电影感 AI 漫剧风格，突出英歌人物脸谱、头饰、服饰纹样和武器剪影，背景保留潮汕祠堂、巷口、鼓阵与舞台烟雾层次。",
            "line_style": "清晰轮廓线，人物边缘强调，服饰刺绣和脸谱边界需要保持可读，避免线条糊成一团。",
            "color_palette": "墨黑、陶土红、朱砂红、暗金、靛青与少量青绿色边缘光，整体低饱和但高对比。",
            "lighting_style": "低照度环境中的侧逆光和金色舞台边缘光，主体亮、背景暗，保留鼓阵火光和祠堂烛光氛围。",
            "composition_style": "竖屏主体居中，中近景英雄构图，低机位仰拍、前景遮挡和队列纵深可交替使用，面部特写突出脸谱。",
            "character_rendering": "人物五官稳定，脸谱图案边界清晰，头饰结构明确，英歌服饰纹样、腰带、鞋靴和武器位置稳定。",
            "background_rendering": "背景服务主体，不抢角色；可使用潮汕祠堂、石板巷口、鼓阵舞台、烟雾、纸钱和暗部空间纵深。",
            "texture_keywords": "高质量漫剧质感，细腻厚涂，干净线条，电影级调色，胶片颗粒，戏剧性边缘光，民俗仪式感，4K 清晰细节。",
            "yingge_adaptation": "将该风格迁移到英歌题材时，必须强化脸谱边界、头饰结构、潮绣服饰纹样、双槌/蛇矛武器、鼓阵队列、祠堂巷口和战舞身段。",
            "image_prompt_template": "参考该全局风格模板生成 AI 漫剧图像：暗色电影国漫质感，清晰轮廓线，低饱和高对比色彩，金色舞台边缘光；保持角色脸谱、头饰、服饰纹样、武器和英歌动作身段一致；背景可使用潮汕祠堂、石板巷口、鼓阵舞台和烟雾层次；画面主体明确，适合 gpt-image-2 生成关键帧或角色设定图。",
            "video_prompt_template": "参考该全局风格模板生成 AI 漫剧视频：镜头保持角色脸谱和服饰稳定，动作节奏符合英歌舞身段；可使用低机位推进、中近景跟拍、面部特写、队列纵深和鼓阵环绕镜头；光影保持暗部层次、金色边缘光和舞台烟雾，转场避免破坏角色一致性。",
            "negative_prompt": "低清晰度、脸部崩坏、脸谱错乱、肢体畸形、手指错误、服饰错乱、服饰刺绣错乱、武器变形、现代服饰误入、水印、文字乱码、廉价滤镜、过度磨皮、背景抢主体",
        }
