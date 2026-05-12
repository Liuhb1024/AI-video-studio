from app.modules._crud import CRUDRepository
from app.modules.characters.models import Character


class CharacterRepository(CRUDRepository):
    model = Character

