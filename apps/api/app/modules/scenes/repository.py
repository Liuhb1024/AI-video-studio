from app.modules._crud import CRUDRepository
from app.modules.scenes.models import Scene


class SceneRepository(CRUDRepository):
    model = Scene

