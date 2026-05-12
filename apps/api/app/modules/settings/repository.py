from app.modules._crud import CRUDRepository
from app.modules.settings.models import SystemSetting


class SystemSettingRepository(CRUDRepository):
    model = SystemSetting

