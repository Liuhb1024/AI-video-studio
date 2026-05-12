from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.ai.dmx import AIProviderError
from app.api.deps import get_db, get_storage
from app.modules.generation.queue import enqueue_character_image_task
from app.modules.generation.schemas import CharacterImagePromptDraftCreate, CharacterImagePromptDraftRead, CharacterImageTaskCreate, GenerateTaskRead
from app.modules.generation.service import GenerateTaskService
from app.storage.base import StorageProvider

router = APIRouter(prefix="/generation", tags=["generation"])


def _service(session=Depends(get_db), storage: StorageProvider = Depends(get_storage)) -> GenerateTaskService:
    return GenerateTaskService(session, storage=storage)


@router.get("/meta")
def module_meta() -> dict[str, str]:
    return {"module": "generation", "status": "ready"}


@router.post("/character-image-tasks", response_model=GenerateTaskRead)
def create_character_image_task(
    payload: CharacterImageTaskCreate,
    request: Request,
    storage: StorageProvider = Depends(get_storage),
    service: GenerateTaskService = Depends(_service),
) -> GenerateTaskRead:
    try:
        task = service.create_character_image_task(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    enqueue_character_image_task(app=request.app, task_id=task.id, storage=storage)
    return task


@router.post("/character-image-prompt-drafts", response_model=CharacterImagePromptDraftRead)
def create_character_image_prompt_draft(
    payload: CharacterImagePromptDraftCreate,
    service: GenerateTaskService = Depends(_service),
) -> CharacterImagePromptDraftRead:
    try:
        draft = service.create_character_image_prompt_draft(payload)
    except (AIProviderError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if draft is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return draft


@router.get("/character-image-tasks", response_model=list[GenerateTaskRead])
def list_character_image_tasks(character_id: str, service: GenerateTaskService = Depends(_service)) -> list[GenerateTaskRead]:
    return service.list_character_image_tasks(character_id)


@router.get("/character-image-tasks/{task_id}", response_model=GenerateTaskRead)
def get_character_image_task(task_id: str, service: GenerateTaskService = Depends(_service)) -> GenerateTaskRead:
    task = service.get_character_image_task(task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation task not found")
    return task


@router.post("/character-image-tasks/{task_id}/cancel", response_model=GenerateTaskRead)
def cancel_character_image_task(task_id: str, service: GenerateTaskService = Depends(_service)) -> GenerateTaskRead:
    try:
        task = service.cancel_character_image_task(task_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation task not found")
    return task


@router.post("/character-image-tasks/{task_id}/retry", response_model=GenerateTaskRead)
def retry_character_image_task(
    task_id: str,
    request: Request,
    storage: StorageProvider = Depends(get_storage),
    service: GenerateTaskService = Depends(_service),
) -> GenerateTaskRead:
    try:
        task = service.retry_character_image_task(task_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation task not found")
    enqueue_character_image_task(app=request.app, task_id=task.id, storage=storage)
    return task
