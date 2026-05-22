"""Export plan response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import ExportPlanStatus


class ExportPlanRead(BaseModel):
    """Export plan response."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    project_id: UUID
    status: ExportPlanStatus
    title: str | None
    timeline: dict | None
    selected_asset_ids: dict | None
    output_format: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
