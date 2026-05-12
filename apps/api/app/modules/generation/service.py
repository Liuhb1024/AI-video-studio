import json
import re
from pathlib import Path

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.dmx import AIProviderError, DMXAIProvider
from app.ai.dmx_gemini import DMXGeminiImageProvider, GeminiImageInput
from app.ai.dmx_gpt_image import DMXGPTImageProvider, GPTImageInput
from app.ai.dmx_seedream import DMXSeedreamImageProvider, SeedreamImageInput
from app.core.config import get_settings
from app.modules._crud import CRUDService
from app.modules.assets.models import Asset
from app.modules.characters.models import Character
from app.modules.generation.models import GenerateTask
from app.modules.generation.repository import GenerateTaskRepository
from app.modules.generation.schemas import CharacterImagePromptDraftCreate, CharacterImagePromptDraftRead, CharacterImageTaskCreate, GenerateTaskRead
from app.modules.style_templates.models import StyleTemplate
from app.storage.base import StorageProvider
from app.storage.factory import get_storage_provider


CHARACTER_IMAGE_GENERATION_TYPES = {"four_view", "style_transfer", "character_lookdev"}
CHARACTER_IMAGE_PROMPT_DRAFT_TYPES = {"four_view", "character_lookdev"}
SCENE_STYLE_TEMPLATE_CATEGORY = "场景模板"


class GenerateTaskService(CRUDService):
    def __init__(self, session: Session, storage: StorageProvider | None = None) -> None:
        self.session = session
        self.storage = storage or get_storage_provider()
        super().__init__(GenerateTaskRepository(session), GenerateTaskRead)

    def list_character_image_tasks(self, character_id: str) -> list[GenerateTaskRead]:
        statement = (
            select(GenerateTask)
            .where(
                GenerateTask.task_type == "character_image_generation",
                GenerateTask.character_id == character_id,
            )
            .order_by(GenerateTask.created_at.desc())
        )
        return [GenerateTaskRead.model_validate(item) for item in self.session.scalars(statement).all()]

    def get_character_image_task(self, task_id: str) -> GenerateTaskRead | None:
        task = self._get_character_image_task(task_id)
        if task is None:
            return None
        return GenerateTaskRead.model_validate(task)

    def cancel_character_image_task(self, task_id: str) -> GenerateTaskRead | None:
        task = self._get_character_image_task(task_id)
        if task is None:
            return None
        if task.status not in {"queued", "pending", "running"}:
            raise ValueError("Only queued or running character image tasks can be cancelled")

        task.status = "cancelled"
        task.current_step = "cancelled"
        task.progress = max(task.progress or 0, 0)
        task.error_code = "USER_CANCELLED"
        task.error_message = "用户手动终止任务。"
        task.output_asset_id = None
        task.output_asset_ids = []
        self.session.commit()
        self.session.refresh(task)
        return GenerateTaskRead.model_validate(task)

    def create_character_image_prompt_draft(self, payload: CharacterImagePromptDraftCreate) -> CharacterImagePromptDraftRead | None:
        if payload.generation_type not in CHARACTER_IMAGE_PROMPT_DRAFT_TYPES:
            raise ValueError("Unsupported character image prompt draft type")

        character = self.session.get(Character, payload.character_id)
        if character is None:
            return None

        input_assets = self._load_character_assets(payload.character_id, payload.input_asset_ids)
        style_template = self._load_character_style_template(payload.style_template_id)
        if payload.generation_type == "four_view":
            draft = self._generate_four_view_prompt_draft(payload, character, input_assets, style_template)
        else:
            draft = self._generate_character_lookdev_prompt_draft(payload, character, input_assets, style_template)
        return CharacterImagePromptDraftRead(
            character_id=character.id,
            generation_type=payload.generation_type,
            style_template_id=payload.style_template_id,
            model_provider=payload.model_provider,
            model_name=payload.model_name,
            model_version=payload.model_version,
            prompt_text=draft["prompt_text"],
            negative_prompt=draft["negative_prompt"],
            checklist=draft["checklist"],
            raw_response=draft.get("raw_response"),
        )

    def create_character_image_task(self, payload: CharacterImageTaskCreate) -> GenerateTaskRead | None:
        if payload.generation_type not in CHARACTER_IMAGE_GENERATION_TYPES:
            raise ValueError("Unsupported character image generation type")

        character = self.session.get(Character, payload.character_id)
        if character is None:
            return None

        input_assets = self._load_character_assets(payload.character_id, payload.input_asset_ids)
        style_template = self._load_character_style_template(payload.style_template_id)
        input_snapshot = self._build_input_snapshot(character, input_assets, style_template)
        assembled_prompt = self._assemble_prompt(payload, character, input_assets, style_template)

        task = self._build_queued_character_image_task(
            payload=payload,
            input_assets=input_assets,
            style_template=style_template,
            assembled_prompt=assembled_prompt,
            input_snapshot=input_snapshot,
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return GenerateTaskRead.model_validate(task)

    def retry_character_image_task(self, task_id: str) -> GenerateTaskRead | None:
        original_task = self._get_character_image_task(task_id)
        if original_task is None:
            return None
        if original_task.character_id is None or original_task.generation_type is None:
            raise ValueError("Original task is missing character generation inputs")

        params_json = dict(original_task.params_json or {})
        previous_attempt = int(params_json.get("retry_attempt", 0) or 0)
        params_json["retry_attempt"] = previous_attempt + 1
        params_json["mock_force_fail"] = False

        payload = CharacterImageTaskCreate(
            character_id=original_task.character_id,
            generation_type=original_task.generation_type,
            model_name=original_task.model_name,
            model_provider=original_task.model_provider,
            model_version=original_task.model_version,
            input_asset_ids=original_task.input_asset_ids or [],
            style_template_id=original_task.style_template_id,
            prompt_text=original_task.prompt_text or original_task.input_prompt,
            negative_prompt=original_task.negative_prompt or "",
            params_json=params_json,
        )
        task = self._create_character_image_task_from_payload(payload, retry_of_task_id=original_task.id)
        return GenerateTaskRead.model_validate(task)

    def _create_character_image_task_from_payload(
        self,
        payload: CharacterImageTaskCreate,
        retry_of_task_id: str | None = None,
    ) -> GenerateTask:
        if payload.generation_type not in CHARACTER_IMAGE_GENERATION_TYPES:
            raise ValueError("Unsupported character image generation type")

        character = self.session.get(Character, payload.character_id)
        if character is None:
            raise ValueError("Character not found")

        input_assets = self._load_character_assets(payload.character_id, payload.input_asset_ids)
        style_template = self._load_character_style_template(payload.style_template_id)
        input_snapshot = self._build_input_snapshot(character, input_assets, style_template)
        assembled_prompt = self._assemble_prompt(payload, character, input_assets, style_template)

        task = self._build_queued_character_image_task(
            payload=payload,
            input_assets=input_assets,
            style_template=style_template,
            assembled_prompt=assembled_prompt,
            input_snapshot=input_snapshot,
            retry_of_task_id=retry_of_task_id,
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def _load_character_style_template(self, style_template_id: str | None) -> StyleTemplate | None:
        if not style_template_id:
            return None
        style_template = self.session.get(StyleTemplate, style_template_id)
        if style_template and style_template.style_category == SCENE_STYLE_TEMPLATE_CATEGORY:
            raise ValueError("角色生图只能绑定角色模板，不能使用场景模板。")
        return style_template

    def execute_character_image_task(self, task_id: str) -> GenerateTaskRead | None:
        task = self._get_character_image_task(task_id)
        if task is None:
            return None
        if task.status not in {"queued", "pending"}:
            return GenerateTaskRead.model_validate(task)

        if task.character_id is None:
            task.status = "failed"
            task.current_step = "generation_failed"
            task.progress = max(task.progress or 0, 15)
            task.error_code = "TASK_INPUT_ERROR"
            task.error_message = "Character image task is missing character_id."
            self.session.commit()
            self.session.refresh(task)
            return GenerateTaskRead.model_validate(task)

        character = self.session.get(Character, task.character_id)
        if character is None:
            task.status = "failed"
            task.current_step = "generation_failed"
            task.progress = max(task.progress or 0, 15)
            task.error_code = "TASK_INPUT_ERROR"
            task.error_message = "Character not found when executing queued task."
            self.session.commit()
            self.session.refresh(task)
            return GenerateTaskRead.model_validate(task)

        input_assets = self._load_character_assets(task.character_id, task.input_asset_ids or [])
        style_template = self.session.get(StyleTemplate, task.style_template_id) if task.style_template_id else None
        task.status = "running"
        task.current_step = "assembling_prompt"
        task.progress = 15
        task.error_code = None
        task.error_message = None
        self.session.commit()

        self._execute_character_image_task(task, character, input_assets, style_template)
        self.session.commit()
        self.session.refresh(task)
        return GenerateTaskRead.model_validate(task)

    def _stop_if_cancelled(self, task: GenerateTask) -> bool:
        self.session.refresh(task)
        if task.status != "cancelled":
            return False
        task.current_step = "cancelled"
        task.error_code = task.error_code or "USER_CANCELLED"
        task.error_message = task.error_message or "用户手动终止任务。"
        task.output_asset_id = None
        task.output_asset_ids = []
        self.session.commit()
        return True

    def _build_queued_character_image_task(
        self,
        *,
        payload: CharacterImageTaskCreate,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
        assembled_prompt: str,
        input_snapshot: dict,
        retry_of_task_id: str | None = None,
    ) -> GenerateTask:
        return GenerateTask(
            task_type="character_image_generation",
            character_id=payload.character_id,
            generation_type=payload.generation_type,
            model_provider=payload.model_provider,
            model_name=payload.model_name,
            model_version=payload.model_version,
            input_asset_ids=[asset.id for asset in input_assets],
            style_template_id=payload.style_template_id,
            prompt_text=assembled_prompt,
            negative_prompt=payload.negative_prompt or (style_template.negative_prompt if style_template else ""),
            params_json=payload.params_json or {},
            input_prompt=assembled_prompt,
            input_snapshot_json=input_snapshot,
            retry_of_task_id=retry_of_task_id,
            output_asset_ids=[],
            status="queued",
            current_step="queued",
            progress=0,
        )

    def _get_character_image_task(self, task_id: str) -> GenerateTask | None:
        statement = select(GenerateTask).where(
            GenerateTask.id == task_id,
            GenerateTask.task_type == "character_image_generation",
        )
        return self.session.scalar(statement)

    def _execute_character_image_task(
        self,
        task: GenerateTask,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> None:
        if (task.model_provider or "").lower() == "dmx-gemini":
            self._execute_dmx_gemini_character_image_task(task, character, input_assets, style_template)
            return
        if (task.model_provider or "").lower() == "dmx-gpt-image":
            self._execute_dmx_gpt_image_character_image_task(task, character, input_assets, style_template)
            return
        if (task.model_provider or "").lower() == "dmx-seedream":
            self._execute_dmx_seedream_character_image_task(task, character, input_assets, style_template)
            return
        self._execute_mock_character_image_task(task, character, input_assets, style_template)

    def _execute_mock_character_image_task(
        self,
        task: GenerateTask,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> None:
        task.current_step = "mock_model_call"
        task.progress = 62
        self.session.commit()
        params_json = task.params_json or {}
        if params_json.get("mock_force_fail") is True:
            task.status = "failed"
            task.error_code = "MOCK_MODEL_ERROR"
            task.error_message = "Mock image model failed before output. Keep this task for prompt/reference replay."
            task.raw_response = {
                "mock": True,
                "failed": True,
                "message": task.error_message,
            }
            task.output_asset_id = None
            task.output_asset_ids = []
            return

        output_asset = self._create_mock_output_asset(task, character, input_assets, style_template)
        task.output_asset_id = output_asset.id
        task.output_asset_ids = [output_asset.id]
        task.raw_response = {
            "mock": True,
            "message": "模型调用尚未接入，当前输出为任务链路验证用候选资产。",
            "source_asset_id": output_asset.id,
        }
        task.error_code = None
        task.error_message = None
        task.status = "mock_completed"
        task.current_step = "completed"
        task.progress = 100

    def _execute_dmx_gemini_character_image_task(
        self,
        task: GenerateTask,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> None:
        task.current_step = "preparing_reference_images"
        task.progress = 28
        self.session.commit()
        try:
            settings = get_settings()
            if not settings.dmx_api_key:
                raise RuntimeError("DMX_API_KEY 未配置，无法调用 Nano Banana 2。")
            if not input_assets:
                raise RuntimeError("至少需要选择一张角色参考图。")

            params = task.params_json or {}
            aspect_ratio = str(params.get("aspect_ratio") or "1:1")
            image_size = str(params.get("image_size") or "1K")
            image_inputs = [self._asset_to_gemini_image(asset) for asset in input_assets[:14]]
            if self._stop_if_cancelled(task):
                return

            task.current_step = "calling_nano_banana_2"
            task.progress = 62
            self.session.commit()
            provider = DMXGeminiImageProvider(
                api_key=settings.dmx_api_key,
                base_url=settings.dmx_gemini_image_base_url,
                default_model=settings.dmx_gemini_image_model,
                timeout_seconds=max(settings.dmx_timeout_seconds, 300),
            )
            result = provider.generate_images(
                prompt=task.prompt_text,
                images=image_inputs,
                aspect_ratio=aspect_ratio,
                image_size=image_size,
                model=task.model_name or settings.dmx_gemini_image_model,
            )
            if self._stop_if_cancelled(task):
                return

            task.current_step = "saving_outputs_to_cos"
            task.progress = 84
            self.session.commit()
            output_assets = [
                self._create_generated_output_asset(
                    task=task,
                    character=character,
                    input_assets=input_assets,
                    style_template=style_template,
                    image_bytes=image.data,
                    mime_type=image.mime_type,
                    index=index,
                )
                for index, image in enumerate(result.images, start=1)
            ]
            task.output_asset_id = output_assets[0].id if output_assets else None
            task.output_asset_ids = [asset.id for asset in output_assets]
            task.raw_response = {
                "mock": False,
                "provider": "dmx-gemini",
                "model": task.model_name,
                "aspect_ratio": aspect_ratio,
                "image_size": image_size,
                "input_asset_count": len(input_assets),
                "output_asset_count": len(output_assets),
                "summary": result.raw_response_summary,
            }
            task.error_code = None
            task.error_message = None
            task.status = "completed"
            task.current_step = "completed"
            task.progress = 100
        except Exception as exc:
            task.status = "failed"
            task.current_step = "generation_failed"
            task.progress = max(task.progress or 0, 62)
            task.error_code = "DMX_GEMINI_IMAGE_ERROR"
            task.error_message = str(exc)
            task.raw_response = {
                "mock": False,
                "failed": True,
                "provider": "dmx-gemini",
                "model": task.model_name,
                "error": str(exc),
            }
            task.output_asset_id = None
            task.output_asset_ids = []

    def _execute_dmx_gpt_image_character_image_task(
        self,
        task: GenerateTask,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> None:
        task.current_step = "preparing_reference_images"
        task.progress = 28
        self.session.commit()
        try:
            settings = get_settings()
            if not settings.dmx_api_key:
                raise RuntimeError("DMX_API_KEY 未配置，无法调用 GPT Image 2。")
            if not input_assets:
                raise RuntimeError("至少需要选择一张角色参考图。")

            params = task.params_json or {}
            aspect_ratio = str(params.get("aspect_ratio") or "1:1")
            image_size = str(params.get("image_size") or "1K")
            output_format = str(params.get("output_format") or "png")
            quality = str(params.get("quality") or "auto")
            image_inputs = [self._asset_to_gpt_image(asset) for asset in input_assets]
            if self._stop_if_cancelled(task):
                return

            task.current_step = "calling_gpt_image_2"
            task.progress = 62
            self.session.commit()
            provider = DMXGPTImageProvider(
                api_key=settings.dmx_api_key,
                base_url=settings.dmx_gpt_image_base_url,
                default_model=settings.dmx_gpt_image_model,
                timeout_seconds=max(settings.dmx_timeout_seconds, 300),
            )
            result = provider.generate_images(
                prompt=task.prompt_text,
                images=image_inputs,
                aspect_ratio=aspect_ratio,
                image_size=image_size,
                model=task.model_name or settings.dmx_gpt_image_model,
                output_format=output_format,
                quality=quality,
                output_count=1,
            )
            if self._stop_if_cancelled(task):
                return

            task.current_step = "saving_outputs_to_cos"
            task.progress = 84
            self.session.commit()
            output_assets = [
                self._create_generated_output_asset(
                    task=task,
                    character=character,
                    input_assets=input_assets,
                    style_template=style_template,
                    image_bytes=image.data,
                    mime_type=image.mime_type,
                    index=index,
                )
                for index, image in enumerate(result.images, start=1)
            ]
            task.output_asset_id = output_assets[0].id if output_assets else None
            task.output_asset_ids = [asset.id for asset in output_assets]
            task.raw_response = {
                "mock": False,
                "provider": "dmx-gpt-image",
                "model": task.model_name,
                "aspect_ratio": aspect_ratio,
                "image_size": image_size,
                "output_format": output_format,
                "quality": quality,
                "input_asset_count": len(input_assets),
                "output_asset_count": len(output_assets),
                "summary": result.raw_response_summary,
            }
            task.error_code = None
            task.error_message = None
            task.status = "completed"
            task.current_step = "completed"
            task.progress = 100
        except Exception as exc:
            task.status = "failed"
            task.current_step = "generation_failed"
            task.progress = max(task.progress or 0, 62)
            task.error_code = "DMX_GPT_IMAGE_ERROR"
            task.error_message = str(exc)
            task.raw_response = {
                "mock": False,
                "failed": True,
                "provider": "dmx-gpt-image",
                "model": task.model_name,
                "error": str(exc),
            }
            task.output_asset_id = None
            task.output_asset_ids = []

    def _execute_dmx_seedream_character_image_task(
        self,
        task: GenerateTask,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> None:
        task.current_step = "preparing_reference_images"
        task.progress = 28
        self.session.commit()
        try:
            settings = get_settings()
            if not settings.dmx_api_key:
                raise RuntimeError("DMX_API_KEY 未配置，无法调用 Seedream 5.0 Lite。")
            if not input_assets:
                raise RuntimeError("至少需要选择一张角色参考图。")

            params = task.params_json or {}
            image_size = str(params.get("image_size") or "2K")
            output_format = str(params.get("output_format") or "png")
            image_inputs = [self._asset_to_seedream_image(asset) for asset in input_assets[:14]]
            if self._stop_if_cancelled(task):
                return

            task.current_step = "calling_seedream_5_lite"
            task.progress = 62
            self.session.commit()
            provider = DMXSeedreamImageProvider(
                api_key=settings.dmx_api_key,
                base_url=settings.dmx_seedream_image_base_url,
                default_model=settings.dmx_seedream_image_model,
                timeout_seconds=max(settings.dmx_timeout_seconds, 300),
            )
            result = provider.generate_images(
                prompt=task.prompt_text,
                images=image_inputs,
                image_size=image_size,
                model=task.model_name or settings.dmx_seedream_image_model,
                output_format=output_format,
                output_count=1,
            )
            if self._stop_if_cancelled(task):
                return

            task.current_step = "saving_outputs_to_cos"
            task.progress = 84
            self.session.commit()
            output_assets = [
                self._create_generated_output_asset(
                    task=task,
                    character=character,
                    input_assets=input_assets,
                    style_template=style_template,
                    image_bytes=image.data,
                    mime_type=image.mime_type,
                    index=index,
                )
                for index, image in enumerate(result.images, start=1)
            ]
            task.output_asset_id = output_assets[0].id if output_assets else None
            task.output_asset_ids = [asset.id for asset in output_assets]
            task.raw_response = {
                "mock": False,
                "provider": "dmx-seedream",
                "model": task.model_name,
                "image_size": image_size,
                "output_format": output_format,
                "input_asset_count": len(input_assets),
                "output_asset_count": len(output_assets),
                "summary": result.raw_response_summary,
            }
            task.error_code = None
            task.error_message = None
            task.status = "completed"
            task.current_step = "completed"
            task.progress = 100
        except Exception as exc:
            task.status = "failed"
            task.current_step = "generation_failed"
            task.progress = max(task.progress or 0, 62)
            task.error_code = "DMX_SEEDREAM_IMAGE_ERROR"
            task.error_message = str(exc)
            task.raw_response = {
                "mock": False,
                "failed": True,
                "provider": "dmx-seedream",
                "model": task.model_name,
                "error": str(exc),
            }
            task.output_asset_id = None
            task.output_asset_ids = []

    def _load_character_assets(self, character_id: str, asset_ids: list[str]) -> list[Asset]:
        if not asset_ids:
            return []
        statement = select(Asset).where(Asset.character_id == character_id, Asset.id.in_(asset_ids))
        assets = self.session.scalars(statement).all()
        by_id = {asset.id: asset for asset in assets}
        return [by_id[asset_id] for asset_id in asset_ids if asset_id in by_id]

    def _build_input_snapshot(self, character: Character, input_assets: list[Asset], style_template: StyleTemplate | None) -> dict:
        return {
            "character": {
                "id": character.id,
                "name": character.name,
                "alias": character.alias,
                "weapons": character.weapons or character.weapon,
                "yingge_role": character.yingge_role,
                "facepaint_main_color": character.facepaint_main_color,
                "facepaint_patterns": character.facepaint_patterns,
                "visual_tone_keywords": character.visual_tone_keywords,
                "appearance": character.appearance,
                "costume": character.costume,
                "weapon": character.weapon,
                "positive_prompt_terms": character.positive_prompt_terms,
                "negative_prompt_terms": character.negative_prompt_terms,
            },
            "input_assets": [
                {
                    "id": asset.id,
                    "filename": asset.filename,
                    "reference_type": asset.reference_type,
                    "url": asset.url,
                }
                for asset in input_assets
            ],
            "style_template": None
            if style_template is None
            else {
                "id": style_template.id,
                "name": style_template.name,
                "style_category": style_template.style_category,
                "visual_summary": style_template.visual_summary,
                "line_style": style_template.line_style,
                "color_palette": style_template.color_palette,
                "lighting_style": style_template.lighting_style,
                "composition_style": style_template.composition_style,
                "character_rendering": style_template.character_rendering,
                "background_rendering": style_template.background_rendering,
                "texture_keywords": style_template.texture_keywords,
                "yingge_adaptation": style_template.yingge_adaptation,
                "image_prompt_template": style_template.image_prompt_template,
                "video_prompt_template": style_template.video_prompt_template,
                "negative_prompt": style_template.negative_prompt,
                "analysis_model": style_template.analysis_model,
                "analysis_version": style_template.analysis_version,
                "analysis_status": style_template.analysis_status,
            },
        }

    def _assemble_prompt(
        self,
        payload: CharacterImageTaskCreate,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> str:
        if (payload.params_json or {}).get("prompt_mode") == "confirmed" and payload.prompt_text.strip():
            return self._append_reference_fidelity_contract(
                payload.prompt_text.strip(),
                generation_type=payload.generation_type,
                input_assets=input_assets,
                style_template=style_template,
            )
        if payload.generation_type == "style_transfer":
            return self._build_style_transfer_prompt_text(payload, character, input_assets, style_template)
        if payload.generation_type == "character_lookdev":
            return self._build_character_lookdev_prompt_text(payload, character, input_assets, style_template)

        generation_label = self._generation_type_label(payload.generation_type)
        style_prompt = self._assemble_style_prompt(style_template)
        user_prompt = payload.prompt_text.strip() or "保持角色脸谱、服饰、武器和英歌气质一致。"
        reference_fidelity_lines = self._build_reference_fidelity_lines(payload.generation_type, input_assets, style_template)
        task_specific_rules = (
            [
                "生成目标：将所选真人妆照重绘为全局风格模板下的 AI 漫剧角色图。",
                "必须保持参考图中的脸谱结构、头饰、潮绣服饰层次、武器/道具位置和体态比例。",
                "服装固有色、局部配色、纹样颜色和材质明暗以参考图为最高优先级；风格模板只迁移线条、渲染、光影和整体质感，风格模板不得改写参考图中的服装颜色。",
                "不要把脸谱主色当作服装颜色；不要把黑白脸谱当作服装颜色；不要把风格模板色板当作服装颜色；不要把整体色彩分级当作服装颜色；不要把彩色服装生成黑白色调。",
                "不要改变角色身份，不要加入无关现代服装，不要让背景抢主体。",
            ]
            if payload.generation_type == "style_transfer"
            else [
                "生成目标：基于脸谱和真人四面妆照生成角色四视图候选设定图。",
                "四视图应保持同一角色、同一服饰、同一脸谱、同一武器和相同身形比例。",
                "服装固有色、局部配色、纹样颜色和材质明暗以参考图为最高优先级；风格模板不得改写参考图中的服装颜色。",
                "不要把脸谱主色当作服装颜色；不要把黑白脸谱当作服装颜色；不要把风格模板色板当作服装颜色；不要把整体色彩分级当作服装颜色；不要把彩色服装生成黑白色调。",
                "画面应适合后续作为关键帧和角色一致性参考资产。",
            ]
        )
        negative_prompt = self._merge_negative_prompts(
            character.negative_prompt,
            character.negative_prompt_terms,
            character.negative_keywords,
            style_template.negative_prompt if style_template else None,
            payload.negative_prompt,
            "低清晰度、脸部崩坏、肢体畸形、服饰错乱、水印、文字乱码",
        )
        return "\n".join(
            [
                f"任务：{generation_label}",
                f"角色：{character.name}",
                f"外观设定：{character.appearance or character.positive_prompt_terms or '未设置'}",
                f"服饰设定：{character.costume or character.yingge_role or '未设置'}",
                f"武器/道具：{character.weapons or character.weapon or '未设置'}",
                f"脸谱主色：{character.facepaint_main_color or '未设置'}",
                f"脸谱纹样：{character.facepaint_patterns or '未设置'}",
                f"风格模板：{style_prompt}",
                f"用户补充：{user_prompt}",
                *reference_fidelity_lines,
                *task_specific_rules,
                f"负面约束：{negative_prompt}",
                "输出要求：生成结果先作为候选角色生成资产，不直接覆盖人工参考图库。",
            ]
        )

    def _build_character_lookdev_prompt_text(
        self,
        payload: CharacterImageTaskCreate,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> str:
        reference_lines = self._build_reference_fidelity_lines(payload.generation_type, input_assets, style_template)
        identity = "，".join(part for part in [character.name, character.alias, character.rank, character.star] if part) or character.name
        appearance = character.appearance or character.positive_prompt_terms or "吸收风格模板人物图的高级脸部审美、五官精致度、画面完成度和气质表达，同时保持英歌角色辨识度"
        costume = character.costume or "根据真人英歌妆照和脸谱参考保留服装结构、头饰、腰饰、鞋履、服装固有色、局部配色、纹样颜色和材质层次"
        weapon = character.weapons or character.weapon or "角色参考图中的原有武器与道具"
        facepaint = "，".join(part for part in [character.facepaint_main_color, character.facepaint_patterns] if part) or "角色参考图中的脸谱颜色、边界和纹样"
        user_prompt = payload.prompt_text.strip() or "生成一张可采纳为四视图主参考的角色标准形象图。"
        style_lines = self._style_transfer_style_lines(style_template)
        negative_prompt = payload.negative_prompt or (style_template.negative_prompt if style_template else character.negative_prompt or character.negative_keywords or "低清晰度、脸部崩坏、肢体畸形、服饰错乱、水印、文字乱码")

        return "\n".join(
            [
                "生成一张单人角色标准形象图，用于后续四视图和关键帧角色一致性参考；这不是普通真人风格转换，而是风格角色化定稿：风格模板人物图决定脸部审美、画风、渲染质感、光影、构图气质和高级感，角色事实参考图决定英歌脸谱、服装结构、服装颜色、头饰、武器道具、体态比例和角色身份。",
                f"角色定稿主体：{identity}，{appearance}；最终角色必须是同一名英歌角色，不是照搬风格模板人物身份。脸谱保持{facepaint}，脸谱主色只用于脸谱区域；身穿{costume}；武器/道具为{weapon}，保留角色参考图中的位置、尺寸关系、材质和颜色。",
                f"风格融合方式：{style_lines} 吸收风格模板人物图的脸部审美、画面质感、光影组织、构图气质和漂亮程度，但不得覆盖角色事实参考图中的脸谱结构、服装固有色、局部配色、纹样颜色、武器/道具颜色和角色身份。用户补充：{user_prompt}",
                *reference_lines,
                "输出构图：单人半身或 3/4 身定妆照，主体清晰，表情稳定，姿态自然有角色气势，背景简洁不抢主体，适合作为后续四视图主参考图。",
                "输出质量：脸部精致但保持角色辨识度，脸谱边界准确，皮肤和妆面细腻，服装纹理清晰，刺绣/织物/金属/皮革材质真实，道具边缘锐利，焦内锐利，电影级质感，专业角色概念设计完成度。",
                f"负面约束：{negative_prompt}、照搬风格模板人物身份、丢失英歌脸谱、脸谱错位、服装改色、道具改色、参考图彩色服装变黑白、风格模板色板污染服装、多人、背景抢主体、文字、水印。",
                "输出要求：生成结果先作为候选角色生成资产，人工采纳后可作为四视图主参考。",
            ]
        )

    def _build_style_transfer_prompt_text(
        self,
        payload: CharacterImageTaskCreate,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> str:
        reference_lines = self._build_reference_fidelity_lines(payload.generation_type, input_assets, style_template)
        identity = "，".join(part for part in [character.name, character.alias, character.rank, character.star] if part) or character.name
        appearance = character.appearance or character.positive_prompt_terms or "按真人妆照参考图保持五官比例、脸型轮廓、发型头饰、体态比例和人物辨识度"
        costume = character.costume or "按真人妆照参考图逐项还原服装结构、服装固有色、局部配色、纹样颜色、腰饰、鞋履、布料/金属/皮革材质明暗和新旧程度"
        weapon = character.weapons or character.weapon or "按真人妆照参考图保留原有武器与道具"
        facepaint = "，".join(part for part in [character.facepaint_main_color, character.facepaint_patterns] if part) or "按真人妆照参考图保留脸谱颜色、边界和纹样"
        user_prompt = payload.prompt_text.strip() or "把真人妆照转换成目标风格角色图。"
        style_lines = self._style_transfer_style_lines(style_template)
        negative_prompt = payload.negative_prompt or (style_template.negative_prompt if style_template else character.negative_prompt or character.negative_keywords or "低清晰度、脸部崩坏、肢体畸形、服饰错乱、水印、文字乱码")

        return "\n".join(
            [
                "基于所选真人妆照参考图进行风格转换，保持同一人物、同一脸谱、同一服装、同一道具、同一体态比例；真人参考图决定画什么，风格模板只决定怎么画，只转换画面风格、线条、渲染、光影、质感和背景处理，不重新设计角色。",
                f"主体保真：角色为{identity}，{appearance}；脸谱保持{facepaint}，脸谱主色只用于脸谱区域，不扩散到服装、腰带、鞋履、武器或道具；身穿{costume}；武器/道具为{weapon}，位置、朝向、尺寸关系和持握方式按真人参考图保持。",
                f"目标风格迁移：{style_lines} 风格模板只作用于画风、线条、色彩氛围、光影组织、渲染颗粒、材质表现和背景处理；不得改写真人参考图中的人物身份、脸谱结构、服装固有色、局部配色、纹样颜色、武器/道具颜色和材质。用户补充：{user_prompt}",
                *reference_lines,
                "输出质量：单人主体清晰，脸谱边界准确，皮肤和妆面细腻，服装纹理清晰，刺绣/织物/金属/皮革材质真实，道具边缘锐利，焦内锐利，电影级质感，画面干净，主体突出。",
                f"负面约束：{negative_prompt}、身份改变、脸谱错位、服装改色、道具改色、参考图彩色服装变黑白、风格模板色板污染服装、无关现代服装、背景抢主体、多人、文字、水印。",
                "输出要求：生成结果先作为候选角色生成资产，不直接覆盖人工参考图库。",
            ]
        )

    def _style_transfer_style_lines(self, style_template: StyleTemplate | None) -> str:
        if style_template is None:
            return "使用当前项目默认英歌漫剧风格，主体清晰，光影稳定，背景弱化。"
        fields = [
            ("视觉摘要", style_template.visual_summary),
            ("线条", style_template.line_style),
            ("色彩氛围", style_template.color_palette),
            ("光影", style_template.lighting_style),
            ("构图", style_template.composition_style),
            ("人物渲染", style_template.character_rendering),
            ("背景处理", style_template.background_rendering),
            ("质感", style_template.texture_keywords),
            ("英歌迁移", style_template.yingge_adaptation),
            ("生图模板", style_template.image_prompt_template),
        ]
        parts = [f"{label}：{value}" for label, value in fields if value and value != "未识别"]
        return "；".join(parts) + ("。" if parts else "使用当前项目默认英歌漫剧风格。")

    def _append_reference_fidelity_contract(
        self,
        prompt_text: str,
        *,
        generation_type: str,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> str:
        lines = self._build_reference_fidelity_lines(generation_type, input_assets, style_template)
        if not lines:
            return prompt_text
        return "\n".join([prompt_text, "参考图配色保真契约：", *lines])

    def _build_reference_fidelity_lines(
        self,
        generation_type: str,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> list[str]:
        if not input_assets:
            return []
        asset_lines = [
            f"第{index}张参考图（{self._reference_type_label(asset.reference_type)}）：逐像素观察并保留其中人物服装、头饰、腰饰、绑带、鞋履、武器/道具的固有色、局部配色、纹样颜色、金属/布料/皮革材质明暗和新旧程度。"
            for index, asset in enumerate(input_assets, start=1)
        ]
        shared_lines = [
            "颜色优先级：真人/实拍参考图中的服装和道具颜色 > 角色文字档案 > 风格模板色板 > 通用审美色调。",
            "风格模板只迁移画风、线条、渲染颗粒、光影组织和质感层次；不得把风格模板的色板套到服装或道具上。",
            "脸谱主色只用于脸谱区域；不得把脸谱黑白、青黑、红白等颜色扩散到衣服、腰带、鞋履、武器或道具。",
            "如果参考图中的服装/道具是彩色，最终图必须保持彩色；禁止统一改成黑白、灰阶、银黑或低饱和单色。",
        ]
        if generation_type == "four_view":
            task_lines = [
                "四视图配色规则：左侧特写、右侧正面、侧面、背面必须使用同一套参考图服装和道具配色；不同视角只能改变可见面，不能改变颜色方案。",
                "正面参考图优先锁定正面衣身、腰饰、手持道具和鞋履颜色；侧面参考图优先锁定侧身拼接、绑带、武器悬挂和道具侧面颜色；背面参考图优先锁定背饰、背后武器、衣摆和后腰结构颜色。",
            ]
        elif generation_type == "character_lookdev":
            task_lines = [
                "角色形象定稿规则：风格模板人物图可以提供脸部审美、质感、光影和构图气质，但不能替换角色身份、脸谱、服装事实和道具事实。",
                "最终图必须是新的英歌角色标准形象图，不是把真人照简单滤镜化，也不是照搬风格模板人物。",
            ]
        else:
            task_lines = [
                "风格转换配色规则：目标图只转换画风和摄影质感，不重新设计服装、道具、头饰和脸谱的颜色。",
                "真人妆照里的服装、道具和头饰色块必须逐项还原；背景和光影可以风格化，但不能污染主体固有色。",
            ]
        if style_template and style_template.color_palette:
            task_lines.append(f"已绑定风格模板色彩：{style_template.color_palette}。这只作为背景、光影和整体质感参考，不作为服装/道具改色依据。")
        return [*asset_lines, *shared_lines, *task_lines]

    def _reference_type_label(self, reference_type: str | None) -> str:
        labels = {
            "facepaint": "脸谱参考",
            "facepaint_reference": "脸谱参考",
            "full_body_front_photo": "真人正面全身参考",
            "half_side_photo_1": "真人半侧参考 1",
            "half_side_photo_2": "真人半侧参考 2",
            "back_photo": "真人背面参考",
            "character_final_reference": "角色定稿参考",
        }
        return labels.get(reference_type or "", reference_type or "角色参考")

    def _generation_type_label(self, generation_type: str | None) -> str:
        labels = {
            "four_view": "角色四视图",
            "style_transfer": "真人妆照风格转换",
            "character_lookdev": "角色形象定稿",
        }
        return labels.get(generation_type or "", generation_type or "角色生成")

    def _generate_four_view_prompt_draft(
        self,
        payload: CharacterImagePromptDraftCreate,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> dict:
        if (payload.model_provider or "").lower() == "mock" or payload.model_name.startswith("mock"):
            prompt_text = self._build_four_view_prompt_text(character, style_template)
            negative_prompt = self._merge_negative_prompts(
                character.negative_prompt,
                character.negative_prompt_terms,
                character.negative_keywords,
                style_template.negative_prompt if style_template else None,
                payload.negative_prompt,
                "多人物、视图不统一、服装漂移、服装颜色漂移、参考图服装被改色、彩色服装变黑白、脸谱主色污染服装、妆造漂移、道具漂移、手指错误、肢体畸形、背景杂物、水印、文字乱码、低清晰度",
            )
            return {
                "prompt_text": prompt_text,
                "negative_prompt": negative_prompt,
                "checklist": self._build_prompt_checklist(prompt_text),
                "raw_response": {"mock": True, "message": "本地固定四视图模板生成。"},
            }

        settings = get_settings()
        if settings.ai_provider.lower() != "dmx" or not settings.dmx_api_key:
            raise AIProviderError("未配置 DMXAPI，无法调用模型生成四视图 Prompt。")

        system_prompt = self._build_four_view_prompt_system_prompt()
        user_prompt = self._build_four_view_prompt_user_prompt(payload, character, input_assets, style_template)
        provider = DMXAIProvider(
            api_key=settings.dmx_api_key,
            base_url=settings.dmx_base_url,
            default_model=payload.model_name,
            timeout_seconds=settings.dmx_timeout_seconds,
        )
        content = provider.generate_text(
            user_prompt,
            system_prompt=system_prompt,
            temperature=payload.temperature,
            max_tokens=1800,
            model=payload.model_name,
        )
        parsed = self._parse_prompt_draft_response(content)
        negative_prompt = self._merge_negative_prompts(
            parsed["negative_prompt"],
            payload.negative_prompt,
        )
        return {
            "prompt_text": parsed["prompt_text"],
            "negative_prompt": negative_prompt,
            "checklist": self._build_prompt_checklist(parsed["prompt_text"]),
            "raw_response": {"mock": False, "content": content},
        }

    def _generate_character_lookdev_prompt_draft(
        self,
        payload: CharacterImagePromptDraftCreate,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> dict:
        if (payload.model_provider or "").lower() == "mock" or payload.model_name.startswith("mock"):
            prompt_text = self._build_character_lookdev_prompt_draft_text(payload, character, input_assets, style_template)
            negative_prompt = self._merge_negative_prompts(
                character.negative_prompt,
                character.negative_prompt_terms,
                character.negative_keywords,
                style_template.negative_prompt if style_template else None,
                payload.negative_prompt,
                "低清晰度、脸部崩坏、肢体畸形、服饰错乱、脸谱错位、道具变形、服装改色、照搬模板人物身份、多人、背景抢主体、水印、文字乱码",
            )
            return {
                "prompt_text": prompt_text,
                "negative_prompt": negative_prompt,
                "checklist": self._build_lookdev_prompt_checklist(prompt_text, negative_prompt),
                "raw_response": {"mock": True, "message": "本地固定角色定稿模板生成。"},
            }

        settings = get_settings()
        if settings.ai_provider.lower() != "dmx" or not settings.dmx_api_key:
            raise AIProviderError("未配置 DMXAPI，无法调用模型生成角色定稿 Prompt。")

        system_prompt = self._build_character_lookdev_prompt_system_prompt()
        user_prompt = self._build_character_lookdev_prompt_user_prompt(payload, character, input_assets, style_template)
        provider = DMXAIProvider(
            api_key=settings.dmx_api_key,
            base_url=settings.dmx_base_url,
            default_model=payload.model_name,
            timeout_seconds=settings.dmx_timeout_seconds,
        )
        content = provider.generate_text(
            user_prompt,
            system_prompt=system_prompt,
            temperature=payload.temperature,
            max_tokens=1800,
            model=payload.model_name,
        )
        parsed = self._parse_prompt_draft_response(content)
        negative_prompt = self._merge_negative_prompts(
            parsed["negative_prompt"],
            character.negative_prompt,
            character.negative_prompt_terms,
            character.negative_keywords,
            style_template.negative_prompt if style_template else None,
            payload.negative_prompt,
            "低清晰度、脸部崩坏、肢体畸形、服饰错乱、脸谱错位、道具变形、服装改色、照搬模板人物身份、多人、背景抢主体、水印、文字乱码",
        )
        return {
            "prompt_text": parsed["prompt_text"],
            "negative_prompt": negative_prompt,
            "checklist": self._build_lookdev_prompt_checklist(parsed["prompt_text"], negative_prompt),
            "raw_response": {"mock": False, "content": content},
        }

    def _build_character_lookdev_prompt_draft_text(
        self,
        payload: CharacterImagePromptDraftCreate,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> str:
        identity = "，".join(part for part in [character.name, character.alias, character.rank, character.star] if part) or character.name
        appearance = character.appearance or character.positive_prompt_terms or "保持英歌角色辨识度，五官精致，气质稳定"
        costume = character.costume or "参考图同款英歌服饰，逐项保留头饰、上衣、下装、腰饰、绑带、鞋履、服装固有色、局部配色、纹样颜色和材质层次"
        weapon = character.weapons or character.weapon or "角色参考图中的原有武器与道具"
        facepaint = "，".join(part for part in [character.facepaint_main_color, character.facepaint_patterns] if part) or "参考图同款脸谱颜色、边界和纹样"
        temperament = character.visual_tone_keywords or character.yingge_role or "潮汕英歌水浒人物气质，庄重、热血、角色辨识度强"
        user_prompt = payload.prompt_text.strip() if payload.prompt_text else "强化角色完成度和可采纳程度。"
        reference_summary = self._lookdev_reference_summary(input_assets)
        style_phrase = self._lookdev_style_phrase(style_template)

        return "\n".join(
            [
                "生成一张单人角色定稿主视觉，用于确认角色标准形象并适合后续纳入参考图库；这不是四视图，不是场景图，不是关键帧，也不是把真人照片简单滤镜化，而是面向后续四视图生成的标准角色概念设计图。",
                f"参考图职责清晰：{reference_summary}；脸谱参考图只锁定脸谱颜色、边界、纹样和妆面层次，真人/角色事实参考图锁定服装结构、服装固有色、头饰、腰饰、鞋履、武器道具、体态比例和角色身份，角色模板只提供脸部审美、画风、线条、渲染质感、光影组织和构图气质，不得替换角色事实。",
                f"角色为{identity}，{temperament}，{appearance}；脸谱为{facepaint}，脸谱主色只作用于脸谱区域，不扩散到服装、腰带、鞋履、武器或道具；身穿{costume}；武器/道具为{weapon}，保留参考图中的位置、尺寸关系、材质和颜色。用户补充：{user_prompt}",
                f"构图为单人半身或 3/4 身定妆照，主体居中，表情稳定，姿态自然但有英歌角色气势，背景简洁不抢主体；{style_phrase} 输出质量要求脸部精致但不换人，脸谱边界准确，服装纹理清晰，刺绣/织物/金属/皮革材质真实，道具边缘锐利，焦内锐利，电影级质感，专业角色概念设计完成度。",
            ]
        )

    def _lookdev_reference_summary(self, input_assets: list[Asset]) -> str:
        if not input_assets:
            return "如未勾选参考图，则以角色文字档案和角色模板共同约束，但仍需避免凭空换脸、换服装或换道具"
        labels = [f"第{index}张{self._reference_type_label(asset.reference_type)}" for index, asset in enumerate(input_assets, start=1)]
        return "、".join(labels)

    def _lookdev_style_phrase(self, style_template: StyleTemplate | None) -> str:
        if style_template is None:
            return "整体使用当前项目默认英歌漫剧角色设定风格，主体清晰，光影稳定，背景弱化。"
        parts = [
            style_template.visual_summary,
            style_template.line_style,
            style_template.lighting_style,
            style_template.composition_style,
            style_template.character_rendering,
            style_template.texture_keywords,
            style_template.yingge_adaptation,
        ]
        compact = "，".join(part for part in parts if part and part != "未识别")
        return f"角色模板风格参考：{compact}。" if compact else "角色模板只作为画风、光影、渲染和质感参考。"

    def _build_character_lookdev_prompt_system_prompt(self) -> str:
        return "\n".join(
            [
                "你是 AI 角色定稿提示词工程师。",
                "你要生成用于角色中心“角色定稿”的中文生图 Prompt，不要写四视图，不要写场景图，不要写关键帧。",
                "提示词必须是 4 段自然中文：任务目标段；参考图职责与模板边界段；角色身份与视觉锚点段；构图和质量段。",
                "必须明确：脸谱参考图只锁定脸谱；真人/角色事实参考图锁定服装、颜色、头饰、道具和体态；角色模板只提供脸部审美、画风、渲染、光影和构图气质。",
                "必须写清楚服装固有色和道具颜色以事实参考图为最高优先级，禁止让风格模板色板改写服装或道具。",
                "只输出以下格式，不要 Markdown，不要解释：\n正向提示词：...\n负面提示词：...",
            ]
        )

    def _build_character_lookdev_prompt_user_prompt(
        self,
        payload: CharacterImagePromptDraftCreate,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> str:
        snapshot = self._build_input_snapshot(character, input_assets, style_template)
        return "\n".join(
            [
                "请生成中文角色定稿生图提示词。",
                "第一段必须包含“单人角色定稿主视觉”“不是四视图”“不是场景图”。",
                "第二段必须包含“脸谱参考图只锁定脸谱”“真人/角色事实参考图”“角色模板只提供”。",
                "第三段必须包含角色身份、脸谱、身穿、武器/道具，并吸收用户补充。",
                "第四段必须包含“半身或 3/4 身”“背景简洁”“适合后续纳入参考图库”或同义表达。",
                f"已有用户补充：{payload.prompt_text or '无'}",
                f"已有负面词：{payload.negative_prompt or '无'}",
                "输入快照 JSON：",
                json.dumps(snapshot, ensure_ascii=False, indent=2),
            ]
        )

    def _build_four_view_prompt_text(self, character: Character, style_template: StyleTemplate | None) -> str:
        identity = "，".join(part for part in [character.name, character.alias, character.rank, character.star] if part)
        appearance = character.appearance or character.positive_prompt_terms or "按参考图还原五官比例、脸型轮廓、发型头饰与人物气质，保持同一人物辨识度"
        costume = character.costume or "参考图同款英歌服饰，逐项还原上衣、下装、腰带、绑带、头饰、鞋履的服装固有色、局部配色、纹样颜色、材质明暗和新旧程度"
        weapon = character.weapons or character.weapon or "参考图中的原有武器与道具"
        facepaint = "，".join(part for part in [character.facepaint_main_color, character.facepaint_patterns] if part) or "参考图同款脸谱颜色与纹样"
        temperament = character.visual_tone_keywords or character.yingge_role or "潮汕英歌水浒人物气质，庄重、热血、动作节奏清晰，角色辨识度强"
        style_phrase = self._four_view_style_phrase(style_template)
        return "\n".join(
            [
                "16:9画幅，人物四视图排版，左侧上半身特写，右侧并列全身正、侧、背面视图，同一人物，服装、妆造、脸谱、道具、身形比例、光影统一；核心侧逆光，形成轮廓光与发丝光，面部低强度伦勃朗补光（面光弱于侧逆光），明暗分明，无死黑过曝，光影统一；纯白极简影棚背景，干净无杂物，视图背景统一。",
                f"超写实人像，{identity or character.name}，{temperament}，{appearance}；脸谱为{facepaint}，脸谱主色只作用于脸谱区域，不扩散到服装、腰带、鞋履、武器或道具。身穿{costume}，服装与道具配色严格以参考图为最高优先级，风格模板只迁移画风、线条、渲染、光影和整体质感，不改写参考图中的服装颜色；不要把黑白脸谱当作服装颜色，不要把风格模板色板或整体色彩分级当作服装颜色，不要把彩色服装生成黑白色调。{style_phrase}",
                f"佩戴参考图同款头饰与妆造，手持或携带{weapon}，姿态稳定有英歌表演张力；左侧特写展示脸谱、五官、头饰、上半身服装纹理和主要道具细节，右侧正面展示完整服装结构、腰饰、鞋履、武器/道具位置，侧面展示侧身轮廓、头饰厚度、服装层次与道具空间关系，背面展示背后服装结构、背饰、武器/道具背部位置，所有视图动作、道具、服装配色、脸谱纹样、身形比例和光影统一。",
                "极致细节，皮肤细腻，妆面干净，脸谱边界清晰，发丝分明，服装纹理清晰，刺绣/暗纹/织物/金属/皮革材质真实，武器道具边界锐利，焦内锐利，电影级质感，专业影棚摄影，景深自然。",
            ]
        )

    def _four_view_style_phrase(self, style_template: StyleTemplate | None) -> str:
        if style_template is None:
            return "整体为超写实角色设定图质感。"
        parts = [
            style_template.visual_summary,
            style_template.line_style,
            style_template.lighting_style,
            style_template.character_rendering,
            style_template.texture_keywords,
        ]
        compact = "，".join(part for part in parts if part and part != "未识别")
        return f"整体风格参考：{compact}。" if compact else "整体为超写实角色设定图质感。"

    def _compact_style_lines(self, style_template: StyleTemplate | None) -> list[str]:
        if style_template is None:
            return ["风格规则：使用当前项目默认英歌漫剧角色设定风格，避免风格抢走角色事实。"]
        candidates = [
            ("风格摘要", style_template.visual_summary),
            ("线条/边缘", style_template.line_style),
            ("色彩", style_template.color_palette),
            ("光影", style_template.lighting_style),
            ("人物渲染", style_template.character_rendering),
            ("英歌迁移", style_template.yingge_adaptation),
            ("质感", style_template.texture_keywords),
        ]
        return [f"{label}：{value}" for label, value in candidates if value and value != "未识别"]

    def _build_four_view_prompt_system_prompt(self) -> str:
        return "\n".join(
            [
                "你是 AI 角色四视图提示词工程师。",
                "你必须严格复刻优秀四视图提示词的写法：不是说明书，不要分点，不要字段标签，而是 4 段自然中文生图 Prompt。",
                "第 1 段固定写版式、统一性、核心侧逆光、轮廓光/发丝光、低强度伦勃朗补光、纯白极简影棚背景。",
                "第 2 段写超写实人像、角色身份、气质、五官/脸谱/发型，并紧接着用“身穿...”详细写服装颜色、纹样、材质、腰带、鞋履；服装和道具配色必须以参考图为最高优先级。",
                "第 3 段写头饰、武器/道具、姿态和左侧特写/右侧正面/侧面/背面的具体展示内容，所有视图动作、道具、服装配色、脸谱纹样、身形比例和光影统一。",
                "第 4 段写极致细节、皮肤、发丝、服装纹理、材质、焦内锐利、电影级质感、专业影棚摄影、景深自然。",
                "风格模板只迁移画风、线条、渲染、光影和整体质感，不得改写参考图中的服装或道具颜色。",
                "脸谱主色只用于脸谱区域；禁止把脸谱主色、黑白脸谱、风格模板色板或整体色彩分级当作服装颜色；禁止把彩色服装生成黑白色调。",
                "只输出以下格式，不要 Markdown，不要解释：\n正向提示词：...\n负面提示词：...",
            ]
        )

    def _build_four_view_prompt_user_prompt(
        self,
        payload: CharacterImagePromptDraftCreate,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> str:
        snapshot = self._build_input_snapshot(character, input_assets, style_template)
        return "\n".join(
            [
                "请生成中文四视图生图提示词。",
                "严格使用 4 段自然生图 Prompt：版式光影背景段；人物身份与服装段；头饰道具动作与四视图段；画质细节段。",
                "第一句话必须以“16:9画幅，人物四视图排版，左侧上半身特写，右侧并列全身正、侧、背面视图”开头。",
                "人物段必须包含“超写实人像”和“身穿”。",
                "动作段必须包含“左侧特写”“右侧正面”“侧面”“背面”。",
                "画质段必须包含“极致细节”“服装纹理清晰”“电影级质感”“专业影棚摄影”。",
                f"已有用户补充：{payload.prompt_text or '无'}",
                f"已有负面词：{payload.negative_prompt or '无'}",
                "输入快照 JSON：",
                json.dumps(snapshot, ensure_ascii=False, indent=2),
            ]
        )

    def _parse_prompt_draft_response(self, content: str) -> dict[str, str]:
        positive_match = re.search(r"正向提示词[:：]\s*([\s\S]*?)(?:\n+负面提示词[:：]|$)", content)
        negative_match = re.search(r"负面提示词[:：]\s*([\s\S]*)$", content)
        prompt_text = positive_match.group(1).strip() if positive_match else content.strip()
        negative_prompt = negative_match.group(1).strip() if negative_match else ""
        if not prompt_text:
            raise AIProviderError("Prompt 生成返回缺少正向提示词。")
        return {"prompt_text": prompt_text, "negative_prompt": negative_prompt}

    def _merge_negative_prompts(self, *values: str | None) -> str:
        items: list[str] = []
        for value in values:
            if not value:
                continue
            cleaned = value.replace("避免：", "").replace("。", "、").replace("，", "、").replace(",", "、")
            for item in cleaned.split("、"):
                term = item.strip(" ；;.")
                if term and term not in items:
                    items.append(term)
        return "、".join(items)

    def _build_prompt_checklist(self, prompt_text: str) -> dict[str, bool]:
        return {
            "fixed_layout": all(term in prompt_text for term in ["16:9", "左侧上半身特写", "正面", "侧面", "背面"]),
            "consistent_lighting": all(term in prompt_text for term in ["侧逆光", "轮廓光", "光影统一"]),
            "character_anchors": all(term in prompt_text for term in ["同一人物", "服装", "妆造", "道具"]),
            "view_specific_poses": all(term in prompt_text for term in ["左侧特写", "右侧正面", "侧面", "背面"]),
            "clean_background": "纯白" in prompt_text and "背景" in prompt_text,
        }

    def _build_lookdev_prompt_checklist(self, prompt_text: str, negative_prompt: str) -> dict[str, bool]:
        return {
            "single_character": all(term in prompt_text for term in ["单人角色定稿主视觉", "不是四视图", "不是场景图"]),
            "reference_roles": all(term in prompt_text for term in ["脸谱参考图只锁定脸谱", "真人/角色事实参考图", "角色模板只提供"]),
            "template_boundary": all(term in prompt_text for term in ["不得替换角色事实", "不扩散到服装", "角色模板风格参考"]),
            "manual_reference_ready": "适合后续纳入参考图库" in prompt_text,
            "negative_controls": all(term in negative_prompt for term in ["照搬模板人物身份", "水印", "文字乱码"]),
        }

    def _assemble_style_prompt(self, style_template: StyleTemplate | None) -> str:
        if style_template is None:
            return "使用当前项目默认漫剧风格。"
        return "\n".join(
            [
                f"风格名称：{style_template.name}",
                f"识别状态：{style_template.analysis_status}",
                f"视觉摘要：{style_template.visual_summary or '未识别'}",
                f"线条特征：{style_template.line_style or '未识别'}",
                f"色彩倾向：{style_template.color_palette or '未识别'}",
                f"光影特征：{style_template.lighting_style or '未识别'}",
                f"构图倾向：{style_template.composition_style or '未识别'}",
                f"人物表现：{style_template.character_rendering or '未识别'}",
                f"背景处理：{style_template.background_rendering or '未识别'}",
                f"质感关键词：{style_template.texture_keywords or '未识别'}",
                f"英歌迁移规则：{style_template.yingge_adaptation or '未识别'}",
                f"生图模板：{style_template.image_prompt_template or '未识别'}",
            ]
        )

    def _asset_to_gemini_image(self, asset: Asset) -> GeminiImageInput:
        data = self._read_asset_bytes(asset)
        return GeminiImageInput(data=data, mime_type=asset.mime_type or self._guess_mime_type(asset.filename))

    def _asset_to_gpt_image(self, asset: Asset) -> GPTImageInput:
        data = self._read_asset_bytes(asset)
        return GPTImageInput(
            data=data,
            mime_type=asset.mime_type or self._guess_mime_type(asset.filename),
            filename=asset.filename or f"{asset.id}.png",
        )

    def _asset_to_seedream_image(self, asset: Asset) -> SeedreamImageInput:
        data = self._read_asset_bytes(asset)
        return SeedreamImageInput(data=data, mime_type=asset.mime_type or self._guess_mime_type(asset.filename))

    def _read_asset_bytes(self, asset: Asset) -> bytes:
        if asset.object_key:
            try:
                return self.storage.get_bytes(asset.object_key)
            except Exception:
                pass
        if not asset.url:
            raise RuntimeError(f"参考图 {asset.filename} 缺少可读取的 URL 或 object_key。")
        response = httpx.get(asset.url, timeout=60, follow_redirects=True, trust_env=False)
        response.raise_for_status()
        return response.content

    def _create_generated_output_asset(
        self,
        *,
        task: GenerateTask,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
        image_bytes: bytes,
        mime_type: str,
        index: int,
    ) -> Asset:
        extension = self._extension_from_mime_type(mime_type)
        filename = f"{character.name}-{task.generation_type or 'generated'}-{index}.{extension}"
        object_key = self.storage.build_key("generated-assets/characters", filename)
        url = self.storage.put_bytes(object_key, image_bytes, content_type=mime_type)
        generation_names = {
            "four_view": "四视图候选",
            "style_transfer": "风格转换候选",
            "character_lookdev": "形象定稿候选",
        }
        generation_name = generation_names.get(task.generation_type or "", "角色生成候选")
        asset = Asset(
            character_id=character.id,
            asset_type="image",
            filename=filename,
            mime_type=mime_type,
            size_bytes=len(image_bytes),
            provider=self.storage.name,
            bucket=getattr(self.storage, "bucket", None),
            region=getattr(self.storage, "region", None),
            object_key=object_key,
            url=url,
            title=f"{character.name} · {generation_name} #{index}",
            note="AI 图片模型输出：候选角色生成资产，需人工采纳后才进入关键帧链路。",
            reference_type="generated_asset",
            asset_origin="generated",
            generation_type=task.generation_type,
            source_reference_asset_ids=[asset.id for asset in input_assets],
            style_template_id=style_template.id if style_template else None,
            generate_task_id=task.id,
            accepted_for_keyframe=False,
            quality_note="待人工检查脸谱、服饰、武器、体态和风格一致性。",
            status="ready",
        )
        self.session.add(asset)
        self.session.flush()
        return asset

    def _guess_mime_type(self, filename: str) -> str:
        suffix = Path(filename).suffix.lower()
        if suffix in {".jpg", ".jpeg"}:
            return "image/jpeg"
        if suffix == ".webp":
            return "image/webp"
        if suffix == ".gif":
            return "image/gif"
        return "image/png"

    def _extension_from_mime_type(self, mime_type: str) -> str:
        if mime_type == "image/jpeg":
            return "jpg"
        if mime_type == "image/webp":
            return "webp"
        if mime_type == "image/gif":
            return "gif"
        return "png"

    def _create_mock_output_asset(
        self,
        task: GenerateTask,
        character: Character,
        input_assets: list[Asset],
        style_template: StyleTemplate | None,
    ) -> Asset:
        source_asset = input_assets[0] if input_assets else None
        generation_names = {
            "four_view": "四视图候选",
            "style_transfer": "风格转换候选",
            "character_lookdev": "形象定稿候选",
        }
        generation_name = generation_names.get(task.generation_type or "", "角色生成候选")
        asset = Asset(
            character_id=character.id,
            asset_type="image",
            filename=f"mock-{task.generation_type or 'character-image'}.png",
            object_key=f"mock/generated-assets/{task.id}.png",
            url=source_asset.url if source_asset else style_template.source_image_url if style_template else None,
            title=f"{character.name} · {generation_name}",
            note="Mock 输出：用于验证任务流、资产归位和人工采纳链路。",
            reference_type="generated_asset",
            asset_origin="generated",
            generation_type=task.generation_type,
            source_reference_asset_ids=[asset.id for asset in input_assets],
            style_template_id=style_template.id if style_template else None,
            generate_task_id=task.id,
            accepted_for_keyframe=False,
            quality_note="待人工检查角色一致性、脸谱、服饰和风格。",
            status="ready",
        )
        self.session.add(asset)
        self.session.flush()
        return asset
