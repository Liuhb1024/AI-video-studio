from app.modules._crud import CRUDRepository
from app.modules.generation.models import GenerateTask


class GenerateTaskRepository(CRUDRepository):
    model = GenerateTask

