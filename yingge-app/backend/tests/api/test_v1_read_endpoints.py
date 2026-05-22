"""API v1 route registration tests."""

from fastapi.testclient import TestClient

from app.main import app
from app.models.enums import ProjectStatus
from app.schemas.project import ProjectListItem
from app.schemas.script import ScriptRead
from scripts import seed_mock_data


def test_v1_read_routes_are_registered() -> None:
    """Swagger should expose the first batch of read endpoints."""
    route_paths = {route.path for route in app.routes}

    expected_paths = {
        "/api/v1/projects",
        "/api/v1/projects/{project_id}",
        "/api/v1/characters",
        "/api/v1/characters/{character_id}",
        "/api/v1/characters/{character_id}/bible",
        "/api/v1/projects/{project_id}/script",
        "/api/v1/scripts/{script_id}/shots",
        "/api/v1/shots/{shot_id}/panels",
    }

    assert expected_paths.issubset(route_paths)


def test_openapi_contains_read_endpoints() -> None:
    """OpenAPI JSON should include registered GET routes."""
    client = TestClient(app)

    response = client.get("/openapi.json")

    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/api/v1/projects" in paths
    assert "get" in paths["/api/v1/projects"]


def test_schema_serializes_enum_as_string() -> None:
    """Pydantic read schemas should serialize enum values as strings."""
    item = ProjectListItem.model_validate(
        {
            "id": seed_mock_data.PROJECT_ID,
            "name": "英歌水浒人物介绍片",
            "description": None,
            "status": ProjectStatus.ACTIVE,
            "platform": "抖音 / TikTok",
            "duration_seconds": 45,
            "aspect_ratio": "9:16",
            "created_at": "2026-05-21T00:00:00Z",
            "updated_at": "2026-05-21T00:00:00Z",
        }
    )

    assert item.model_dump(mode="json")["status"] == "active"


def test_script_schema_accepts_keyword_list() -> None:
    """Script keywords come from frontend mock data as an array."""
    item = ScriptRead.model_validate(
        {
            "id": seed_mock_data.SCRIPT_ID,
            "project_id": seed_mock_data.PROJECT_ID,
            "character_id": seed_mock_data.CHARACTER_ID,
            "title": "武松英歌角色介绍短片",
            "platform": "抖音 / TikTok",
            "duration_seconds": 45,
            "aspect_ratio": "9:16",
            "tone": "英雄诗 / 国风叙事",
            "version": "v2.1",
            "status": "reviewed",
            "hook": "三声鼓响，行者出阵。",
            "narration": "武松人物介绍旁白",
            "ending": "他不是孤勇的传说，而是英歌阵中最烈的一声鼓点。",
            "keywords": ["武松", "英歌"],
            "agent_notes": None,
            "created_at": "2026-05-21T00:00:00Z",
            "updated_at": "2026-05-21T00:00:00Z",
        }
    )

    assert item.keywords == ["武松", "英歌"]
