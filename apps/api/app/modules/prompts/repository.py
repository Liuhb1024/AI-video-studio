from app.modules._crud import CRUDRepository
from app.modules.prompts.models import PromptTemplate


class PromptTemplateRepository(CRUDRepository):
    model = PromptTemplate

