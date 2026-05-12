from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "../../.env"), extra="ignore")

    app_name: str = Field(default="AI英歌漫剧生产工作台")
    app_version: str = Field(default="0.1.0")
    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    cors_origins: str = Field(default="http://localhost:3000", validation_alias="CORS_ORIGINS")
    database_url: str = Field(
        default="postgresql+psycopg://ai_video_studio:ai_video_studio@localhost:5433/ai_video_studio",
        validation_alias="DATABASE_URL",
    )
    storage_provider: str = Field(default="cos", validation_alias="STORAGE_PROVIDER")
    storage_local_root: str = Field(default="var/storage", validation_alias="STORAGE_LOCAL_ROOT")
    cos_region: str | None = Field(default=None, validation_alias="COS_REGION")
    cos_secret_id: str | None = Field(default=None, validation_alias="COS_SECRET_ID")
    cos_secret_key: str | None = Field(default=None, validation_alias="COS_SECRET_KEY")
    cos_bucket: str | None = Field(default=None, validation_alias="COS_BUCKET")
    cos_public_domain: str | None = Field(default=None, validation_alias="COS_PUBLIC_DOMAIN")
    ai_provider: str = Field(default="mock", validation_alias="AI_PROVIDER")
    dmx_api_key: str | None = Field(default=None, validation_alias="DMX_API_KEY")
    dmx_base_url: str = Field(default="https://www.dmxapi.cn/v1", validation_alias="DMX_BASE_URL")
    dmx_script_model: str = Field(
        default="gemini-3.1-flash-lite-preview",
        validation_alias="DMX_SCRIPT_MODEL",
    )
    dmx_script_temperature: float = Field(default=1.0, validation_alias="DMX_SCRIPT_TEMPERATURE")
    dmx_script_max_tokens: int = Field(default=4000, validation_alias="DMX_SCRIPT_MAX_TOKENS")
    dmx_shot_model: str = Field(default="gemini-3.1-flash-lite-preview", validation_alias="DMX_SHOT_MODEL")
    dmx_shot_temperature: float = Field(default=1.0, validation_alias="DMX_SHOT_TEMPERATURE")
    dmx_shot_max_tokens: int = Field(default=6000, validation_alias="DMX_SHOT_MAX_TOKENS")
    dmx_style_model: str = Field(default="gpt-5.4-nano", validation_alias="DMX_STYLE_MODEL")
    dmx_style_temperature: float = Field(default=1.0, validation_alias="DMX_STYLE_TEMPERATURE")
    dmx_gemini_image_base_url: str = Field(default="https://www.dmxapi.cn/v1beta", validation_alias="DMX_GEMINI_IMAGE_BASE_URL")
    dmx_gemini_image_model: str = Field(default="gemini-3.1-flash-image-preview", validation_alias="DMX_GEMINI_IMAGE_MODEL")
    dmx_gpt_image_base_url: str = Field(default="https://www.dmxapi.cn/v1", validation_alias="DMX_GPT_IMAGE_BASE_URL")
    dmx_gpt_image_model: str = Field(default="gpt-image-2-ssvip", validation_alias="DMX_GPT_IMAGE_MODEL")
    dmx_seedream_image_base_url: str = Field(default="https://www.dmxapi.cn/v1", validation_alias="DMX_SEEDREAM_IMAGE_BASE_URL")
    dmx_seedream_image_model: str = Field(default="doubao-seedream-5.0-lite", validation_alias="DMX_SEEDREAM_IMAGE_MODEL")
    dmx_timeout_seconds: int = Field(default=120, validation_alias="DMX_TIMEOUT_SECONDS")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
