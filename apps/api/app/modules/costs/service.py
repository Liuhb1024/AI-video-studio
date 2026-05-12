from sqlalchemy.orm import Session

from app.modules._crud import CRUDService
from app.modules.costs.repository import CostRecordRepository
from app.modules.costs.schemas import CostRecordRead


class CostRecordService(CRUDService):
    def __init__(self, session: Session) -> None:
        super().__init__(CostRecordRepository(session), CostRecordRead)

