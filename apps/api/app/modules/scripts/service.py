import json
import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.mock import MockAIProvider
from app.ai.script_prompt import SCRIPT_PROMPT_VERSION, SCRIPT_SYSTEM_PROMPT, build_script_user_prompt
from app.core.config import get_settings
from app.modules._crud import CRUDService
from app.modules.projects.models import Project
from app.modules.scenes.models import Scene
from app.modules.scripts.repository import ScriptRepository
from app.modules.scripts.schemas import (
    GeneratedScriptPayload,
    ScriptGenerationRead,
    ScriptGenerationRequest,
    ScriptRead,
    ScriptVersionRead,
    TimelineBeat,
)


class ScriptService(CRUDService):
    def __init__(self, session: Session, ai_provider: AIProvider | None = None) -> None:
        self.session = session
        self.script_repository = ScriptRepository(session)
        self.ai_provider = ai_provider or MockAIProvider()
        self.settings = get_settings()
        super().__init__(ScriptRepository(session), ScriptRead)

    def list_by_project(self, project_id: str) -> list[ScriptRead]:
        scripts = [script for script in self.script_repository.list() if script.project_id == project_id]
        scripts.sort(key=lambda script: script.created_at, reverse=True)
        return [ScriptRead.model_validate(script) for script in scripts]

    def get_version(self, project_id: str, script_id: str) -> ScriptVersionRead | None:
        script = self.session.get(self.script_repository.model, script_id)
        if script is None or script.project_id != project_id:
            return None
        scenes = self._list_scenes(script.id)
        return ScriptVersionRead(script=ScriptRead.model_validate(script), scenes=scenes)

    def delete_version(self, project_id: str, script_id: str) -> bool:
        script = self.session.get(self.script_repository.model, script_id)
        if script is None or script.project_id != project_id:
            return False
        for scene in self.session.scalars(select(Scene).where(Scene.script_id == script_id)).all():
            self.session.delete(scene)
        self.session.delete(script)
        self.session.commit()
        return True

    def generate_for_project(self, project_id: str, payload: ScriptGenerationRequest) -> ScriptGenerationRead | None:
        project = self.session.get(Project, project_id)
        if project is None:
            return None

        generated_payload = self._generate_script_payload(project, payload)
        version = self.script_repository.next_version_for_project(project_id)
        generation_settings = {
            **payload.model_dump(),
            "provider": self.ai_provider.name,
            "model": self.settings.dmx_script_model,
            "temperature": self.settings.dmx_script_temperature,
            "max_tokens": self.settings.dmx_script_max_tokens,
            "prompt_version": SCRIPT_PROMPT_VERSION,
            "prompt_inputs": {
                "aspect_ratio_saved_only": payload.aspect_ratio,
                "platform_used_for_pacing": payload.platform,
            },
        }
        script = self.script_repository.create(
            {
                "project_id": project_id,
                "title": generated_payload.title,
                "version": version,
                "content": self._format_script_content(generated_payload),
                "generation_settings": generation_settings,
                "status": "draft",
            }
        )

        scenes = []
        for index, scene_payload in enumerate(self._build_timeline_scenes(generated_payload.timeline), start=1):
            scene = Scene(script_id=script.id, order_index=index, **scene_payload)
            self.session.add(scene)
            scenes.append(scene)
        self.session.commit()
        for scene in scenes:
            self.session.refresh(scene)

        return ScriptGenerationRead(
            script=ScriptRead.model_validate(script),
            scenes=self._list_scenes(script.id),
            settings=payload.model_dump(),
        )

    def _generate_script_payload(self, project: Project, payload: ScriptGenerationRequest) -> GeneratedScriptPayload:
        if self.ai_provider.name == "mock":
            return self._fallback_script_payload(project, payload)

        raw_text = self.ai_provider.generate_text(
            build_script_user_prompt(project, payload),
            system_prompt=SCRIPT_SYSTEM_PROMPT,
            model=self.settings.dmx_script_model,
            temperature=self.settings.dmx_script_temperature,
            max_tokens=self.settings.dmx_script_max_tokens,
        )
        return self._parse_generated_payload(raw_text)

    def _parse_generated_payload(self, raw_text: str) -> GeneratedScriptPayload:
        cleaned = self._strip_json_fence(raw_text)
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ValueError("模型没有返回合法 JSON，请重试。") from exc

        generated_payload = GeneratedScriptPayload.model_validate(data)
        if not generated_payload.timeline:
            raise ValueError("模型返回的 timeline 为空，请重试。")
        self._validate_timeline(generated_payload.timeline)
        return generated_payload

    def _strip_json_fence(self, raw_text: str) -> str:
        text = raw_text.strip()
        fence_match = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", text, flags=re.DOTALL)
        if fence_match:
            return fence_match.group(1).strip()
        return text

    def _validate_timeline(self, timeline: list[TimelineBeat]) -> None:
        previous_end = 0
        for beat in timeline:
            if beat.start_second < 0 or beat.end_second <= beat.start_second:
                raise ValueError("模型返回的时间轴秒数不合法，请重试。")
            if beat.start_second < previous_end:
                raise ValueError("模型返回的时间轴有重叠，请重试。")
            previous_end = beat.end_second

    def _format_script_content(self, payload: GeneratedScriptPayload) -> str:
        character_lines = "\n".join(f"- {item.name}：{item.description}" for item in payload.characters)
        timeline_lines = "\n".join(
            (
                f"{self._timecode(beat.start_second)}-{self._timecode(beat.end_second)} "
                f"【{beat.beat}】{beat.story}\n"
                f"画面重点：{beat.visual_focus}\n"
                f"情绪：{beat.emotion}\n"
                f"对白：{beat.dialogue or '无'}\n"
                f"旁白：{beat.narration or '无'}\n"
                f"转分镜建议：{beat.shot_hint}"
            )
            for beat in payload.timeline
        )
        return f"""《{payload.title}》

一句话梗概：
{payload.logline}

完整剧本：
{payload.full_script}

时间轴：
{timeline_lines}

角色候选：
{character_lines or "暂无"}
"""

    def _build_timeline_scenes(self, timeline: list[TimelineBeat]) -> list[dict[str, str]]:
        scenes = []
        for beat in timeline:
            time_range = f"{self._timecode(beat.start_second)}-{self._timecode(beat.end_second)}"
            lens = beat.lens_language
            transition = beat.transition
            storyboard_lines = [
                (
                    f"{item.shot}：{item.purpose}；"
                    f"生图重点：{item.image_prompt_focus or '无'}；"
                    f"生视频重点：{item.video_prompt_focus or '无'}"
                )
                for item in beat.storyboard_plan
            ]
            seedance_lines = [item.video_prompt_focus for item in beat.storyboard_plan if item.video_prompt_focus]
            scenes.append(
                {
                    "title": f"{time_range} {beat.beat}",
                    "summary": beat.story,
                    "raw_text": "\n".join(
                        [
                            f"剧情：{beat.story}",
                            f"画面重点：{beat.visual_focus}",
                            f"景别：{lens.shot_size or '未指定'}",
                            f"机位：{lens.camera_angle or '未指定'}",
                            f"构图：{lens.composition or '未指定'}",
                            f"运镜：{lens.camera_movement or '未指定'}",
                            f"光影：{lens.lighting or '未指定'}",
                            f"剪辑点：{lens.edit_point or '未指定'}",
                            f"情绪：{beat.emotion}",
                            f"角色：{'、'.join(beat.characters) if beat.characters else '无'}",
                            f"对白：{beat.dialogue or '无'}",
                            f"旁白：{beat.narration or '无'}",
                            f"转分镜建议：{beat.shot_hint}",
                            f"转场：{transition.type or '未指定'}",
                            f"转场说明：{transition.description or '未指定'}",
                            f"镜头密度：{beat.shot_density or '未指定'}",
                            f"推荐分镜数：{beat.recommended_shot_count if beat.recommended_shot_count is not None else '未指定'}",
                            f"关键帧优先级：{'、'.join(beat.keyframe_priority) if beat.keyframe_priority else '未指定'}",
                            f"分镜拆解：{' | '.join(storyboard_lines) if storyboard_lines else '无'}",
                            f"Seedance提示骨架：{' | '.join(seedance_lines) if seedance_lines else '未指定'}",
                            f"AI生成难点：{beat.generation_risk or '无'}",
                            f"规避策略：{beat.simplify_strategy or '无'}",
                        ]
                    ),
                }
            )
        return scenes

    def _list_scenes(self, script_id: str):
        statement = select(Scene).where(Scene.script_id == script_id).order_by(Scene.order_index.asc())
        return self.session.scalars(statement).all()

    def _fallback_script_payload(self, project: Project, payload: ScriptGenerationRequest) -> GeneratedScriptPayload:
        return GeneratedScriptPayload(
            title=f"{project.name} - {payload.duration_seconds}秒短视频剧本",
            logline=payload.story_seed,
            full_script="00:00-00:03 夜色压低，祠堂鼓点突然响起。\n00:03-00:12 少年循声走向老街深处，脸谱影子在墙面移动。",
            characters=[{"name": "年轻英歌队员", "description": "好奇、胆大、被鼓点召唤。"}],
            timeline=[
                {
                    "start_second": 0,
                    "end_second": 3,
                    "beat": "强钩子",
                    "story": "夜色压低，祠堂鼓点突然响起。",
                    "visual_focus": "空街、祠堂、鼓点震动水面",
                    "lens_language": {
                        "shot_size": "特写",
                        "camera_angle": "低机位",
                        "composition": "前景遮挡",
                        "camera_movement": "快速推近",
                        "lighting": "冷月光与祠堂暖光对撞",
                        "edit_point": "鼓点落下",
                    },
                    "emotion": payload.tone,
                    "characters": ["年轻英歌队员"],
                    "dialogue": "",
                    "narration": "这鼓声，不是人敲的。",
                    "shot_hint": "用低机位和快速推近建立悬念。",
                    "transition": {
                        "type": "鼓点切",
                        "description": "双槌落下瞬间切到祠堂门缝亮起",
                    },
                    "shot_density": "中",
                    "recommended_shot_count": 3,
                    "keyframe_priority": ["脸谱特写", "祠堂门缝", "水面震动"],
                    "storyboard_plan": [
                        {
                            "shot": "镜头1",
                            "purpose": "建立祠堂异象",
                            "image_prompt_focus": "祠堂门缝与水面震动",
                            "video_prompt_focus": "鼓点同步的轻微推镜",
                        }
                    ],
                    "generation_risk": "连续鼓点震动容易生成杂乱纹理",
                    "simplify_strategy": "拆成祠堂门缝、少年反应、水面震动三张分镜",
                },
                {
                    "start_second": 3,
                    "end_second": min(payload.duration_seconds, 12),
                    "beat": "进入事件",
                    "story": "少年循声走向老街深处，脸谱影子在墙面移动。",
                    "visual_focus": "脸谱影子、双槌、祠堂门缝",
                    "lens_language": {
                        "shot_size": "中近景",
                        "camera_angle": "平视",
                        "composition": "纵深构图",
                        "camera_movement": "跟拍",
                        "lighting": "巷尾金色边缘光",
                        "edit_point": "脸谱影子越过墙面",
                    },
                    "emotion": "紧张",
                    "characters": ["年轻英歌队员"],
                    "dialogue": "谁在那里？",
                    "narration": "",
                    "shot_hint": "分为跟拍、特写、影子反打三张分镜。",
                    "transition": {
                        "type": "遮挡转场",
                        "description": "红绸掠过画面后切到脸谱影子",
                    },
                    "shot_density": "高",
                    "recommended_shot_count": 4,
                    "keyframe_priority": ["少年侧背影", "脸谱影子", "双槌特写"],
                    "storyboard_plan": [
                        {
                            "shot": "镜头1",
                            "purpose": "表现少年被引入老街深处",
                            "image_prompt_focus": "少年侧背影与脸谱影子",
                            "video_prompt_focus": "稳定跟拍，不做复杂转身",
                        }
                    ],
                    "generation_risk": "影子和人物可能粘连",
                    "simplify_strategy": "保持人物与墙面距离，避免多角色同框",
                },
            ],
            scene_summary=[{"title": "强钩子", "summary": "鼓点异象拉开故事。"}],
        )

    def _timecode(self, seconds: int) -> str:
        return f"{seconds // 60:02d}:{seconds % 60:02d}"
