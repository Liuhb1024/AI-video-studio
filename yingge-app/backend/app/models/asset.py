"""Asset ORM models."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import AssetStatus, AssetType
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.cost import CostRecord
    from app.models.generation_task import GenerationTask
    from app.models.panel import Panel
    from app.models.project import Project
    from app.models.prompt import PromptDraft
    from app.models.reflection import ReflectionNote
    from app.models.review import AssetReview
    from app.models.shot import Shot


class Asset(Base):
    """Unified asset table for image, video, audio, and subtitle outputs."""

    __tablename__ = "assets"
    __table_args__ = (
        Index("ix_assets_project_id", "project_id"),
        Index("ix_assets_shot_id", "shot_id"),
        Index("ix_assets_panel_id", "panel_id"),
        Index("ix_assets_type", "type"),
        Index("ix_assets_status", "status"),
        Index("ix_assets_task_id", "task_id"),
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
    type: Mapped[AssetType] = mapped_column(
        Enum(
            AssetType,
            name="asset_type",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )
    status: Mapped[AssetStatus] = mapped_column(
        Enum(
            AssetStatus,
            name="asset_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=AssetStatus.CANDIDATE,
        server_default=AssetStatus.CANDIDATE.value,
    )
    uri: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_uri: Mapped[str | None] = mapped_column(Text, nullable=True)
    model: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provider: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    consistency_score: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 4), nullable=True
    )
    failure_reasons: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    project: Mapped[Project | None] = relationship(back_populates="assets")
    shot: Mapped[Shot | None] = relationship(back_populates="assets")
    panel: Mapped[Panel | None] = relationship(back_populates="assets")
    prompt: Mapped[PromptDraft | None] = relationship(back_populates="assets")
    task: Mapped[GenerationTask | None] = relationship(back_populates="assets")
    image_asset: Mapped[ImageAsset | None] = relationship(
        back_populates="asset", cascade="all, delete-orphan", uselist=False
    )
    video_asset: Mapped[VideoAsset | None] = relationship(
        back_populates="asset", cascade="all, delete-orphan", uselist=False
    )
    audio_asset: Mapped[AudioAsset | None] = relationship(
        back_populates="asset", cascade="all, delete-orphan", uselist=False
    )
    subtitle_asset: Mapped[SubtitleAsset | None] = relationship(
        back_populates="asset", cascade="all, delete-orphan", uselist=False
    )
    reviews: Mapped[list[AssetReview]] = relationship(back_populates="asset")
    cost_records: Mapped[list[CostRecord]] = relationship(back_populates="asset")
    reflection_notes: Mapped[list[ReflectionNote]] = relationship(
        back_populates="asset"
    )


class ImageAsset(Base):
    """Image-specific asset fields."""

    __tablename__ = "image_assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assets.id"), unique=True, nullable=False
    )
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    aspect_ratio: Mapped[str | None] = mapped_column(String(50), nullable=True)
    prompt_strength: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 4), nullable=True
    )
    seed: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    asset: Mapped[Asset] = relationship(back_populates="image_asset")


class VideoAsset(Base):
    """Video-specific asset fields."""

    __tablename__ = "video_assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assets.id"), unique=True, nullable=False
    )
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    aspect_ratio: Mapped[str | None] = mapped_column(String(50), nullable=True)
    resolution: Mapped[str | None] = mapped_column(String(100), nullable=True)
    motion_strength: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 4), nullable=True
    )
    mode: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    asset: Mapped[Asset] = relationship(back_populates="video_asset")


class AudioAsset(Base):
    """Audio-specific asset fields."""

    __tablename__ = "audio_assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assets.id"), unique=True, nullable=False
    )
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    voice: Mapped[str | None] = mapped_column(String(255), nullable=True)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    asset: Mapped[Asset] = relationship(back_populates="audio_asset")


class SubtitleAsset(Base):
    """Subtitle-specific asset fields."""

    __tablename__ = "subtitle_assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assets.id"), unique=True, nullable=False
    )
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    text: Mapped[str | None] = mapped_column(Text, nullable=True)
    timing_status: Mapped[str | None] = mapped_column(String(100), nullable=True)
    format: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    asset: Mapped[Asset] = relationship(back_populates="subtitle_asset")
