"""Script repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.script import Script


def get_project_script(db: Session, project_id: UUID) -> Script | None:
    """Return the latest script for a project."""
    statement = (
        select(Script)
        .where(Script.project_id == project_id)
        .order_by(Script.updated_at.desc())
    )
    return db.scalar(statement)


def get_script(db: Session, script_id: UUID) -> Script | None:
    """Return a script by id."""
    return db.get(Script, script_id)
