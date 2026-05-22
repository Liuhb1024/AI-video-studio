"""Health check endpoint."""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import get_settings
from app.db.session import SessionLocal

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    """Return service health without touching external dependencies."""
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.service_name,
        "version": settings.app_version,
    }


def check_database_health() -> dict[str, str]:
    """Execute a lightweight database reachability check."""
    with SessionLocal() as session:
        session.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "database": "reachable",
    }


@router.get("/health/db", response_model=None)
def database_health_check() -> dict[str, str] | JSONResponse:
    """Return database reachability without affecting the base health check."""
    try:
        return check_database_health()
    except SQLAlchemyError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "database": "unreachable",
                "detail": str(exc),
            },
        )
