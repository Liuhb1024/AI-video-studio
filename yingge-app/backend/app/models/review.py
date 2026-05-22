"""Asset review ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ReviewStatus
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.asset import Asset
    from app.models.panel import Panel
    from app.models.project import Project
    from app.models.shot import Shot


class AssetReview(Base):
    """Review decision record for an asset."""

    __tablename__ = "asset_reviews"
    __table_args__ = (
        Index("ix_asset_reviews_asset_id", "asset_id"),
        Index("ix_asset_reviews_project_id", "project_id"),
        Index("ix_asset_reviews_shot_id", "shot_id"),
        Index("ix_asset_reviews_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("assets.id"), nullable=False)
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id"), nullable=True
    )
    shot_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("shots.id"), nullable=True
    )
    panel_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("panels.id"), nullable=True
    )
    status: Mapped[ReviewStatus] = mapped_column(
        Enum(
            ReviewStatus,
            name="review_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=ReviewStatus.PENDING,
        server_default=ReviewStatus.PENDING.value,
    )
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    failure_reason_codes: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    reflection_suggestion: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    asset: Mapped[Asset] = relationship(back_populates="reviews")
    project: Mapped[Project | None] = relationship(back_populates="asset_reviews")
    shot: Mapped[Shot | None] = relationship(back_populates="asset_reviews")
    panel: Mapped[Panel | None] = relationship(back_populates="asset_reviews")
