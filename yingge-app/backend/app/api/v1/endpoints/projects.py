"""Project read endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.deps import get_db_session
from app.schemas.asset import AssetRead
from app.schemas.cost import CostRecordRead
from app.schemas.export_plan import ExportPlanRead
from app.schemas.generation_task import GenerationTaskRead
from app.schemas.project import ProjectListItem, ProjectRead
from app.schemas.script import ScriptRead
from app.services import (
    asset_service,
    cost_service,
    export_plan_service,
    generation_task_service,
    project_service,
    script_service,
)

router = APIRouter(prefix="/projects", tags=["projects"])
DB_SESSION = Depends(get_db_session)


@router.get("", response_model=list[ProjectListItem])
def list_projects(db: Session = DB_SESSION) -> list[ProjectListItem]:
    """List projects."""
    return project_service.list_projects(db)


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: UUID, db: Session = DB_SESSION) -> ProjectRead:
    """Get one project."""
    project = project_service.get_project(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_id}/script", response_model=ScriptRead)
def get_project_script(project_id: UUID, db: Session = DB_SESSION) -> ScriptRead:
    """Get latest script for a project."""
    script = script_service.get_project_script(db, project_id)
    if script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    return script


@router.get("/{project_id}/tasks", response_model=list[GenerationTaskRead])
def list_project_tasks(
    project_id: UUID, db: Session = DB_SESSION
) -> list[GenerationTaskRead]:
    """List generation tasks for a project."""
    return generation_task_service.list_project_tasks(db, project_id)


@router.get("/{project_id}/assets", response_model=list[AssetRead])
def list_project_assets(project_id: UUID, db: Session = DB_SESSION) -> list[AssetRead]:
    """List assets for a project."""
    return asset_service.list_project_assets(db, project_id)


@router.get("/{project_id}/costs", response_model=list[CostRecordRead])
def list_project_costs(
    project_id: UUID, db: Session = DB_SESSION
) -> list[CostRecordRead]:
    """List cost records for a project."""
    return cost_service.list_project_costs(db, project_id)


@router.get("/{project_id}/export-plan", response_model=ExportPlanRead)
def get_project_export_plan(
    project_id: UUID, db: Session = DB_SESSION
) -> ExportPlanRead:
    """Get latest export plan for a project."""
    export_plan = export_plan_service.get_project_export_plan(db, project_id)
    if export_plan is None:
        raise HTTPException(status_code=404, detail="Export plan not found")
    return export_plan
