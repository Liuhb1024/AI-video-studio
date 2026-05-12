from app.modules._crud import CRUDRepository
from app.modules.assets.models import Asset


class AssetRepository(CRUDRepository):
    model = Asset

