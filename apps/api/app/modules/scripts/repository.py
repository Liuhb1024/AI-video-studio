from app.modules._crud import CRUDRepository
from app.modules.scripts.models import Script


class ScriptRepository(CRUDRepository):
    model = Script

    def next_version_for_project(self, project_id: str) -> int:
        existing = [script.version for script in self.list() if script.project_id == project_id]
        if not existing:
            return 1
        return max(existing) + 1
