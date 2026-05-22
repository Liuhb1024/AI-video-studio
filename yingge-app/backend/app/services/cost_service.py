"""Cost read service."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.cost import CostRecord
from app.repositories import cost_repository


def list_project_costs(db: Session, project_id: UUID) -> list[CostRecord]:
    """List cost records for a project."""
    return cost_repository.list_project_costs(db, project_id)
