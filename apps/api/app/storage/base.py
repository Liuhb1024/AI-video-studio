from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Protocol
from uuid import uuid4


@dataclass(slots=True)
class StorageKeyBuilder:
    clock: Callable[[], datetime] = lambda: datetime.now(UTC)

    def build(self, namespace: str, filename: str, *, project_id: str | None = None) -> str:
        today = self.clock().strftime("%Y/%m/%d")
        safe_name = Path(filename).name.replace(" ", "_")
        parts = [namespace, today]
        if project_id:
            parts.append(project_id)
        parts.append(f"{uuid4().hex[:12]}-{safe_name}")
        return "/".join(parts)


class StorageProvider(Protocol):
    name: str

    def build_key(self, namespace: str, filename: str, *, project_id: str | None = None) -> str: ...

    def put_bytes(self, key: str, data: bytes, *, content_type: str | None = None) -> str: ...

    def get_bytes(self, key: str) -> bytes: ...

    def public_url(self, key: str) -> str: ...

    def delete(self, key: str) -> None: ...
