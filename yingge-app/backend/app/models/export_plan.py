"""Export plan ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ExportPlanStatus
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.project import Project


class ExportPlan(Base):
    """Export production plan that references selected final assets."""

    __tablename__ = "export_plans"
    __table_args__ = (
        Index("ix_export_plans_project_id", "project_id"),
        Index("ix_export_plans_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id"), nullable=False
    )
    status: Mapped[ExportPlanStatus] = mapped_column(
        Enum(
            ExportPlanStatus,
            name="export_plan_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=ExportPlanStatus.DRAFT,
        server_default=ExportPlanStatus.DRAFT.value,
    )
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    timeline: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    selected_asset_ids: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    output_format: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    project: Mapped[Project] = relationship(back_populates="export_plans")
