from app.modules._crud import CRUDRepository
from app.modules.shots.models import Shot


class ShotRepository(CRUDRepository):
    model = Shot

