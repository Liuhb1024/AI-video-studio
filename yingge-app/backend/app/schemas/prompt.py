"""Prompt response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import PromptStatus, PromptType


class PromptDraftRead(BaseModel):
    """Prompt draft response."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    project_id: UUID | None
    script_id: UUID | None
    shot_id: UUID | None
    panel_id: UUID | None
    type: PromptType
    version: str | None
    status: PromptStatus
    content: str
    positive_keywords: dict | None
    negative_keywords: dict | None
    source_fields: dict | None
    quality_checklist: dict | None
    created_at: datetime
    updated_at: datetime
