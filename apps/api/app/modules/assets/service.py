from sqlalchemy.orm import Session

from app.modules._crud import CRUDService
from app.modules.assets.repository import AssetRepository
from app.modules.assets.schemas import AssetRead


class AssetService(CRUDService):
    def __init__(self, session: Session) -> None:
        super().__init__(AssetRepository(session), AssetRead)

