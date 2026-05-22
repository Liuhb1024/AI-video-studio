"""Character response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CharacterListItem(BaseModel):
    """Character list item."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    nickname: str | None
    ranking: int | None
    star: str | None
    liangshan_role: str | None
    weapon: str | None
    yingge_role: str | None
    face_primary_color: str | None
    face_pattern: str | None
    source: str | None
    created_at: datetime
    updated_at: datetime


class CharacterRead(CharacterListItem):
    """Character detail response."""

    color_symbolism: str | None
    metadata_: dict | None = None


class CharacterBibleRead(BaseModel):
    """Character bible response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    character_id: UUID
    identity_layer: dict | None
    inner_core_layer: dict | None
    cultural_visual_layer: dict | None
    narrative_material_layer: dict | None
    commercial_culture_layer: dict | None
    positive_prompt_keywords: dict | None
    forbidden_prompt_keywords: dict | None
    consistency_checklist: dict | None
    field_sources: dict | None
    created_at: datetime
    updated_at: datetime
