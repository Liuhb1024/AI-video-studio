from datetime import UTC, datetime

from app.storage.base import StorageKeyBuilder


def test_storage_key_builder_uses_namespace_date_project_and_safe_filename() -> None:
    builder = StorageKeyBuilder(clock=lambda: datetime(2026, 4, 19, tzinfo=UTC))

    key = builder.build("shots/keyframes", " hero frame.png ", project_id="project-1")

    assert key.startswith("shots/keyframes/2026/04/19/project-1/")
    assert key.endswith("-_hero_frame.png_")

