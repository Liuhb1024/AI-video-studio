"""Reflection note ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ReflectionSeverity
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.generation_task import GenerationTask
    from app.models.panel import Panel
    from app.models.project import Project
    from app.models.prompt import PromptDraft
    from app.models.shot import Shot


class ReflectionNote(Base):
    """Reflection and improvement suggestion linked to prompts, tasks, or assets."""

    __tablename__ = "reflection_notes"
    __table_args__ = (
        Index("ix_reflection_notes_project_id", "project_id"),
        Index("ix_reflection_notes_shot_id", "shot_id"),
        Index("ix_reflection_notes_task_id", "task_id"),
        Index("ix_reflection_notes_asset_id", "asset_id"),
        Index("ix_reflection_notes_severity", "severity"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id"), nullable=True
    )
    shot_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("shots.id"), nullable=True
    )
    panel_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("panels.id"), nullable=True
    )
    prompt_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("prompt_drafts.id"), nullable=True
    )
    task_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("generation_tasks.id"), nullable=True
    )
    asset_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("assets.id"), nullable=True
    )
    severity: Mapped[ReflectionSeverity] = mapped_column(
        Enum(
            ReflectionSeverity,
            name="reflection_severity",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=ReflectionSeverity.INFO,
        server_default=ReflectionSeverity.INFO.value,
    )
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    suggestion: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    project: Mapped[Project | None] = relationship(back_populates="reflection_notes")
    shot: Mapped[Shot | None] = relationship(back_populates="reflection_notes")
    panel: Mapped[Panel | None] = relationship(back_populates="reflection_notes")
    prompt: Mapped[PromptDraft | None] = relationship(back_populates="reflection_notes")
    task: Mapped[GenerationTask | None] = relationship(
        back_populates="reflection_notes"
    )
    asset: Mapped[Asset | None] = relationship(back_populates="reflection_notes")
