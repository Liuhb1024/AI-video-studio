"""Asset response schemas."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import AssetStatus, AssetType


class AssetRead(BaseModel):
    """Asset response."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    project_id: UUID | None
    shot_id: UUID | None
    panel_id: UUID | None
    prompt_id: UUID | None
    task_id: UUID | None
    type: AssetType
    status: AssetStatus
    uri: str | None
    thumbnail_uri: str | None
    model: str | None
    provider: str | None
    cost: Decimal | None
    consistency_score: Decimal | None
    failure_reasons: dict | None
    metadata_: dict | None = None
    created_at: datetime
    updated_at: datetime
