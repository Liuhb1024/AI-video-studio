from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_ai, get_db
from app.ai.dmx import AIProviderError
from app.modules.scripts.schemas import ScriptGenerationRead, ScriptGenerationRequest, ScriptRead, ScriptVersionRead
from app.modules.scripts.service import ScriptService

router = APIRouter(tags=["scripts"])


def _service(session=Depends(get_db), ai_provider=Depends(get_ai)) -> ScriptService:
    return ScriptService(session, ai_provider=ai_provider)


@router.get("/projects/{project_id}/scripts/", response_model=list[ScriptRead])
def list_project_scripts(project_id: str, service: ScriptService = Depends(_service)) -> list[ScriptRead]:
    return service.list_by_project(project_id)


@router.get("/projects/{project_id}/scripts/{script_id}", response_model=ScriptVersionRead)
def get_project_script_version(
    project_id: str,
    script_id: str,
    service: ScriptService = Depends(_service),
) -> ScriptVersionRead:
    result = service.get_version(project_id, script_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Script not found")
    return result


@router.post("/projects/{project_id}/scripts/generate", response_model=ScriptGenerationRead)
def generate_project_script(
    project_id: str,
    payload: ScriptGenerationRequest,
    service: ScriptService = Depends(_service),
) -> ScriptGenerationRead:
    try:
        result = service.generate_for_project(project_id, payload)
    except AIProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return result


@router.delete("/projects/{project_id}/scripts/{script_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_script_version(
    project_id: str,
    script_id: str,
    service: ScriptService = Depends(_service),
) -> None:
    deleted = service.delete_version(project_id, script_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Script not found")
