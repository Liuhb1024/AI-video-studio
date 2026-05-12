from collections.abc import Generator
from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.ai.dmx_gemini import GeminiImageGenerationResult, GeminiImageOutput
from app.ai.dmx_gpt_image import GPTImageGenerationResult, GPTImageOutput
from app.ai.dmx_seedream import SeedreamImageGenerationResult, SeedreamImageOutput
from app.api.deps import get_db, get_storage
from app.db.base import Base
from app.main import create_app
from app.modules.assets.models import Asset
from app.modules.characters.models import Character
from app.modules.generation.models import GenerateTask
from app.modules.generation.queue import drain_generation_task_queue, get_generation_task_queue
from app.modules.projects.models import Project
from app.modules.style_templates.models import StyleTemplate


def build_test_client() -> TestClient:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)
    Base.metadata.create_all(
        bind=engine,
        tables=[Project.__table__, Character.__table__, Asset.__table__, StyleTemplate.__table__, GenerateTask.__table__],
    )

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    app.state.testing_session_factory = TestingSessionLocal
    app.state.disable_generation_worker = True
    return TestClient(app)


class FakeStorageProvider:
    name = "fake-storage"
    bucket = "test-bucket"
    region = "test-region"

    def __init__(self) -> None:
        self.objects = {
            "characters/front.png": b"front-bytes",
            "characters/facepaint.png": b"facepaint-bytes",
        }

    def build_key(self, namespace: str, filename: str, *, project_id: str | None = None) -> str:
        return f"{namespace}/{filename}"

    def put_bytes(self, key: str, data: bytes, *, content_type: str | None = None) -> str:
        self.objects[key] = data
        return f"https://storage.test/{key}"

    def get_bytes(self, key: str) -> bytes:
        return self.objects[key]

    def public_url(self, key: str) -> str:
        return f"https://storage.test/{key}"

    def delete(self, key: str) -> None:
        self.objects.pop(key, None)


def test_character_image_task_creates_traceable_task_and_mock_output_asset() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "林冲", "weapons": "蛇矛"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        facepaint = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="facepaint.png",
            object_key="characters/facepaint.png",
            url="https://example.com/facepaint.png",
            reference_type="facepaint",
            asset_origin="uploaded",
            status="ready",
        )
        full_body = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="full-body.png",
            object_key="characters/full-body.png",
            url="https://example.com/full-body.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        style_template = StyleTemplate(
            name="暗色电影国漫",
            source_image_url="https://example.com/style.png",
            style_category="国漫厚涂",
            visual_summary="强轮廓、金红光影。",
            line_style="清晰轮廓线",
            color_palette="墨黑、陶土红、暗金",
            lighting_style="金色舞台边缘光",
            composition_style="竖屏主体居中",
            character_rendering="脸谱边界清晰，服饰纹样可读。",
            background_rendering="祠堂暗部空间纵深。",
            texture_keywords="细腻厚涂，电影级调色。",
            image_prompt_template="参考暗色电影国漫风格，保持脸谱和服饰一致。",
            video_prompt_template="镜头保持角色脸谱和服饰稳定。",
            negative_prompt="脸部崩坏、服饰错乱",
            analysis_status="analyzed",
            analysis_model="gpt-5.4-nano",
            analysis_version="style-template-vocab-mvp",
            status="active",
        )
        session.add_all([facepaint, full_body, style_template])
        session.commit()
        facepaint_id = facepaint.id
        full_body_id = full_body.id
        style_template_id = style_template.id

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "four_view",
            "model_name": "mock-image",
            "input_asset_ids": [facepaint_id, full_body_id],
            "style_template_id": style_template_id,
            "prompt_text": "生成英歌角色四视图，强调蛇矛和脸谱。",
            "negative_prompt": "不要现代服装",
            "params_json": {"temperature": 1.0},
        },
    )

    assert response.status_code == 200
    created_task = response.json()
    assert created_task["status"] == "queued"
    assert created_task["current_step"] == "queued"
    assert created_task["progress"] == 0
    assert get_generation_task_queue(client.app).pending_count == 1

    drained_task_ids = drain_generation_task_queue(client.app)
    assert drained_task_ids == [created_task["id"]]

    task = client.get(f"/api/v1/generation/character-image-tasks/{created_task['id']}").json()
    assert task["task_type"] == "character_image_generation"
    assert task["generation_type"] == "four_view"
    assert task["status"] == "mock_completed"
    assert task["current_step"] == "completed"
    assert task["progress"] == 100
    assert task["input_asset_ids"] == [facepaint_id, full_body_id]
    assert task["style_template_id"] == style_template_id
    assert task["input_snapshot_json"]["character"]["name"] == "林冲"
    snapshot_style = task["input_snapshot_json"]["style_template"]
    assert snapshot_style["name"] == "暗色电影国漫"
    assert snapshot_style["analysis_status"] == "analyzed"
    assert snapshot_style["line_style"] == "清晰轮廓线"
    assert snapshot_style["color_palette"] == "墨黑、陶土红、暗金"
    assert snapshot_style["video_prompt_template"] == "镜头保持角色脸谱和服饰稳定。"
    assert snapshot_style["analysis_model"] == "gpt-5.4-nano"
    assert task["output_asset_ids"]

    generated_assets = client.get(f"/api/v1/characters/{character['id']}/generated-assets").json()
    assert [asset["id"] for asset in generated_assets] == task["output_asset_ids"]
    assert generated_assets[0]["asset_origin"] == "generated"
    assert generated_assets[0]["generation_type"] == "four_view"
    assert generated_assets[0]["generate_task_id"] == task["id"]
    assert generated_assets[0]["source_reference_asset_ids"] == [facepaint_id, full_body_id]


def test_character_image_task_creation_returns_queued_task_before_background_execution() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "张清", "weapons": "飞石"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        reference = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="front.png",
            object_key="characters/front.png",
            url="https://example.com/front.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        session.add(reference)
        session.commit()
        reference_id = reference.id

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "style_transfer",
            "model_name": "mock-image",
            "input_asset_ids": [reference_id],
            "prompt_text": "生成候选角色图。",
        },
    )

    assert response.status_code == 200
    task = response.json()
    assert task["status"] == "queued"
    assert task["current_step"] == "queued"
    assert task["progress"] == 0
    assert task["output_asset_ids"] == []
    assert get_generation_task_queue(client.app).pending_count == 1

    generated_assets = client.get(f"/api/v1/characters/{character['id']}/generated-assets").json()
    assert generated_assets == []


def test_character_image_task_can_use_confirmed_prompt_without_rewrapping() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "林冲", "weapons": "蛇矛"}).json()

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "four_view",
            "model_name": "mock-image",
            "model_provider": "mock",
            "input_asset_ids": [],
            "prompt_text": "16:9画幅，人物四视图排版，左侧上半身特写，右侧并列全身正面、侧面、背面视图。",
            "negative_prompt": "视图不统一、蛇矛变形",
            "params_json": {"prompt_mode": "confirmed"},
        },
    )

    assert response.status_code == 200
    task = response.json()
    assert task["prompt_text"] == "16:9画幅，人物四视图排版，左侧上半身特写，右侧并列全身正面、侧面、背面视图。"
    assert task["input_prompt"] == task["prompt_text"]
    assert task["negative_prompt"] == "视图不统一、蛇矛变形"


def test_character_image_task_rejects_scene_style_template() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "林冲", "weapons": "蛇矛"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        style_template = StyleTemplate(
            name="祠堂夜景模板",
            style_category="场景模板",
            visual_summary="祠堂空间、烟雾、鼓阵和背景光影。",
            analysis_status="analyzed",
            status="active",
        )
        session.add(style_template)
        session.commit()
        style_template_id = style_template.id

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "character_lookdev",
            "model_name": "mock-image",
            "model_provider": "mock",
            "style_template_id": style_template_id,
            "prompt_text": "生成角色定稿候选。",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "角色生图只能绑定角色模板，不能使用场景模板。"


def test_non_confirmed_four_view_task_assembles_prompt_text() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "林冲", "weapons": "蛇矛"}).json()

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "four_view",
            "model_name": "mock-image",
            "model_provider": "mock",
            "prompt_text": "保持蛇矛和英歌脸谱。",
            "params_json": {"prompt_mode": "assembled"},
        },
    )

    assert response.status_code == 200
    task = response.json()
    assert "任务：角色四视图" in task["prompt_text"]
    assert "角色：林冲" in task["prompt_text"]
    assert "生成目标：基于脸谱和真人四面妆照生成角色四视图候选设定图。" in task["prompt_text"]
    assert "用户补充：保持蛇矛和英歌脸谱。" in task["prompt_text"]


def test_confirmed_prompt_appends_reference_color_fidelity_contract() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "林冲", "weapons": "蛇矛"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        front = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="front.png",
            object_key="characters/front.png",
            url="https://example.com/front.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        side = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="side.png",
            object_key="characters/side.png",
            url="https://example.com/side.png",
            reference_type="half_side_photo_1",
            asset_origin="uploaded",
            status="ready",
        )
        session.add_all([front, side])
        session.commit()
        front_id = front.id
        side_id = side.id

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "four_view",
            "model_name": "mock-image",
            "model_provider": "mock",
            "input_asset_ids": [front_id, side_id],
            "prompt_text": "16:9画幅，人物四视图排版。",
            "params_json": {"prompt_mode": "confirmed"},
        },
    )

    assert response.status_code == 200
    task = response.json()
    assert task["prompt_text"].startswith("16:9画幅，人物四视图排版。")
    assert "参考图配色保真契约" in task["prompt_text"]
    assert "第1张参考图（真人正面全身参考）" in task["prompt_text"]
    assert "第2张参考图（真人半侧参考 1）" in task["prompt_text"]
    assert "颜色优先级：真人/实拍参考图中的服装和道具颜色 > 角色文字档案 > 风格模板色板 > 通用审美色调" in task["prompt_text"]
    assert "脸谱主色只用于脸谱区域" in task["prompt_text"]
    assert "禁止统一改成黑白、灰阶、银黑或低饱和单色" in task["prompt_text"]
    assert "四视图配色规则" in task["prompt_text"]
    assert task["input_prompt"] == task["prompt_text"]


def test_character_four_view_prompt_draft_uses_fixed_layout_and_merges_constraints() -> None:
    client = build_test_client()
    character = client.post(
        "/api/v1/characters/",
        json={
            "name": "林冲",
            "alias": "豹子头",
            "rank": "第6位",
            "star": "天雄星",
            "weapons": "蛇矛",
            "yingge_role": "英歌槌手，身段挺拔。",
            "facepaint_main_color": "青黑",
            "facepaint_patterns": "豹纹额饰、眼角锐利纹样",
            "visual_tone_keywords": "冷峻、忠义、压迫感",
            "positive_prompt_terms": "青黑战袍、蛇矛、英气眉眼",
            "negative_prompt_terms": "脸谱错乱、蛇矛变形",
        },
    ).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        style_template = StyleTemplate(
            name="白底影棚写实",
            style_category="超写实角色设定",
            visual_summary="白底专业影棚，人物边缘清晰。",
            line_style="真实摄影边缘，不使用漫画描边。",
            color_palette="冷白背景、青黑服饰、低饱和金属色。",
            lighting_style="核心侧逆光，形成轮廓光与发丝光，面部低强度伦勃朗补光。",
            composition_style="16:9 横向角色设定图，左侧特写，右侧三视图并列。",
            character_rendering="皮肤细腻，脸谱边界清晰，服饰纹理锐利。",
            background_rendering="纯白极简影棚背景，干净无杂物。",
            texture_keywords="焦内锐利、专业影棚摄影、电影级质感。",
            yingge_adaptation="保持英歌脸谱、潮绣服饰、蛇矛和身段统一。",
            image_prompt_template="固定四视图设定图版式。",
            negative_prompt="背景杂物、视图光影不统一",
            analysis_status="analyzed",
            status="active",
        )
        session.add(style_template)
        session.commit()
        style_template_id = style_template.id

    response = client.post(
        "/api/v1/generation/character-image-prompt-drafts",
        json={
            "character_id": character["id"],
            "generation_type": "four_view",
            "style_template_id": style_template_id,
            "model_provider": "mock",
            "model_name": "mock-prompt",
            "negative_prompt": "不要水印、不要文字乱码",
        },
    )

    assert response.status_code == 200
    draft = response.json()
    assert draft["generation_type"] == "four_view"
    assert draft["model_provider"] == "mock"
    assert "16:9画幅" in draft["prompt_text"]
    assert "左侧上半身特写" in draft["prompt_text"]
    assert "右侧并列全身正、侧、背面视图" in draft["prompt_text"]
    assert "超写实人像" in draft["prompt_text"]
    assert "林冲，豹子头，第6位，天雄星" in draft["prompt_text"]
    assert "身穿" in draft["prompt_text"]
    assert "脸谱为青黑，豹纹额饰、眼角锐利纹样" in draft["prompt_text"]
    assert "脸谱主色只作用于脸谱区域" in draft["prompt_text"]
    assert "蛇矛" in draft["prompt_text"]
    assert "核心侧逆光" in draft["prompt_text"]
    assert "纯白极简影棚背景" in draft["prompt_text"]
    assert "服装固有色" in draft["prompt_text"]
    assert "服装与道具配色严格以参考图为最高优先级" in draft["prompt_text"]
    assert "风格模板只迁移画风、线条、渲染、光影和整体质感" in draft["prompt_text"]
    assert "不要把风格模板色板" in draft["prompt_text"]
    assert "黑白脸谱" in draft["prompt_text"]
    assert "不要把彩色服装生成黑白色调" in draft["prompt_text"]
    assert "左侧特写展示" in draft["prompt_text"]
    assert "右侧正面展示" in draft["prompt_text"]
    assert "极致细节" in draft["prompt_text"]
    assert "电影级质感" in draft["prompt_text"]
    assert "脸谱错乱" in draft["negative_prompt"]
    assert "背景杂物" in draft["negative_prompt"]
    assert "水印" in draft["negative_prompt"]
    assert draft["checklist"]["fixed_layout"] is True
    assert draft["checklist"]["consistent_lighting"] is True
    assert draft["checklist"]["view_specific_poses"] is True


def test_character_lookdev_prompt_draft_uses_reference_roles_and_merges_constraints() -> None:
    client = build_test_client()
    character = client.post(
        "/api/v1/characters/",
        json={
            "name": "林冲",
            "alias": "豹子头",
            "rank": "第6位",
            "star": "天雄星",
            "weapons": "蛇矛",
            "yingge_role": "英歌槌手，身段挺拔。",
            "facepaint_main_color": "青黑",
            "facepaint_patterns": "豹纹额饰、眼角锐利纹样",
            "visual_tone_keywords": "冷峻、忠义、压迫感",
            "positive_prompt_terms": "青黑战袍、蛇矛、英气眉眼",
            "negative_prompt_terms": "脸谱错乱、蛇矛变形",
        },
    ).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        facepaint = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="facepaint.png",
            object_key="characters/facepaint.png",
            url="https://example.com/facepaint.png",
            reference_type="facepaint",
            asset_origin="uploaded",
            status="ready",
        )
        full_body = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="full-body.png",
            object_key="characters/full-body.png",
            url="https://example.com/full-body.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        style_template = StyleTemplate(
            name="白底影棚写实角色",
            style_category="角色模板",
            visual_summary="白底专业影棚，人物边缘清晰。",
            line_style="真实摄影边缘，不使用漫画描边。",
            color_palette="冷白背景、青黑氛围、低饱和金属色。",
            lighting_style="核心侧逆光，形成轮廓光与发丝光。",
            composition_style="单人半身或 3/4 身定妆照，主体居中。",
            character_rendering="皮肤细腻，脸谱边界清晰，服饰纹理锐利。",
            background_rendering="纯白极简影棚背景，干净无杂物。",
            texture_keywords="焦内锐利、专业影棚摄影、电影级质感。",
            yingge_adaptation="保持英歌脸谱、潮绣服饰、蛇矛和身段统一。",
            image_prompt_template="生成角色标准形象主视觉。",
            negative_prompt="背景杂物、模板脸照搬",
            analysis_status="analyzed",
            status="active",
        )
        session.add_all([facepaint, full_body, style_template])
        session.commit()
        facepaint_id = facepaint.id
        full_body_id = full_body.id
        style_template_id = style_template.id

    response = client.post(
        "/api/v1/generation/character-image-prompt-drafts",
        json={
            "character_id": character["id"],
            "generation_type": "character_lookdev",
            "style_template_id": style_template_id,
            "input_asset_ids": [facepaint_id, full_body_id],
            "model_provider": "mock",
            "model_name": "mock-prompt",
            "prompt_text": "要更有少年英雄感。",
            "negative_prompt": "不要水印、不要文字乱码",
        },
    )

    assert response.status_code == 200
    draft = response.json()
    assert draft["generation_type"] == "character_lookdev"
    assert "单人角色定稿主视觉" in draft["prompt_text"]
    assert "不是四视图" in draft["prompt_text"]
    assert "不是场景图" in draft["prompt_text"]
    assert "林冲，豹子头，第6位，天雄星" in draft["prompt_text"]
    assert "脸谱参考图只锁定脸谱" in draft["prompt_text"]
    assert "真人/角色事实参考图" in draft["prompt_text"]
    assert "角色模板只提供" in draft["prompt_text"]
    assert "脸谱为青黑，豹纹额饰、眼角锐利纹样" in draft["prompt_text"]
    assert "身穿" in draft["prompt_text"]
    assert "蛇矛" in draft["prompt_text"]
    assert "半身或 3/4 身" in draft["prompt_text"]
    assert "背景简洁" in draft["prompt_text"]
    assert "适合后续纳入参考图库" in draft["prompt_text"]
    assert "少年英雄感" in draft["prompt_text"]
    assert "脸谱错乱" in draft["negative_prompt"]
    assert "背景杂物" in draft["negative_prompt"]
    assert "水印" in draft["negative_prompt"]
    assert "照搬模板人物身份" in draft["negative_prompt"]
    assert draft["checklist"]["single_character"] is True
    assert draft["checklist"]["reference_roles"] is True
    assert draft["checklist"]["template_boundary"] is True
    assert draft["checklist"]["manual_reference_ready"] is True
    assert draft["checklist"]["negative_controls"] is True


def test_character_lookdev_confirmed_prompt_appends_reference_contract() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "林冲", "weapons": "蛇矛"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        reference = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="lookdev.png",
            object_key="characters/lookdev.png",
            url="https://example.com/lookdev.png",
            reference_type="character_final_reference",
            asset_origin="promoted",
            status="ready",
        )
        session.add(reference)
        session.commit()
        reference_id = reference.id

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "character_lookdev",
            "model_name": "mock-image",
            "model_provider": "mock",
            "input_asset_ids": [reference_id],
            "prompt_text": "生成一张单人角色定稿主视觉。",
            "params_json": {"prompt_mode": "confirmed"},
        },
    )

    assert response.status_code == 200
    task = response.json()
    assert task["prompt_text"].startswith("生成一张单人角色定稿主视觉。")
    assert "参考图配色保真契约" in task["prompt_text"]
    assert "第1张参考图（角色定稿参考）" in task["prompt_text"]
    assert "角色形象定稿规则" in task["prompt_text"]
    assert "最终图必须是新的英歌角色标准形象图" in task["prompt_text"]
    assert task["input_prompt"] == task["prompt_text"]


def test_character_prompt_draft_rejects_unsupported_generation_type() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "张清"}).json()

    response = client.post(
        "/api/v1/generation/character-image-prompt-drafts",
        json={
            "character_id": character["id"],
            "generation_type": "expression_sheet",
            "model_provider": "mock",
            "model_name": "mock-prompt",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported character image prompt draft type"


def test_character_image_task_worker_writes_running_progress_before_model_execution(monkeypatch) -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "杨志", "weapons": "朴刀"}).json()
    observed_running_state = {}

    def fake_execute_mock_task(self, task, character, input_assets, style_template):
        observed_running_state["status"] = task.status
        observed_running_state["current_step"] = task.current_step
        observed_running_state["progress"] = task.progress
        task.status = "mock_completed"
        task.current_step = "completed"
        task.progress = 100
        task.output_asset_ids = []
        task.raw_response = {"mock": True, "message": "patched test output"}

    monkeypatch.setattr(
        "app.modules.generation.service.GenerateTaskService._execute_mock_character_image_task",
        fake_execute_mock_task,
    )

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "four_view",
            "model_name": "mock-image",
            "input_asset_ids": [],
            "prompt_text": "生成四视图。",
        },
    )

    assert response.status_code == 200
    created_task = response.json()
    assert drain_generation_task_queue(client.app) == [created_task["id"]]
    assert observed_running_state == {
        "status": "running",
        "current_step": "assembling_prompt",
        "progress": 15,
    }


def test_generation_queue_recovers_orphaned_queued_tasks_after_restart() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "时迁", "weapons": "匕首"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        task = GenerateTask(
            task_type="character_image_generation",
            character_id=character["id"],
            generation_type="character_lookdev",
            model_provider="mock",
            model_name="mock-image",
            prompt_text="生成角色定稿。",
            input_prompt="生成角色定稿。",
            status="queued",
            current_step="queued",
            progress=0,
            input_asset_ids=[],
            output_asset_ids=[],
        )
        session.add(task)
        session.commit()
        task_id = task.id

    queue = get_generation_task_queue(client.app)

    assert queue.pending_count == 1
    assert drain_generation_task_queue(client.app) == [task_id]


def test_generation_queue_marks_stale_running_tasks_failed_on_recovery() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "时迁", "weapons": "匕首"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        task = GenerateTask(
            task_type="character_image_generation",
            character_id=character["id"],
            generation_type="character_lookdev",
            model_provider="dmx-gemini",
            model_name="gemini-3.1-flash-image-preview",
            prompt_text="生成角色定稿。",
            input_prompt="生成角色定稿。",
            status="running",
            current_step="calling_nano_banana_2",
            progress=62,
            input_asset_ids=[],
            output_asset_ids=[],
        )
        task.updated_at = datetime.now(UTC) - timedelta(minutes=20)
        session.add(task)
        session.commit()
        task_id = task.id

    queue = get_generation_task_queue(client.app)

    assert queue.pending_count == 0
    failed_task = client.get(f"/api/v1/generation/character-image-tasks/{task_id}").json()
    assert failed_task["status"] == "failed"
    assert failed_task["current_step"] == "generation_failed"
    assert failed_task["error_code"] == "GENERATION_TASK_ORPHANED"


def test_generation_queue_marks_fresh_running_tasks_failed_after_process_restart() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "时迁", "weapons": "匕首"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        task = GenerateTask(
            task_type="character_image_generation",
            character_id=character["id"],
            generation_type="character_lookdev",
            model_provider="dmx-gemini",
            model_name="gemini-3.1-flash-image-preview",
            prompt_text="生成角色定稿。",
            input_prompt="生成角色定稿。",
            status="running",
            current_step="calling_nano_banana_2",
            progress=62,
            input_asset_ids=[],
            output_asset_ids=[],
        )
        session.add(task)
        session.commit()
        task_id = task.id

    get_generation_task_queue(client.app)

    failed_task = client.get(f"/api/v1/generation/character-image-tasks/{task_id}").json()
    assert failed_task["status"] == "failed"
    assert failed_task["current_step"] == "generation_failed"
    assert failed_task["error_code"] == "GENERATION_TASK_ORPHANED"


def test_character_image_task_can_be_cancelled_while_queued() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "时迁", "weapons": "匕首"}).json()

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "character_lookdev",
            "model_provider": "mock",
            "model_name": "mock-image",
            "input_asset_ids": [],
            "prompt_text": "生成角色定稿。",
        },
    )
    assert response.status_code == 200
    task_id = response.json()["id"]

    cancel_response = client.post(f"/api/v1/generation/character-image-tasks/{task_id}/cancel")

    assert cancel_response.status_code == 200
    cancelled = cancel_response.json()
    assert cancelled["status"] == "cancelled"
    assert cancelled["current_step"] == "cancelled"
    assert cancelled["progress"] == 0
    assert cancelled["error_code"] == "USER_CANCELLED"
    assert "用户手动终止任务" in cancelled["error_message"]

    assert drain_generation_task_queue(client.app) == [task_id]
    task_after_worker = client.get(f"/api/v1/generation/character-image-tasks/{task_id}").json()
    assert task_after_worker["status"] == "cancelled"
    assert task_after_worker["output_asset_ids"] == []


def test_character_image_task_can_be_cancelled_while_running() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "时迁", "weapons": "匕首"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        task = GenerateTask(
            task_type="character_image_generation",
            character_id=character["id"],
            generation_type="character_lookdev",
            model_provider="dmx-gemini",
            model_name="gemini-3.1-flash-image-preview",
            prompt_text="生成角色定稿。",
            input_prompt="生成角色定稿。",
            status="running",
            current_step="calling_nano_banana_2",
            progress=62,
            input_asset_ids=[],
            output_asset_ids=[],
        )
        session.add(task)
        session.commit()
        task_id = task.id

    cancel_response = client.post(f"/api/v1/generation/character-image-tasks/{task_id}/cancel")

    assert cancel_response.status_code == 200
    cancelled = cancel_response.json()
    assert cancelled["status"] == "cancelled"
    assert cancelled["current_step"] == "cancelled"
    assert cancelled["progress"] == 62
    assert cancelled["error_code"] == "USER_CANCELLED"


def test_completed_character_image_task_cannot_be_cancelled() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "时迁", "weapons": "匕首"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        task = GenerateTask(
            task_type="character_image_generation",
            character_id=character["id"],
            generation_type="character_lookdev",
            model_provider="mock",
            model_name="mock-image",
            prompt_text="生成角色定稿。",
            input_prompt="生成角色定稿。",
            status="completed",
            current_step="completed",
            progress=100,
            input_asset_ids=[],
            output_asset_ids=[],
        )
        session.add(task)
        session.commit()
        task_id = task.id

    cancel_response = client.post(f"/api/v1/generation/character-image-tasks/{task_id}/cancel")

    assert cancel_response.status_code == 400
    assert cancel_response.json()["detail"] == "Only queued or running character image tasks can be cancelled"


def test_cancelled_real_task_does_not_save_outputs_after_provider_returns(monkeypatch) -> None:
    client = build_test_client()
    fake_storage = FakeStorageProvider()
    client.app.dependency_overrides[get_storage] = lambda: fake_storage
    character = client.post("/api/v1/characters/", json={"name": "燕青", "weapons": "短弩"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        reference = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="front.png",
            mime_type="image/png",
            object_key="characters/front.png",
            url="https://storage.test/characters/front.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        session.add(reference)
        session.commit()
        reference_id = reference.id

    task_id_box: dict[str, str] = {}

    def fake_generate_images(self, *, prompt, images, aspect_ratio="1:1", image_size="1K", model=None, output_format="png", quality="auto", output_count=1):
        with session_factory() as session:
            task = session.get(GenerateTask, task_id_box["task_id"])
            task.status = "cancelled"
            task.current_step = "cancelled"
            task.error_code = "USER_CANCELLED"
            task.error_message = "用户手动终止任务。"
            session.commit()
        return GPTImageGenerationResult(
            images=[GPTImageOutput(data=b"gpt-generated-image", mime_type="image/png")],
            raw_response_summary={"image_count": 1},
        )

    monkeypatch.setenv("AI_PROVIDER", "dmx")
    monkeypatch.setenv("DMX_API_KEY", "sk-test")
    monkeypatch.setattr("app.ai.dmx_gpt_image.DMXGPTImageProvider.generate_images", fake_generate_images)

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "style_transfer",
            "model_name": "gpt-image-2-ssvip",
            "model_provider": "dmx-gpt-image",
            "input_asset_ids": [reference_id],
            "prompt_text": "把真人妆照转换成英歌漫剧风格。",
        },
    )

    assert response.status_code == 200
    task_id_box["task_id"] = response.json()["id"]
    assert drain_generation_task_queue(client.app) == [task_id_box["task_id"]]

    task = client.get(f"/api/v1/generation/character-image-tasks/{task_id_box['task_id']}").json()
    assert task["status"] == "cancelled"
    assert task["current_step"] == "cancelled"
    assert task["output_asset_ids"] == []
    generated_assets = client.get(f"/api/v1/characters/{character['id']}/generated-assets").json()
    assert generated_assets == []


def test_character_image_task_failure_detail_and_retry_flow() -> None:
    client = build_test_client()
    character = client.post("/api/v1/characters/", json={"name": "武松", "weapons": "双槌"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        reference = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="front.png",
            object_key="characters/front.png",
            url="https://example.com/front.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        session.add(reference)
        session.commit()
        reference_id = reference.id

    failed_response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "style_transfer",
            "model_name": "mock-image",
            "input_asset_ids": [reference_id],
            "prompt_text": "把真人妆照转换成英歌漫剧风格。",
            "params_json": {"mock_force_fail": True},
        },
    )

    assert failed_response.status_code == 200
    queued_failed_task = failed_response.json()
    assert queued_failed_task["status"] == "queued"
    assert drain_generation_task_queue(client.app) == [queued_failed_task["id"]]

    failed_task = client.get(f"/api/v1/generation/character-image-tasks/{queued_failed_task['id']}").json()
    assert failed_task["status"] == "failed"
    assert failed_task["current_step"] == "mock_model_call"
    assert failed_task["progress"] == 62
    assert failed_task["error_code"] == "MOCK_MODEL_ERROR"
    assert "mock" in failed_task["error_message"].lower()
    assert failed_task["output_asset_ids"] == []

    detail_response = client.get(f"/api/v1/generation/character-image-tasks/{failed_task['id']}")
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["id"] == failed_task["id"]
    assert detail["input_snapshot_json"]["character"]["name"] == "武松"
    assert detail["input_asset_ids"] == [reference_id]
    assert detail["prompt_text"]

    retry_response = client.post(f"/api/v1/generation/character-image-tasks/{failed_task['id']}/retry")

    assert retry_response.status_code == 200
    queued_retry_task = retry_response.json()
    assert queued_retry_task["status"] == "queued"
    assert drain_generation_task_queue(client.app) == [queued_retry_task["id"]]

    retry_task = client.get(f"/api/v1/generation/character-image-tasks/{queued_retry_task['id']}").json()
    assert retry_task["id"] != failed_task["id"]
    assert retry_task["retry_of_task_id"] == failed_task["id"]
    assert retry_task["status"] == "mock_completed"
    assert retry_task["current_step"] == "completed"
    assert retry_task["progress"] == 100
    assert retry_task["params_json"]["retry_attempt"] == 1
    assert retry_task["params_json"]["mock_force_fail"] is False
    assert retry_task["output_asset_ids"]

    listed = client.get(f"/api/v1/generation/character-image-tasks?character_id={character['id']}").json()
    listed_ids = [task["id"] for task in listed]
    assert retry_task["id"] in listed_ids
    assert failed_task["id"] in listed_ids


def test_character_style_transfer_uses_dmx_gemini_and_saves_generated_asset(monkeypatch) -> None:
    client = build_test_client()
    fake_storage = FakeStorageProvider()
    client.app.dependency_overrides[get_storage] = lambda: fake_storage
    character = client.post("/api/v1/characters/", json={"name": "鲁智深", "weapons": "双槌"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        reference = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="front.png",
            mime_type="image/png",
            object_key="characters/front.png",
            url="https://storage.test/characters/front.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        style_template = StyleTemplate(
            name="英歌暗色漫剧",
            style_category="暗色国漫",
            visual_summary="暗色电影感，强调英歌脸谱。",
            line_style="清晰轮廓线",
            color_palette="黑红金",
            lighting_style="金色边缘光",
            composition_style="主体居中",
            character_rendering="脸谱稳定，服饰纹样清晰。",
            background_rendering="祠堂暗部纵深。",
            texture_keywords="厚涂、胶片颗粒",
            yingge_adaptation="强化脸谱、头饰、潮绣服饰和双槌。",
            image_prompt_template="保持英歌脸谱和服饰一致。",
            video_prompt_template="镜头保持角色稳定。",
            negative_prompt="脸谱错乱、服饰错乱",
            analysis_status="analyzed",
            status="active",
        )
        session.add_all([reference, style_template])
        session.commit()
        reference_id = reference.id
        style_template_id = style_template.id

    captured = {}

    def fake_generate_images(self, *, prompt, images, aspect_ratio="1:1", image_size="1K", model=None):
        captured["prompt"] = prompt
        captured["images"] = images
        captured["aspect_ratio"] = aspect_ratio
        captured["image_size"] = image_size
        captured["model"] = model
        return GeminiImageGenerationResult(
            images=[GeminiImageOutput(data=b"generated-image", mime_type="image/png")],
            text_parts=[],
            raw_response_summary={"image_count": 1},
        )

    monkeypatch.setenv("AI_PROVIDER", "dmx")
    monkeypatch.setenv("DMX_API_KEY", "sk-test")
    monkeypatch.setattr("app.ai.dmx_gemini.DMXGeminiImageProvider.generate_images", fake_generate_images)

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "style_transfer",
            "model_name": "gemini-3.1-flash-image-preview",
            "model_provider": "dmx-gemini",
            "input_asset_ids": [reference_id],
            "style_template_id": style_template_id,
            "prompt_text": "把真人妆照转换成英歌漫剧风格。",
            "params_json": {"aspect_ratio": "3:4", "image_size": "1K"},
        },
    )

    assert response.status_code == 200
    created_task = response.json()
    assert created_task["status"] == "queued"
    assert drain_generation_task_queue(client.app) == [created_task["id"]]

    task = client.get(f"/api/v1/generation/character-image-tasks/{created_task['id']}").json()
    assert task["status"] == "completed"
    assert task["model_provider"] == "dmx-gemini"
    assert task["raw_response"]["mock"] is False
    assert task["raw_response"]["output_asset_count"] == 1
    assert "基于所选真人妆照参考图进行风格转换" in captured["prompt"]
    assert "真人参考图决定画什么，风格模板只决定怎么画" in captured["prompt"]
    assert "主体保真" in captured["prompt"]
    assert "目标风格迁移" in captured["prompt"]
    assert "同一人物、同一脸谱、同一服装、同一道具、同一体态比例" in captured["prompt"]
    assert "服装固有色" in captured["prompt"]
    assert "不得改写真人参考图中的人物身份、脸谱结构、服装固有色" in captured["prompt"]
    assert "脸谱主色只用于脸谱区域" in captured["prompt"]
    assert "风格模板色板污染服装" in captured["prompt"]
    assert "视觉摘要：暗色电影感" in captured["prompt"]
    assert "线条：清晰轮廓线" in captured["prompt"]
    assert "色彩氛围：黑红金" in captured["prompt"]
    assert "这只作为背景、光影和整体质感参考，不作为服装/道具改色依据" in captured["prompt"]
    assert captured["images"][0].data == b"front-bytes"
    assert captured["aspect_ratio"] == "3:4"
    assert captured["image_size"] == "1K"
    assert task["output_asset_ids"]

    generated_assets = client.get(f"/api/v1/characters/{character['id']}/generated-assets").json()
    assert generated_assets[0]["asset_origin"] == "generated"
    assert generated_assets[0]["provider"] == "fake-storage"
    assert generated_assets[0]["url"].startswith("https://storage.test/generated-assets/characters/")
    assert fake_storage.objects[generated_assets[0]["object_key"]] == b"generated-image"


def test_character_style_transfer_uses_dmx_gpt_image_and_saves_generated_asset(monkeypatch) -> None:
    client = build_test_client()
    fake_storage = FakeStorageProvider()
    client.app.dependency_overrides[get_storage] = lambda: fake_storage
    character = client.post("/api/v1/characters/", json={"name": "燕青", "weapons": "短弩"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        reference = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="front.png",
            mime_type="image/png",
            object_key="characters/front.png",
            url="https://storage.test/characters/front.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        session.add(reference)
        session.commit()
        reference_id = reference.id

    captured = {}

    def fake_generate_images(self, *, prompt, images, aspect_ratio="1:1", image_size="1K", model=None, output_format="png", quality="auto", output_count=1):
        captured["prompt"] = prompt
        captured["images"] = images
        captured["aspect_ratio"] = aspect_ratio
        captured["image_size"] = image_size
        captured["model"] = model
        captured["output_format"] = output_format
        captured["quality"] = quality
        captured["output_count"] = output_count
        return GPTImageGenerationResult(
            images=[GPTImageOutput(data=b"gpt-generated-image", mime_type="image/png")],
            raw_response_summary={"image_count": 1, "size": "3584x1536"},
        )

    monkeypatch.setenv("AI_PROVIDER", "dmx")
    monkeypatch.setenv("DMX_API_KEY", "sk-test")
    monkeypatch.setattr("app.ai.dmx_gpt_image.DMXGPTImageProvider.generate_images", fake_generate_images)

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "style_transfer",
            "model_name": "gpt-image-2-ssvip",
            "model_provider": "dmx-gpt-image",
            "input_asset_ids": [reference_id],
            "prompt_text": "把真人妆照转换成英歌漫剧风格。",
            "params_json": {"aspect_ratio": "21:9", "image_size": "4K", "output_format": "png", "quality": "auto", "output_count": 2},
        },
    )

    assert response.status_code == 200
    created_task = response.json()
    assert created_task["status"] == "queued"
    assert drain_generation_task_queue(client.app) == [created_task["id"]]

    task = client.get(f"/api/v1/generation/character-image-tasks/{created_task['id']}").json()
    assert task["status"] == "completed"
    assert task["model_provider"] == "dmx-gpt-image"
    assert task["raw_response"]["mock"] is False
    assert task["raw_response"]["provider"] == "dmx-gpt-image"
    assert task["raw_response"]["output_asset_count"] == 1
    assert captured["images"][0].data == b"front-bytes"
    assert captured["aspect_ratio"] == "21:9"
    assert captured["image_size"] == "4K"
    assert captured["model"] == "gpt-image-2-ssvip"
    assert captured["output_count"] == 1
    assert task["output_asset_ids"]

    generated_assets = client.get(f"/api/v1/characters/{character['id']}/generated-assets").json()
    assert generated_assets[0]["asset_origin"] == "generated"
    assert generated_assets[0]["provider"] == "fake-storage"
    assert generated_assets[0]["url"].startswith("https://storage.test/generated-assets/characters/")
    assert fake_storage.objects[generated_assets[0]["object_key"]] == b"gpt-generated-image"


def test_character_lookdev_uses_seedream_and_saves_generated_asset(monkeypatch) -> None:
    client = build_test_client()
    fake_storage = FakeStorageProvider()
    client.app.dependency_overrides[get_storage] = lambda: fake_storage
    character = client.post(
        "/api/v1/characters/",
        json={
            "name": "时迁",
            "alias": "鼓上蚤",
            "weapons": "短刀",
            "facepaint_main_color": "黑白",
            "facepaint_patterns": "蛇形脸谱",
        },
    ).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        facepaint = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="facepaint.png",
            mime_type="image/png",
            object_key="characters/facepaint.png",
            url="https://storage.test/characters/facepaint.png",
            reference_type="facepaint",
            asset_origin="uploaded",
            status="ready",
        )
        reference = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="front.png",
            mime_type="image/png",
            object_key="characters/front.png",
            url="https://storage.test/characters/front.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        style_template = StyleTemplate(
            name="优秀人物定妆",
            style_category="人物概念设计",
            visual_summary="高级角色定妆照，主体精致。",
            line_style="干净轮廓线",
            color_palette="冷白肤色、暗金边缘光",
            lighting_style="核心侧逆光，面部柔和补光。",
            composition_style="单人半身或 3/4 身。",
            character_rendering="脸部审美精致，妆面干净。",
            background_rendering="简洁影棚背景。",
            texture_keywords="电影级质感、焦内锐利。",
            yingge_adaptation="融合英歌脸谱、头饰和短刀。",
            image_prompt_template="生成角色标准形象图。",
            negative_prompt="脸谱错乱、服饰错乱",
            analysis_status="analyzed",
            status="active",
        )
        session.add_all([facepaint, reference, style_template])
        session.commit()
        facepaint_id = facepaint.id
        reference_id = reference.id
        style_template_id = style_template.id

    captured = {}

    def fake_generate_images(self, *, prompt, images, image_size="2K", model=None, output_format="png", output_count=1):
        captured["prompt"] = prompt
        captured["images"] = images
        captured["image_size"] = image_size
        captured["model"] = model
        captured["output_format"] = output_format
        return SeedreamImageGenerationResult(
            images=[SeedreamImageOutput(data=b"lookdev-generated-image", mime_type="image/png")],
            raw_response_summary={"image_count": 1, "resolved_size": "2K"},
        )

    monkeypatch.setenv("AI_PROVIDER", "dmx")
    monkeypatch.setenv("DMX_API_KEY", "sk-test")
    monkeypatch.setattr("app.ai.dmx_seedream.DMXSeedreamImageProvider.generate_images", fake_generate_images)

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "character_lookdev",
            "model_name": "doubao-seedream-5.0-lite",
            "model_provider": "dmx-seedream",
            "input_asset_ids": [facepaint_id, reference_id],
            "style_template_id": style_template_id,
            "prompt_text": "生成可采纳为四视图主参考的角色标准形象图。",
            "params_json": {"image_size": "2K", "output_format": "png"},
        },
    )

    assert response.status_code == 200
    created_task = response.json()
    assert created_task["status"] == "queued"
    assert drain_generation_task_queue(client.app) == [created_task["id"]]

    task = client.get(f"/api/v1/generation/character-image-tasks/{created_task['id']}").json()
    assert task["status"] == "completed"
    assert task["generation_type"] == "character_lookdev"
    assert task["raw_response"]["provider"] == "dmx-seedream"
    assert "生成一张单人角色标准形象图" in captured["prompt"]
    assert "风格角色化定稿" in captured["prompt"]
    assert "风格模板人物图决定脸部审美" in captured["prompt"]
    assert "角色事实参考图决定英歌脸谱、服装结构、服装颜色" in captured["prompt"]
    assert "不是照搬风格模板人物身份" in captured["prompt"]
    assert "人工采纳后可作为四视图主参考" in captured["prompt"]
    assert captured["images"][0].data == b"facepaint-bytes"
    assert captured["images"][1].data == b"front-bytes"
    assert task["output_asset_ids"]

    generated_assets = client.get(f"/api/v1/characters/{character['id']}/generated-assets").json()
    assert generated_assets[0]["generation_type"] == "character_lookdev"
    assert "形象定稿候选" in generated_assets[0]["title"]
    assert fake_storage.objects[generated_assets[0]["object_key"]] == b"lookdev-generated-image"


def test_character_four_view_uses_dmx_seedream_and_saves_generated_asset(monkeypatch) -> None:
    client = build_test_client()
    fake_storage = FakeStorageProvider()
    client.app.dependency_overrides[get_storage] = lambda: fake_storage
    character = client.post("/api/v1/characters/", json={"name": "石迁", "weapons": "匕首"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        reference = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="front.png",
            mime_type="image/png",
            object_key="characters/front.png",
            url="https://storage.test/characters/front.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        session.add(reference)
        session.commit()
        reference_id = reference.id

    captured = {}

    def fake_generate_images(self, *, prompt, images, image_size="2K", model=None, output_format="png", output_count=1):
        captured["prompt"] = prompt
        captured["images"] = images
        captured["image_size"] = image_size
        captured["model"] = model
        captured["output_format"] = output_format
        captured["output_count"] = output_count
        return SeedreamImageGenerationResult(
            images=[SeedreamImageOutput(data=b"seedream-generated-image", mime_type="image/png")],
            raw_response_summary={"image_count": 1, "resolved_size": "3K"},
        )

    monkeypatch.setenv("AI_PROVIDER", "dmx")
    monkeypatch.setenv("DMX_API_KEY", "sk-test")
    monkeypatch.setattr("app.ai.dmx_seedream.DMXSeedreamImageProvider.generate_images", fake_generate_images)

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "four_view",
            "model_name": "doubao-seedream-5.0-lite",
            "model_provider": "dmx-seedream",
            "input_asset_ids": [reference_id],
            "prompt_text": "16:9画幅，人物四视图排版，服装颜色锁定，以参考图为准。",
            "negative_prompt": "服装颜色漂移",
            "params_json": {"prompt_mode": "confirmed", "image_size": "4K", "output_format": "png"},
        },
    )

    assert response.status_code == 200
    created_task = response.json()
    assert created_task["status"] == "queued"
    assert drain_generation_task_queue(client.app) == [created_task["id"]]

    task = client.get(f"/api/v1/generation/character-image-tasks/{created_task['id']}").json()
    assert task["status"] == "completed"
    assert task["model_provider"] == "dmx-seedream"
    assert task["raw_response"]["mock"] is False
    assert task["raw_response"]["provider"] == "dmx-seedream"
    assert task["raw_response"]["output_asset_count"] == 1
    assert captured["prompt"].startswith("16:9画幅，人物四视图排版，服装颜色锁定，以参考图为准。")
    assert "参考图配色保真契约" in captured["prompt"]
    assert "第1张参考图（真人正面全身参考）" in captured["prompt"]
    assert "脸谱主色只用于脸谱区域" in captured["prompt"]
    assert "禁止统一改成黑白、灰阶、银黑或低饱和单色" in captured["prompt"]
    assert captured["images"][0].data == b"front-bytes"
    assert captured["image_size"] == "4K"
    assert captured["model"] == "doubao-seedream-5.0-lite"
    assert captured["output_format"] == "png"
    assert captured["output_count"] == 1
    assert task["output_asset_ids"]

    generated_assets = client.get(f"/api/v1/characters/{character['id']}/generated-assets").json()
    assert generated_assets[0]["asset_origin"] == "generated"
    assert generated_assets[0]["provider"] == "fake-storage"
    assert fake_storage.objects[generated_assets[0]["object_key"]] == b"seedream-generated-image"


def test_character_style_transfer_records_dmx_gpt_image_failure(monkeypatch) -> None:
    client = build_test_client()
    fake_storage = FakeStorageProvider()
    client.app.dependency_overrides[get_storage] = lambda: fake_storage
    character = client.post("/api/v1/characters/", json={"name": "史进", "weapons": "棍"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        reference = Asset(
            character_id=character["id"],
            asset_type="image",
            filename="front.png",
            mime_type="image/png",
            object_key="characters/front.png",
            url="https://storage.test/characters/front.png",
            reference_type="full_body_front_photo",
            asset_origin="uploaded",
            status="ready",
        )
        session.add(reference)
        session.commit()
        reference_id = reference.id

    def fake_generate_images(self, **kwargs):
        raise RuntimeError("DMX GPT Image 2 图片模型参数不兼容。")

    monkeypatch.setenv("DMX_API_KEY", "sk-test")
    monkeypatch.setattr("app.ai.dmx_gpt_image.DMXGPTImageProvider.generate_images", fake_generate_images)

    response = client.post(
        "/api/v1/generation/character-image-tasks",
        json={
            "character_id": character["id"],
            "generation_type": "style_transfer",
            "model_name": "gpt-image-2-ssvip",
            "model_provider": "dmx-gpt-image",
            "input_asset_ids": [reference_id],
            "prompt_text": "把真人妆照转换成英歌漫剧风格。",
            "params_json": {"aspect_ratio": "16:9", "image_size": "4K"},
        },
    )

    assert response.status_code == 200
    created_task = response.json()
    assert drain_generation_task_queue(client.app) == [created_task["id"]]

    task = client.get(f"/api/v1/generation/character-image-tasks/{created_task['id']}").json()
    assert task["status"] == "failed"
    assert task["error_code"] == "DMX_GPT_IMAGE_ERROR"
    assert "GPT Image 2" in task["error_message"]
    assert task["raw_response"]["provider"] == "dmx-gpt-image"
    assert task["output_asset_ids"] == []
