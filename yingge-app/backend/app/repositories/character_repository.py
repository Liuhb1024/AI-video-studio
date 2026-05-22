"""Character repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.character import Character
from app.models.character_bible import CharacterBible


def list_characters(db: Session) -> list[Character]:
    """Return characters ordered by ranking and name."""
    statement = select(Character).order_by(
        Character.ranking.asc(), Character.name.asc()
    )
    return list(db.scalars(statement).all())


def get_character(db: Session, character_id: UUID) -> Character | None:
    """Return a character by id."""
    return db.get(Character, character_id)


def get_character_bible(db: Session, character_id: UUID) -> CharacterBible | None:
    """Return a character bible by character id."""
    statement = select(CharacterBible).where(
        CharacterBible.character_id == character_id
    )
    return db.scalar(statement)
