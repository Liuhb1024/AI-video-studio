"""Shot ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ShotStatus
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.character import Character
    from app.models.generation_task import GenerationTask
    from app.models.panel import Panel
    from app.models.prompt import PromptDraft
    from app.models.reflection import ReflectionNote
    from app.models.review import AssetReview
    from app.models.script import Script


class Shot(Base):
    """Shot generated from a script."""

    __tablename__ = "shots"
    __table_args__ = (
        UniqueConstraint("script_id", "shot_no", name="uq_shots_script_id_shot_no"),
        Index("ix_shots_script_id", "script_id"),
        Index("ix_shots_character_id", "character_id"),
        Index("ix_shots_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    script_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("scripts.id"), nullable=False
    )
    character_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("characters.id"), nullable=True
    )
    shot_no: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    narration_segment: Mapped[str | None] = mapped_column(Text, nullable=True)
    visual_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    action: Mapped[str | None] = mapped_column(Text, nullable=True)
    emotion: Mapped[str | None] = mapped_column(String(100), nullable=True)
    camera_movement: Mapped[str | None] = mapped_column(String(255), nullable=True)
    scene: Mapped[str | None] = mapped_column(String(255), nullable=True)
    consistency_status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    prompt_status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[ShotStatus] = mapped_column(
        Enum(
            ShotStatus,
            name="shot_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=ShotStatus.DRAFT,
        server_default=ShotStatus.DRAFT.value,
    )
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    script: Mapped[Script] = relationship(back_populates="shots")
    character: Mapped[Character | None] = relationship(back_populates="shots")
    panels: Mapped[list[Panel]] = relationship(
        back_populates="shot", cascade="all, delete-orphan"
    )
    prompt_drafts: Mapped[list[PromptDraft]] = relationship(back_populates="shot")
    generation_tasks: Mapped[list[GenerationTask]] = relationship(back_populates="shot")
    assets: Mapped[list[Asset]] = relationship(back_populates="shot")
    asset_reviews: Mapped[list[AssetReview]] = relationship(back_populates="shot")
    reflection_notes: Mapped[list[ReflectionNote]] = relationship(back_populates="shot")
