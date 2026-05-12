from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import get_db
from app.modules.project_characters.schemas import ProjectCharacterCreate, ProjectCharacterRead, ProjectCharacterUpdate
from app.modules.project_characters.service import (
    CharacterNotFoundError,
    ProjectCharacterDuplicateError,
    ProjectCharacterService,
    ProjectNotFoundError,
)


router = APIRouter(prefix="/projects/{project_id}/characters", tags=["project-characters"])


def _service(session=Depends(get_db)) -> ProjectCharacterService:
    return ProjectCharacterService(session)


@router.get("", response_model=list[ProjectCharacterRead])
@router.get("/", response_model=list[ProjectCharacterRead])
def list_project_characters(project_id: str, service: ProjectCharacterService = Depends(_service)) -> list[ProjectCharacterRead]:
    try:
        return service.list(project_id)
    except ProjectNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found") from None


@router.post("", response_model=ProjectCharacterRead)
@router.post("/", response_model=ProjectCharacterRead)
def create_project_character(
    project_id: str,
    payload: ProjectCharacterCreate,
    service: ProjectCharacterService = Depends(_service),
) -> ProjectCharacterRead:
    try:
        return service.create(project_id, payload)
    except ProjectNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found") from None
    except CharacterNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found") from None
    except ProjectCharacterDuplicateError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Character already linked to project") from None


@router.patch("/{project_character_id}", response_model=ProjectCharacterRead)
def update_project_character(
    project_id: str,
    project_character_id: str,
    payload: ProjectCharacterUpdate,
    service: ProjectCharacterService = Depends(_service),
) -> ProjectCharacterRead:
    try:
        project_character = service.update(project_id, project_character_id, payload)
    except ProjectNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found") from None
    except CharacterNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found") from None
    if project_character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project character not found")
    return project_character


@router.delete("/{project_character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_character(
    project_id: str,
    project_character_id: str,
    service: ProjectCharacterService = Depends(_service),
) -> Response:
    try:
        deleted = service.delete(project_id, project_character_id)
    except ProjectNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found") from None
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project character not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
