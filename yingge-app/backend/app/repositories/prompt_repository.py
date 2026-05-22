"""Prompt repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.prompt import PromptDraft


def list_project_prompts(db: Session, project_id: UUID) -> list[PromptDraft]:
    """Return prompts for a project."""
    statement = (
        select(PromptDraft)
        .where(PromptDraft.project_id == project_id)
        .order_by(PromptDraft.created_at.desc())
    )
    return list(db.scalars(statement).all())
