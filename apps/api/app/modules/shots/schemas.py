from pydantic import BaseModel, Field

from app.modules._schemas import ORM_MODEL_CONFIG


class ShotBase(BaseModel):
    project_id: str
    script_id: str | None = None
    scene_id: str | None = None
    shot_no: str = "S01"
    order_index: int = 1
    story_beat: str | None = None
    description: str = ""
    characters: list[str] = Field(default_factory=list)
    setting: str | None = None
    emotion: str | None = None
    action: str | None = None
    expression: str | None = None
    props: list[str] = Field(default_factory=list)
    shot_size: str | None = None
    camera_angle: str | None = None
    composition: str | None = None
    camera_movement: str | None = None
    lighting: str | None = None
    transition_in: str | None = None
    transition_out: str | None = None
    edit_point: str | None = None
    duration_seconds: float | None = None
    image_prompt: str | None = None
    video_prompt: str | None = None
    negative_prompt: str | None = None
    reference_asset_ids: list[str] = Field(default_factory=list)
    continuity_constraints: list[str] = Field(default_factory=list)
    generation_risk: str | None = None
    simplify_strategy: str | None = None
    readiness: str = "draft"
    extra_metadata: dict = Field(default_factory=dict)
    status: str = "draft"


class ShotCreate(ShotBase):
    pass


class ShotUpdate(BaseModel):
    shot_no: str | None = None
    order_index: int | None = None
    story_beat: str | None = None
    description: str | None = None
    characters: list[str] | None = None
    setting: str | None = None
    emotion: str | None = None
    action: str | None = None
    expression: str | None = None
    props: list[str] | None = None
    shot_size: str | None = None
    camera_angle: str | None = None
    composition: str | None = None
    camera_movement: str | None = None
    lighting: str | None = None
    transition_in: str | None = None
    transition_out: str | None = None
    edit_point: str | None = None
    duration_seconds: float | None = None
    image_prompt: str | None = None
    video_prompt: str | None = None
    negative_prompt: str | None = None
    reference_asset_ids: list[str] | None = None
    continuity_constraints: list[str] | None = None
    generation_risk: str | None = None
    simplify_strategy: str | None = None
    readiness: str | None = None
    extra_metadata: dict | None = None
    status: str | None = None


class ShotRead(ShotBase):
    model_config = ORM_MODEL_CONFIG

    id: str


class ShotGenerationRequest(BaseModel):
    script_id: str
    replace_existing: bool = True


class ShotGenerationRead(BaseModel):
    shots: list[ShotRead]


class ShotReorderRequest(BaseModel):
    shot_ids: list[str]


class GeneratedShot(BaseModel):
    scene_id: str | None = None
    shot_no: str
    order_index: int
    story_beat: str = ""
    description: str = ""
    characters: list[str] = Field(default_factory=list)
    setting: str = ""
    emotion: str = ""
    action: str = ""
    expression: str = ""
    props: list[str] = Field(default_factory=list)
    shot_size: str = ""
    camera_angle: str = ""
    composition: str = ""
    camera_movement: str = ""
    lighting: str = ""
    transition_in: str = ""
    transition_out: str = ""
    edit_point: str = ""
    duration_seconds: float | None = None
    image_prompt: str = ""
    video_prompt: str = ""
    negative_prompt: str = ""
    reference_asset_ids: list[str] = Field(default_factory=list)
    continuity_constraints: list[str] = Field(default_factory=list)
    generation_risk: str = ""
    simplify_strategy: str = ""
    readiness: str = "draft"
    metadata: dict = Field(default_factory=dict)


class GeneratedShotsPayload(BaseModel):
    shots: list[GeneratedShot]
