from app.core import config


def test_default_database_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    config.get_settings.cache_clear()

    settings = config.get_settings()

    assert settings.database_url == "postgresql+psycopg://ai_video_studio:ai_video_studio@localhost:5433/ai_video_studio"
    assert settings.storage_provider == "cos"


def test_database_url_from_env(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:pass@db:5432/demo")
    config.get_settings.cache_clear()

    settings = config.get_settings()

    assert settings.database_url == "postgresql+psycopg://user:pass@db:5432/demo"


def test_dmx_script_model_defaults_to_script_module_model(monkeypatch):
    monkeypatch.delenv("DMX_SCRIPT_MODEL", raising=False)
    config.get_settings.cache_clear()

    settings = config.get_settings()

    assert settings.dmx_script_model == "gemini-3.1-flash-lite-preview"
    assert settings.dmx_script_temperature == 1.0
