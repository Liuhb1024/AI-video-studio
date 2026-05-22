"""Prompt read service."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.prompt import PromptDraft
from app.repositories import prompt_repository


def list_project_prompts(db: Session, project_id: UUID) -> list[PromptDraft]:
    """List prompts for a project."""
    return prompt_repository.list_project_prompts(db, project_id)
