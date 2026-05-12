from decimal import Decimal

from pydantic import BaseModel

from app.modules._schemas import ORM_MODEL_CONFIG


class CostRecordCreate(BaseModel):
    model_name: str = "mock"
    token_count: int = 0
    amount: Decimal = Decimal("0")
    currency: str = "CNY"
    project_id: str | None = None


class CostRecordRead(CostRecordCreate):
    model_config = ORM_MODEL_CONFIG

    id: str

