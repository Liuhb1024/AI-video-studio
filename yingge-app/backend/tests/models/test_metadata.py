"""ORM metadata tests."""

import app.models  # noqa: F401
from app.db.base import Base


def test_p0_batch1_tables_are_registered_in_metadata() -> None:
    """Alembic autogenerate should see the first and second P0 ORM tables."""
    expected_tables = {
        "projects",
        "characters",
        "character_bibles",
        "scripts",
        "shots",
        "panels",
        "prompt_drafts",
        "generation_tasks",
        "assets",
        "image_assets",
        "video_assets",
        "audio_assets",
        "subtitle_assets",
        "asset_reviews",
        "failure_reasons",
        "reflection_notes",
        "cost_records",
        "export_plans",
    }

    assert expected_tables.issubset(Base.metadata.tables.keys())


def test_models_do_not_map_metadata_reserved_attribute() -> None:
    """Models with a metadata column must expose it as metadata_ in Python."""
    models_with_metadata_column = [
        app.models.Asset,
        app.models.CostRecord,
        app.models.GenerationTask,
        app.models.Project,
        app.models.ReflectionNote,
        app.models.Shot,
    ]

    for model in models_with_metadata_column:
        assert "metadata_" in model.__mapper__.attrs
        assert model.__mapper__.attrs["metadata_"].columns[0].name == "metadata"
        assert "metadata" not in model.__mapper__.attrs
