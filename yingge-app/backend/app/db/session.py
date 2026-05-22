"""Database engine and session helpers.

Creating the engine and session factory does not open a database connection.
Actual connectivity is attempted only when a session executes a statement.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()
engine: Engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_engine() -> Engine:
    """Return the configured SQLAlchemy engine."""
    return engine


def get_sessionmaker() -> sessionmaker[Session]:
    """Return the configured session factory."""
    return SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Yield a database session for FastAPI dependencies."""
    with SessionLocal() as session:
        yield session


get_db_session = get_db
