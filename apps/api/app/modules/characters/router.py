from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.deps import get_db, get_storage
from app.core.config import get_settings
from app.modules.characters.importer import import_yingge_bible
from app.modules.characters.schemas import (
    CharacterCreate,
    CharacterGeneratedAssetUpdate,
    CharacterImportRead,
    CharacterImportRequest,
    CharacterListRead,
    CharacterRead,
    CharacterReferenceAssetRead,
    CharacterReferenceAssetUpdate,
    CharacterUpdate,
)
from app.modules.characters.service import CharacterService

router = APIRouter(prefix="/characters", tags=["characters"])


def _service(session=Depends(get_db)) -> CharacterService:
    return CharacterService(session)


@router.get("/", response_model=list[CharacterRead])
def list_characters(query: str | None = None, service: CharacterService = Depends(_service)) -> list[CharacterRead]:
    return service.list(query=query)


@router.get("/paginated", response_model=CharacterListRead)
def list_characters_paginated(
    query: str | None = None,
    page: int = 1,
    page_size: int = 12,
    service: CharacterService = Depends(_service),
) -> CharacterListRead:
    return service.list_paginated(query=query, page=page, page_size=page_size)


@router.post("/", response_model=CharacterRead)
def create_character(payload: CharacterCreate, service: CharacterService = Depends(_service)) -> CharacterRead:
    return service.create(payload)


@router.get("/{character_id}/references", response_model=list[CharacterReferenceAssetRead])
def list_character_references(
    character_id: str,
    reference_type: str | None = None,
    include_deleted: bool = False,
    service: CharacterService = Depends(_service),
) -> list[CharacterReferenceAssetRead]:
    if service.get(character_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return service.list_reference_assets(character_id, reference_type=reference_type, include_deleted=include_deleted)


@router.get("/{character_id}/generated-assets", response_model=list[CharacterReferenceAssetRead])
def list_character_generated_assets(
    character_id: str,
    generation_type: str | None = None,
    status_filter: str | None = None,
    include_deleted: bool = False,
    service: CharacterService = Depends(_service),
) -> list[CharacterReferenceAssetRead]:
    if service.get(character_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return service.list_generated_assets(character_id, generation_type=generation_type, status_filter=status_filter, include_deleted=include_deleted)


@router.patch("/{character_id}/generated-assets/{asset_id}", response_model=CharacterReferenceAssetRead)
def update_character_generated_asset(
    character_id: str,
    asset_id: str,
    payload: CharacterGeneratedAssetUpdate,
    service: CharacterService = Depends(_service),
) -> CharacterReferenceAssetRead:
    asset = service.update_generated_asset(character_id, asset_id, payload)
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generated asset not found")
    return asset


@router.post("/{character_id}/generated-assets/{asset_id}/promote-to-reference", response_model=CharacterReferenceAssetRead)
def promote_character_generated_asset_to_reference(
    character_id: str,
    asset_id: str,
    service: CharacterService = Depends(_service),
) -> CharacterReferenceAssetRead:
    asset = service.promote_generated_asset_to_reference(character_id, asset_id)
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generated asset not found")
    return asset


@router.post("/{character_id}/references", response_model=CharacterReferenceAssetRead)
async def upload_character_reference(
    character_id: str,
    file: UploadFile = File(...),
    reference_type: str = Form(...),
    title: str | None = Form(None),
    note: str | None = Form(None),
    style_board: str | None = Form(None),
    is_primary: bool = Form(False),
    service: CharacterService = Depends(_service),
    storage=Depends(get_storage),
) -> CharacterReferenceAssetRead:
    if service.get(character_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image uploads are supported")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
    key = storage.build_key(f"characters/{character_id}/references/{reference_type}", file.filename or "reference.png")
    url = storage.put_bytes(key, data, content_type=file.content_type)
    settings = get_settings()
    asset = service.create_reference_asset(
        character_id=character_id,
        filename=file.filename or "reference.png",
        object_key=key,
        url=url,
        provider=storage.name,
        bucket=settings.cos_bucket if storage.name == "cos" else None,
        region=settings.cos_region if storage.name == "cos" else None,
        mime_type=file.content_type,
        size_bytes=len(data),
        reference_type=reference_type,
        title=title,
        note=note,
        style_board=style_board,
        is_primary=is_primary,
    )
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return asset


@router.patch("/{character_id}/references/{asset_id}", response_model=CharacterReferenceAssetRead)
def update_character_reference(
    character_id: str,
    asset_id: str,
    payload: CharacterReferenceAssetUpdate,
    service: CharacterService = Depends(_service),
) -> CharacterReferenceAssetRead:
    asset = service.update_reference_asset(character_id, asset_id, payload)
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference asset not found")
    return asset


@router.put("/{character_id}/references/{asset_id}/file", response_model=CharacterReferenceAssetRead)
async def replace_character_reference_file(
    character_id: str,
    asset_id: str,
    file: UploadFile = File(...),
    title: str | None = Form(None),
    note: str | None = Form(None),
    service: CharacterService = Depends(_service),
    storage=Depends(get_storage),
) -> CharacterReferenceAssetRead:
    current = service.get_reference_asset(character_id, asset_id)
    if current is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference asset not found")
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image uploads are supported")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    reference_type = current.reference_type or "reference"
    key = storage.build_key(f"characters/{character_id}/references/{reference_type}", file.filename or "reference.png")
    url = storage.put_bytes(key, data, content_type=file.content_type)
    settings = get_settings()
    asset = service.replace_reference_asset_file(
        character_id=character_id,
        asset_id=asset_id,
        filename=file.filename or "reference.png",
        object_key=key,
        url=url,
        provider=storage.name,
        bucket=settings.cos_bucket if storage.name == "cos" else None,
        region=settings.cos_region if storage.name == "cos" else None,
        mime_type=file.content_type,
        size_bytes=len(data),
        title=title,
        note=note,
    )
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference asset not found")

    return asset


@router.post("/{character_id}/references/{asset_id}/restore", response_model=CharacterReferenceAssetRead)
def restore_character_reference(
    character_id: str,
    asset_id: str,
    service: CharacterService = Depends(_service),
) -> CharacterReferenceAssetRead:
    asset = service.restore_reference_asset(character_id, asset_id)
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference asset not found")
    return asset


@router.delete("/{character_id}/references/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_character_reference(
    character_id: str,
    asset_id: str,
    service: CharacterService = Depends(_service),
) -> None:
    if not service.delete_reference_asset(character_id, asset_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference asset not found")


@router.get("/{character_id}", response_model=CharacterRead)
def get_character(character_id: str, service: CharacterService = Depends(_service)) -> CharacterRead:
    character = service.get(character_id)
    if character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return character


@router.patch("/{character_id}", response_model=CharacterRead)
def update_character(character_id: str, payload: CharacterUpdate, service: CharacterService = Depends(_service)) -> CharacterRead:
    character = service.update(character_id, payload)
    if character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return character


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_character(character_id: str, service: CharacterService = Depends(_service)) -> None:
    if not service.delete(character_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")


@router.post("/import-yingge-bible", response_model=CharacterImportRead)
def import_characters_from_yingge_bible(payload: CharacterImportRequest, session=Depends(get_db)) -> CharacterImportRead:
    path = Path(payload.file_path)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workbook not found")
    result = import_yingge_bible(session, path)
    return CharacterImportRead(
        imported_count=result.imported_count,
        updated_count=result.updated_count,
        skipped_count=result.skipped_count,
    )
