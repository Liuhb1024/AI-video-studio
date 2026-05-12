import json
import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.mock import MockAIProvider
from app.ai.shot_prompt import SHOT_PROMPT_VERSION, SHOT_SYSTEM_PROMPT, build_shot_user_prompt
from app.core.config import get_settings
from app.modules._crud import CRUDService
from app.modules.projects.models import Project
from app.modules.scenes.models import Scene
from app.modules.shots.models import Shot
from app.modules.shots.repository import ShotRepository
from app.modules.shots.schemas import (
    GeneratedShotsPayload,
    ShotGenerationRead,
    ShotGenerationRequest,
    ShotRead,
    ShotUpdate,
)
from app.modules.scripts.models import Script


class ShotService(CRUDService):
    def __init__(self, session: Session, ai_provider: AIProvider | None = None) -> None:
        self.session = session
        self.shot_repository = ShotRepository(session)
        self.ai_provider = ai_provider or MockAIProvider()
        self.settings = get_settings()
        super().__init__(self.shot_repository, ShotRead)

    def list_by_project(self, project_id: str, script_id: str | None = None) -> list[ShotRead]:
        query = select(Shot).where(Shot.project_id == project_id)
        if script_id:
            query = query.where(Shot.script_id == script_id)
        shots = self.session.scalars(query.order_by(Shot.order_index.asc(), Shot.created_at.asc())).all()
        return [ShotRead.model_validate(shot) for shot in shots]

    def generate_from_script(self, project_id: str, payload: ShotGenerationRequest) -> ShotGenerationRead | None:
        project = self.session.get(Project, project_id)
        script = self.session.get(Script, payload.script_id)
        if project is None or script is None or script.project_id != project_id:
            return None

        scenes = self.session.scalars(select(Scene).where(Scene.script_id == script.id).order_by(Scene.order_index.asc())).all()
        if not scenes:
            raise ValueError("当前剧本没有场次，无法生成分镜。")

        if payload.replace_existing:
            existing = self.session.scalars(select(Shot).where(Shot.project_id == project_id, Shot.script_id == script.id)).all()
            for shot in existing:
                self.session.delete(shot)
            self.session.flush()

        generated = self._generate_shots_payload(project, script, list(scenes))
        scene_ids = {scene.id for scene in scenes}
        shots: list[Shot] = []
        for index, item in enumerate(generated.shots, start=1):
            shot = Shot(
                project_id=project_id,
                script_id=script.id,
                scene_id=item.scene_id if item.scene_id in scene_ids else None,
                shot_no=item.shot_no or f"S{index:02d}",
                order_index=item.order_index or index,
                story_beat=item.story_beat,
                description=item.description,
                characters=item.characters,
                setting=item.setting,
                emotion=item.emotion,
                action=item.action,
                expression=item.expression,
                props=item.props,
                shot_size=item.shot_size,
                camera_angle=item.camera_angle,
                composition=item.composition,
                camera_movement=item.camera_movement,
                lighting=item.lighting,
                transition_in=item.transition_in,
                transition_out=item.transition_out,
                edit_point=item.edit_point,
                duration_seconds=item.duration_seconds,
                image_prompt=item.image_prompt,
                video_prompt=item.video_prompt,
                negative_prompt=item.negative_prompt,
                reference_asset_ids=item.reference_asset_ids,
                continuity_constraints=item.continuity_constraints,
                generation_risk=item.generation_risk,
                simplify_strategy=item.simplify_strategy,
                readiness=item.readiness,
                extra_metadata={
                    **item.metadata,
                    "prompt_version": SHOT_PROMPT_VERSION,
                    "provider": self.ai_provider.name,
                    "model": self.settings.dmx_shot_model,
                },
                status="draft",
            )
            self.session.add(shot)
            shots.append(shot)
        self.session.commit()
        for shot in shots:
            self.session.refresh(shot)
        return ShotGenerationRead(shots=[ShotRead.model_validate(shot) for shot in shots])

    def update_project_shot(self, project_id: str, shot_id: str, payload: ShotUpdate) -> ShotRead | None:
        shot = self.session.get(Shot, shot_id)
        if shot is None or shot.project_id != project_id:
            return None
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(shot, key, value)
        self.session.commit()
        self.session.refresh(shot)
        return ShotRead.model_validate(shot)

    def delete_project_shot(self, project_id: str, shot_id: str) -> bool:
        shot = self.session.get(Shot, shot_id)
        if shot is None or shot.project_id != project_id:
            return False
        self.session.delete(shot)
        self.session.commit()
        return True

    def reorder_project_shots(self, project_id: str, shot_ids: list[str]) -> list[ShotRead] | None:
        shots = self.session.scalars(select(Shot).where(Shot.project_id == project_id, Shot.id.in_(shot_ids))).all()
        shot_by_id = {shot.id: shot for shot in shots}
        if len(shot_by_id) != len(set(shot_ids)):
            return None
        for index, shot_id in enumerate(shot_ids, start=1):
            shot_by_id[shot_id].order_index = index
        self.session.commit()
        ordered = [shot_by_id[shot_id] for shot_id in shot_ids]
        for shot in ordered:
            self.session.refresh(shot)
        return [ShotRead.model_validate(shot) for shot in ordered]

    def _generate_shots_payload(self, project: Project, script: Script, scenes: list[Scene]) -> GeneratedShotsPayload:
        if self.ai_provider.name == "mock":
            return self._fallback_shots_payload(scenes)
        raw_text = self.ai_provider.generate_text(
            build_shot_user_prompt(project, script, scenes),
            system_prompt=SHOT_SYSTEM_PROMPT,
            model=self.settings.dmx_shot_model,
            temperature=self.settings.dmx_shot_temperature,
            max_tokens=self.settings.dmx_shot_max_tokens,
        )
        return self._parse_generated_payload(raw_text)

    def _parse_generated_payload(self, raw_text: str) -> GeneratedShotsPayload:
        cleaned = self._strip_json_fence(raw_text)
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise ValueError("模型没有返回合法分镜 JSON，请重试。") from exc
        payload = GeneratedShotsPayload.model_validate(data)
        if not payload.shots:
            raise ValueError("模型返回的 shots 为空，请重试。")
        return payload

    def _strip_json_fence(self, raw_text: str) -> str:
        text = raw_text.strip()
        fence_match = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", text, flags=re.DOTALL)
        if fence_match:
            return fence_match.group(1).strip()
        return text

    def _fallback_shots_payload(self, scenes: list[Scene]) -> GeneratedShotsPayload:
        scene = scenes[0]
        return GeneratedShotsPayload.model_validate(
            {
                "shots": [
                    {
                        "scene_id": scene.id,
                        "shot_no": "S01",
                        "order_index": 1,
                        "story_beat": "强钩子",
                        "description": "英歌少年在祠堂门外听见鼓点，低头握紧双槌。",
                        "characters": ["英歌少年"],
                        "setting": "夜晚潮汕老街祠堂外",
                        "emotion": "神秘",
                        "action": "握紧双槌并抬头",
                        "expression": "警觉",
                        "props": ["双槌", "红灯笼"],
                        "shot_size": "CU",
                        "camera_angle": "low",
                        "composition": "foreground_frame",
                        "camera_movement": "slow_dolly_in",
                        "lighting": "冷月光与暖金门缝光",
                        "transition_in": "cut",
                        "transition_out": "drum_cut",
                        "edit_point": "鼓点落下时切到脸谱特写",
                        "duration_seconds": 4,
                        "image_prompt": "英歌少年握紧双槌站在祠堂门外，低机位特写，冷月光与暖金门缝光。",
                        "video_prompt": "主体：英歌少年；动作：握紧双槌并抬头；镜头：低机位缓慢推近；节奏：跟随鼓点；约束：人物五官自然，双槌不变形，画面稳定无水印。",
                        "negative_prompt": "多余手指、武器变形、脸部漂移、画面水印",
                        "continuity_constraints": ["保持红黑服饰", "双槌在右手"],
                        "generation_risk": "手部和双槌容易变形",
                        "simplify_strategy": "失败时拆成双槌特写和少年侧脸两镜",
                        "readiness": "ready",
                        "metadata": {},
                    }
                ]
            }
        )
