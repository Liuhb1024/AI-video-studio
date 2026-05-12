from pydantic import BaseModel

from app.modules._schemas import ORM_MODEL_CONFIG


class PromptTemplateCreate(BaseModel):
    name: str
    prompt_type: str = "image"
    system_prompt: str = ""
    user_template: str = ""


class PromptTemplateRead(PromptTemplateCreate):
    model_config = ORM_MODEL_CONFIG

    id: str
    version: int

