"""Generation task ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import GenerationTaskStatus, GenerationTaskType
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.cost import CostRecord
    from app.models.panel import Panel
    from app.models.project import Project
    from app.models.prompt import PromptDraft
    from app.models.reflection import ReflectionNote
    from app.models.shot import Shot


class GenerationTask(Base):
    """Generation task state record without a real queue integration."""

    __tablename__ = "generation_tasks"
    __table_args__ = (
        Index("ix_generation_tasks_project_id", "project_id"),
        Index("ix_generation_tasks_shot_id", "shot_id"),
        Index("ix_generation_tasks_panel_id", "panel_id"),
        Index("ix_generation_tasks_prompt_id", "prompt_id"),
        Index("ix_generation_tasks_type", "type"),
        Index("ix_generation_tasks_status", "status"),
        Index("ix_generation_tasks_provider", "provider"),
        Index("ix_generation_tasks_model", "model"),
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
    type: Mapped[GenerationTaskType] = mapped_column(
        Enum(
            GenerationTaskType,
            name="generation_task_type",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )
    status: Mapped[GenerationTaskStatus] = mapped_column(
        Enum(
            GenerationTaskStatus,
            name="generation_task_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=GenerationTaskStatus.PENDING,
        server_default=GenerationTaskStatus.PENDING.value,
    )
    provider: Mapped[str | None] = mapped_column(String(100), nullable=True)
    model: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mode: Mapped[str | None] = mapped_column(String(100), nullable=True)
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    estimated_cost: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 4), nullable=True
    )
    actual_cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    request_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    response_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    project: Mapped[Project | None] = relationship(back_populates="generation_tasks")
    shot: Mapped[Shot | None] = relationship(back_populates="generation_tasks")
    panel: Mapped[Panel | None] = relationship(back_populates="generation_tasks")
    prompt: Mapped[PromptDraft | None] = relationship(back_populates="generation_tasks")
    assets: Mapped[list[Asset]] = relationship(back_populates="task")
    cost_records: Mapped[list[CostRecord]] = relationship(back_populates="task")
    reflection_notes: Mapped[list[ReflectionNote]] = relationship(back_populates="task")
