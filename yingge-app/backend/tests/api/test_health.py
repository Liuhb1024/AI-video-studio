"""Health API tests."""

from fastapi.testclient import TestClient

from app.api import health
from app.main import app


def test_health_returns_ok() -> None:
    """GET /api/health returns the expected healthy response."""
    client = TestClient(app)

    response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "ai-yingge-drama-studio-backend"
    assert body["version"] == "0.1.0"


def test_database_health_returns_ok_when_check_is_mocked(
    monkeypatch,
) -> None:
    """GET /api/health/db can be tested without a real PostgreSQL instance."""

    def fake_check_database_health() -> dict[str, str]:
        return {
            "status": "ok",
            "database": "reachable",
        }

    monkeypatch.setattr(health, "check_database_health", fake_check_database_health)
    client = TestClient(app)

    response = client.get("/api/health/db")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "reachable"
