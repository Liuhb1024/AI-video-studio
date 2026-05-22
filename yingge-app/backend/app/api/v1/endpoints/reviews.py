"""Review read endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db_session
from app.schemas.review import AssetReviewRead
from app.services import review_service

router = APIRouter(prefix="/projects", tags=["reviews"])
DB_SESSION = Depends(get_db_session)


@router.get("/{project_id}/reviews", response_model=list[AssetReviewRead])
def list_project_reviews(
    project_id: UUID, db: Session = DB_SESSION
) -> list[AssetReviewRead]:
    """List asset reviews for a project."""
    return review_service.list_project_reviews(db, project_id)
