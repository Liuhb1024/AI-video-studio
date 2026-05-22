"""Script read service."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.script import Script
from app.repositories import script_repository


def get_project_script(db: Session, project_id: UUID) -> Script | None:
    """Get latest project script."""
    return script_repository.get_project_script(db, project_id)


def get_script(db: Session, script_id: UUID) -> Script | None:
    """Get one script."""
    return script_repository.get_script(db, script_id)
