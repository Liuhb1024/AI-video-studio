"""Seed a minimal Yingge Wusong production loop into PostgreSQL.

This script writes deterministic mock data with ORM models only. It is safe to
run repeatedly: existing records with the same fixed UUIDs are updated, not
duplicated.
"""

from __future__ import annotations

import uuid
from collections.abc import Iterable
from decimal import Decimal
from typing import TypeVar

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
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

T = TypeVar("T")


PROJECT_ID = uuid.UUID("00000000-0000-4000-8000-000000000001")
CHARACTER_ID = uuid.UUID("00000000-0000-4000-8000-000000000002")
CHARACTER_BIBLE_ID = uuid.UUID("00000000-0000-4000-8000-000000000003")
SCRIPT_ID = uuid.UUID("00000000-0000-4000-8000-000000000004")
EXPORT_PLAN_ID = uuid.UUID("00000000-0000-4000-8000-000000000005")

SHOT_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000001{index:02d}") for index in range(1, 7)
]
PANEL_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000002{index:02d}")
    for index in range(1, 13)
]
IMAGE_PROMPT_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000003{index:02d}") for index in range(1, 7)
]
VIDEO_PROMPT_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000004{index:02d}") for index in range(1, 7)
]
TASK_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000005{index:02d}") for index in range(1, 7)
]
ASSET_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000006{index:02d}")
    for index in range(1, 10)
]
ASSET_EXT_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000007{index:02d}")
    for index in range(1, 10)
]
REVIEW_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000008{index:02d}") for index in range(1, 5)
]
REFLECTION_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000009{index:02d}") for index in range(1, 6)
]
COST_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000010{index:02d}") for index in range(1, 5)
]
FAILURE_REASON_IDS = [
    uuid.UUID(f"00000000-0000-4000-8000-0000000011{index:02d}") for index in range(1, 9)
]


def upsert_by_id(db: Session, model: type[T], item_id: uuid.UUID, values: dict) -> T:
    """Insert or update an ORM row by primary key."""
    instance = db.get(model, item_id)
    if instance is None:
        instance = model(id=item_id, **values)
        db.add(instance)
    else:
        for key, value in values.items():
            setattr(instance, key, value)
    return instance


def seed_project_character_script(db: Session) -> None:
    """Seed the project, Wusong character, bible, and script."""
    upsert_by_id(
        db,
        Project,
        PROJECT_ID,
        {
            "name": "英歌水浒人物介绍片",
            "description": "用 AI 漫剧流程生产英歌水浒人物介绍短片",
            "status": ProjectStatus.ACTIVE,
            "current_character_id": CHARACTER_ID,
            "platform": "抖音 / TikTok",
            "duration_seconds": 45,
            "aspect_ratio": "9:16",
            "metadata_": {"tags": ["人物介绍", "英歌", "水浒", "竖屏短片"]},
        },
    )
    upsert_by_id(
        db,
        Character,
        CHARACTER_ID,
        {
            "name": "武松",
            "nickname": "行者",
            "ranking": 14,
            "star": "天伤星",
            "liangshan_role": "步军头领",
            "weapon": "戒刀 / 哨棒 / 英歌槌",
            "yingge_role": "刚烈武生",
            "face_primary_color": "朱砂红 / 墨黑",
            "face_pattern": "虎纹火焰脸谱",
            "color_symbolism": "刚烈、除恶、护佑、驱邪",
            "source": "英歌水浒角色基础信息.xlsx",
            "metadata_": {
                "visual_tone_keywords": ["勇猛", "刚烈", "血性", "水墨烟尘"],
                "mock_source": "frontend/data/mock/characterDetail.ts",
            },
        },
    )
    upsert_by_id(
        db,
        CharacterBible,
        CHARACTER_BIBLE_ID,
        {
            "character_id": CHARACTER_ID,
            "identity_layer": {
                "title": "身份层",
                "summary": "武松，绰号行者，梁山第十四位，天伤星，步军头领。",
                "fields": {
                    "姓名": "武松",
                    "绰号": "行者",
                    "排名": "第 14 位",
                    "梁山职务": "步军头领",
                },
            },
            "inner_core_layer": {
                "title": "内核层",
                "summary": "以孤勇抗压迫，情绪触发点是痛快、刚烈、复仇与护义。",
                "keywords": ["勇猛", "果敢", "忠义", "不平则鸣"],
            },
            "cultural_visual_layer": {
                "title": "文化视觉层",
                "summary": "红黑主色、朱砂额印、虎纹火焰脸谱和英歌槌动作。",
                "palette": ["朱砂红", "墨黑", "鎏金"],
            },
            "narrative_material_layer": {
                "title": "叙事素材层",
                "summary": "串联景阳冈、醉打蒋门神、行者身份和英歌阵列。",
                "scene_seeds": ["景阳冈", "青石街酒楼", "英歌鼓阵"],
            },
            "commercial_culture_layer": {
                "title": "商业文化层",
                "summary": "适合勇气、护身、破局主题文创和国潮短视频传播。",
                "product_tags": ["行者破局", "朱砂护义", "英歌脸谱"],
            },
            "positive_prompt_keywords": {
                "items": [
                    "英歌战舞",
                    "朱砂脸谱",
                    "heroic warrior",
                    "ink wash",
                    "dynamic pose",
                    "traditional armor",
                    "chaoshan Yingge",
                ]
            },
            "forbidden_prompt_keywords": {
                "items": [
                    "现代服饰",
                    "3D 卡通",
                    "写实照片",
                    "塑料质感",
                    "西式盔甲",
                    "霓虹赛博",
                ]
            },
            "consistency_checklist": {
                "items": [
                    {"label": "脸谱主色一致", "status": "通过"},
                    {"label": "武器一致", "status": "通过"},
                    {"label": "禁止词覆盖", "status": "预警"},
                ]
            },
            "field_sources": {
                "items": [
                    {
                        "field": "身份层",
                        "source": "英歌水浒角色基础信息.xlsx",
                        "evidence": "明确记录",
                    },
                    {
                        "field": "文化视觉层",
                        "source": "frontend/data/mock/characterDetail.ts",
                        "evidence": "推断",
                    },
                ]
            },
        },
    )
    upsert_by_id(
        db,
        Script,
        SCRIPT_ID,
        {
            "project_id": PROJECT_ID,
            "character_id": CHARACTER_ID,
            "title": "武松英歌角色介绍短片",
            "platform": "抖音 / TikTok",
            "duration_seconds": 45,
            "aspect_ratio": "9:16",
            "tone": "英雄诗 / 国风叙事",
            "version": "v2.1",
            "status": ScriptStatus.REVIEWED,
            "hook": "三声鼓响，行者出阵。",
            "narration": (
                "三声鼓响，行者出阵。武松踏过水泊烟尘，朱砂虎纹在脸谱上燃起。"
                "他曾景阳冈打虎，也曾为义挥棒。今日他站入英歌阵，鼓点催动脚步，"
                "每一次抬槌，都是刚烈、除恶与护佑的回声。"
            ),
            "ending": "他不是孤勇的传说，而是英歌阵中最烈的一声鼓点。",
            "keywords": ["武松", "英歌", "水浒", "行者", "刚烈", "虎纹"],
            "agent_notes": {
                "source": "seed_mock_data.py",
                "review_status": "mock reviewed",
            },
        },
    )


SHOT_DATA = [
    (
        "鼓点开场：英歌阵起",
        5,
        "三声鼓响，行者出阵。",
        "英歌阵列起势，水墨烟尘压低天光。",
        "鼓槌起落，旗帜掠过。",
        "肃穆、开场压迫感",
        "低机位推近",
        "英歌鼓阵",
    ),
    (
        "行者亮相：朱砂虎纹脸谱",
        7,
        "朱砂虎纹在脸谱上燃起。",
        "武松红黑虎纹脸谱特写，眼尾飞锋清晰。",
        "回眸、定身、抬槌。",
        "刚烈、坚定",
        "正面特写推近",
        "朱砂脸谱舞台",
    ),
    (
        "景阳冈意象：猛虎与山风",
        7,
        "他曾景阳冈打虎，天下闻名。",
        "山风卷尘，虎影与武松对峙，不表现血腥。",
        "踏步、转身、拳势定格。",
        "勇猛、爆发",
        "环绕跟拍",
        "景阳冈山林",
    ),
    (
        "英歌槌舞：刚烈动作爆发",
        8,
        "今日他站入英歌阵，鼓点催动脚步。",
        "英歌槌翻飞，红黑烟尘随动作爆开。",
        "甩槌、踏步、横扫。",
        "热血、昂扬",
        "快速横移",
        "英歌阵列",
    ),
    (
        "水浒精神：除恶护佑",
        9,
        "每一次抬槌，都是刚烈、除恶与护佑的回声。",
        "青石街酒楼意象与英歌鼓阵叠化。",
        "哨棒横扫，压迫感强但克制。",
        "痛快、护义",
        "背后跟拍转正面",
        "青石街酒楼",
    ),
    (
        "收束成片：阵中定格",
        9,
        "他不是孤勇的传说，而是英歌阵中最烈的一声鼓点。",
        "武松站在鼓阵中心，水墨化为朱砂脸谱印记。",
        "定格、抬槌、落印。",
        "庄重、收束",
        "缓慢升格",
        "朱砂印记舞台",
    ),
]


def seed_shots_and_panels(db: Session) -> None:
    """Seed shots and panels."""
    for index, data in enumerate(SHOT_DATA, start=1):
        title, duration, narration, visual, action, emotion, camera, scene = data
        upsert_by_id(
            db,
            Shot,
            SHOT_IDS[index - 1],
            {
                "script_id": SCRIPT_ID,
                "character_id": CHARACTER_ID,
                "shot_no": index,
                "title": title,
                "duration_seconds": duration,
                "narration_segment": narration,
                "visual_description": visual,
                "action": action,
                "emotion": emotion,
                "camera_movement": camera,
                "scene": scene,
                "consistency_status": "优秀" if index in {1, 2, 6} else "一致",
                "prompt_status": "已生成",
                "status": ShotStatus.READY,
                "metadata_": {"seed_key": f"shot-{index:02d}"},
            },
        )

        for panel_offset in range(2):
            panel_index = (index - 1) * 2 + panel_offset
            upsert_by_id(
                db,
                Panel,
                PANEL_IDS[panel_index],
                {
                    "shot_id": SHOT_IDS[index - 1],
                    "panel_no": panel_offset + 1,
                    "image_description": (f"{title} 分镜 {panel_offset + 1}：{visual}"),
                    "camera": camera,
                    "motion": "起势推进" if panel_offset == 0 else "动作定格转场",
                    "prompt_status": "已生成",
                    "keyframe_status": "已采纳" if panel_offset == 0 else "候选",
                    "video_status": "候选" if index <= 3 else "未生成",
                    "status": PanelStatus.READY,
                    "metadata_": {"seed_key": f"panel-{index:02d}-{panel_offset + 1}"},
                },
            )


def seed_prompts_tasks_assets(db: Session) -> None:
    """Seed prompts, tasks, assets, reviews, reflections, costs, and export plan."""
    for index, shot_id in enumerate(SHOT_IDS, start=1):
        shot_title = SHOT_DATA[index - 1][0]
        upsert_by_id(
            db,
            PromptDraft,
            IMAGE_PROMPT_IDS[index - 1],
            {
                "project_id": PROJECT_ID,
                "script_id": SCRIPT_ID,
                "shot_id": shot_id,
                "panel_id": PANEL_IDS[(index - 1) * 2],
                "type": PromptType.IMAGE,
                "version": "v1",
                "status": PromptStatus.OPTIMIZED,
                "content": (
                    f"{shot_title}，武松朱砂红黑虎纹脸谱，英歌战舞，"
                    "国风水墨，游戏 CG 质感，强动态构图，9:16。"
                ),
                "positive_keywords": {"items": ["朱砂脸谱", "英歌战舞", "水墨烟尘"]},
                "negative_keywords": {"items": ["现代服饰", "塑料质感", "西式盔甲"]},
                "source_fields": {"shot_no": index, "character": "武松"},
                "quality_checklist": {"face_color": "朱砂红 / 墨黑", "aspect": "9:16"},
            },
        )
        upsert_by_id(
            db,
            PromptDraft,
            VIDEO_PROMPT_IDS[index - 1],
            {
                "project_id": PROJECT_ID,
                "script_id": SCRIPT_ID,
                "shot_id": shot_id,
                "panel_id": PANEL_IDS[(index - 1) * 2 + 1],
                "type": PromptType.VIDEO,
                "version": "v1",
                "status": PromptStatus.OPTIMIZED,
                "content": (
                    f"{shot_title}，镜头随鼓点推进，动作克制有力，"
                    "保持武松脸谱与英歌槌一致性。"
                ),
                "positive_keywords": {"items": ["鼓点", "动作爆发", "镜头推进"]},
                "negative_keywords": {"items": ["动作过强", "脸谱漂移", "血腥"]},
                "source_fields": {"shot_no": index, "target": "video"},
                "quality_checklist": {"motion": "中等强度", "duration": "5-9s"},
            },
        )

    task_payloads = [
        (GenerationTaskType.IMAGE, GenerationTaskStatus.SUCCEEDED, 100, "gpt-image-2"),
        (GenerationTaskType.VIDEO, GenerationTaskStatus.RUNNING, 62, "Seedance 2.0"),
        (GenerationTaskType.TTS, GenerationTaskStatus.SUCCEEDED, 100, "MiniMax TTS"),
        (GenerationTaskType.VIDEO, GenerationTaskStatus.FAILED, 100, "Seedance 2.0"),
        (GenerationTaskType.IMAGE, GenerationTaskStatus.QUEUED, 0, "nano banana"),
        (GenerationTaskType.SUBTITLE, GenerationTaskStatus.SUCCEEDED, 100, "mock-srt"),
    ]
    for index, (task_type, status, progress, model) in enumerate(task_payloads):
        upsert_by_id(
            db,
            GenerationTask,
            TASK_IDS[index],
            {
                "project_id": PROJECT_ID,
                "shot_id": SHOT_IDS[index % len(SHOT_IDS)],
                "panel_id": PANEL_IDS[index],
                "prompt_id": (
                    IMAGE_PROMPT_IDS[index % len(IMAGE_PROMPT_IDS)]
                    if task_type == GenerationTaskType.IMAGE
                    else VIDEO_PROMPT_IDS[index % len(VIDEO_PROMPT_IDS)]
                ),
                "type": task_type,
                "status": status,
                "provider": "mock",
                "model": model,
                "mode": "mock",
                "progress": progress,
                "estimated_cost": Decimal("12.5000"),
                "actual_cost": Decimal("10.8000")
                if status.value == "succeeded"
                else None,
                "failure_reason": "脸谱边界漂移，动作过强"
                if status.value == "failed"
                else None,
                "retry_count": 1 if status.value == "failed" else 0,
                "request_payload": {"mock": True, "phase": 6},
                "response_payload": {"status": status.value},
                "metadata_": {"seed_key": f"task-{index + 1}"},
            },
        )

    asset_payloads = [
        (AssetType.IMAGE, AssetStatus.ACCEPTED, 0, "mock://assets/wusong-shot-01.png"),
        (AssetType.VIDEO, AssetStatus.CANDIDATE, 1, "mock://assets/wusong-shot-02.mp4"),
        (
            AssetType.IMAGE,
            AssetStatus.REJECTED,
            2,
            "mock://assets/wusong-shot-03-bad.png",
        ),
        (AssetType.VIDEO, AssetStatus.CANDIDATE, 3, "mock://assets/wusong-shot-04.mp4"),
        (AssetType.IMAGE, AssetStatus.CANDIDATE, 4, "mock://assets/wusong-shot-05.png"),
        (AssetType.VIDEO, AssetStatus.ACCEPTED, 5, "mock://assets/wusong-shot-06.mp4"),
        (AssetType.AUDIO, AssetStatus.ACCEPTED, 0, "mock://assets/wusong-tts.mp3"),
        (AssetType.SUBTITLE, AssetStatus.ACCEPTED, 0, "mock://assets/wusong-zh.srt"),
        (AssetType.IMAGE, AssetStatus.CANDIDATE, 1, "mock://assets/wusong-cover.png"),
    ]
    for index, (asset_type, status, shot_index, uri) in enumerate(asset_payloads):
        upsert_by_id(
            db,
            Asset,
            ASSET_IDS[index],
            {
                "project_id": PROJECT_ID,
                "shot_id": SHOT_IDS[shot_index],
                "panel_id": PANEL_IDS[min(shot_index * 2, len(PANEL_IDS) - 1)],
                "prompt_id": IMAGE_PROMPT_IDS[shot_index]
                if asset_type == AssetType.IMAGE
                else VIDEO_PROMPT_IDS[shot_index],
                "task_id": TASK_IDS[index % len(TASK_IDS)],
                "type": asset_type,
                "status": status,
                "uri": uri,
                "thumbnail_uri": uri.replace(".mp4", ".jpg").replace(".mp3", ".jpg"),
                "model": "mock-model",
                "provider": "mock",
                "cost": Decimal("8.8000"),
                "consistency_score": Decimal("0.8800")
                if status != AssetStatus.REJECTED
                else Decimal("0.4200"),
                "failure_reasons": {"items": ["face_pattern_wrong"]}
                if status == AssetStatus.REJECTED
                else None,
                "metadata_": {"seed_key": f"asset-{index + 1}", "mock_uri": True},
            },
        )

    image_asset_indexes = [0, 2, 4, 8]
    for index in image_asset_indexes:
        upsert_by_id(
            db,
            ImageAsset,
            ASSET_EXT_IDS[index],
            {
                "asset_id": ASSET_IDS[index],
                "width": 1080,
                "height": 1920,
                "aspect_ratio": "9:16",
                "prompt_strength": Decimal("0.7200"),
                "seed": f"wusong-seed-{index + 1}",
            },
        )
    video_asset_indexes = [1, 3, 5]
    for index in video_asset_indexes:
        upsert_by_id(
            db,
            VideoAsset,
            ASSET_EXT_IDS[index],
            {
                "asset_id": ASSET_IDS[index],
                "duration_seconds": SHOT_DATA[index % len(SHOT_DATA)][1],
                "aspect_ratio": "9:16",
                "resolution": "1080x1920",
                "motion_strength": Decimal("0.6600"),
                "mode": "image-to-video",
            },
        )
    upsert_by_id(
        db,
        AudioAsset,
        ASSET_EXT_IDS[6],
        {
            "asset_id": ASSET_IDS[6],
            "duration_seconds": 45,
            "voice": "MiniMax 男声 国风旁白",
            "transcript": "三声鼓响，行者出阵。武松踏过水泊烟尘。",
        },
    )
    upsert_by_id(
        db,
        SubtitleAsset,
        ASSET_EXT_IDS[7],
        {
            "asset_id": ASSET_IDS[7],
            "language": "zh-CN",
            "text": "三声鼓响，行者出阵。",
            "timing_status": "mock_synced",
            "format": "srt",
        },
    )

    review_payloads = [
        (ASSET_IDS[0], ReviewStatus.ACCEPTED, None, "主视觉可采纳"),
        (ASSET_IDS[2], ReviewStatus.REJECTED, ["face_pattern_wrong"], "脸谱边界漂移"),
        (ASSET_IDS[3], ReviewStatus.NEEDS_RETRY, ["motion_too_strong"], "动作过强"),
        (ASSET_IDS[5], ReviewStatus.ACCEPTED, None, "收束镜头可采纳"),
    ]
    for index, (asset_id, status, codes, comment) in enumerate(review_payloads):
        upsert_by_id(
            db,
            AssetReview,
            REVIEW_IDS[index],
            {
                "asset_id": asset_id,
                "project_id": PROJECT_ID,
                "shot_id": SHOT_IDS[index],
                "panel_id": PANEL_IDS[index],
                "status": status,
                "reviewer_id": None,
                "failure_reason_codes": {"items": codes} if codes else None,
                "comment": comment,
                "reflection_suggestion": "加强负向词和脸谱参考锁定" if codes else None,
            },
        )

    failure_reasons = [
        (FailureReasonCode.CHARACTER_INCONSISTENT, "角色不一致", "consistency"),
        (FailureReasonCode.FACE_PATTERN_WRONG, "脸谱纹样错误", "visual"),
        (FailureReasonCode.COLOR_WRONG, "主色偏移", "visual"),
        (FailureReasonCode.SCENE_MISMATCH, "场景不匹配", "scene"),
        (FailureReasonCode.STYLE_DRIFT, "画风漂移", "style"),
        (FailureReasonCode.YINGGE_MOTION_WRONG, "英歌动作错误", "motion"),
        (FailureReasonCode.MODEL_ERROR, "模型错误", "provider"),
        (FailureReasonCode.PROMPT_WEAK, "提示词约束弱", "prompt"),
    ]
    for index, (code, label, category) in enumerate(failure_reasons):
        upsert_by_id(
            db,
            FailureReason,
            FAILURE_REASON_IDS[index],
            {
                "code": code,
                "label": label,
                "description": f"Seeded mock failure reason: {label}",
                "category": category,
            },
        )

    reflection_payloads = [
        (ReflectionSeverity.WARNING, "脸谱主色需要继续锁定朱砂红 / 墨黑。"),
        (ReflectionSeverity.INFO, "景阳冈镜头可以减少猛虎写实比例，保留意象。"),
        (ReflectionSeverity.WARNING, "英歌槌动作强度需控制在中等，避免武侠化过度。"),
        (ReflectionSeverity.ERROR, "被拒绝素材出现现代写实偏差，需要补充禁止词。"),
        (ReflectionSeverity.INFO, "收束镜头适合作为导出方案封面。"),
    ]
    for index, (severity, message) in enumerate(reflection_payloads):
        upsert_by_id(
            db,
            ReflectionNote,
            REFLECTION_IDS[index],
            {
                "project_id": PROJECT_ID,
                "shot_id": SHOT_IDS[index % len(SHOT_IDS)],
                "panel_id": PANEL_IDS[index],
                "prompt_id": IMAGE_PROMPT_IDS[index % len(IMAGE_PROMPT_IDS)],
                "task_id": TASK_IDS[index % len(TASK_IDS)],
                "asset_id": ASSET_IDS[index % len(ASSET_IDS)],
                "severity": severity,
                "source": "mock_review",
                "message": message,
                "suggestion": "后续 Prompt 优化时纳入一致性检查。",
                "metadata_": {"phase": 6},
            },
        )

    for index, cost_type in enumerate(
        [
            CostRecordType.ESTIMATED,
            CostRecordType.ACTUAL,
            CostRecordType.ESTIMATED,
            CostRecordType.ACTUAL,
        ]
    ):
        upsert_by_id(
            db,
            CostRecord,
            COST_IDS[index],
            {
                "project_id": PROJECT_ID,
                "task_id": TASK_IDS[index],
                "asset_id": ASSET_IDS[index],
                "provider": "mock",
                "model": "Seedance 2.0" if index % 2 else "gpt-image-2",
                "type": cost_type,
                "amount": Decimal("12.5000")
                if cost_type.value == "estimated"
                else Decimal("10.8000"),
                "currency": "CNY",
                "metadata_": {"phase": 6, "manual": True},
            },
        )

    upsert_by_id(
        db,
        ExportPlan,
        EXPORT_PLAN_ID,
        {
            "project_id": PROJECT_ID,
            "status": ExportPlanStatus.READY,
            "title": "武松英歌人物介绍短片制作方案",
            "timeline": {
                "duration_seconds": 45,
                "shots": [
                    {"shot_id": str(shot_id), "order": index + 1}
                    for index, shot_id in enumerate(SHOT_IDS)
                ],
            },
            "selected_asset_ids": {
                "cover": str(ASSET_IDS[0]),
                "accepted_video": str(ASSET_IDS[5]),
                "audio": str(ASSET_IDS[6]),
                "subtitle": str(ASSET_IDS[7]),
            },
            "output_format": "production_plan_json",
            "notes": "Phase 6 seed mock export plan; no real file is generated.",
        },
    )


def count_rows(db: Session, models: Iterable[type]) -> dict[str, int]:
    """Count rows by table name for seed output."""
    counts: dict[str, int] = {}
    for model in models:
        counts[model.__tablename__] = db.query(model).count()
    return counts


def main() -> None:
    """Run seed in one transaction."""
    with SessionLocal() as db:
        seed_project_character_script(db)
        seed_shots_and_panels(db)
        seed_prompts_tasks_assets(db)
        db.commit()

        counts = count_rows(
            db,
            [
                Project,
                Character,
                CharacterBible,
                Script,
                Shot,
                Panel,
                PromptDraft,
                GenerationTask,
                Asset,
                AssetReview,
                FailureReason,
                ReflectionNote,
                CostRecord,
                ExportPlan,
            ],
        )

    print("Seed mock data completed.")
    for table_name, count in counts.items():
        print(f"{table_name}: {count}")


if __name__ == "__main__":
    main()
