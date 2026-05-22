"""Asset review read service."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.review import AssetReview
from app.repositories import review_repository


def list_project_reviews(db: Session, project_id: UUID) -> list[AssetReview]:
    """List asset reviews for a project."""
    return review_repository.list_project_reviews(db, project_id)
