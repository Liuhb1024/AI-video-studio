"""Stable database enums for ORM models."""

from enum import StrEnum


class ProjectStatus(StrEnum):
    """Lifecycle status for a Yingge short-video project."""

    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    COMPLETED = "completed"


class ScriptStatus(StrEnum):
    """Lifecycle status for a script draft."""

    DRAFT = "draft"
    GENERATED = "generated"
    REVIEWED = "reviewed"
    LOCKED = "locked"


class ShotStatus(StrEnum):
    """Lifecycle status for a shot."""

    DRAFT = "draft"
    READY = "ready"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class PanelStatus(StrEnum):
    """Lifecycle status for a storyboard panel."""

    DRAFT = "draft"
    READY = "ready"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class PromptType(StrEnum):
    """Prompt content category."""

    IMAGE = "image"
    VIDEO = "video"
    NEGATIVE = "negative"
    TTS = "tts"
    STORYBOARD = "storyboard"
    SCRIPT = "script"


class PromptStatus(StrEnum):
    """Prompt draft lifecycle status."""

    DRAFT = "draft"
    OPTIMIZED = "optimized"
    LOCKED = "locked"
    DEPRECATED = "deprecated"


class GenerationTaskType(StrEnum):
    """Generation task category."""

    IMAGE = "image"
    VIDEO = "video"
    TTS = "tts"
    SUBTITLE = "subtitle"
    PROMPT_OPTIMIZE = "prompt_optimize"


class GenerationTaskStatus(StrEnum):
    """Generation task execution status."""

    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AssetType(StrEnum):
    """Generated asset type."""

    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    SUBTITLE = "subtitle"


class AssetStatus(StrEnum):
    """Asset review lifecycle status."""

    CANDIDATE = "candidate"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class ReviewStatus(StrEnum):
    """Asset review decision status."""

    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    NEEDS_RETRY = "needs_retry"


class FailureReasonCode(StrEnum):
    """Standardized asset failure reason code."""

    CHARACTER_INCONSISTENT = "character_inconsistent"
    FACE_PATTERN_WRONG = "face_pattern_wrong"
    COLOR_WRONG = "color_wrong"
    SCENE_MISMATCH = "scene_mismatch"
    STYLE_DRIFT = "style_drift"
    YINGGE_MOTION_WRONG = "yingge_motion_wrong"
    MOTION_TOO_STRONG = "motion_too_strong"
    MOTION_TOO_WEAK = "motion_too_weak"
    BAD_ANATOMY = "bad_anatomy"
    DURATION_MISMATCH = "duration_mismatch"
    MODEL_ERROR = "model_error"
    PROMPT_WEAK = "prompt_weak"


class CostRecordType(StrEnum):
    """Cost record source type."""

    ESTIMATED = "estimated"
    ACTUAL = "actual"
    ADJUSTMENT = "adjustment"


class ReflectionSeverity(StrEnum):
    """Reflection note severity."""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class ExportPlanStatus(StrEnum):
    """Export plan lifecycle status."""

    DRAFT = "draft"
    READY = "ready"
    EXPORTED = "exported"
