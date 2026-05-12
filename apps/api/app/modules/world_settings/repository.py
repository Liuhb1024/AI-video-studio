from app.modules._crud import CRUDRepository
from app.modules.world_settings.models import WorldSetting


class WorldSettingRepository(CRUDRepository):
    model = WorldSetting

