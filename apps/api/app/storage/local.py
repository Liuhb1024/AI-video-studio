from pathlib import Path

from app.storage.base import StorageKeyBuilder


class LocalStorageProvider:
    name = "local"

    def __init__(self, root_dir: str | Path = "var/storage", clock=None) -> None:
        self.root_dir = Path(root_dir)
        self.key_builder = StorageKeyBuilder(clock=clock) if clock else StorageKeyBuilder()

    def build_key(self, namespace: str, filename: str, *, project_id: str | None = None) -> str:
        return self.key_builder.build(namespace, filename, project_id=project_id)

    def put_bytes(self, key: str, data: bytes, *, content_type: str | None = None) -> str:
        file_path = self.root_dir / key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(data)
        return str(file_path)

    def get_bytes(self, key: str) -> bytes:
        return (self.root_dir / key).read_bytes()

    def public_url(self, key: str) -> str:
        return (self.root_dir / key).resolve().as_uri()

    def delete(self, key: str) -> None:
        (self.root_dir / key).unlink(missing_ok=True)
