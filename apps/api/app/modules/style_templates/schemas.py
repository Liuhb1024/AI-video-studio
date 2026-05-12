from datetime import datetime

from pydantic import BaseModel, Field

from app.modules._schemas import ORM_MODEL_CONFIG


class StyleTemplateBase(BaseModel):
    name: str
    source_asset_id: str | None = None
    cover_asset_id: str | None = None
    source_image_url: str | None = None
    style_category: str | None = None
    visual_summary: str = ""
    line_style: str = ""
    color_palette: str = ""
    lighting_style: str = ""
    composition_style: str = ""
    character_rendering: str = ""
    background_rendering: str = ""
    texture_keywords: str = ""
    yingge_adaptation: str = ""
    image_prompt_template: str = ""
    video_prompt_template: str = ""
    negative_prompt: str = ""
    analysis_model: str | None = None
    analysis_version: str | None = None
    analysis_status: str = "manual"
    status: str = "draft"


class StyleTemplateCreate(StyleTemplateBase):
    pass


class StyleTemplateUpdate(BaseModel):
    name: str | None = None
    source_asset_id: str | None = None
    cover_asset_id: str | None = None
    source_image_url: str | None = None
    style_category: str | None = None
    visual_summary: str | None = None
    line_style: str | None = None
    color_palette: str | None = None
    lighting_style: str | None = None
    composition_style: str | None = None
    character_rendering: str | None = None
    background_rendering: str | None = None
    texture_keywords: str | None = None
    yingge_adaptation: str | None = None
    image_prompt_template: str | None = None
    video_prompt_template: str | None = None
    negative_prompt: str | None = None
    analysis_model: str | None = None
    analysis_version: str | None = None
    analysis_status: str | None = None
    status: str | None = None


class StyleTemplateAnalyzeRequest(BaseModel):
    model_name: str = "gpt-5.4-nano"
    model_provider: str | None = "dmx"
    model_version: str | None = None
    temperature: float = 1.0


class StyleTemplateRead(StyleTemplateBase):
    model_config = ORM_MODEL_CONFIG

    id: str
    created_at: datetime
    updated_at: datetime


class StyleTemplateAnalysisTaskListItem(BaseModel):
    model_config = ORM_MODEL_CONFIG

    id: str
    status: str
    model_provider: str | None = None
    model_name: str
    model_version: str | None = None
    params_json: dict | None = None
    current_step: str
    progress: int
    error_code: str | None = None
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime


class StyleTemplateAnalysisTaskDetail(StyleTemplateAnalysisTaskListItem):
    task_type: str
    style_template_id: str | None = None
    parameters: dict | None = None
    input_asset_ids: list[str] = Field(default_factory=list)
    prompt_template_id: str | None = None
    prompt_version: str | None = None
    prompt_text: str
    input_prompt: str
    negative_prompt: str
    input_snapshot_json: dict | None = None
    raw_response: dict | None = None
    retry_of_task_id: str | None = None
    cost_json: dict | None = None
    estimated_cost: float | None = None
