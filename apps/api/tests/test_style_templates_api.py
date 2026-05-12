from collections.abc import Generator
from pathlib import Path
from urllib.parse import urlparse

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db, get_storage
from app.core.config import get_settings
from app.db.base import Base
from app.main import create_app
from app.modules.assets.models import Asset
from app.modules.generation.models import GenerateTask
from app.modules.style_templates.models import StyleTemplate
from app.storage.local import LocalStorageProvider


def build_test_client() -> TestClient:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)
    Base.metadata.create_all(bind=engine, tables=[StyleTemplate.__table__, Asset.__table__, GenerateTask.__table__])

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    app.state.testing_session_factory = TestingSessionLocal
    return TestClient(app)


def test_style_template_crud_flow() -> None:
    client = build_test_client()

    create_response = client.post(
        "/api/v1/style-templates/",
        json={
            "name": "暗色电影国漫",
            "style_category": "国漫厚涂",
            "visual_summary": "低照度、金红舞台光、强轮廓人物。",
            "color_palette": "黑、陶土红、金色高光",
            "image_prompt_template": "暗色电影感国漫厚涂，强轮廓，金红舞台光。",
            "negative_prompt": "低清晰度、脸部崩坏、廉价滤镜",
        },
    )

    assert create_response.status_code == 200
    created = create_response.json()
    assert created["name"] == "暗色电影国漫"
    assert created["analysis_status"] == "manual"

    list_response = client.get("/api/v1/style-templates/", params={"query": "国漫"})
    assert list_response.status_code == 200
    assert [item["id"] for item in list_response.json()] == [created["id"]]

    update_response = client.patch(
        f"/api/v1/style-templates/{created['id']}",
        json={"status": "active", "lighting_style": "强背光、侧逆光、舞台金边"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "active"
    assert "侧逆光" in update_response.json()["lighting_style"]

    delete_response = client.delete(f"/api/v1/style-templates/{created['id']}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/api/v1/style-templates/{created['id']}")
    assert missing_response.status_code == 404


def test_style_template_list_can_filter_role_and_scene_templates() -> None:
    client = build_test_client()

    role_response = client.post(
        "/api/v1/style-templates/",
        json={
            "name": "角色定稿模板",
            "style_category": "角色模板",
            "visual_summary": "人物脸部审美、服装材质和定妆光影。",
        },
    )
    scene_response = client.post(
        "/api/v1/style-templates/",
        json={
            "name": "祠堂场景模板",
            "style_category": "场景模板",
            "visual_summary": "祠堂空间、烟雾、鼓阵和背景光影。",
        },
    )

    role_list = client.get("/api/v1/style-templates/", params={"style_category": "角色模板"})
    assert role_list.status_code == 200
    assert [item["id"] for item in role_list.json()] == [role_response.json()["id"]]

    scene_list = client.get("/api/v1/style-templates/", params={"style_category": "场景模板"})
    assert scene_list.status_code == 200
    assert [item["id"] for item in scene_list.json()] == [scene_response.json()["id"]]


def test_style_template_can_be_created_from_uploaded_source_image(tmp_path) -> None:
    client = build_test_client()
    client.app.dependency_overrides[get_storage] = lambda: LocalStorageProvider(root_dir=tmp_path)

    response = client.post(
        "/api/v1/style-templates/from-image",
        data={
            "name": "暗色电影国漫",
            "style_category": "国漫厚涂",
        },
        files={"file": ("style-shot.png", b"fake-style-image", "image/png")},
    )

    assert response.status_code == 200
    created = response.json()
    assert created["name"] == "暗色电影国漫"
    assert created["style_category"] == "国漫厚涂"
    assert created["source_asset_id"]
    assert created["cover_asset_id"] == created["source_asset_id"]
    assert created["source_image_url"]
    assert created["analysis_status"] == "pending"

    source_path = Path(urlparse(created["source_image_url"]).path)
    assert source_path.exists()


def test_style_template_analysis_creates_traceable_task_and_fills_prompt_fields() -> None:
    client = build_test_client()
    create_response = client.post(
        "/api/v1/style-templates/",
        json={
            "name": "潮汕暗色漫剧",
            "source_asset_id": "asset-style-001",
            "source_image_url": "https://example.com/style.png",
            "style_category": "待识别",
            "visual_summary": "等待 AI 识别截图风格后自动填充。",
            "analysis_status": "pending",
        },
    )
    template = create_response.json()

    response = client.post(
        f"/api/v1/style-templates/{template['id']}/analyze",
        json={"model_name": "mock-vision-style", "temperature": 1.0},
    )

    assert response.status_code == 200
    analyzed = response.json()
    assert analyzed["analysis_status"] == "analyzed"
    assert analyzed["analysis_model"] == "mock-vision-style"
    assert analyzed["analysis_version"] == "style-template-vocab-mvp"
    assert "英歌" in analyzed["visual_summary"]
    assert analyzed["yingge_adaptation"]
    assert "脸谱" in analyzed["image_prompt_template"]
    assert "镜头" in analyzed["video_prompt_template"]
    assert "服饰错乱" in analyzed["negative_prompt"]

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        task = session.query(GenerateTask).filter_by(task_type="style_template_analysis").one()
        assert task.status == "mock_completed"
        assert task.model_name == "mock-vision-style"
        assert task.style_template_id == template["id"]
        assert task.input_asset_ids == ["asset-style-001"]
        assert task.prompt_text
        assert task.raw_response["mock"] is True
        assert task.raw_response["analysis"]["style_category"] == analyzed["style_category"]


def test_style_template_analysis_preserves_manual_role_scene_category() -> None:
    client = build_test_client()
    template = client.post(
        "/api/v1/style-templates/",
        json={
            "name": "角色模板识别保护",
            "source_asset_id": "asset-style-keep-category",
            "source_image_url": "https://example.com/style.png",
            "style_category": "角色模板",
            "analysis_status": "pending",
        },
    ).json()

    response = client.post(
        f"/api/v1/style-templates/{template['id']}/analyze",
        json={"model_name": "mock-vision-style", "temperature": 1.0},
    )

    assert response.status_code == 200
    analyzed = response.json()
    assert analyzed["style_category"] == "角色模板"


def test_style_template_dmx_analysis_preserves_manual_role_scene_category(monkeypatch) -> None:
    client = build_test_client()
    template = client.post(
        "/api/v1/style-templates/",
        json={
            "name": "真实识别分类保护",
            "source_asset_id": "asset-style-real-keep-category",
            "source_image_url": "https://example.com/style.png",
            "style_category": "角色模板",
            "analysis_status": "pending",
        },
    ).json()

    def fake_analyze_image(self, image_url, prompt, *, system_prompt=None, temperature=1.0, max_tokens=None, model=None):
        return """
        {
          "style_category": "真实识别国漫",
          "visual_summary": "真实 DMX 识别摘要，强调英歌脸谱。",
          "line_style": "真实线条",
          "color_palette": "真实色彩",
          "lighting_style": "真实光影",
          "composition_style": "真实构图",
          "character_rendering": "真实人物",
          "background_rendering": "真实背景",
          "texture_keywords": "真实质感",
          "yingge_adaptation": "真实英歌迁移规则",
          "image_prompt_template": "真实生图模板，锁定脸谱和服饰。",
          "video_prompt_template": "真实生视频模板，镜头稳定。",
          "negative_prompt": "服饰错乱、脸谱错乱"
        }
        """

    monkeypatch.setenv("AI_PROVIDER", "dmx")
    monkeypatch.setenv("DMX_API_KEY", "sk-test")
    get_settings.cache_clear()
    monkeypatch.setattr("app.ai.dmx.DMXAIProvider.analyze_image", fake_analyze_image)

    response = client.post(
        f"/api/v1/style-templates/{template['id']}/analyze",
        json={"model_name": "gpt-5.4-nano", "temperature": 1.0},
    )

    assert response.status_code == 200
    analyzed = response.json()
    assert analyzed["style_category"] == "角色模板"
    get_settings.cache_clear()


def test_style_template_analysis_uses_dmx_vision_provider_when_configured(monkeypatch) -> None:
    client = build_test_client()
    create_response = client.post(
        "/api/v1/style-templates/",
        json={
            "name": "真实模型风格",
            "source_asset_id": "asset-style-002",
            "source_image_url": "https://example.com/real-style.png",
            "analysis_status": "pending",
        },
    )
    template = create_response.json()
    captured = {}

    def fake_analyze_image(self, image_url, prompt, *, system_prompt=None, temperature=1.0, max_tokens=None, model=None):
        captured["image_url"] = image_url
        captured["prompt"] = prompt
        captured["system_prompt"] = system_prompt
        captured["temperature"] = temperature
        captured["model"] = model
        return """
        {
          "style_category": "真实识别国漫",
          "visual_summary": "真实 DMX 识别摘要，强调英歌脸谱。",
          "line_style": "真实线条",
          "color_palette": "真实色彩",
          "lighting_style": "真实光影",
          "composition_style": "真实构图",
          "character_rendering": "真实人物",
          "background_rendering": "真实背景",
          "texture_keywords": "真实质感",
          "yingge_adaptation": "真实英歌迁移规则",
          "image_prompt_template": "真实生图模板，锁定脸谱和服饰。",
          "video_prompt_template": "真实生视频模板，镜头稳定。",
          "negative_prompt": "服饰错乱、脸谱错乱"
        }
        """

    monkeypatch.setenv("AI_PROVIDER", "dmx")
    monkeypatch.setenv("DMX_API_KEY", "sk-test")
    get_settings.cache_clear()
    monkeypatch.setattr("app.ai.dmx.DMXAIProvider.analyze_image", fake_analyze_image)

    response = client.post(
        f"/api/v1/style-templates/{template['id']}/analyze",
        json={"model_name": "gpt-5.4-nano", "temperature": 1.0},
    )

    assert response.status_code == 200
    analyzed = response.json()
    assert analyzed["style_category"] == "真实识别国漫"
    assert analyzed["yingge_adaptation"] == "真实英歌迁移规则"
    assert analyzed["analysis_model"] == "gpt-5.4-nano"
    assert captured["image_url"] == "https://example.com/real-style.png"
    assert captured["temperature"] == 1.0
    assert captured["model"] == "gpt-5.4-nano"
    assert "JSON" in captured["prompt"]
    get_settings.cache_clear()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        task = session.query(GenerateTask).filter_by(task_type="style_template_analysis", style_template_id=template["id"]).one()
        assert task.status == "completed"
        assert task.raw_response["mock"] is False


def test_style_template_analysis_failure_does_not_fallback_to_mock(monkeypatch) -> None:
    client = build_test_client()
    create_response = client.post(
        "/api/v1/style-templates/",
        json={
            "name": "失败模板",
            "source_asset_id": "asset-style-003",
            "source_image_url": "https://example.com/fail-style.png",
            "visual_summary": "旧摘要",
            "analysis_status": "pending",
        },
    )
    template = create_response.json()

    def fake_analyze_image(self, image_url, prompt, *, system_prompt=None, temperature=1.0, max_tokens=None, model=None):
        raise RuntimeError("upstream failed")

    monkeypatch.setenv("AI_PROVIDER", "dmx")
    monkeypatch.setenv("DMX_API_KEY", "sk-test")
    get_settings.cache_clear()
    monkeypatch.setattr("app.ai.dmx.DMXAIProvider.analyze_image", fake_analyze_image)

    response = client.post(
        f"/api/v1/style-templates/{template['id']}/analyze",
        json={"model_name": "gpt-5.4-nano", "temperature": 1.0},
    )

    assert response.status_code == 200
    failed = response.json()
    assert failed["analysis_status"] == "failed"
    assert failed["visual_summary"] == "旧摘要"

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        task = session.query(GenerateTask).filter_by(task_type="style_template_analysis", style_template_id=template["id"]).one()
        assert task.status == "failed"
        assert task.error_code == "STYLE_ANALYSIS_FAILED"
        assert "upstream failed" in task.error_message
        assert task.raw_response["mock"] is False
    get_settings.cache_clear()


def test_style_template_analysis_tasks_list_filters_by_template_and_task_type() -> None:
    client = build_test_client()
    template_response = client.post(
        "/api/v1/style-templates/",
        json={"name": "任务历史模板", "source_asset_id": "asset-style-history", "analysis_status": "pending"},
    )
    template = template_response.json()
    other_template_response = client.post("/api/v1/style-templates/", json={"name": "其他模板"})
    other_template = other_template_response.json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        first_task = GenerateTask(
            task_type="style_template_analysis",
            style_template_id=template["id"],
            model_provider="dmx",
            model_name="gpt-5.4-nano",
            model_version="2026-04",
            params_json={"temperature": 1.0},
            input_asset_ids=["asset-style-history"],
            prompt_text="first prompt",
            input_prompt="first prompt",
            raw_response={"analysis": {"visual_summary": "first"}},
            current_step="completed",
            progress=100,
            status="completed",
        )
        second_task = GenerateTask(
            task_type="style_template_analysis",
            style_template_id=template["id"],
            model_provider="dmx",
            model_name="gpt-5.4-nano",
            params_json={"temperature": 0.8},
            current_step="analysis_failed",
            progress=45,
            error_code="STYLE_ANALYSIS_FAILED",
            error_message="upstream failed",
            status="failed",
        )
        other_type_task = GenerateTask(
            task_type="image",
            style_template_id=template["id"],
            model_name="mock-image",
            status="completed",
        )
        other_template_task = GenerateTask(
            task_type="style_template_analysis",
            style_template_id=other_template["id"],
            model_name="mock-vision-style",
            status="completed",
        )
        session.add_all([first_task, second_task, other_type_task, other_template_task])
        session.commit()
        first_task_id = first_task.id
        second_task_id = second_task.id
        other_type_task_id = other_type_task.id
        other_template_task_id = other_template_task.id

    response = client.get(f"/api/v1/style-templates/{template['id']}/analysis-tasks")

    assert response.status_code == 200
    payload = response.json()
    assert [task["id"] for task in payload] == [second_task_id, first_task_id]
    assert payload[0]["status"] == "failed"
    assert payload[0]["model_provider"] == "dmx"
    assert payload[0]["model_name"] == "gpt-5.4-nano"
    assert payload[0]["params_json"] == {"temperature": 0.8}
    assert payload[0]["current_step"] == "analysis_failed"
    assert payload[0]["progress"] == 45
    assert payload[0]["error_code"] == "STYLE_ANALYSIS_FAILED"
    assert payload[0]["error_message"] == "upstream failed"
    assert payload[0]["created_at"]
    assert payload[0]["updated_at"]
    assert all(task["id"] not in {other_template_task_id, other_type_task_id} for task in payload)


def test_style_template_analysis_task_detail_returns_trace_fields_and_enforces_template_scope() -> None:
    client = build_test_client()
    template_response = client.post(
        "/api/v1/style-templates/",
        json={"name": "详情模板", "source_asset_id": "asset-detail", "source_image_url": "https://example.com/detail.png"},
    )
    template = template_response.json()
    other_template_response = client.post("/api/v1/style-templates/", json={"name": "其他详情模板"})
    other_template = other_template_response.json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        task = GenerateTask(
            task_type="style_template_analysis",
            style_template_id=template["id"],
            model_provider="dmx",
            model_name="gpt-5.4-nano",
            model_version="2026-04",
            params_json={"temperature": 1.0},
            input_asset_ids=["asset-detail"],
            prompt_text="structured prompt",
            input_prompt="structured prompt",
            input_snapshot_json={"style_template": {"id": template["id"], "name": "详情模板"}},
            raw_response={"mock": False, "content": "{\"visual_summary\":\"detail\"}"},
            current_step="completed",
            progress=100,
            status="completed",
        )
        non_style_task = GenerateTask(
            task_type="image",
            style_template_id=template["id"],
            model_name="mock-image",
            status="completed",
        )
        session.add_all([task, non_style_task])
        session.commit()
        task_id = task.id
        non_style_task_id = non_style_task.id

    response = client.get(f"/api/v1/style-templates/{template['id']}/analysis-tasks/{task_id}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == task_id
    assert payload["task_type"] == "style_template_analysis"
    assert payload["style_template_id"] == template["id"]
    assert payload["input_asset_ids"] == ["asset-detail"]
    assert payload["prompt_text"] == "structured prompt"
    assert payload["input_prompt"] == "structured prompt"
    assert payload["input_snapshot_json"]["style_template"]["id"] == template["id"]
    assert payload["raw_response"]["content"] == "{\"visual_summary\":\"detail\"}"
    assert payload["created_at"]
    assert payload["updated_at"]

    wrong_template_response = client.get(f"/api/v1/style-templates/{other_template['id']}/analysis-tasks/{task_id}")
    assert wrong_template_response.status_code == 404

    non_style_response = client.get(f"/api/v1/style-templates/{template['id']}/analysis-tasks/{non_style_task_id}")
    assert non_style_response.status_code == 404
