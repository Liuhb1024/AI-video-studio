from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.modules.assets.models import Asset
from app.modules.assets.schemas import AssetRead
from app.modules.characters.models import Character
from app.modules.characters.prompting import build_character_prompts
from app.modules.characters.schemas import CharacterCreate, CharacterGeneratedAssetUpdate, CharacterListRead, CharacterRead, CharacterReferenceAssetUpdate, CharacterUpdate


class CharacterService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list(self, query: str | None = None) -> list[CharacterRead]:
        statement = select(Character)
        statement = self._apply_query(statement, query)
        statement = statement.order_by(Character.source_row.asc().nulls_last(), Character.created_at.desc())
        return [CharacterRead.model_validate(item) for item in self.session.scalars(statement).all()]

    def list_paginated(self, query: str | None = None, page: int = 1, page_size: int = 12) -> CharacterListRead:
        safe_page = max(1, page)
        safe_page_size = min(48, max(6, page_size))
        statement = self._apply_query(select(Character), query)
        total = self.session.scalar(select(func.count()).select_from(statement.subquery())) or 0
        page_statement = (
            statement.order_by(Character.source_row.asc().nulls_last(), Character.created_at.desc())
            .offset((safe_page - 1) * safe_page_size)
            .limit(safe_page_size)
        )
        return CharacterListRead(
            items=[CharacterRead.model_validate(item) for item in self.session.scalars(page_statement).all()],
            total=total,
            page=safe_page,
            page_size=safe_page_size,
        )

    def get(self, character_id: str) -> CharacterRead | None:
        character = self.session.get(Character, character_id)
        if character is None:
            return None
        return CharacterRead.model_validate(character)

    def create(self, payload: CharacterCreate) -> CharacterRead:
        data = payload.model_dump()
        data.update(self._ensure_prompts(payload))
        character = Character(**data)
        self.session.add(character)
        self.session.commit()
        self.session.refresh(character)
        return CharacterRead.model_validate(character)

    def update(self, character_id: str, payload: CharacterUpdate) -> CharacterRead | None:
        character = self.session.get(Character, character_id)
        if character is None:
            return None
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(character, key, value)
        if self._needs_prompt_refresh(data):
            merged = CharacterCreate(**CharacterRead.model_validate(character).model_dump())
            for key, value in self._ensure_prompts(merged).items():
                if not getattr(character, key):
                    setattr(character, key, value)
        self.session.commit()
        self.session.refresh(character)
        return CharacterRead.model_validate(character)

    def delete(self, character_id: str) -> bool:
        character = self.session.get(Character, character_id)
        if character is None:
            return False
        self.session.delete(character)
        self.session.commit()
        return True

    def list_reference_assets(self, character_id: str, reference_type: str | None = None, include_deleted: bool = False) -> list[AssetRead]:
        statement = select(Asset).where(
            Asset.character_id == character_id,
            Asset.asset_origin != "generated",
        )
        if not include_deleted:
            statement = statement.where(Asset.deleted_at.is_(None))
        if reference_type:
            statement = statement.where(Asset.reference_type == reference_type)
        statement = statement.order_by(Asset.is_primary.desc(), Asset.created_at.desc())
        return [AssetRead.model_validate(item) for item in self.session.scalars(statement).all()]

    def list_generated_assets(
        self,
        character_id: str,
        generation_type: str | None = None,
        status_filter: str | None = None,
        include_deleted: bool = False,
    ) -> list[AssetRead]:
        statement = select(Asset).where(
            Asset.character_id == character_id,
            Asset.asset_origin == "generated",
        )
        if not include_deleted:
            statement = statement.where(Asset.deleted_at.is_(None))
        if generation_type:
            statement = statement.where(Asset.generation_type == generation_type)
        if status_filter:
            statement = statement.where(Asset.status == status_filter)
        statement = statement.order_by(Asset.accepted_for_keyframe.desc(), Asset.created_at.desc())
        return [AssetRead.model_validate(item) for item in self.session.scalars(statement).all()]

    def update_generated_asset(self, character_id: str, asset_id: str, payload: CharacterGeneratedAssetUpdate) -> AssetRead | None:
        asset = self._get_generated_asset(character_id, asset_id)
        if asset is None:
            return None
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(asset, key, value)
        if data.get("accepted_for_keyframe") is True and "status" not in data:
            asset.status = "accepted"
        if data.get("accepted_for_keyframe") is False and asset.status == "accepted" and "status" not in data:
            asset.status = "candidate"
        self.session.commit()
        self.session.refresh(asset)
        return AssetRead.model_validate(asset)

    def promote_generated_asset_to_reference(self, character_id: str, asset_id: str) -> AssetRead | None:
        source_asset = self._get_generated_asset(character_id, asset_id)
        character = self.session.get(Character, character_id)
        if source_asset is None or character is None:
            return None

        reference = Asset(
            character_id=character_id,
            asset_type=source_asset.asset_type,
            filename=source_asset.filename,
            mime_type=source_asset.mime_type,
            size_bytes=source_asset.size_bytes,
            provider=source_asset.provider,
            bucket=source_asset.bucket,
            region=source_asset.region,
            object_key=source_asset.object_key,
            url=source_asset.url,
            thumbnail_key=source_asset.thumbnail_key,
            title=f"角色定稿参考 · {source_asset.title or source_asset.filename}",
            note=source_asset.quality_note or source_asset.note or "由角色定稿候选图手动纳入参考图库。",
            reference_type="character_final_reference",
            style_board=source_asset.style_board,
            asset_origin="promoted",
            generation_type=source_asset.generation_type,
            source_reference_asset_ids=source_asset.source_reference_asset_ids,
            style_template_id=source_asset.style_template_id,
            generate_task_id=source_asset.generate_task_id,
            accepted_for_keyframe=False,
            quality_note=source_asset.quality_note,
            is_primary=False,
            width=source_asset.width,
            height=source_asset.height,
            duration_seconds=source_asset.duration_seconds,
            status="ready",
        )
        self.session.add(reference)
        self.session.flush()
        character.reference_asset_ids = self._append_reference_id(character.reference_asset_ids, reference.id)
        self.session.commit()
        self.session.refresh(reference)
        return AssetRead.model_validate(reference)

    def create_reference_asset(
        self,
        *,
        character_id: str,
        filename: str,
        object_key: str,
        url: str,
        provider: str,
        bucket: str | None,
        region: str | None,
        mime_type: str | None,
        size_bytes: int | None,
        reference_type: str,
        title: str | None,
        note: str | None,
        style_board: str | None,
        is_primary: bool,
    ) -> AssetRead | None:
        character = self.session.get(Character, character_id)
        if character is None:
            return None
        if reference_type == "facepaint":
            self._archive_active_reference_assets(character, reference_type)
            is_primary = True
        if is_primary:
            self._clear_primary_reference(character_id, reference_type)
        asset = Asset(
            character_id=character_id,
            asset_type="image",
            filename=filename,
            mime_type=mime_type,
            size_bytes=size_bytes,
            provider=provider,
            bucket=bucket,
            region=region,
            object_key=object_key,
            url=url,
            reference_type=reference_type,
            title=title or filename,
            note=note,
            style_board=style_board,
            is_primary=is_primary,
            status="ready",
        )
        self.session.add(asset)
        self.session.flush()
        character.reference_asset_ids = self._append_reference_id(character.reference_asset_ids, asset.id)
        if is_primary or not character.reference_asset_id:
            character.reference_asset_id = asset.id
        self.session.commit()
        self.session.refresh(asset)
        return AssetRead.model_validate(asset)

    def update_reference_asset(self, character_id: str, asset_id: str, payload: CharacterReferenceAssetUpdate) -> AssetRead | None:
        asset = self._get_reference_asset(character_id, asset_id)
        if asset is None:
            return None
        data = payload.model_dump(exclude_unset=True)
        if data.get("is_primary"):
            self._clear_primary_reference(character_id, asset.reference_type)
            character = self.session.get(Character, character_id)
            if character is not None:
                character.reference_asset_id = asset.id
        for key, value in data.items():
            setattr(asset, key, value)
        self.session.commit()
        self.session.refresh(asset)
        return AssetRead.model_validate(asset)

    def replace_reference_asset_file(
        self,
        *,
        character_id: str,
        asset_id: str,
        filename: str,
        object_key: str,
        url: str,
        provider: str,
        bucket: str | None,
        region: str | None,
        mime_type: str | None,
        size_bytes: int | None,
        title: str | None,
        note: str | None,
    ) -> AssetRead | None:
        asset = self._get_reference_asset(character_id, asset_id)
        if asset is None:
            return None
        asset.filename = filename
        asset.object_key = object_key
        asset.url = url
        asset.provider = provider
        asset.bucket = bucket
        asset.region = region
        asset.mime_type = mime_type
        asset.size_bytes = size_bytes
        if title is not None:
            asset.title = title
        elif not asset.title:
            asset.title = filename
        if note is not None:
            asset.note = note
        self.session.commit()
        self.session.refresh(asset)
        return AssetRead.model_validate(asset)

    def get_reference_asset(self, character_id: str, asset_id: str) -> AssetRead | None:
        asset = self._get_reference_asset(character_id, asset_id)
        if asset is None:
            return None
        return AssetRead.model_validate(asset)

    def delete_reference_asset(self, character_id: str, asset_id: str) -> bool:
        asset = self._get_reference_asset(character_id, asset_id)
        if asset is None:
            return False
        character = self.session.get(Character, character_id)
        if character is not None:
            character.reference_asset_ids = [item for item in character.reference_asset_ids if item != asset_id]
            if character.reference_asset_id == asset_id:
                character.reference_asset_id = character.reference_asset_ids[0] if character.reference_asset_ids else None
        asset.deleted_at = datetime.now(UTC)
        asset.is_primary = False
        asset.status = "deleted"
        self.session.commit()
        return True

    def restore_reference_asset(self, character_id: str, asset_id: str) -> AssetRead | None:
        asset = self._get_reference_asset(character_id, asset_id)
        if asset is None:
            return None
        character = self.session.get(Character, character_id)
        if character is not None:
            character.reference_asset_ids = self._append_reference_id(character.reference_asset_ids, asset.id)
        asset.deleted_at = None
        asset.status = "ready"
        self.session.commit()
        self.session.refresh(asset)
        return AssetRead.model_validate(asset)

    def _ensure_prompts(self, payload: CharacterCreate) -> dict[str, str]:
        generated = build_character_prompts(payload)
        return {
            key: getattr(payload, key) or value
            for key, value in generated.items()
        }

    def _needs_prompt_refresh(self, data: dict) -> bool:
        prompt_source_fields = {
            "name",
            "alias",
            "rank",
            "star",
            "yingge_role",
            "facepaint_main_color",
            "facepaint_patterns",
            "weapons",
            "weapon",
            "visual_tone_keywords",
            "positive_prompt_terms",
            "negative_prompt_terms",
        }
        return bool(prompt_source_fields.intersection(data))

    def _apply_query(self, statement, query: str | None):
        if not query:
            return statement

        like = f"%{query}%"
        return statement.where(
            or_(
                Character.name.ilike(like),
                Character.alias.ilike(like),
                Character.weapons.ilike(like),
                Character.weapon.ilike(like),
                Character.yingge_role.ilike(like),
                Character.facepaint_main_color.ilike(like),
                Character.facepaint_patterns.ilike(like),
                Character.visual_tone_keywords.ilike(like),
                Character.positive_prompt_terms.ilike(like),
                Character.negative_prompt_terms.ilike(like),
            )
        )

    def _get_reference_asset(self, character_id: str, asset_id: str) -> Asset | None:
        return self.session.scalar(select(Asset).where(Asset.id == asset_id, Asset.character_id == character_id))

    def _get_generated_asset(self, character_id: str, asset_id: str) -> Asset | None:
        return self.session.scalar(
            select(Asset).where(
                Asset.id == asset_id,
                Asset.character_id == character_id,
                Asset.asset_origin == "generated",
            )
        )

    def _clear_primary_reference(self, character_id: str, reference_type: str | None) -> None:
        statement = select(Asset).where(Asset.character_id == character_id, Asset.deleted_at.is_(None))
        if reference_type:
            statement = statement.where(Asset.reference_type == reference_type)
        for asset in self.session.scalars(statement).all():
            asset.is_primary = False

    def _archive_active_reference_assets(self, character: Character, reference_type: str) -> None:
        statement = select(Asset).where(
            Asset.character_id == character.id,
            Asset.reference_type == reference_type,
            Asset.deleted_at.is_(None),
        )
        archived_ids: list[str] = []
        for asset in self.session.scalars(statement).all():
            asset.deleted_at = datetime.now(UTC)
            asset.is_primary = False
            asset.status = "deleted"
            archived_ids.append(asset.id)
        if archived_ids:
            character.reference_asset_ids = [item for item in character.reference_asset_ids if item not in archived_ids]
            if character.reference_asset_id in archived_ids:
                character.reference_asset_id = None

    def _append_reference_id(self, current: list[str] | None, asset_id: str) -> list[str]:
        items = list(current or [])
        if asset_id not in items:
            items.append(asset_id)
        return items
