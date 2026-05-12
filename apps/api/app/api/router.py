from fastapi import APIRouter

from app.modules.assets.router import router as assets_router
from app.modules.characters.router import router as characters_router
from app.modules.costs.router import router as costs_router
from app.modules.final_cuts.router import router as final_cuts_router
from app.modules.generation.router import router as generation_router
from app.modules.project_characters.router import router as project_characters_router
from app.modules.projects.router import router as projects_router
from app.modules.prompts.router import router as prompts_router
from app.modules.scenes.router import router as scenes_router
from app.modules.settings.router import router as settings_router
from app.modules.shots.router import router as shots_router
from app.modules.scripts.router import router as scripts_router
from app.modules.style_templates.router import router as style_templates_router
from app.modules.tags.router import router as tags_router
from app.modules.world_settings.router import router as world_settings_router


api_router = APIRouter(prefix="/api/v1")

api_router.include_router(projects_router)
api_router.include_router(project_characters_router)
api_router.include_router(scripts_router)
api_router.include_router(scenes_router)
api_router.include_router(shots_router)
api_router.include_router(characters_router)
api_router.include_router(style_templates_router)
api_router.include_router(world_settings_router)
api_router.include_router(tags_router)
api_router.include_router(prompts_router)
api_router.include_router(generation_router)
api_router.include_router(assets_router)
api_router.include_router(final_cuts_router)
api_router.include_router(costs_router)
api_router.include_router(settings_router)
