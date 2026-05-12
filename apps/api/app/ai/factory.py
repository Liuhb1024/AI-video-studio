from app.ai.dmx import DMXAIProvider
from app.ai.mock import MockAIProvider
from app.core.config import Settings, get_settings


def get_ai_provider(settings: Settings | None = None):
    settings = settings or get_settings()
    if settings.ai_provider.lower() == "mock":
        return MockAIProvider()
    if settings.ai_provider.lower() == "dmx" and settings.dmx_api_key:
        return DMXAIProvider(
            api_key=settings.dmx_api_key,
            base_url=settings.dmx_base_url,
            default_model=settings.dmx_script_model,
            timeout_seconds=settings.dmx_timeout_seconds,
        )
    return MockAIProvider()
