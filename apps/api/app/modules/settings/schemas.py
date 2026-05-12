from pydantic import BaseModel

from app.modules._schemas import ORM_MODEL_CONFIG


class SystemSettingCreate(BaseModel):
    key: str
    value: str = ""


class SystemSettingRead(SystemSettingCreate):
    model_config = ORM_MODEL_CONFIG

    id: str

