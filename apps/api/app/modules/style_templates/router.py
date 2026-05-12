from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status

from app.api.deps import get_db, get_storage
from app.core.config import get_settings
from app.modules.style_templates.schemas import (
    StyleTemplateAnalysisTaskDetail,
    StyleTemplateAnalysisTaskListItem,
    StyleTemplateAnalyzeRequest,
    StyleTemplateCreate,
    StyleTemplateRead,
    StyleTemplateUpdate,
)
from app.modules.style_templates.service import StyleTemplateService


router = APIRouter(prefix="/style-templates", tags=["style_templates"])


def _service(session=Depends(get_db)) -> StyleTemplateService:
    return StyleTemplateService(session)


@router.get("/", response_model=list[StyleTemplateRead])
def list_style_templates(
    query: str | None = None,
    style_category: str | None = None,
    service: StyleTemplateService = Depends(_service),
) -> list[StyleTemplateRead]:
    return service.list(query=query, style_category=style_category)


@router.post("/", response_model=StyleTemplateRead)
def create_style_template(payload: StyleTemplateCreate, service: StyleTemplateService = Depends(_service)) -> StyleTemplateRead:
    return service.create(payload)


@router.post("/from-image", response_model=StyleTemplateRead)
async def create_style_template_from_image(
    file: UploadFile = File(...),
    name: str = Form(...),
    style_category: str | None = Form(None),
    service: StyleTemplateService = Depends(_service),
    storage=Depends(get_storage),
) -> StyleTemplateRead:
    if not name.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Template name is required")
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image uploads are supported")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    filename = file.filename or "style-template.png"
    key = storage.build_key("style-templates/source-images", filename)
    url = storage.put_bytes(key, data, content_type=file.content_type)
    settings = get_settings()
    return service.create_from_source_image(
        name=name.strip(),
        filename=filename,
        object_key=key,
        url=url,
        provider=storage.name,
        bucket=settings.cos_bucket if storage.name == "cos" else None,
        region=settings.cos_region if storage.name == "cos" else None,
        mime_type=file.content_type,
        size_bytes=len(data),
        style_category=style_category.strip() if style_category else None,
    )


@router.get("/{template_id}", response_model=StyleTemplateRead)
def get_style_template(template_id: str, service: StyleTemplateService = Depends(_service)) -> StyleTemplateRead:
    template = service.get(template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style template not found")
    return template


@router.get("/{template_id}/analysis-tasks", response_model=list[StyleTemplateAnalysisTaskListItem])
def list_style_template_analysis_tasks(
    template_id: str,
    service: StyleTemplateService = Depends(_service),
) -> list[StyleTemplateAnalysisTaskListItem]:
    tasks = service.list_analysis_tasks(template_id)
    if tasks is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style template not found")
    return tasks


@router.get("/{template_id}/analysis-tasks/{task_id}", response_model=StyleTemplateAnalysisTaskDetail)
def get_style_template_analysis_task(
    template_id: str,
    task_id: str,
    service: StyleTemplateService = Depends(_service),
) -> StyleTemplateAnalysisTaskDetail:
    task = service.get_analysis_task(template_id, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style analysis task not found")
    return task


@router.post("/{template_id}/analyze", response_model=StyleTemplateRead)
def analyze_style_template(
    template_id: str,
    payload: StyleTemplateAnalyzeRequest,
    service: StyleTemplateService = Depends(_service),
) -> StyleTemplateRead:
    template = service.analyze(template_id, payload)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style template not found")
    return template


@router.patch("/{template_id}", response_model=StyleTemplateRead)
def update_style_template(
    template_id: str,
    payload: StyleTemplateUpdate,
    service: StyleTemplateService = Depends(_service),
) -> StyleTemplateRead:
    template = service.update(template_id, payload)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style template not found")
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_style_template(template_id: str, service: StyleTemplateService = Depends(_service)) -> Response:
    if not service.delete(template_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Style template not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
