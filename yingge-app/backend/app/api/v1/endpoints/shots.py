"""Shot read endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db_session
from app.schemas.panel import PanelRead
from app.services import storyboard_service

router = APIRouter(prefix="/shots", tags=["shots"])
DB_SESSION = Depends(get_db_session)


@router.get("/{shot_id}/panels", response_model=list[PanelRead])
def list_shot_panels(shot_id: UUID, db: Session = DB_SESSION) -> list[PanelRead]:
    """List panels for a shot."""
    return storyboard_service.list_shot_panels(db, shot_id)
