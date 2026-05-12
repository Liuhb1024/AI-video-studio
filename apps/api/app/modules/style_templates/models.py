from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IDMixin, TimestampMixin


class StyleTemplate(Base, IDMixin, TimestampMixin):
    __tablename__ = "style_templates"

    name: Mapped[str] = mapped_column(Text, nullable=False)
    source_asset_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_asset_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    style_category: Mapped[str | None] = mapped_column(Text, nullable=True)
    visual_summary: Mapped[str] = mapped_column(Text, default="")
    line_style: Mapped[str] = mapped_column(Text, default="")
    color_palette: Mapped[str] = mapped_column(Text, default="")
    lighting_style: Mapped[str] = mapped_column(Text, default="")
    composition_style: Mapped[str] = mapped_column(Text, default="")
    character_rendering: Mapped[str] = mapped_column(Text, default="")
    background_rendering: Mapped[str] = mapped_column(Text, default="")
    texture_keywords: Mapped[str] = mapped_column(Text, default="")
    yingge_adaptation: Mapped[str] = mapped_column(Text, default="")
    image_prompt_template: Mapped[str] = mapped_column(Text, default="")
    video_prompt_template: Mapped[str] = mapped_column(Text, default="")
    negative_prompt: Mapped[str] = mapped_column(Text, default="")
    analysis_model: Mapped[str | None] = mapped_column(Text, nullable=True)
    analysis_version: Mapped[str | None] = mapped_column(Text, nullable=True)
    analysis_status: Mapped[str] = mapped_column(default="manual")
    status: Mapped[str] = mapped_column(default="draft")
