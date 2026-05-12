from app.modules._crud import CRUDRepository
from app.modules.projects.models import Project


class ProjectRepository(CRUDRepository):
    model = Project

