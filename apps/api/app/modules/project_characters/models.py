from sqlalchemy import ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IDMixin, TimestampMixin


class ProjectCharacter(Base, IDMixin, TimestampMixin):
    __tablename__ = "project_characters"
    __table_args__ = (UniqueConstraint("project_id", "character_id", name="uq_project_characters_project_character"),)

    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    character_id: Mapped[str] = mapped_column(ForeignKey("characters.id"), nullable=False, index=True)
    role_in_project: Mapped[str | None] = mapped_column(Text, nullable=True)
    usage_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, default="selected")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
