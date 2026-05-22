"""Character ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.character_bible import CharacterBible
    from app.models.script import Script
    from app.models.shot import Shot


class Character(Base):
    """Yingge Shuihu character base profile."""

    __tablename__ = "characters"
    __table_args__ = (
        Index("ix_characters_name", "name"),
        Index("ix_characters_ranking", "ranking"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    nickname: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ranking: Mapped[int | None] = mapped_column(Integer, nullable=True)
    star: Mapped[str | None] = mapped_column(String(255), nullable=True)
    liangshan_role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    weapon: Mapped[str | None] = mapped_column(String(255), nullable=True)
    yingge_role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    face_primary_color: Mapped[str | None] = mapped_column(String(100), nullable=True)
    face_pattern: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color_symbolism: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    character_bible: Mapped[CharacterBible | None] = relationship(
        back_populates="character",
        cascade="all, delete-orphan",
        uselist=False,
    )
    scripts: Mapped[list[Script]] = relationship(back_populates="character")
    shots: Mapped[list[Shot]] = relationship(back_populates="character")
