from collections.abc import Generator

from sqlalchemy.orm import Session

from app.ai.factory import get_ai_provider
from app.core.config import get_settings
from app.core.database import get_session_factory
from app.storage.factory import get_storage_provider


def get_db() -> Generator[Session, None, None]:
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()


def get_storage():
    return get_storage_provider()


def get_ai():
    settings = get_settings()
    return get_ai_provider(settings)
