from pydantic import BaseModel

from app.modules._schemas import ORM_MODEL_CONFIG


class TagCreate(BaseModel):
    name: str
    category: str = "general"


class TagRead(TagCreate):
    model_config = ORM_MODEL_CONFIG

    id: str

