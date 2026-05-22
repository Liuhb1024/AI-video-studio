"""ORM model registry for Alembic metadata discovery."""

from app.models.asset import Asset, AudioAsset, ImageAsset, SubtitleAsset, VideoAsset
from app.models.character import Character
from app.models.character_bible import CharacterBible
from app.models.cost import CostRecord
from app.models.enums import (
    AssetStatus,
    AssetType,
    CostRecordType,
    ExportPlanStatus,
    FailureReasonCode,
    GenerationTaskStatus,
    GenerationTaskType,
    PanelStatus,
    ProjectStatus,
    PromptStatus,
    PromptType,
    ReflectionSeverity,
    ReviewStatus,
    ScriptStatus,
    ShotStatus,
)
from app.models.export_plan import ExportPlan
from app.models.failure_reason import FailureReason
from app.models.generation_task import GenerationTask
from app.models.panel import Panel
from app.models.project import Project
from app.models.prompt import PromptDraft
from app.models.reflection import ReflectionNote
from app.models.review import AssetReview
from app.models.script import Script
from app.models.shot import Shot

__all__ = [
    "Asset",
    "AssetReview",
    "AssetStatus",
    "AssetType",
    "AudioAsset",
    "Character",
    "CharacterBible",
    "CostRecord",
    "CostRecordType",
    "ExportPlan",
    "ExportPlanStatus",
    "FailureReason",
    "FailureReasonCode",
    "GenerationTask",
    "GenerationTaskStatus",
    "GenerationTaskType",
    "ImageAsset",
    "Panel",
    "PanelStatus",
    "Project",
    "ProjectStatus",
    "PromptDraft",
    "PromptStatus",
    "PromptType",
    "ReflectionNote",
    "ReflectionSeverity",
    "ReviewStatus",
    "Script",
    "ScriptStatus",
    "Shot",
    "ShotStatus",
    "SubtitleAsset",
    "VideoAsset",
]
