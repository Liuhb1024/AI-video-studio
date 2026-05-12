from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules._schemas import ORM_MODEL_CONFIG


class ProjectCharacterBase(BaseModel):
    role_in_project: str | None = None
    usage_note: str | None = None
    status: str = "selected"
    sort_order: int = 0


class ProjectCharacterCreate(BaseModel):
    character_id: str
    role_in_project: str | None = None
    usage_note: str | None = None
    status: str = "selected"
    sort_order: int = 0


class ProjectCharacterUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    role_in_project: str | None = None
    usage_note: str | None = None
    status: str | None = None
    sort_order: int | None = None


class ProjectCharacterSummary(BaseModel):
    model_config = ORM_MODEL_CONFIG

    id: str
    name: str
    alias: str | None = None
    yingge_role: str | None = None
    weapons: str | None = None
    weapon: str | None = None
    reference_asset_id: str | None = None
    reference_asset_ids: list[str] = Field(default_factory=list)
    reference_asset_count: int = 0
    generated_asset_count: int = 0
    image_consistency_prompt: str | None = None
    status: str


class ProjectCharacterRead(ProjectCharacterBase):
    model_config = ORM_MODEL_CONFIG

    id: str
    project_id: str
    character_id: str
    created_at: datetime
    updated_at: datetime
    character: ProjectCharacterSummary
