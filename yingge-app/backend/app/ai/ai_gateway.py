"""AI gateway placeholder.

All future model calls must enter through this module. Backend Phase 2 does not
call real providers or read API keys.
"""

from typing import Any


class AIGateway:
    """Placeholder AI gateway interface."""

    def generate_mock(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Return a deterministic placeholder response for future tests."""
        return {
            "task_type": task_type,
            "payload": payload,
            "status": "mock_not_implemented",
        }
