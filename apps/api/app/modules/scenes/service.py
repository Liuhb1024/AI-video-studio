from sqlalchemy.orm import Session

from app.modules._crud import CRUDService
from app.modules.scenes.repository import SceneRepository
from app.modules.scenes.schemas import SceneRead


class SceneService(CRUDService):
    def __init__(self, session: Session) -> None:
        super().__init__(SceneRepository(session), SceneRead)

