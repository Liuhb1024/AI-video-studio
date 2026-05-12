from pydantic import BaseModel, Field

from app.modules._schemas import ORM_MODEL_CONFIG
from app.modules.assets.schemas import AssetRead


class CharacterBase(BaseModel):
    name: str
    alias: str | None = None
    rank: str | None = None
    star: str | None = None
    origin: str | None = None
    ip_name: str | None = "英歌水浒"
    role_type: str | None = None
    bio: str | None = None
    liangshan_role: str | None = None
    weapons: str | None = None
    personality_tags: str | None = None
    internal_conflict: str | None = None
    life_events: str | None = None
    audience_hook: str | None = None
    target_audience: str | None = None
    yingge_role: str | None = None
    facepaint_main_color: str | None = None
    color_symbolism: str | None = None
    facepaint_patterns: str | None = None
    source_color_clues: str | None = None
    visual_tone_keywords: str | None = None
    positive_prompt_terms: str | None = None
    negative_prompt_terms: str | None = None
    narrative_origin: str | None = None
    relationship_map: str | None = None
    product_tone: str | None = None
    blessing_meaning: str | None = None
    appearance: str | None = None
    costume: str | None = None
    weapon: str | None = None
    visual_keywords: str | None = None
    negative_keywords: str | None = None
    image_consistency_prompt: str | None = None
    video_consistency_prompt: str | None = None
    three_view_prompt: str | None = None
    negative_prompt: str | None = None
    reference_asset_ids: list[str] = Field(default_factory=list)
    reference_asset_id: str | None = None
    source: str = "manual"
    source_row: int | None = None
    status: str = "draft"


class CharacterCreate(CharacterBase):
    pass


class CharacterUpdate(BaseModel):
    name: str | None = None
    alias: str | None = None
    rank: str | None = None
    star: str | None = None
    origin: str | None = None
    ip_name: str | None = None
    role_type: str | None = None
    bio: str | None = None
    liangshan_role: str | None = None
    weapons: str | None = None
    personality_tags: str | None = None
    internal_conflict: str | None = None
    life_events: str | None = None
    audience_hook: str | None = None
    target_audience: str | None = None
    yingge_role: str | None = None
    facepaint_main_color: str | None = None
    color_symbolism: str | None = None
    facepaint_patterns: str | None = None
    source_color_clues: str | None = None
    visual_tone_keywords: str | None = None
    positive_prompt_terms: str | None = None
    negative_prompt_terms: str | None = None
    narrative_origin: str | None = None
    relationship_map: str | None = None
    product_tone: str | None = None
    blessing_meaning: str | None = None
    appearance: str | None = None
    costume: str | None = None
    weapon: str | None = None
    visual_keywords: str | None = None
    negative_keywords: str | None = None
    image_consistency_prompt: str | None = None
    video_consistency_prompt: str | None = None
    three_view_prompt: str | None = None
    negative_prompt: str | None = None
    reference_asset_ids: list[str] | None = None
    reference_asset_id: str | None = None
    source: str | None = None
    source_row: int | None = None
    status: str | None = None


class CharacterRead(CharacterBase):
    model_config = ORM_MODEL_CONFIG

    id: str


class CharacterListRead(BaseModel):
    items: list[CharacterRead]
    total: int
    page: int
    page_size: int


class CharacterImportRequest(BaseModel):
    file_path: str


class CharacterImportRead(BaseModel):
    imported_count: int
    updated_count: int
    skipped_count: int


class CharacterReferenceAssetRead(AssetRead):
    pass


class CharacterReferenceAssetUpdate(BaseModel):
    title: str | None = None
    note: str | None = None
    style_board: str | None = None
    is_primary: bool | None = None


class CharacterGeneratedAssetUpdate(BaseModel):
    accepted_for_keyframe: bool | None = None
    status: str | None = None
    quality_note: str | None = None
    title: str | None = None
    note: str | None = None
