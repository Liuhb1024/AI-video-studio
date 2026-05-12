from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.characters.models import Character
from app.modules.project_characters.models import ProjectCharacter


class ProjectCharacterRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_by_project(self, project_id: str) -> list[ProjectCharacter]:
        statement = (
            select(ProjectCharacter)
            .where(ProjectCharacter.project_id == project_id)
            .order_by(ProjectCharacter.sort_order.asc(), ProjectCharacter.created_at.asc())
        )
        return list(self.session.scalars(statement).all())

    def get(self, project_id: str, project_character_id: str) -> ProjectCharacter | None:
        return self.session.scalar(
            select(ProjectCharacter).where(
                ProjectCharacter.id == project_character_id,
                ProjectCharacter.project_id == project_id,
            )
        )

    def get_by_character(self, project_id: str, character_id: str) -> ProjectCharacter | None:
        return self.session.scalar(
            select(ProjectCharacter).where(
                ProjectCharacter.project_id == project_id,
                ProjectCharacter.character_id == character_id,
            )
        )

    def get_character(self, character_id: str) -> Character | None:
        return self.session.get(Character, character_id)

    def create(self, payload: dict) -> ProjectCharacter:
        project_character = ProjectCharacter(**payload)
        self.session.add(project_character)
        self.session.commit()
        self.session.refresh(project_character)
        return project_character

    def update(self, project_character: ProjectCharacter, payload: dict) -> ProjectCharacter:
        for key, value in payload.items():
            setattr(project_character, key, value)
        self.session.commit()
        self.session.refresh(project_character)
        return project_character

    def delete(self, project_character: ProjectCharacter) -> None:
        self.session.delete(project_character)
        self.session.commit()
