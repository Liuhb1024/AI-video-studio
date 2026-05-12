from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from typing import Any

import httpx

from app.ai.dmx import AIProviderError


@dataclass(frozen=True)
class SeedreamImageInput:
    data: bytes
    mime_type: str


@dataclass(frozen=True)
class SeedreamImageOutput:
    data: bytes
    mime_type: str


@dataclass(frozen=True)
class SeedreamImageGenerationResult:
    images: list[SeedreamImageOutput]
    raw_response_summary: dict[str, Any]


@dataclass(frozen=True)
class DMXSeedreamImageProvider:
    api_key: str
    base_url: str
    default_model: str = "doubao-seedream-5.0-lite"
    timeout_seconds: int = 300
    name: str = "dmx-seedream"

    def generate_images(
        self,
        *,
        prompt: str,
        images: list[SeedreamImageInput],
        image_size: str = "2K",
        model: str | None = None,
        output_format: str = "png",
        output_count: int = 1,
    ) -> SeedreamImageGenerationResult:
        if not images:
            raise ValueError("Seedream 多图融合至少需要一张参考图。")
        resolved_size = self._resolve_size(image_size)
        payload = self._build_payload(
            prompt=prompt,
            images=images[:14],
            model=model or self.default_model,
            resolved_size=resolved_size,
            output_format=output_format,
            output_count=output_count,
        )
        try:
            response = httpx.post(
                f"{self.base_url.rstrip('/')}/responses",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": self.api_key,
                },
                json=payload,
                timeout=self.timeout_seconds,
                trust_env=False,
            )
            response.raise_for_status()
            response_payload = response.json()
        except httpx.HTTPStatusError as exc:
            raise AIProviderError(
                self._map_http_error(exc.response.status_code),
                status_code=exc.response.status_code,
            ) from exc
        except httpx.RequestError as exc:
            raise AIProviderError("DMX Seedream 图片模型连接失败，请检查网络或 Base URL。") from exc
        except json.JSONDecodeError as exc:
            raise AIProviderError("DMX Seedream 图片模型返回了非 JSON 响应。") from exc

        return self._parse_response(
            response_payload,
            resolved_size=resolved_size,
            model=model or self.default_model,
            output_format=output_format,
        )

    def _resolve_size(self, image_size: str) -> str:
        if image_size == "4K":
            return "3K"
        if image_size == "3K":
            return "3K"
        return "2K"

    def _build_payload(
        self,
        *,
        prompt: str,
        images: list[SeedreamImageInput],
        model: str,
        resolved_size: str,
        output_format: str,
        output_count: int,
    ) -> dict[str, Any]:
        return {
            "model": model,
            "input": prompt,
            "size": resolved_size,
            "image": [self._to_data_url(image) for image in images],
            "sequential_image_generation": "disabled",
            "sequential_image_generation_options": {"max_images": max(1, output_count)},
            "stream": False,
            "output_format": output_format,
            "response_format": "url",
            "watermark": False,
            "optimize_prompt_options": {"mode": "standard"},
        }

    def _to_data_url(self, image: SeedreamImageInput) -> str:
        mime_type = (image.mime_type or "image/png").lower()
        return f"data:{mime_type};base64,{base64.b64encode(image.data).decode('utf-8')}"

    def _parse_response(
        self,
        payload: dict[str, Any],
        *,
        resolved_size: str,
        model: str,
        output_format: str,
    ) -> SeedreamImageGenerationResult:
        images: list[SeedreamImageOutput] = []
        returned_url_count = 0

        for item in payload.get("output", []):
            if not isinstance(item, dict):
                continue
            image_url = item.get("image_url")
            if isinstance(image_url, dict) and image_url.get("url"):
                returned_url_count += 1
                images.append(self._download_image(str(image_url["url"]), output_format))

        if not images:
            raise AIProviderError("DMX Seedream 图片模型响应中没有找到图片数据。")

        return SeedreamImageGenerationResult(
            images=images,
            raw_response_summary={
                "image_count": len(images),
                "returned_url_count": returned_url_count,
                "resolved_size": resolved_size,
                "model": model,
                "status": payload.get("status"),
                "usage": payload.get("usage"),
            },
        )

    def _download_image(self, url: str, output_format: str) -> SeedreamImageOutput:
        try:
            response = httpx.get(url, timeout=120, follow_redirects=True, trust_env=False)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise AIProviderError(f"DMX Seedream 图片 URL 下载失败，HTTP {exc.response.status_code}。") from exc
        except httpx.RequestError as exc:
            raise AIProviderError("DMX Seedream 图片 URL 下载失败，请检查网络。") from exc
        content_type = response.headers.get("content-type", "").split(";")[0].strip()
        return SeedreamImageOutput(data=response.content, mime_type=content_type or self._mime_type_from_output_format(output_format))

    def _mime_type_from_output_format(self, output_format: str) -> str:
        if output_format == "jpeg":
            return "image/jpeg"
        return "image/png"

    def _map_http_error(self, status_code: int) -> str:
        if status_code == 400:
            return "DMX Seedream 图片模型参数不兼容，请检查 prompt、图片、尺寸或输出格式。"
        if status_code == 401:
            return "DMXAPI 令牌无效，或令牌与 Base URL 域名不匹配。"
        if status_code == 404:
            return "DMX Seedream responses 接口不存在，请检查 Base URL 或模型名称。"
        if status_code == 429:
            return "DMXAPI 或上游 Seedream 图片模型限流，请稍后重试。"
        if status_code in {500, 503, 524}:
            return "DMXAPI 上游 Seedream 图片模型繁忙或不可用，请稍后重试。"
        return f"DMX Seedream 图片模型调用失败，HTTP {status_code}。"
