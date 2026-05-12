from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import get_db
from app.modules.projects.schemas import ProjectCreate, ProjectRead, ProjectUpdate
from app.modules.projects.service import ProjectService


router = APIRouter(prefix="/projects", tags=["projects"])


def _service(session=Depends(get_db)) -> ProjectService:
    return ProjectService(session)


@router.get("/", response_model=list[ProjectRead])
def list_projects(service: ProjectService = Depends(_service)) -> list[ProjectRead]:
    return service.list()


@router.post("/", response_model=ProjectRead)
def create_project(payload: ProjectCreate, service: ProjectService = Depends(_service)) -> ProjectRead:
    return service.create(payload)


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: str, service: ProjectService = Depends(_service)) -> ProjectRead:
    project = service.get(project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    service: ProjectService = Depends(_service),
) -> ProjectRead:
    project = service.update(project_id, payload)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, service: ProjectService = Depends(_service)) -> Response:
    deleted = service.delete(project_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
