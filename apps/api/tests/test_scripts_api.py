from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.api.deps import get_ai
from app.db.base import Base
from app.main import create_app
from app.modules.projects.models import Project
from app.modules.scenes.models import Scene
from app.modules.scripts.models import Script


class FakeScriptAIProvider:
    name = "fake-script-ai"

    def generate_text(self, prompt: str, *, system_prompt: str | None = None, temperature: float = 1.0, max_tokens: int | None = None, model: str | None = None) -> str:
        assert system_prompt is not None
        assert temperature == 1.0
        assert model == "gemini-3.1-flash-lite-preview"
        assert "duration_seconds" in prompt
        assert "aspect_ratio" not in prompt
        assert "taboos" in prompt
        return """
{
  "title": "鼓点夜巡",
  "logline": "英歌少年夜巡老街，被神秘鼓点引向一场民俗试炼。",
  "full_script": "00:00-00:03 夜色压低，祠堂鼓点突然响起。\\n00:03-00:12 少年循声走向老街深处，脸谱影子在墙面移动。",
  "characters": [
    {"name": "英歌少年", "description": "年轻、胆大、被鼓点召唤。"}
  ],
      "timeline": [
    {
      "start_second": 0,
      "end_second": 3,
      "beat": "强钩子",
      "story": "夜色压低，祠堂鼓点突然响起。",
      "visual_focus": "空街、祠堂、鼓点震动水面",
      "lens_language": {
        "shot_size": "特写",
        "camera_angle": "低机位",
        "composition": "前景遮挡",
        "camera_movement": "快速推近",
        "lighting": "冷月光与祠堂暖光对撞",
        "edit_point": "鼓点落下"
      },
      "emotion": "神秘",
      "characters": ["英歌少年"],
      "dialogue": "",
      "narration": "这鼓声，不是人敲的。",
      "shot_hint": "用低机位和快速推近建立悬念。",
      "transition": {
        "type": "鼓点切",
        "description": "双槌落下瞬间切到祠堂门缝亮起"
      },
      "shot_density": "中",
      "recommended_shot_count": 3,
      "keyframe_priority": ["脸谱特写", "祠堂门缝", "水面震动"],
      "storyboard_plan": [
        {
          "shot": "镜头1",
          "purpose": "建立祠堂异象",
          "image_prompt_focus": "祠堂门缝与水面震动",
          "video_prompt_focus": "主体：英歌少年；动作：握紧双槌凝视祠堂门缝；镜头：低机位缓慢推近；风格：暗色电影感，陶土红与金色祠堂光；节奏：跟随鼓点轻微推进；约束：人物五官自然，无畸变穿模，画面稳定无水印"
        }
      ],
      "generation_risk": "连续鼓点震动容易生成杂乱纹理",
      "simplify_strategy": "拆成祠堂门缝、少年反应、水面震动三张分镜"
    },
    {
      "start_second": 3,
      "end_second": 12,
      "beat": "进入事件",
      "story": "少年循声走向老街深处，脸谱影子在墙面移动。",
      "visual_focus": "脸谱影子、双槌、祠堂门缝",
      "lens_language": {
        "shot_size": "中近景",
        "camera_angle": "平视",
        "composition": "纵深构图",
        "camera_movement": "跟拍",
        "lighting": "巷尾金色边缘光",
        "edit_point": "脸谱影子越过墙面"
      },
      "emotion": "紧张",
      "characters": ["英歌少年"],
      "dialogue": "谁在那里？",
      "narration": "",
      "shot_hint": "分为跟拍、特写、影子反打三张分镜。",
      "transition": {
        "type": "遮挡转场",
        "description": "红绸掠过画面后切到脸谱影子"
      },
      "shot_density": "高",
      "recommended_shot_count": 4,
      "keyframe_priority": ["少年侧背影", "脸谱影子", "双槌特写"],
      "storyboard_plan": [
        {
          "shot": "镜头1",
          "purpose": "表现少年被引入老街深处",
          "image_prompt_focus": "少年侧背影与脸谱影子",
          "video_prompt_focus": "主体：英歌少年侧背影；动作：沿老街向前走；镜头：稳定跟拍，轻微手持感；风格：夜晚潮汕老街，青绿色边缘光；节奏：步伐匹配远处鼓点；约束：避免人物与影子粘连，无畸变穿模"
        }
      ],
      "generation_risk": "影子和人物可能粘连",
      "simplify_strategy": "保持人物与墙面距离，避免多角色同框"
    }
  ],
  "scene_summary": [
    {"title": "强钩子", "summary": "鼓点异象拉开故事。"}
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
    Base.metadata.create_all(bind=engine, tables=[Project.__table__, Script.__table__, Scene.__table__])

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
    client.post("/api/v1/projects/", json={"name": "岭南夜巡", "stage": "scripting"})
    return client


def test_generate_short_video_script_creates_script_and_scenes() -> None:
    client = build_test_client(FakeScriptAIProvider())
    project = client.get("/api/v1/projects/").json()[0]

    response = client.post(
        f"/api/v1/projects/{project['id']}/scripts/generate",
        json={
            "story_seed": "一个年轻英歌队员夜里听见祠堂鼓点，发现脸谱在月光下变了表情。",
            "duration_seconds": 60,
            "platform": "抖音",
            "aspect_ratio": "9:16",
            "story_structure": "短视频强钩子",
            "opening_style": "悬念开头",
            "ending_style": "悬念留钩子",
            "genre": "民俗奇幻",
            "tone": "神秘",
            "dialogue_density": "标准",
            "action_density": "高",
            "narration_ratio": "少量旁白",
            "yingge_intensity": "中",
            "cultural_expression": "热血仪式感",
            "tradition_modern_mix": "现代场景中的传统元素",
            "visual_symbols": ["脸谱", "双槌", "鼓点", "祠堂"],
            "taboos": ["避免戏谑民俗", "避免文化误读"],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["script"]["project_id"] == project["id"]
    assert payload["script"]["title"] == "鼓点夜巡"
    assert "祠堂鼓点" in payload["script"]["content"]
    assert payload["settings"]["aspect_ratio"] == "9:16"
    assert payload["script"]["generation_settings"]["provider"] == "fake-script-ai"
    assert payload["script"]["generation_settings"]["temperature"] == 1.0
    assert payload["script"]["generation_settings"]["prompt_version"] == "script_timeline_v2_director_room"
    assert len(payload["scenes"]) == 2
    assert payload["scenes"][0]["title"] == "00:00-00:03 强钩子"
    assert "画面重点：空街、祠堂、鼓点震动水面" in payload["scenes"][0]["raw_text"]
    assert "景别：特写" in payload["scenes"][0]["raw_text"]
    assert "转场：鼓点切" in payload["scenes"][0]["raw_text"]
    assert "推荐分镜数：3" in payload["scenes"][0]["raw_text"]
    assert "关键帧优先级：脸谱特写、祠堂门缝、水面震动" in payload["scenes"][0]["raw_text"]
    assert "Seedance提示骨架：主体：英歌少年" in payload["scenes"][0]["raw_text"]
    assert "AI生成难点：连续鼓点震动容易生成杂乱纹理" in payload["scenes"][0]["raw_text"]

    list_response = client.get(f"/api/v1/projects/{project['id']}/scripts/")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == payload["script"]["id"]

    detail_response = client.get(f"/api/v1/projects/{project['id']}/scripts/{payload['script']['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["script"]["id"] == payload["script"]["id"]
    assert detail_response.json()["scenes"][0]["title"] == "00:00-00:03 强钩子"

    delete_response = client.delete(f"/api/v1/projects/{project['id']}/scripts/{payload['script']['id']}")
    assert delete_response.status_code == 204

    deleted_detail_response = client.get(f"/api/v1/projects/{project['id']}/scripts/{payload['script']['id']}")
    assert deleted_detail_response.status_code == 404


def test_generate_script_requires_existing_project() -> None:
    client = build_test_client()

    response = client.post(
        "/api/v1/projects/missing/scripts/generate",
        json={"story_seed": "测试", "duration_seconds": 30, "platform": "抖音", "aspect_ratio": "9:16"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Project not found"
