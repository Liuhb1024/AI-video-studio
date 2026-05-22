"""Project repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project


def list_projects(db: Session) -> list[Project]:
    """Return projects ordered by newest first."""
    return list(db.scalars(select(Project).order_by(Project.created_at.desc())).all())


def get_project(db: Session, project_id: UUID) -> Project | None:
    """Return a project by id."""
    return db.get(Project, project_id)
