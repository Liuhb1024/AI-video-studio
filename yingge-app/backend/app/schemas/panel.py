"""Panel response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import PanelStatus


class PanelRead(BaseModel):
    """Panel response."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    shot_id: UUID
    panel_no: int
    image_description: str | None
    camera: str | None
    motion: str | None
    prompt_status: str | None
    keyframe_status: str | None
    video_status: str | None
    status: PanelStatus
    metadata_: dict | None = None
    created_at: datetime
    updated_at: datetime
