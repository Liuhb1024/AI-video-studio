from app.modules._crud import CRUDRepository
from app.modules.final_cuts.models import FinalCut


class FinalCutRepository(CRUDRepository):
    model = FinalCut

