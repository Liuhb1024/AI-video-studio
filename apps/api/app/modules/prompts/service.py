from sqlalchemy.orm import Session

from app.modules._crud import CRUDService
from app.modules.prompts.repository import PromptTemplateRepository
from app.modules.prompts.schemas import PromptTemplateRead


class PromptTemplateService(CRUDService):
    def __init__(self, session: Session) -> None:
        super().__init__(PromptTemplateRepository(session), PromptTemplateRead)

