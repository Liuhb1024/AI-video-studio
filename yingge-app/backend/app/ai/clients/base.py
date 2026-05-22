"""Base interface for future AI provider clients."""

from abc import ABC, abstractmethod
from typing import Any


class BaseAIClient(ABC):
    """Abstract provider client interface."""

    @abstractmethod
    def run(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Run a provider request.

        Real network calls are out of scope for Backend Phase 2.
        """
