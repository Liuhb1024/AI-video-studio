from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_ai, get_db
from app.ai.dmx import AIProviderError
from app.modules.shots.schemas import (
    ShotGenerationRead,
    ShotGenerationRequest,
    ShotRead,
    ShotReorderRequest,
    ShotUpdate,
)
from app.modules.shots.service import ShotService

router = APIRouter(tags=["shots"])


def _service(session=Depends(get_db), ai_provider=Depends(get_ai)) -> ShotService:
    return ShotService(session, ai_provider=ai_provider)


@router.get("/shots/meta")
def module_meta() -> dict[str, str]:
    return {"module": "shots", "status": "ready"}


@router.get("/projects/{project_id}/shots", response_model=list[ShotRead])
def list_project_shots(project_id: str, script_id: str | None = None, service: ShotService = Depends(_service)) -> list[ShotRead]:
    return service.list_by_project(project_id, script_id=script_id)


@router.post("/projects/{project_id}/shots/generate-from-script", response_model=ShotGenerationRead)
def generate_project_shots_from_script(
    project_id: str,
    payload: ShotGenerationRequest,
    service: ShotService = Depends(_service),
) -> ShotGenerationRead:
    try:
        result = service.generate_from_script(project_id, payload)
    except AIProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Script not found")
    return result


@router.patch("/projects/{project_id}/shots/{shot_id}", response_model=ShotRead)
def update_project_shot(
    project_id: str,
    shot_id: str,
    payload: ShotUpdate,
    service: ShotService = Depends(_service),
) -> ShotRead:
    updated = service.update_project_shot(project_id, shot_id, payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shot not found")
    return updated


@router.delete("/projects/{project_id}/shots/{shot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_shot(project_id: str, shot_id: str, service: ShotService = Depends(_service)) -> None:
    deleted = service.delete_project_shot(project_id, shot_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shot not found")


@router.post("/projects/{project_id}/shots/reorder", response_model=list[ShotRead])
def reorder_project_shots(
    project_id: str,
    payload: ShotReorderRequest,
    service: ShotService = Depends(_service),
) -> list[ShotRead]:
    reordered = service.reorder_project_shots(project_id, payload.shot_ids)
    if reordered is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shot not found")
    return reordered
