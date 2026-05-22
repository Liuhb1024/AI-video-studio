"""Character read service."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.character import Character
from app.models.character_bible import CharacterBible
from app.repositories import character_repository


def list_characters(db: Session) -> list[Character]:
    """List characters."""
    return character_repository.list_characters(db)


def get_character(db: Session, character_id: UUID) -> Character | None:
    """Get one character."""
    return character_repository.get_character(db, character_id)


def get_character_bible(db: Session, character_id: UUID) -> CharacterBible | None:
    """Get a character bible."""
    return character_repository.get_character_bible(db, character_id)
