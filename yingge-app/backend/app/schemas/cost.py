"""Cost response schemas."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import CostRecordType


class CostRecordRead(BaseModel):
    """Cost record response."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    project_id: UUID | None
    task_id: UUID | None
    asset_id: UUID | None
    provider: str | None
    model: str | None
    type: CostRecordType
    amount: Decimal
    currency: str
    metadata_: dict | None = None
    created_at: datetime
    updated_at: datetime
