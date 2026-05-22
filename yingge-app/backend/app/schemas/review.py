"""Review response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import ReviewStatus


class AssetReviewRead(BaseModel):
    """Asset review response."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    asset_id: UUID
    project_id: UUID | None
    shot_id: UUID | None
    panel_id: UUID | None
    status: ReviewStatus
    reviewer_id: UUID | None
    failure_reason_codes: dict | None
    comment: str | None
    reflection_suggestion: str | None
    created_at: datetime
    updated_at: datetime
