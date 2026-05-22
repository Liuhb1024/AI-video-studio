"""Seed script unit tests."""

from scripts import seed_mock_data


def test_seed_ids_are_stable_and_unique() -> None:
    """The seed script should use stable ids to stay repeatable."""
    ids = [
        seed_mock_data.PROJECT_ID,
        seed_mock_data.CHARACTER_ID,
        seed_mock_data.CHARACTER_BIBLE_ID,
        seed_mock_data.SCRIPT_ID,
        seed_mock_data.EXPORT_PLAN_ID,
        *seed_mock_data.SHOT_IDS,
        *seed_mock_data.PANEL_IDS,
        *seed_mock_data.IMAGE_PROMPT_IDS,
        *seed_mock_data.VIDEO_PROMPT_IDS,
        *seed_mock_data.TASK_IDS,
        *seed_mock_data.ASSET_IDS,
    ]

    assert len(ids) == len(set(ids))


def test_seed_minimal_loop_cardinality() -> None:
    """The seed data should cover the expected Wusong production loop."""
    assert len(seed_mock_data.SHOT_IDS) == 6
    assert len(seed_mock_data.PANEL_IDS) == 12
    assert len(seed_mock_data.IMAGE_PROMPT_IDS) == 6
    assert len(seed_mock_data.VIDEO_PROMPT_IDS) == 6
    assert len(seed_mock_data.TASK_IDS) >= 3
    assert len(seed_mock_data.ASSET_IDS) >= 4
