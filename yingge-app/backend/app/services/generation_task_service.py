"""Generation task read service."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.generation_task import GenerationTask
from app.repositories import generation_task_repository


def list_project_tasks(db: Session, project_id: UUID) -> list[GenerationTask]:
    """List generation tasks for a project."""
    return generation_task_repository.list_project_tasks(db, project_id)
