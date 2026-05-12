from sqlalchemy.orm import Session

from app.modules._crud import CRUDService
from app.modules.projects.repository import ProjectRepository
from app.modules.projects.schemas import ProjectCreate, ProjectRead


class ProjectService(CRUDService):
    def __init__(self, session: Session) -> None:
        super().__init__(ProjectRepository(session), ProjectRead)


def get_project_service(session: Session) -> ProjectService:
    return ProjectService(session)
