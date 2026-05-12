from app.modules._crud import CRUDRepository
from app.modules.costs.models import CostRecord


class CostRecordRepository(CRUDRepository):
    model = CostRecord

