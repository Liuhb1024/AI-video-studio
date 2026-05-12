from __future__ import annotations

from typing import Protocol


class AIProvider(Protocol):
    name: str

    def generate_text(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        temperature: float = 1.0,
        max_tokens: int | None = None,
        model: str | None = None,
    ) -> str: ...
