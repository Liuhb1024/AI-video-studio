from pydantic import BaseModel, Field

from app.modules._schemas import ORM_MODEL_CONFIG


class GenerateTaskCreate(BaseModel):
    task_type: str = "image"
    input_prompt: str
    project_id: str | None = None
    shot_id: str | None = None
    model_name: str = "mock"


class CharacterImageTaskCreate(BaseModel):
    character_id: str
    generation_type: str
    model_name: str = "mock-image"
    model_provider: str | None = "mock"
    model_version: str | None = None
    input_asset_ids: list[str] = Field(default_factory=list)
    style_template_id: str | None = None
    prompt_text: str = ""
    negative_prompt: str = ""
    params_json: dict | None = None


class CharacterImagePromptDraftCreate(BaseModel):
    character_id: str
    generation_type: str = "four_view"
    style_template_id: str | None = None
    input_asset_ids: list[str] = Field(default_factory=list)
    prompt_text: str = ""
    negative_prompt: str = ""
    model_name: str = "mock-prompt"
    model_provider: str | None = "mock"
    model_version: str | None = None
    temperature: float = 0.4


class CharacterImagePromptDraftRead(BaseModel):
    character_id: str
    generation_type: str
    style_template_id: str | None = None
    model_provider: str | None = None
    model_name: str
    model_version: str | None = None
    prompt_text: str
    negative_prompt: str
    checklist: dict[str, bool] = Field(default_factory=dict)
    raw_response: dict | None = None


class GenerateTaskRead(BaseModel):
    model_config = ORM_MODEL_CONFIG

    id: str
    task_type: str
    project_id: str | None = None
    shot_id: str | None = None
    character_id: str | None = None
    generation_type: str | None = None
    model_provider: str | None = None
    model_name: str
    model_version: str | None = None
    parameters: dict | None = None
    params_json: dict | None = None
    input_asset_ids: list[str] = Field(default_factory=list)
    style_template_id: str | None = None
    prompt_template_id: str | None = None
    prompt_version: str | None = None
    prompt_text: str
    negative_prompt: str
    input_snapshot_json: dict | None = None
    input_prompt: str
    raw_response: dict | None = None
    output_asset_id: str | None = None
    output_asset_ids: list[str] = Field(default_factory=list)
    current_step: str
    progress: int
    error_code: str | None = None
    error_message: str | None = None
    retry_of_task_id: str | None = None
    cost_json: dict | None = None
    estimated_cost: float | None = None
    status: str
