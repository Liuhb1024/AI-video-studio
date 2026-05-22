"""Shot response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import ShotStatus


class ShotRead(BaseModel):
    """Shot response."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    script_id: UUID
    character_id: UUID | None
    shot_no: int
    title: str
    duration_seconds: int | None
    narration_segment: str | None
    visual_description: str | None
    action: str | None
    emotion: str | None
    camera_movement: str | None
    scene: str | None
    consistency_status: str | None
    prompt_status: str | None
    status: ShotStatus
    metadata_: dict | None = None
    created_at: datetime
    updated_at: datetime
