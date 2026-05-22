"""Prompt read endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db_session
from app.schemas.prompt import PromptDraftRead
from app.services import prompt_service

router = APIRouter(prefix="/projects", tags=["prompts"])
DB_SESSION = Depends(get_db_session)


@router.get("/{project_id}/prompts", response_model=list[PromptDraftRead])
def list_project_prompts(
    project_id: UUID, db: Session = DB_SESSION
) -> list[PromptDraftRead]:
    """List prompts for a project."""
    return prompt_service.list_project_prompts(db, project_id)
