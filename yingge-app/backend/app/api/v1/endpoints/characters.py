"""Character read endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db_session
from app.schemas.character import (
    CharacterBibleRead,
    CharacterListItem,
    CharacterRead,
)
from app.services import character_service

router = APIRouter(prefix="/characters", tags=["characters"])
DB_SESSION = Depends(get_db_session)


@router.get("", response_model=list[CharacterListItem])
def list_characters(db: Session = DB_SESSION) -> list[CharacterListItem]:
    """List characters."""
    return character_service.list_characters(db)


@router.get("/{character_id}", response_model=CharacterRead)
def get_character(character_id: UUID, db: Session = DB_SESSION) -> CharacterRead:
    """Get one character."""
    character = character_service.get_character(db, character_id)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return character


@router.get("/{character_id}/bible", response_model=CharacterBibleRead)
def get_character_bible(
    character_id: UUID, db: Session = DB_SESSION
) -> CharacterBibleRead:
    """Get one character bible."""
    bible = character_service.get_character_bible(db, character_id)
    if bible is None:
        raise HTTPException(status_code=404, detail="Character bible not found")
    return bible
