"""Project response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import ProjectStatus


class ProjectListItem(BaseModel):
    """Project list item."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    name: str
    description: str | None
    status: ProjectStatus
    platform: str | None
    duration_seconds: int | None
    aspect_ratio: str | None
    created_at: datetime
    updated_at: datetime


class ProjectRead(ProjectListItem):
    """Project detail response."""

    current_character_id: UUID | None
    metadata_: dict | None = None
