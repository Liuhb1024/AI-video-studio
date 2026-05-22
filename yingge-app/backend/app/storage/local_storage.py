"""Local storage placeholder."""

from app.storage.base import StorageBackend


class LocalStorage(StorageBackend):
    """Resolve local paths without performing file uploads."""

    def resolve_url(self, path: str) -> str:
        """Return the path unchanged for local development placeholders."""
        return path
