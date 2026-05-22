"""Asset review repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.review import AssetReview


def list_project_reviews(db: Session, project_id: UUID) -> list[AssetReview]:
    """Return asset reviews for a project."""
    statement = (
        select(AssetReview)
        .where(AssetReview.project_id == project_id)
        .order_by(AssetReview.created_at.desc())
    )
    return list(db.scalars(statement).all())
