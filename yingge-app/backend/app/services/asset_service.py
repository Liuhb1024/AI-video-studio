"""Asset read service."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.repositories import asset_repository


def list_project_assets(db: Session, project_id: UUID) -> list[Asset]:
    """List assets for a project."""
    return asset_repository.list_project_assets(db, project_id)
