"""Panel repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.panel import Panel


def list_shot_panels(db: Session, shot_id: UUID) -> list[Panel]:
    """Return panels for a shot ordered by panel number."""
    statement = select(Panel).where(Panel.shot_id == shot_id).order_by(Panel.panel_no)
    return list(db.scalars(statement).all())
