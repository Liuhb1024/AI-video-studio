"""Generation task response schemas."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import GenerationTaskStatus, GenerationTaskType


class GenerationTaskRead(BaseModel):
    """Generation task response."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    project_id: UUID | None
    shot_id: UUID | None
    panel_id: UUID | None
    prompt_id: UUID | None
    type: GenerationTaskType
    status: GenerationTaskStatus
    provider: str | None
    model: str | None
    mode: str | None
    progress: int
    estimated_cost: Decimal | None
    actual_cost: Decimal | None
    started_at: datetime | None
    finished_at: datetime | None
    failure_reason: str | None
    retry_count: int
    metadata_: dict | None = None
    created_at: datetime
    updated_at: datetime
