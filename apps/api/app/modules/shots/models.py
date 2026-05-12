from sqlalchemy import Float, ForeignKey, Integer, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IDMixin, TimestampMixin


class Shot(Base, IDMixin, TimestampMixin):
    __tablename__ = "shots"

    # 分镜卡是生产链路核心对象，生成任务、素材、成本都通过它回溯。
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), index=True)
    script_id: Mapped[str | None] = mapped_column(ForeignKey("scripts.id"), nullable=True, index=True)
    scene_id: Mapped[str | None] = mapped_column(ForeignKey("scenes.id"), nullable=True, index=True)
    shot_no: Mapped[str] = mapped_column(Text, default="S01")
    order_index: Mapped[int] = mapped_column(Integer, default=1)
    story_beat: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str] = mapped_column(Text, default="")
    characters: Mapped[list[str]] = mapped_column(JSON, default=list)
    setting: Mapped[str | None] = mapped_column(Text, nullable=True)
    emotion: Mapped[str | None] = mapped_column(Text, nullable=True)
    action: Mapped[str | None] = mapped_column(Text, nullable=True)
    expression: Mapped[str | None] = mapped_column(Text, nullable=True)
    props: Mapped[list[str]] = mapped_column(JSON, default=list)
    shot_size: Mapped[str | None] = mapped_column(Text, nullable=True)
    camera_angle: Mapped[str | None] = mapped_column(Text, nullable=True)
    composition: Mapped[str | None] = mapped_column(Text, nullable=True)
    camera_movement: Mapped[str | None] = mapped_column(Text, nullable=True)
    lighting: Mapped[str | None] = mapped_column(Text, nullable=True)
    transition_in: Mapped[str | None] = mapped_column(Text, nullable=True)
    transition_out: Mapped[str | None] = mapped_column(Text, nullable=True)
    edit_point: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    image_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    negative_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    reference_asset_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    continuity_constraints: Mapped[list[str]] = mapped_column(JSON, default=list)
    generation_risk: Mapped[str | None] = mapped_column(Text, nullable=True)
    simplify_strategy: Mapped[str | None] = mapped_column(Text, nullable=True)
    readiness: Mapped[str] = mapped_column(default="draft")
    extra_metadata: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    status: Mapped[str] = mapped_column(default="draft")
