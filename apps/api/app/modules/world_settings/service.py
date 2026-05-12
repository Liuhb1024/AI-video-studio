from sqlalchemy.orm import Session

from app.modules._crud import CRUDService
from app.modules.world_settings.repository import WorldSettingRepository
from app.modules.world_settings.schemas import WorldSettingRead


class WorldSettingService(CRUDService):
    def __init__(self, session: Session) -> None:
        super().__init__(WorldSettingRepository(session), WorldSettingRead)

