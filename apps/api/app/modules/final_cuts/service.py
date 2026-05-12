from sqlalchemy.orm import Session

from app.modules._crud import CRUDService
from app.modules.final_cuts.repository import FinalCutRepository
from app.modules.final_cuts.schemas import FinalCutRead


class FinalCutService(CRUDService):
    def __init__(self, session: Session) -> None:
        super().__init__(FinalCutRepository(session), FinalCutRead)

