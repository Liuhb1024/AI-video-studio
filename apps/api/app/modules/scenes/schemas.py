from pydantic import BaseModel

from app.modules._schemas import ORM_MODEL_CONFIG


class SceneCreate(BaseModel):
    script_id: str
    order_index: int = 0
    title: str
    summary: str | None = None
    raw_text: str = ""


class SceneRead(SceneCreate):
    model_config = ORM_MODEL_CONFIG

    id: str

