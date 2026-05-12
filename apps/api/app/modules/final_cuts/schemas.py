from pydantic import BaseModel

from app.modules._schemas import ORM_MODEL_CONFIG


class FinalCutCreate(BaseModel):
    project_id: str
    title: str
    asset_id: str | None = None
    review_notes: str | None = None


class FinalCutRead(FinalCutCreate):
    model_config = ORM_MODEL_CONFIG

    id: str

