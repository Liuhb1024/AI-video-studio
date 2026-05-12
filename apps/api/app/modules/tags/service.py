from sqlalchemy.orm import Session

from app.modules._crud import CRUDService
from app.modules.tags.repository import TagRepository
from app.modules.tags.schemas import TagRead


class TagService(CRUDService):
    def __init__(self, session: Session) -> None:
        super().__init__(TagRepository(session), TagRead)

