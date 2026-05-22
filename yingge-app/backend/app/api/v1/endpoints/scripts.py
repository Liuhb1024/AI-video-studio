"""Script read endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db_session
from app.schemas.shot import ShotRead
from app.services import storyboard_service

router = APIRouter(prefix="/scripts", tags=["scripts"])
DB_SESSION = Depends(get_db_session)


@router.get("/{script_id}/shots", response_model=list[ShotRead])
def list_script_shots(script_id: UUID, db: Session = DB_SESSION) -> list[ShotRead]:
    """List shots for a script."""
    return storyboard_service.list_script_shots(db, script_id)
