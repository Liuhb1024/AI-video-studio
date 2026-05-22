"""Script response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import ScriptStatus


class ScriptRead(BaseModel):
    """Script detail response."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    project_id: UUID
    character_id: UUID | None
    title: str
    platform: str | None
    duration_seconds: int | None
    aspect_ratio: str | None
    tone: str | None
    version: str | None
    status: ScriptStatus
    hook: str | None
    narration: str | None
    ending: str | None
    keywords: list[str] | dict | None
    agent_notes: dict | None
    created_at: datetime
    updated_at: datetime
