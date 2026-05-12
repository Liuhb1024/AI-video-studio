from pydantic import BaseModel

from app.modules._schemas import ORM_MODEL_CONFIG


class WorldSettingCreate(BaseModel):
    title: str
    content: str = ""


class WorldSettingRead(WorldSettingCreate):
    model_config = ORM_MODEL_CONFIG

    id: str

