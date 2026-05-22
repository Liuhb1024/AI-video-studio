"""Character bible ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.utils.time import utc_now

if TYPE_CHECKING:
    from app.models.character import Character


class CharacterBible(Base):
    """Five-layer character bible for prompt and consistency control."""

    __tablename__ = "character_bibles"
    __table_args__ = (
        UniqueConstraint("character_id", name="uq_character_bibles_character_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    character_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("characters.id"), nullable=False
    )
    identity_layer: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    inner_core_layer: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    cultural_visual_layer: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    narrative_material_layer: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    commercial_culture_layer: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    positive_prompt_keywords: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    forbidden_prompt_keywords: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    consistency_checklist: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    field_sources: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    character: Mapped[Character] = relationship(back_populates="character_bible")
