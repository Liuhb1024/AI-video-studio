"""Script ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ScriptStatus
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.character import Character
    from app.models.project import Project
    from app.models.prompt import PromptDraft
    from app.models.shot import Shot


class Script(Base):
    """Script draft for a Yingge project."""

    __tablename__ = "scripts"
    __table_args__ = (
        Index("ix_scripts_project_id", "project_id"),
        Index("ix_scripts_character_id", "character_id"),
        Index("ix_scripts_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id"), nullable=False
    )
    character_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("characters.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    platform: Mapped[str | None] = mapped_column(String(100), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    aspect_ratio: Mapped[str | None] = mapped_column(String(50), nullable=True)
    tone: Mapped[str | None] = mapped_column(String(100), nullable=True)
    version: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[ScriptStatus] = mapped_column(
        Enum(
            ScriptStatus,
            name="script_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=ScriptStatus.DRAFT,
        server_default=ScriptStatus.DRAFT.value,
    )
    hook: Mapped[str | None] = mapped_column(Text, nullable=True)
    narration: Mapped[str | None] = mapped_column(Text, nullable=True)
    ending: Mapped[str | None] = mapped_column(Text, nullable=True)
    keywords: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    agent_notes: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    project: Mapped[Project] = relationship(back_populates="scripts")
    character: Mapped[Character | None] = relationship(back_populates="scripts")
    shots: Mapped[list[Shot]] = relationship(
        back_populates="script", cascade="all, delete-orphan"
    )
    prompt_drafts: Mapped[list[PromptDraft]] = relationship(back_populates="script")
