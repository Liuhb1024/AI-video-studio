from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_ai, get_db
from app.db.base import Base
from app.main import create_app
from app.modules.projects.models import Project
from app.modules.scenes.models import Scene
from app.modules.shots.models import Shot
from app.modules.scripts.models import Script


class FakeShotAIProvider:
    name = "fake-shot-ai"

    def generate_text(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        temperature: float = 1.0,
        max_tokens: int | None = None,
        model: str | None = None,
    ) -> str:
        assert system_prompt is not None
        assert "AI 漫剧分镜导演" in system_prompt
        assert "场次" in prompt
        assert "aspect_ratio" in prompt
        assert temperature == 1.0
        return """
{
  "shots": [
    {
      "scene_id": "scene-1",
      "shot_no": "S01",
      "order_index": 1,
      "story_beat": "强钩子",
      "description": "鼓点震动水面，少年在祠堂外停步。",
      "characters": ["英歌少年"],
      "setting": "夜晚潮汕老街祠堂外",
      "emotion": "神秘",
      "action": "少年握紧双槌，抬头看向祠堂门缝。",
      "expression": "警觉、屏息",
      "props": ["双槌", "脸谱", "红灯笼"],
      "shot_size": "CU",
      "camera_angle": "low",
      "composition": "foreground_frame",
      "camera_movement": "slow_dolly_in",
      "lighting": "冷月光与祠堂暖光对撞",
      "transition_in": "cut",
      "transition_out": "drum_cut",
      "edit_point": "鼓点落下时切到脸谱特写",
      "duration_seconds": 4,
      "image_prompt": "英歌少年握紧双槌站在祠堂门外，低机位特写，冷月光与暖金门缝光。",
      "video_prompt": "主体：英歌少年；动作：握紧双槌并抬头；镜头：低机位缓慢推近；节奏：跟随鼓点；约束：人物五官自然，双槌不变形，画面稳定无水印。",
      "negative_prompt": "多余手指、武器变形、脸部漂移、画面水印",
      "reference_asset_ids": [],
      "continuity_constraints": ["保持红黑服饰", "双槌在右手"],
      "generation_risk": "手部和双槌容易变形",
      "simplify_strategy": "失败时拆成双槌特写和少年侧脸两镜",
      "readiness": "ready",
      "metadata": {
        "image_prompt_formula": "主体 + 场景 + 姿态 + 构图 + 光影 + 风格 + 画质",
        "video_prompt_formula": "主体动作 + 环境运动 + 镜头运动 + 节奏 + 约束"
      }
    },
    {
      "scene_id": "scene-1",
      "shot_no": "S02",
      "order_index": 2,
      "story_beat": "异象出现",
      "description": "墙上脸谱影子缓慢转头。",
      "characters": ["脸谱影"],
      "setting": "祠堂外墙",
      "emotion": "紧张",
      "action": "脸谱影子在墙面移动。",
      "expression": "诡谲",
      "props": ["脸谱影子"],
      "shot_size": "INSERT",
      "camera_angle": "eye_level",
      "composition": "centered",
      "camera_movement": "locked",
      "lighting": "灯笼暖光投影",
      "transition_in": "drum_cut",
      "transition_out": "reaction_cut",
      "edit_point": "影子转头后切少年反应",
      "duration_seconds": 3,
      "image_prompt": "祠堂外墙上的脸谱影子，中心构图，灯笼暖光投影。",
      "video_prompt": "主体：脸谱影子；动作：影子缓慢转头；镜头：固定机位；节奏：缓慢诡谲；约束：墙面稳定，无多余杂物。",
      "negative_prompt": "影子粘连、墙面变形、水印",
      "reference_asset_ids": [],
      "continuity_constraints": ["脸谱影在墙面右侧"],
      "generation_risk": "影子可能和墙面纹理粘连",
      "simplify_strategy": "保持固定镜头，只生成轻微影子移动",
      "readiness": "needs_reference",
      "metadata": {}
    }
  ]
}
"""


def build_test_client(ai_provider=None) -> TestClient:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)
    Base.metadata.create_all(bind=engine, tables=[Project.__table__, Script.__table__, Scene.__table__, Shot.__table__])

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    if ai_provider is not None:
        app.dependency_overrides[get_ai] = lambda: ai_provider
    client = TestClient(app)

    with TestingSessionLocal() as db:
        project = Project(name="岭南夜巡", stage="storyboarding")
        db.add(project)
        db.flush()
        script = Script(
            project_id=project.id,
            title="鼓点夜巡",
            content="00:00-00:07 少年在祠堂外听见鼓点。",
            generation_settings={"aspect_ratio_saved_only": "9:16", "prompt_version": "script_timeline_v2_director_room"},
        )
        db.add(script)
        db.flush()
        second_script = Script(
            project_id=project.id,
            title="鼓点夜巡备选版",
            content="00:00-00:07 少年没有进入祠堂，只在巷口回望。",
            version=2,
            generation_settings={"aspect_ratio_saved_only": "9:16"},
        )
        db.add(second_script)
        db.flush()
        db.add(
            Scene(
                id="scene-1",
                script_id=script.id,
                order_index=1,
                title="00:00-00:07 强钩子",
                summary="少年听见祠堂鼓点。",
                raw_text="剧情：少年在祠堂外听见鼓点。画面重点：双槌、祠堂门缝、脸谱影子。",
            )
        )
        db.add(
            Scene(
                id="scene-2",
                script_id=second_script.id,
                order_index=1,
                title="00:00-00:07 备选钩子",
                summary="少年在巷口回望。",
                raw_text="剧情：少年在巷口回望。画面重点：雨巷、背影、鼓声。",
            )
        )
        db.commit()
    return client


def test_generate_shots_from_script_creates_executable_shot_cards() -> None:
    client = build_test_client(FakeShotAIProvider())
    project = client.get("/api/v1/projects/").json()[0]
    script = client.get(f"/api/v1/projects/{project['id']}/scripts/").json()[0]

    response = client.post(f"/api/v1/projects/{project['id']}/shots/generate-from-script", json={"script_id": script["id"]})

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["shots"]) == 2
    assert payload["shots"][0]["project_id"] == project["id"]
    assert payload["shots"][0]["script_id"] == script["id"]
    assert payload["shots"][0]["shot_no"] == "S01"
    assert payload["shots"][0]["camera_angle"] == "low"
    assert payload["shots"][0]["transition_out"] == "drum_cut"
    assert payload["shots"][0]["readiness"] == "ready"
    assert payload["shots"][0]["generation_risk"] == "手部和双槌容易变形"
    assert "主体：英歌少年" in payload["shots"][0]["video_prompt"]


def test_project_shots_can_be_listed_updated_deleted_and_reordered() -> None:
    client = build_test_client(FakeShotAIProvider())
    project = client.get("/api/v1/projects/").json()[0]
    script = client.get(f"/api/v1/projects/{project['id']}/scripts/").json()[0]
    generated = client.post(f"/api/v1/projects/{project['id']}/shots/generate-from-script", json={"script_id": script["id"]}).json()
    first = generated["shots"][0]
    second = generated["shots"][1]

    list_response = client.get(f"/api/v1/projects/{project['id']}/shots")
    assert list_response.status_code == 200
    assert [shot["shot_no"] for shot in list_response.json()] == ["S01", "S02"]

    update_response = client.patch(
        f"/api/v1/projects/{project['id']}/shots/{first['id']}",
        json={"readiness": "needs_reference", "generation_risk": "需要角色参考图", "status": "ready"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["readiness"] == "needs_reference"
    assert update_response.json()["status"] == "ready"

    reorder_response = client.post(
        f"/api/v1/projects/{project['id']}/shots/reorder",
        json={"shot_ids": [second["id"], first["id"]]},
    )
    assert reorder_response.status_code == 200
    assert [shot["id"] for shot in reorder_response.json()] == [second["id"], first["id"]]
    assert reorder_response.json()[0]["order_index"] == 1

    delete_response = client.delete(f"/api/v1/projects/{project['id']}/shots/{first['id']}")
    assert delete_response.status_code == 204

    remaining = client.get(f"/api/v1/projects/{project['id']}/shots").json()
    assert [shot["id"] for shot in remaining] == [second["id"]]


def test_project_shots_can_be_filtered_by_script_version() -> None:
    client = build_test_client(FakeShotAIProvider())
    project = client.get("/api/v1/projects/").json()[0]
    scripts = client.get(f"/api/v1/projects/{project['id']}/scripts/").json()
    first_script = next(script for script in scripts if script["version"] == 1)
    second_script = next(script for script in scripts if script["version"] == 2)

    client.post(f"/api/v1/projects/{project['id']}/shots/generate-from-script", json={"script_id": first_script["id"]})

    first_script_response = client.get(f"/api/v1/projects/{project['id']}/shots", params={"script_id": first_script["id"]})
    second_script_response = client.get(f"/api/v1/projects/{project['id']}/shots", params={"script_id": second_script["id"]})

    assert first_script_response.status_code == 200
    assert second_script_response.status_code == 200
    assert [shot["script_id"] for shot in first_script_response.json()] == [first_script["id"], first_script["id"]]
    assert second_script_response.json() == []
