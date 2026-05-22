"""Prompt draft ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import PromptStatus, PromptType
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.generation_task import GenerationTask
    from app.models.panel import Panel
    from app.models.project import Project
    from app.models.reflection import ReflectionNote
    from app.models.script import Script
    from app.models.shot import Shot


class PromptDraft(Base):
    """Versioned prompt draft for script, storyboard, image, video, and TTS."""

    __tablename__ = "prompt_drafts"
    __table_args__ = (
        Index("ix_prompt_drafts_project_id", "project_id"),
        Index("ix_prompt_drafts_shot_id", "shot_id"),
        Index("ix_prompt_drafts_panel_id", "panel_id"),
        Index("ix_prompt_drafts_type", "type"),
        Index("ix_prompt_drafts_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id"), nullable=True
    )
    script_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("scripts.id"), nullable=True
    )
    shot_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("shots.id"), nullable=True
    )
    panel_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("panels.id"), nullable=True
    )
    type: Mapped[PromptType] = mapped_column(
        Enum(
            PromptType,
            name="prompt_type",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )
    version: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[PromptStatus] = mapped_column(
        Enum(
            PromptStatus,
            name="prompt_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=PromptStatus.DRAFT,
        server_default=PromptStatus.DRAFT.value,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    positive_keywords: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    negative_keywords: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    source_fields: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    quality_checklist: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    project: Mapped[Project | None] = relationship(back_populates="prompt_drafts")
    script: Mapped[Script | None] = relationship(back_populates="prompt_drafts")
    shot: Mapped[Shot | None] = relationship(back_populates="prompt_drafts")
    panel: Mapped[Panel | None] = relationship(back_populates="prompt_drafts")
    generation_tasks: Mapped[list[GenerationTask]] = relationship(
        back_populates="prompt"
    )
    assets: Mapped[list[Asset]] = relationship(back_populates="prompt")
    reflection_notes: Mapped[list[ReflectionNote]] = relationship(
        back_populates="prompt"
    )
