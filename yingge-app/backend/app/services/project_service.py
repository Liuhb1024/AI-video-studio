"""Project read service."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.project import Project
from app.repositories import project_repository


def list_projects(db: Session) -> list[Project]:
    """List projects."""
    return project_repository.list_projects(db)


def get_project(db: Session, project_id: UUID) -> Project | None:
    """Get one project."""
    return project_repository.get_project(db, project_id)
