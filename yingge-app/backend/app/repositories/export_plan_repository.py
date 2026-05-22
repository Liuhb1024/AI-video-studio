"""Export plan repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.export_plan import ExportPlan


def get_project_export_plan(db: Session, project_id: UUID) -> ExportPlan | None:
    """Return the latest export plan for a project."""
    statement = (
        select(ExportPlan)
        .where(ExportPlan.project_id == project_id)
        .order_by(ExportPlan.updated_at.desc())
    )
    return db.scalar(statement)
