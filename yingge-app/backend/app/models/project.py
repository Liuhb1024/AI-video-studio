"""Project ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ProjectStatus
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.cost import CostRecord
    from app.models.export_plan import ExportPlan
    from app.models.generation_task import GenerationTask
    from app.models.prompt import PromptDraft
    from app.models.reflection import ReflectionNote
    from app.models.review import AssetReview
    from app.models.script import Script


class Project(Base):
    """Yingge short-video project."""

    __tablename__ = "projects"
    __table_args__ = (
        Index("ix_projects_status", "status"),
        Index("ix_projects_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(
            ProjectStatus,
            name="project_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=ProjectStatus.DRAFT,
        server_default=ProjectStatus.DRAFT.value,
    )
    current_character_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    platform: Mapped[str | None] = mapped_column(String(100), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    aspect_ratio: Mapped[str | None] = mapped_column(String(50), nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    scripts: Mapped[list[Script]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    prompt_drafts: Mapped[list[PromptDraft]] = relationship(back_populates="project")
    generation_tasks: Mapped[list[GenerationTask]] = relationship(
        back_populates="project"
    )
    assets: Mapped[list[Asset]] = relationship(back_populates="project")
    asset_reviews: Mapped[list[AssetReview]] = relationship(back_populates="project")
    cost_records: Mapped[list[CostRecord]] = relationship(back_populates="project")
    export_plans: Mapped[list[ExportPlan]] = relationship(back_populates="project")
    reflection_notes: Mapped[list[ReflectionNote]] = relationship(
        back_populates="project"
    )
