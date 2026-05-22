"""API v1 router."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    assets,
    characters,
    costs,
    exports,
    generation_tasks,
    panels,
    projects,
    prompts,
    reviews,
    scripts,
    shots,
)

router = APIRouter()

router.include_router(projects.router)
router.include_router(characters.router)
router.include_router(scripts.router)
router.include_router(shots.router)
router.include_router(panels.router)
router.include_router(prompts.router)
router.include_router(generation_tasks.router)
router.include_router(assets.router)
router.include_router(reviews.router)
router.include_router(costs.router)
router.include_router(exports.router)


@router.get("/info", tags=["api-v1"])
def api_info() -> dict[str, str]:
    """Return v1 API metadata."""
    return {
        "name": "AI Yingge Drama Studio API v1",
        "status": "skeleton",
    }
