from datetime import datetime

from pydantic import BaseModel, Field

from app.modules._schemas import ORM_MODEL_CONFIG


class AssetCreate(BaseModel):
    filename: str
    object_key: str
    asset_type: str = "image"
    project_id: str | None = None
    shot_id: str | None = None
    character_id: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = None
    provider: str = "tencent_cos"
    bucket: str | None = None
    region: str | None = None
    url: str | None = None
    title: str | None = None
    note: str | None = None
    reference_type: str | None = None
    style_board: str | None = None
    asset_origin: str = "uploaded"
    generation_type: str | None = None
    source_reference_asset_ids: list[str] = Field(default_factory=list)
    style_template_id: str | None = None
    generate_task_id: str | None = None
    accepted_for_keyframe: bool = False
    quality_note: str | None = None
    is_primary: bool = False
    deleted_at: datetime | None = None


class AssetRead(AssetCreate):
    model_config = ORM_MODEL_CONFIG

    id: str
    status: str
