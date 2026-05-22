"""Panel ORM model."""

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
from app.models.enums import PanelStatus
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.generation_task import GenerationTask
    from app.models.prompt import PromptDraft
    from app.models.reflection import ReflectionNote
    from app.models.review import AssetReview
    from app.models.shot import Shot


class Panel(Base):
    """Storyboard panel under a shot."""

    __tablename__ = "panels"
    __table_args__ = (
        UniqueConstraint("shot_id", "panel_no", name="uq_panels_shot_id_panel_no"),
        Index("ix_panels_shot_id", "shot_id"),
        Index("ix_panels_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    shot_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("shots.id"), nullable=False)
    panel_no: Mapped[int] = mapped_column(Integer, nullable=False)
    image_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    camera: Mapped[str | None] = mapped_column(String(255), nullable=True)
    motion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    prompt_status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    keyframe_status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    video_status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[PanelStatus] = mapped_column(
        Enum(
            PanelStatus,
            name="panel_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=PanelStatus.DRAFT,
        server_default=PanelStatus.DRAFT.value,
    )
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    shot: Mapped[Shot] = relationship(back_populates="panels")
    prompt_drafts: Mapped[list[PromptDraft]] = relationship(back_populates="panel")
    generation_tasks: Mapped[list[GenerationTask]] = relationship(
        back_populates="panel"
    )
    assets: Mapped[list[Asset]] = relationship(back_populates="panel")
    asset_reviews: Mapped[list[AssetReview]] = relationship(back_populates="panel")
    reflection_notes: Mapped[list[ReflectionNote]] = relationship(
        back_populates="panel"
    )
