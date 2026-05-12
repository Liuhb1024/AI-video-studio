from app.core.config import Settings, get_settings
from app.storage.cos import TencentCOSProvider
from app.storage.local import LocalStorageProvider


def get_storage_provider(settings: Settings | None = None):
    settings = settings or get_settings()
    provider_name = settings.storage_provider.lower()
    if provider_name == "local":
        return LocalStorageProvider(root_dir=settings.storage_local_root)
    return TencentCOSProvider.from_settings(settings)

