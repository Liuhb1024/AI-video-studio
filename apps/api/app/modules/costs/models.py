from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, IDMixin, TimestampMixin


class CostRecord(Base, IDMixin, TimestampMixin):
    __tablename__ = "cost_records"

    project_id: Mapped[str | None] = mapped_column(ForeignKey("projects.id"), nullable=True, index=True)
    generate_task_id: Mapped[str | None] = mapped_column(ForeignKey("generate_tasks.id"), nullable=True)
    model_name: Mapped[str] = mapped_column(default="mock")
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 4), default=Decimal("0"))
    currency: Mapped[str] = mapped_column(Text, default="CNY")

