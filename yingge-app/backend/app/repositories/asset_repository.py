"""Asset repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.asset import Asset


def list_project_assets(db: Session, project_id: UUID) -> list[Asset]:
    """Return assets for a project."""
    statement = (
        select(Asset)
        .where(Asset.project_id == project_id)
        .order_by(Asset.created_at.desc())
    )
    return list(db.scalars(statement).all())
