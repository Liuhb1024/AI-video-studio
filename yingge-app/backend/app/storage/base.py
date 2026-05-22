"""Storage interface placeholder."""

from abc import ABC, abstractmethod


class StorageBackend(ABC):
    """Abstract storage backend."""

    @abstractmethod
    def resolve_url(self, path: str) -> str:
        """Resolve a stored path to a URL or local path."""
