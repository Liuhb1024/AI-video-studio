"""Shot repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.shot import Shot


def list_script_shots(db: Session, script_id: UUID) -> list[Shot]:
    """Return shots for a script ordered by shot number."""
    statement = select(Shot).where(Shot.script_id == script_id).order_by(Shot.shot_no)
    return list(db.scalars(statement).all())


def get_shot(db: Session, shot_id: UUID) -> Shot | None:
    """Return a shot by id."""
    return db.get(Shot, shot_id)
