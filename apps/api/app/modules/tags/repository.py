from app.modules._crud import CRUDRepository
from app.modules.tags.models import Tag


class TagRepository(CRUDRepository):
    model = Tag

