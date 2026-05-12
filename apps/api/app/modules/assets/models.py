from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Integer, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IDMixin, TimestampMixin


class Asset(Base, IDMixin, TimestampMixin):
    __tablename__ = "assets"

    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True, index=True)
    shot_id: Mapped[str | None] = mapped_column(ForeignKey("shots.id"), nullable=True, index=True)
    character_id: Mapped[str | None] = mapped_column(ForeignKey("characters.id"), nullable=True, index=True)
    asset_type: Mapped[str] = mapped_column(default="image")
    filename: Mapped[str] = mapped_column(Text, nullable=False)
    mime_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    provider: Mapped[str] = mapped_column(default="tencent_cos")
    bucket: Mapped[str | None] = mapped_column(Text, nullable=True)
    region: Mapped[str | None] = mapped_column(Text, nullable=True)
    object_key: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    reference_type: Mapped[str | None] = mapped_column(Text, nullable=True, index=True)
    style_board: Mapped[str | None] = mapped_column(Text, nullable=True, index=True)
    asset_origin: Mapped[str] = mapped_column(Text, default="uploaded", index=True)
    generation_type: Mapped[str | None] = mapped_column(Text, nullable=True, index=True)
    source_reference_asset_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    style_template_id: Mapped[str | None] = mapped_column(Text, nullable=True, index=True)
    generate_task_id: Mapped[str | None] = mapped_column(Text, nullable=True, index=True)
    accepted_for_keyframe: Mapped[bool] = mapped_column(default=False)
    quality_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_primary: Mapped[bool] = mapped_column(default=False)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(default="ready")
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
