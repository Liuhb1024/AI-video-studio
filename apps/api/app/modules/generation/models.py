from sqlalchemy import ForeignKey, Float, Integer, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IDMixin, TimestampMixin


class GenerateTask(Base, IDMixin, TimestampMixin):
    __tablename__ = "generate_tasks"

    task_type: Mapped[str] = mapped_column(default="image")
    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True, index=True)
    shot_id: Mapped[str | None] = mapped_column(ForeignKey("shots.id"), nullable=True, index=True)
    character_id: Mapped[str | None] = mapped_column(ForeignKey("characters.id"), nullable=True, index=True)
    generation_type: Mapped[str | None] = mapped_column(Text, nullable=True, index=True)
    model_provider: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_name: Mapped[str] = mapped_column(default="mock")
    model_version: Mapped[str | None] = mapped_column(Text, nullable=True)
    parameters: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    params_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    input_asset_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    style_template_id: Mapped[str | None] = mapped_column(Text, nullable=True, index=True)
    prompt_template_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_text: Mapped[str] = mapped_column(Text, default="")
    negative_prompt: Mapped[str] = mapped_column(Text, default="")
    input_snapshot_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    input_prompt: Mapped[str] = mapped_column(Text, default="")
    raw_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    output_asset_id: Mapped[str | None] = mapped_column(ForeignKey("assets.id"), nullable=True)
    output_asset_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    current_step: Mapped[str] = mapped_column(default="queued")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    error_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_of_task_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    cost_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    estimated_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(default="pending")
