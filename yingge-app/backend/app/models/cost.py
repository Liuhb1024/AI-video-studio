"""Cost record ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import CostRecordType
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.generation_task import GenerationTask
    from app.models.project import Project


class CostRecord(Base):
    """Estimated, actual, or adjustment cost record."""

    __tablename__ = "cost_records"
    __table_args__ = (
        Index("ix_cost_records_project_id", "project_id"),
        Index("ix_cost_records_task_id", "task_id"),
        Index("ix_cost_records_asset_id", "asset_id"),
        Index("ix_cost_records_provider", "provider"),
        Index("ix_cost_records_model", "model"),
        Index("ix_cost_records_type", "type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id"), nullable=True
    )
    task_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("generation_tasks.id"), nullable=True
    )
    asset_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("assets.id"), nullable=True
    )
    provider: Mapped[str | None] = mapped_column(String(100), nullable=True)
    model: Mapped[str | None] = mapped_column(String(255), nullable=True)
    type: Mapped[CostRecordType] = mapped_column(
        Enum(
            CostRecordType,
            name="cost_record_type",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=CostRecordType.ACTUAL,
        server_default=CostRecordType.ACTUAL.value,
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    currency: Mapped[str] = mapped_column(
        String(10), nullable=False, default="CNY", server_default="CNY"
    )
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    project: Mapped[Project | None] = relationship(back_populates="cost_records")
    task: Mapped[GenerationTask | None] = relationship(back_populates="cost_records")
    asset: Mapped[Asset | None] = relationship(back_populates="cost_records")
