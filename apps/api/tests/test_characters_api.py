from collections.abc import Generator
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db, get_storage
from app.db.base import Base
from app.main import create_app
from app.modules.assets.models import Asset
from app.modules.characters.models import Character
from app.modules.projects.models import Project
from app.storage.local import LocalStorageProvider


def build_test_client() -> TestClient:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)
    Base.metadata.create_all(bind=engine, tables=[Project.__table__, Character.__table__, Asset.__table__])

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    app.state.testing_session_factory = TestingSessionLocal
    return TestClient(app)


def test_character_bible_crud_flow() -> None:
    client = build_test_client()

    create_response = client.post(
        "/api/v1/characters/",
        json={
            "name": "宋江",
            "alias": "及时雨·呼保义",
            "rank": "第1位",
            "star": "天魁星",
            "liangshan_role": "总兵都头领（梁山寨主）",
            "weapons": "骨朵",
            "personality_tags": "城府极深·仗义疏财·隐忍圆滑",
            "yingge_role": "英歌队司鼓者/指挥。",
            "facepaint_main_color": "正红",
            "facepaint_patterns": "及时雨云纹、天罡北斗七星纹",
            "visual_tone_keywords": "王者气场·厚重深沉·居中而稳",
            "positive_prompt_terms": "墨红战袍、统帅气场、居中主位",
            "negative_prompt_terms": "弱小形象、泪目低头、简陋装束",
        },
    )

    assert create_response.status_code == 200
    created = create_response.json()
    assert created["name"] == "宋江"
    assert created["source"] == "manual"
    assert "宋江，及时雨·呼保义" in created["image_consistency_prompt"]
    assert "避免：弱小形象、泪目低头、简陋装束" in created["negative_prompt"]

    list_response = client.get("/api/v1/characters/", params={"query": "宋江"})
    assert list_response.status_code == 200
    assert [item["name"] for item in list_response.json()] == ["宋江"]

    paginated_response = client.get("/api/v1/characters/paginated", params={"query": "宋江", "page": 1, "page_size": 12})
    assert paginated_response.status_code == 200
    assert paginated_response.json()["total"] == 1
    assert paginated_response.json()["items"][0]["name"] == "宋江"

    update_response = client.patch(
        f"/api/v1/characters/{created['id']}",
        json={"facepaint_main_color": "丹红", "status": "active"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["facepaint_main_color"] == "丹红"

    delete_response = client.delete(f"/api/v1/characters/{created['id']}")
    assert delete_response.status_code == 204


def test_character_reference_upload_flow(tmp_path) -> None:
    client = build_test_client()
    app = client.app
    app.dependency_overrides[get_storage] = lambda: LocalStorageProvider(root_dir=tmp_path)

    created = client.post("/api/v1/characters/", json={"name": "林冲"}).json()

    upload_response = client.post(
        f"/api/v1/characters/{created['id']}/references",
        data={
            "reference_type": "facepaint",
            "title": "脸谱正面",
            "note": "测试上传",
            "is_primary": "true",
        },
        files={"file": ("face.png", b"fake-image", "image/png")},
    )

    assert upload_response.status_code == 200
    asset = upload_response.json()
    assert asset["reference_type"] == "facepaint"
    assert asset["is_primary"] is True
    assert "references/facepaint" in asset["url"]

    list_response = client.get(f"/api/v1/characters/{created['id']}/references")
    assert list_response.status_code == 200
    assert list_response.json()[0]["title"] == "脸谱正面"

    update_response = client.patch(
        f"/api/v1/characters/{created['id']}/references/{asset['id']}",
        json={"title": "脸谱主参考", "is_primary": True},
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "脸谱主参考"

    replace_response = client.put(
        f"/api/v1/characters/{created['id']}/references/{asset['id']}/file",
        data={"title": "脸谱替换图"},
        files={"file": ("face-v2.png", b"fake-image-v2", "image/png")},
    )
    assert replace_response.status_code == 200
    replaced = replace_response.json()
    assert replaced["id"] == asset["id"]
    assert replaced["filename"] == "face-v2.png"
    assert replaced["title"] == "脸谱替换图"
    assert replaced["object_key"] != asset["object_key"]
    assert Path(tmp_path / asset["object_key"]).exists()

    delete_response = client.delete(f"/api/v1/characters/{created['id']}/references/{asset['id']}")
    assert delete_response.status_code == 204
    assert Path(tmp_path / replaced["object_key"]).exists()

    list_after_delete_response = client.get(f"/api/v1/characters/{created['id']}/references")
    assert list_after_delete_response.status_code == 200
    assert list_after_delete_response.json() == []

    recycle_bin_response = client.get(
        f"/api/v1/characters/{created['id']}/references",
        params={"include_deleted": "true"},
    )
    assert recycle_bin_response.status_code == 200
    deleted_asset = recycle_bin_response.json()[0]
    assert deleted_asset["id"] == asset["id"]
    assert deleted_asset["deleted_at"] is not None

    restore_response = client.post(f"/api/v1/characters/{created['id']}/references/{asset['id']}/restore")
    assert restore_response.status_code == 200
    assert restore_response.json()["deleted_at"] is None

    list_after_restore_response = client.get(f"/api/v1/characters/{created['id']}/references")
    assert list_after_restore_response.status_code == 200
    assert list_after_restore_response.json()[0]["id"] == asset["id"]


def test_facepaint_reference_keeps_one_active_image(tmp_path) -> None:
    client = build_test_client()
    app = client.app
    app.dependency_overrides[get_storage] = lambda: LocalStorageProvider(root_dir=tmp_path)

    created = client.post("/api/v1/characters/", json={"name": "武松"}).json()

    first_response = client.post(
        f"/api/v1/characters/{created['id']}/references",
        data={"reference_type": "facepaint", "title": "脸谱初版", "is_primary": "true"},
        files={"file": ("face-a.png", b"face-a", "image/png")},
    )
    assert first_response.status_code == 200
    first = first_response.json()

    second_response = client.post(
        f"/api/v1/characters/{created['id']}/references",
        data={"reference_type": "facepaint", "title": "脸谱定稿", "is_primary": "true"},
        files={"file": ("face-b.png", b"face-b", "image/png")},
    )
    assert second_response.status_code == 200
    second = second_response.json()

    active_response = client.get(
        f"/api/v1/characters/{created['id']}/references",
        params={"reference_type": "facepaint"},
    )
    assert active_response.status_code == 200
    active_assets = active_response.json()
    assert [asset["id"] for asset in active_assets] == [second["id"]]
    assert active_assets[0]["title"] == "脸谱定稿"

    all_response = client.get(
        f"/api/v1/characters/{created['id']}/references",
        params={"reference_type": "facepaint", "include_deleted": "true"},
    )
    assert all_response.status_code == 200
    all_assets = all_response.json()
    deleted_first = next(asset for asset in all_assets if asset["id"] == first["id"])
    assert deleted_first["deleted_at"] is not None
    assert Path(tmp_path / first["object_key"]).exists()


def test_character_generated_assets_are_separated_from_reference_gallery() -> None:
    client = build_test_client()
    created = client.post("/api/v1/characters/", json={"name": "鲁智深"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        reference_asset = Asset(
            character_id=created["id"],
            asset_type="image",
            filename="face.png",
            object_key="characters/face.png",
            url="https://example.com/face.png",
            reference_type="facepaint",
            asset_origin="uploaded",
            status="ready",
        )
        generated_asset = Asset(
            character_id=created["id"],
            asset_type="image",
            filename="three-view.png",
            object_key="characters/generated/three-view.png",
            url="https://example.com/three-view.png",
            reference_type="generated_asset",
            generation_type="three_view",
            asset_origin="generated",
            accepted_for_keyframe=True,
            status="ready",
        )
        session.add_all([reference_asset, generated_asset])
        session.commit()

    reference_response = client.get(f"/api/v1/characters/{created['id']}/references")
    assert reference_response.status_code == 200
    assert [asset["filename"] for asset in reference_response.json()] == ["face.png"]

    generated_response = client.get(f"/api/v1/characters/{created['id']}/generated-assets")
    assert generated_response.status_code == 200
    payload = generated_response.json()
    assert [asset["filename"] for asset in payload] == ["three-view.png"]
    assert payload[0]["generation_type"] == "three_view"
    assert payload[0]["accepted_for_keyframe"] is True


def test_character_generated_asset_can_be_accepted_or_rejected() -> None:
    client = build_test_client()
    created = client.post("/api/v1/characters/", json={"name": "燕青"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        generated_asset = Asset(
            character_id=created["id"],
            asset_type="image",
            filename="style-transfer.png",
            object_key="characters/generated/style-transfer.png",
            url="https://example.com/style-transfer.png",
            reference_type="generated_asset",
            generation_type="style_transfer",
            asset_origin="generated",
            status="candidate",
        )
        session.add(generated_asset)
        session.commit()
        asset_id = generated_asset.id

    accept_response = client.patch(
        f"/api/v1/characters/{created['id']}/generated-assets/{asset_id}",
        json={
            "accepted_for_keyframe": True,
            "status": "accepted",
            "quality_note": "脸谱、服饰和风格都可用于关键帧。",
        },
    )
    assert accept_response.status_code == 200
    accepted = accept_response.json()
    assert accepted["accepted_for_keyframe"] is True
    assert accepted["status"] == "accepted"
    assert "关键帧" in accepted["quality_note"]

    accepted_list_response = client.get(
        f"/api/v1/characters/{created['id']}/generated-assets",
        params={"status_filter": "accepted"},
    )
    assert accepted_list_response.status_code == 200
    assert [asset["id"] for asset in accepted_list_response.json()] == [asset_id]

    reject_response = client.patch(
        f"/api/v1/characters/{created['id']}/generated-assets/{asset_id}",
        json={
            "accepted_for_keyframe": False,
            "status": "rejected",
            "quality_note": "脸谱漂移，暂不采用。",
        },
    )
    assert reject_response.status_code == 200
    rejected = reject_response.json()
    assert rejected["accepted_for_keyframe"] is False
    assert rejected["status"] == "rejected"
    assert "脸谱漂移" in rejected["quality_note"]


def test_character_generated_asset_can_be_promoted_to_manual_reference() -> None:
    client = build_test_client()
    created = client.post("/api/v1/characters/", json={"name": "燕青"}).json()

    session_factory = client.app.state.testing_session_factory
    with session_factory() as session:
        generated_asset = Asset(
            character_id=created["id"],
            asset_type="image",
            filename="lookdev.png",
            object_key="characters/generated/lookdev.png",
            url="https://example.com/lookdev.png",
            reference_type="generated_asset",
            generation_type="character_lookdev",
            asset_origin="generated",
            style_template_id="style-role-001",
            source_reference_asset_ids=["facepaint-001"],
            status="candidate",
        )
        session.add(generated_asset)
        session.commit()
        asset_id = generated_asset.id

    promote_response = client.post(f"/api/v1/characters/{created['id']}/generated-assets/{asset_id}/promote-to-reference")
    assert promote_response.status_code == 200
    promoted = promote_response.json()
    assert promoted["id"] != asset_id
    assert promoted["asset_origin"] == "promoted"
    assert promoted["reference_type"] == "character_final_reference"
    assert promoted["generation_type"] == "character_lookdev"
    assert promoted["is_primary"] is False
    assert promoted["object_key"] == "characters/generated/lookdev.png"
    assert promoted["url"] == "https://example.com/lookdev.png"
    assert "角色定稿参考" in promoted["title"]

    references_response = client.get(f"/api/v1/characters/{created['id']}/references")
    assert references_response.status_code == 200
    references = references_response.json()
    assert [asset["id"] for asset in references] == [promoted["id"]]

    generated_response = client.get(f"/api/v1/characters/{created['id']}/generated-assets")
    assert generated_response.status_code == 200
    assert [asset["id"] for asset in generated_response.json()] == [asset_id]


def test_import_yingge_bible_reads_existing_asset_workbook() -> None:
    path = Path("/Users/huabi/Downloads/英歌水浒角色基础信息.xlsx")
    if not path.exists():
        return

    client = build_test_client()
    response = client.post("/api/v1/characters/import-yingge-bible", json={"file_path": str(path)})

    assert response.status_code == 200
    assert response.json()["imported_count"] >= 40
    payload = client.get("/api/v1/characters/", params={"query": "宋江"}).json()
    assert payload[0]["alias"] == "及时雨·呼保义"
    assert payload[0]["facepaint_main_color"].startswith("正红")
    assert "英歌队司鼓者" in payload[0]["yingge_role"]
