"""ID helpers."""

from uuid import uuid4


def new_uuid_str() -> str:
    """Return a new UUID string."""
    return str(uuid4())
