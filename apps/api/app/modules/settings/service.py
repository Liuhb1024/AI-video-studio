from sqlalchemy.orm import Session

from app.modules._crud import CRUDService
from app.modules.settings.repository import SystemSettingRepository
from app.modules.settings.schemas import SystemSettingRead


class SystemSettingService(CRUDService):
    def __init__(self, session: Session) -> None:
        super().__init__(SystemSettingRepository(session), SystemSettingRead)

