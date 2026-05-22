"""Generation task repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.generation_task import GenerationTask


def list_project_tasks(db: Session, project_id: UUID) -> list[GenerationTask]:
    """Return generation tasks for a project."""
    statement = (
        select(GenerationTask)
        .where(GenerationTask.project_id == project_id)
        .order_by(GenerationTask.created_at.desc())
    )
    return list(db.scalars(statement).all())
