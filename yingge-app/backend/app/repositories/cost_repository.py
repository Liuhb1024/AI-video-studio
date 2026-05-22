"""Cost repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.cost import CostRecord


def list_project_costs(db: Session, project_id: UUID) -> list[CostRecord]:
    """Return cost records for a project."""
    statement = (
        select(CostRecord)
        .where(CostRecord.project_id == project_id)
        .order_by(CostRecord.created_at.desc())
    )
    return list(db.scalars(statement).all())
