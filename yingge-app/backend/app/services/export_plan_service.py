"""Export plan read service."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.export_plan import ExportPlan
from app.repositories import export_plan_repository


def get_project_export_plan(db: Session, project_id: UUID) -> ExportPlan | None:
    """Get latest export plan for a project."""
    return export_plan_repository.get_project_export_plan(db, project_id)
