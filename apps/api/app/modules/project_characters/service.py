from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.assets.models import Asset
from app.modules.characters.models import Character
from app.modules.project_characters.models import ProjectCharacter
from app.modules.project_characters.repository import ProjectCharacterRepository
from app.modules.project_characters.schemas import ProjectCharacterCreate, ProjectCharacterRead, ProjectCharacterSummary, ProjectCharacterUpdate
from app.modules.projects.models import Project


class ProjectNotFoundError(Exception):
    pass


class CharacterNotFoundError(Exception):
    pass


class ProjectCharacterDuplicateError(Exception):
    pass


class ProjectCharacterService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repository = ProjectCharacterRepository(session)

    def list(self, project_id: str) -> list[ProjectCharacterRead]:
        self._ensure_project(project_id)
        return [self._read(item) for item in self.repository.list_by_project(project_id)]

    def create(self, project_id: str, payload: ProjectCharacterCreate) -> ProjectCharacterRead:
        self._ensure_project(project_id)
        if self.repository.get_character(payload.character_id) is None:
            raise CharacterNotFoundError
        if self.repository.get_by_character(project_id, payload.character_id) is not None:
            raise ProjectCharacterDuplicateError

        data = payload.model_dump()
        data["project_id"] = project_id
        created = self.repository.create(data)
        return self._read(created)

    def update(self, project_id: str, project_character_id: str, payload: ProjectCharacterUpdate) -> ProjectCharacterRead | None:
        self._ensure_project(project_id)
        project_character = self.repository.get(project_id, project_character_id)
        if project_character is None:
            return None
        updated = self.repository.update(project_character, payload.model_dump(exclude_unset=True))
        return self._read(updated)

    def delete(self, project_id: str, project_character_id: str) -> bool:
        self._ensure_project(project_id)
        project_character = self.repository.get(project_id, project_character_id)
        if project_character is None:
            return False
        self.repository.delete(project_character)
        return True

    def _ensure_project(self, project_id: str) -> None:
        if self.session.get(Project, project_id) is None:
            raise ProjectNotFoundError

    def _read(self, project_character: ProjectCharacter) -> ProjectCharacterRead:
        character = self.session.get(Character, project_character.character_id)
        if character is None:
            raise CharacterNotFoundError

        data = {
            "id": project_character.id,
            "project_id": project_character.project_id,
            "character_id": project_character.character_id,
            "role_in_project": project_character.role_in_project,
            "usage_note": project_character.usage_note,
            "status": project_character.status,
            "sort_order": project_character.sort_order,
            "created_at": project_character.created_at,
            "updated_at": project_character.updated_at,
            "character": self._character_summary(character),
        }
        return ProjectCharacterRead.model_validate(data)

    def _character_summary(self, character: Character) -> ProjectCharacterSummary:
        reference_asset_ids = character.reference_asset_ids or []
        generated_asset_count = self.session.scalar(
            select(func.count())
            .select_from(Asset)
            .where(
                Asset.character_id == character.id,
                Asset.asset_origin == "generated",
                Asset.deleted_at.is_(None),
            )
        ) or 0
        return ProjectCharacterSummary.model_validate(
            {
                "id": character.id,
                "name": character.name,
                "alias": character.alias,
                "yingge_role": character.yingge_role,
                "weapons": character.weapons,
                "weapon": character.weapon,
                "reference_asset_id": character.reference_asset_id,
                "reference_asset_ids": reference_asset_ids,
                "reference_asset_count": len(reference_asset_ids),
                "generated_asset_count": generated_asset_count,
                "image_consistency_prompt": character.image_consistency_prompt,
                "status": character.status,
            }
        )
