from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.modules._schemas import ORM_MODEL_CONFIG


class ProjectBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    summary: str | None = None
    ip_name: str | None = None
    genre: str | None = None
    visual_style: str | None = None
    stage: str = "preparing"
    cover_asset_id: str | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str | None = None
    summary: str | None = None
    ip_name: str | None = None
    genre: str | None = None
    visual_style: str | None = None
    stage: str | None = None
    cover_asset_id: str | None = None


class ProjectRead(ProjectBase):
    model_config = ORM_MODEL_CONFIG

    id: str
    created_at: datetime
    updated_at: datetime
