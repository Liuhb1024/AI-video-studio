from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.db.base import Base
from app.main import create_app
from app.modules.projects.models import Project


def build_test_client() -> TestClient:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)
    Base.metadata.create_all(bind=engine, tables=[Project.__table__])

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


def test_project_crud_flow() -> None:
    client = build_test_client()

    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "岭南夜巡",
            "summary": "英歌队夜巡遇见旧祠堂异象。",
            "ip_name": "英歌少年宇宙",
            "genre": "民俗奇幻",
            "visual_style": "暗色电影感，陶土红和金色舞台光",
            "stage": "preparing",
            "cover_asset_id": "asset-cover-1",
        },
    )

    assert create_response.status_code == 200
    created = create_response.json()
    assert created["name"] == "岭南夜巡"
    assert created["stage"] == "preparing"
    assert created["visual_style"] == "暗色电影感，陶土红和金色舞台光"

    list_response = client.get("/api/v1/projects/")
    assert list_response.status_code == 200
    assert [item["name"] for item in list_response.json()] == ["岭南夜巡"]

    detail_response = client.get(f"/api/v1/projects/{created['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["ip_name"] == "英歌少年宇宙"

    update_response = client.patch(
        f"/api/v1/projects/{created['id']}",
        json={"stage": "storyboarding", "summary": "已进入分镜拆解。"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["stage"] == "storyboarding"
    assert update_response.json()["summary"] == "已进入分镜拆解。"

    delete_response = client.delete(f"/api/v1/projects/{created['id']}")
    assert delete_response.status_code == 204

    missing_response = client.get(f"/api/v1/projects/{created['id']}")
    assert missing_response.status_code == 404


def test_project_detail_returns_404_for_missing_project() -> None:
    client = build_test_client()

    response = client.get("/api/v1/projects/missing")

    assert response.status_code == 404
    assert response.json()["detail"] == "Project not found"

