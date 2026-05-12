from fastapi import APIRouter


def create_module_router(prefix: str, tag: str) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=[tag])

    @router.get("/meta")
    def module_meta() -> dict[str, str]:
        return {"module": tag, "status": "ready"}

    return router

