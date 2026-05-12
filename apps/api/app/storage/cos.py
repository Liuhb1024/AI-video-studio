from __future__ import annotations

from app.core.config import Settings
from app.storage.base import StorageKeyBuilder


class TencentCOSProvider:
    name = "cos"

    def __init__(
        self,
        *,
        region: str | None,
        secret_id: str | None,
        secret_key: str | None,
        bucket: str | None,
        public_domain: str | None = None,
        clock=None,
    ) -> None:
        self.region = region
        self.secret_id = secret_id
        self.secret_key = secret_key
        self.bucket = bucket
        self.public_domain = public_domain
        self.key_builder = StorageKeyBuilder(clock=clock) if clock else StorageKeyBuilder()

    @classmethod
    def from_settings(cls, settings: Settings) -> "TencentCOSProvider":
        return cls(
            region=settings.cos_region,
            secret_id=settings.cos_secret_id,
            secret_key=settings.cos_secret_key,
            bucket=settings.cos_bucket,
            public_domain=settings.cos_public_domain,
        )

    def build_key(self, namespace: str, filename: str, *, project_id: str | None = None) -> str:
        return self.key_builder.build(namespace, filename, project_id=project_id)

    def _ensure_client(self):
        if not all([self.region, self.secret_id, self.secret_key, self.bucket]):
            raise RuntimeError("Tencent COS credentials are not configured via environment variables.")
        try:
            from qcloud_cos import CosConfig, CosS3Client
        except ImportError as exc:  # pragma: no cover - optional dependency guard
            raise RuntimeError("cos-python-sdk-v5 is required for Tencent COS uploads.") from exc

        config = CosConfig(
            Region=self.region,
            SecretId=self.secret_id,
            SecretKey=self.secret_key,
            Scheme="https",
        )
        return CosS3Client(config)

    def put_bytes(self, key: str, data: bytes, *, content_type: str | None = None) -> str:
        client = self._ensure_client()
        kwargs = {"ContentType": content_type} if content_type else {}
        client.put_object(Bucket=self.bucket, Body=data, Key=key, **kwargs)
        return self.public_url(key)

    def get_bytes(self, key: str) -> bytes:
        client = self._ensure_client()
        response = client.get_object(Bucket=self.bucket, Key=key)
        return response["Body"].get_raw_stream().read()

    def public_url(self, key: str) -> str:
        if self.public_domain:
            return f"{self.public_domain.rstrip('/')}/{key}"
        if self.bucket and self.region:
            return f"https://{self.bucket}.cos.{self.region}.myqcloud.com/{key}"
        return f"cos://{self.bucket or 'unknown'}/{key}"

    def delete(self, key: str) -> None:
        client = self._ensure_client()
        client.delete_object(Bucket=self.bucket, Key=key)
