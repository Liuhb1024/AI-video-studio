from datetime import datetime

from pydantic import BaseModel, Field

from app.modules._schemas import ORM_MODEL_CONFIG


class ScriptCreate(BaseModel):
    project_id: str
    title: str
    content: str = ""
    generation_settings: dict | None = None
    status: str = "draft"


class ScriptRead(ScriptCreate):
    model_config = ORM_MODEL_CONFIG

    id: str
    version: int
    created_at: datetime
    updated_at: datetime


class ScriptGenerationRequest(BaseModel):
    story_seed: str = Field(min_length=1)
    duration_seconds: int = 60
    platform: str = "抖音"
    aspect_ratio: str = "9:16"
    story_structure: str = "短视频强钩子"
    opening_style: str = "悬念开头"
    ending_style: str = "悬念留钩子"
    genre: str = "民俗奇幻"
    tone: str = "神秘"
    dialogue_density: str = "标准"
    action_density: str = "高"
    narration_ratio: str = "少量旁白"
    yingge_intensity: str = "中"
    cultural_expression: str = "热血仪式感"
    tradition_modern_mix: str = "现代场景中的传统元素"
    visual_symbols: list[str] = Field(default_factory=lambda: ["脸谱", "双槌", "鼓点", "队列", "祠堂"])
    taboos: list[str] = Field(default_factory=lambda: ["避免戏谑民俗", "避免文化误读", "避免低俗化"])


class GeneratedSceneRead(BaseModel):
    model_config = ORM_MODEL_CONFIG

    id: str
    script_id: str
    order_index: int
    title: str
    summary: str | None = None
    raw_text: str


class ScriptVersionRead(BaseModel):
    script: ScriptRead
    scenes: list[GeneratedSceneRead]


class ScriptGenerationRead(BaseModel):
    script: ScriptRead
    scenes: list[GeneratedSceneRead]
    settings: dict


class GeneratedCharacter(BaseModel):
    name: str
    description: str = ""


class LensLanguage(BaseModel):
    shot_size: str = ""
    camera_angle: str = ""
    composition: str = ""
    camera_movement: str = ""
    lighting: str = ""
    edit_point: str = ""


class StoryboardPlanItem(BaseModel):
    shot: str
    purpose: str = ""
    image_prompt_focus: str = ""
    video_prompt_focus: str = ""


class TransitionPlan(BaseModel):
    type: str = ""
    description: str = ""


class TimelineBeat(BaseModel):
    start_second: int
    end_second: int
    beat: str
    story: str
    visual_focus: str = ""
    lens_language: LensLanguage = Field(default_factory=LensLanguage)
    emotion: str = ""
    characters: list[str] = Field(default_factory=list)
    dialogue: str = ""
    narration: str = ""
    shot_hint: str = ""
    transition: TransitionPlan = Field(default_factory=TransitionPlan)
    shot_density: str = ""
    recommended_shot_count: int | None = None
    keyframe_priority: list[str] = Field(default_factory=list)
    storyboard_plan: list[StoryboardPlanItem] = Field(default_factory=list)
    generation_risk: str = ""
    simplify_strategy: str = ""


class SceneSummary(BaseModel):
    title: str
    summary: str = ""


class GeneratedScriptPayload(BaseModel):
    title: str
    logline: str = ""
    full_script: str
    characters: list[GeneratedCharacter] = Field(default_factory=list)
    timeline: list[TimelineBeat]
    scene_summary: list[SceneSummary] = Field(default_factory=list)
