"""Storyboard read service for shots and panels."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.panel import Panel
from app.models.shot import Shot
from app.repositories import panel_repository, shot_repository


def list_script_shots(db: Session, script_id: UUID) -> list[Shot]:
    """List shots for a script."""
    return shot_repository.list_script_shots(db, script_id)


def get_shot(db: Session, shot_id: UUID) -> Shot | None:
    """Get one shot."""
    return shot_repository.get_shot(db, shot_id)


def list_shot_panels(db: Session, shot_id: UUID) -> list[Panel]:
    """List panels for a shot."""
    return panel_repository.list_shot_panels(db, shot_id)
