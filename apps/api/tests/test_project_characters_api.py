from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.db.base import Base
from app.main import create_app
from app.modules.assets.models import Asset
from app.modules.characters.models import Character
from app.modules.project_characters.models import ProjectCharacter
from app.modules.projects.models import Project


def build_test_client() -> TestClient:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)
    Base.metadata.create_all(
        bind=engine,
        tables=[Project.__table__, Character.__table__, ProjectCharacter.__table__, Asset.__table__],
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
    return TestClient(app)


def create_project(client: TestClient) -> dict:
    response = client.post(
        "/api/v1/projects/",
        json={"name": "岭南夜巡", "summary": "少年英歌队夜巡。", "stage": "preparing"},
    )
    assert response.status_code == 200
    return response.json()


def create_character(client: TestClient, name: str = "宋江") -> dict:
    response = client.post(
        "/api/v1/characters/",
        json={
            "name": name,
            "alias": "及时雨·呼保义",
            "yingge_role": "英歌队司鼓者/指挥。",
            "weapons": "骨朵",
            "reference_asset_ids": ["asset-facepaint"],
            "reference_asset_id": "asset-facepaint",
            "status": "active",
        },
    )
    assert response.status_code == 200
    return response.json()


def test_project_character_flow_embeds_character_summary_and_preserves_global_character() -> None:
    client = build_test_client()
    project = create_project(client)
    character = create_character(client)

    create_response = client.post(
        f"/api/v1/projects/{project['id']}/characters",
        json={
            "character_id": character["id"],
            "role_in_project": "主角",
            "usage_note": "夜巡队伍的精神核心。",
        },
    )

    assert create_response.status_code == 200
    created = create_response.json()
    assert created["project_id"] == project["id"]
    assert created["character_id"] == character["id"]
    assert created["role_in_project"] == "主角"
    assert created["usage_note"] == "夜巡队伍的精神核心。"
    assert created["status"] == "selected"
    assert created["sort_order"] == 0
    assert created["character"]["id"] == character["id"]
    assert created["character"]["name"] == "宋江"
    assert created["character"]["alias"] == "及时雨·呼保义"
    assert created["character"]["yingge_role"] == "英歌队司鼓者/指挥。"
    assert created["character"]["weapons"] == "骨朵"
    assert created["character"]["reference_asset_id"] == "asset-facepaint"
    assert created["character"]["reference_asset_count"] == 1

    list_response = client.get(f"/api/v1/projects/{project['id']}/characters")
    assert list_response.status_code == 200
    assert [item["id"] for item in list_response.json()] == [created["id"]]

    update_response = client.patch(
        f"/api/v1/projects/{project['id']}/characters/{created['id']}",
        json={"role_in_project": "统帅", "usage_note": "第一幕负责集结。", "status": "ready", "sort_order": 3},
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["role_in_project"] == "统帅"
    assert updated["usage_note"] == "第一幕负责集结。"
    assert updated["status"] == "ready"
    assert updated["sort_order"] == 3

    delete_response = client.delete(f"/api/v1/projects/{project['id']}/characters/{created['id']}")
    assert delete_response.status_code == 204

    empty_response = client.get(f"/api/v1/projects/{project['id']}/characters")
    assert empty_response.status_code == 200
    assert empty_response.json() == []

    global_character_response = client.get(f"/api/v1/characters/{character['id']}")
    assert global_character_response.status_code == 200
    assert global_character_response.json()["name"] == "宋江"


def test_project_character_rejects_duplicate_character_in_same_project() -> None:
    client = build_test_client()
    project = create_project(client)
    character = create_character(client, name="林冲")

    payload = {"character_id": character["id"], "role_in_project": "配角"}
    first_response = client.post(f"/api/v1/projects/{project['id']}/characters", json=payload)
    duplicate_response = client.post(f"/api/v1/projects/{project['id']}/characters", json=payload)

    assert first_response.status_code == 200
    assert duplicate_response.status_code == 409
    assert duplicate_response.json()["detail"] == "Character already linked to project"


def test_project_character_returns_404_for_missing_project_or_character() -> None:
    client = build_test_client()
    project = create_project(client)
    character = create_character(client, name="武松")

    missing_project_list = client.get("/api/v1/projects/missing-project/characters")
    assert missing_project_list.status_code == 404
    assert missing_project_list.json()["detail"] == "Project not found"

    missing_project_create = client.post(
        "/api/v1/projects/missing-project/characters",
        json={"character_id": character["id"]},
    )
    assert missing_project_create.status_code == 404
    assert missing_project_create.json()["detail"] == "Project not found"

    missing_character_create = client.post(
        f"/api/v1/projects/{project['id']}/characters",
        json={"character_id": "missing-character"},
    )
    assert missing_character_create.status_code == 404
    assert missing_character_create.json()["detail"] == "Character not found"


def test_project_character_update_and_delete_are_scoped_to_project() -> None:
    client = build_test_client()
    first_project = create_project(client)
    second_project = client.post("/api/v1/projects/", json={"name": "第二项目", "stage": "preparing"}).json()
    character = create_character(client, name="鲁智深")

    created = client.post(
        f"/api/v1/projects/{first_project['id']}/characters",
        json={"character_id": character["id"]},
    ).json()

    wrong_project_update = client.patch(
        f"/api/v1/projects/{second_project['id']}/characters/{created['id']}",
        json={"status": "ready"},
    )
    wrong_project_delete = client.delete(f"/api/v1/projects/{second_project['id']}/characters/{created['id']}")

    assert wrong_project_update.status_code == 404
    assert wrong_project_update.json()["detail"] == "Project character not found"
    assert wrong_project_delete.status_code == 404
    assert wrong_project_delete.json()["detail"] == "Project character not found"
