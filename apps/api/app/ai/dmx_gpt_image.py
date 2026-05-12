from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from typing import Any

import httpx

from app.ai.dmx import AIProviderError


GPT_IMAGE_2_SIZE_MAP = {
    ("1:1", "1K"): "1024x1024",
    ("1:1", "2K"): "2048x2048",
    ("1:1", "4K"): "2880x2880",
    ("16:9", "1K"): "1536x864",
    ("16:9", "2K"): "2048x1152",
    ("16:9", "4K"): "3840x2160",
    ("9:16", "1K"): "864x1536",
    ("9:16", "2K"): "1152x2048",
    ("9:16", "4K"): "2160x3840",
    ("4:3", "1K"): "1536x1152",
    ("4:3", "2K"): "2048x1536",
    ("4:3", "4K"): "3200x2400",
    ("3:4", "1K"): "1152x1536",
    ("3:4", "2K"): "1536x2048",
    ("3:4", "4K"): "2400x3200",
    ("3:2", "1K"): "1536x1024",
    ("3:2", "2K"): "2304x1536",
    ("3:2", "4K"): "3456x2304",
    ("2:3", "1K"): "1024x1536",
    ("2:3", "2K"): "1536x2304",
    ("2:3", "4K"): "2304x3456",
    ("21:9", "1K"): "1792x768",
    ("21:9", "2K"): "2688x1152",
    ("21:9", "4K"): "3584x1536",
}


@dataclass(frozen=True)
class GPTImageInput:
    data: bytes
    mime_type: str
    filename: str = "input.png"


@dataclass(frozen=True)
class GPTImageOutput:
    data: bytes
    mime_type: str


@dataclass(frozen=True)
class GPTImageGenerationResult:
    images: list[GPTImageOutput]
    raw_response_summary: dict[str, Any]


@dataclass(frozen=True)
class DMXGPTImageProvider:
    api_key: str
    base_url: str
    default_model: str = "gpt-image-2-ssvip"
    timeout_seconds: int = 300
    name: str = "dmx-gpt-image"

    def generate_images(
        self,
        *,
        prompt: str,
        images: list[GPTImageInput],
        aspect_ratio: str = "1:1",
        image_size: str = "1K",
        model: str | None = None,
        output_format: str = "png",
        quality: str = "auto",
        output_count: int = 1,
        background: str = "auto",
        output_compression: int | None = None,
    ) -> GPTImageGenerationResult:
        size = self._resolve_size(aspect_ratio, image_size)
        payload = self._build_payload(
            prompt=prompt,
            model=model or self.default_model,
            size=size,
            output_format=output_format,
            quality=quality,
            output_count=output_count,
            background=background,
            output_compression=output_compression,
        )
        files = self._build_files(images)
        try:
            response = httpx.post(
                f"{self.base_url.rstrip('/')}/images/edits",
                headers={"Authorization": f"Bearer {self.api_key}"},
                data=payload,
                files=files,
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
            raise AIProviderError("DMX GPT Image 2 图片模型连接失败，请检查网络或 Base URL。") from exc
        except json.JSONDecodeError as exc:
            raise AIProviderError("DMX GPT Image 2 图片模型返回了非 JSON 响应。") from exc

        return self._parse_response(
            response_payload,
            size=size,
            output_format=output_format,
            model=model or self.default_model,
        )

    def _resolve_size(self, aspect_ratio: str, image_size: str) -> str:
        try:
            return GPT_IMAGE_2_SIZE_MAP[(aspect_ratio, image_size)]
        except KeyError as exc:
            raise ValueError(f"Unsupported GPT Image 2 size mapping: aspect_ratio={aspect_ratio}, image_size={image_size}") from exc

    def _build_payload(
        self,
        *,
        prompt: str,
        model: str,
        size: str,
        output_format: str,
        quality: str,
        output_count: int,
        background: str,
        output_compression: int | None,
    ) -> dict[str, str]:
        payload = {
            "model": model,
            "prompt": prompt,
            "size": size,
            "background": background,
            "output_format": output_format,
            "quality": quality,
            "n": str(max(1, output_count)),
        }
        if output_compression is not None:
            payload["output_compression"] = str(output_compression)
        return payload

    def _build_files(self, images: list[GPTImageInput]) -> list[tuple[str, tuple[str, bytes, str]]]:
        if not images:
            raise ValueError("GPT Image 2 图片编辑至少需要一张参考图。")
        return [
            (
                "image",
                (
                    image.filename or f"input-{index}.png",
                    image.data,
                    image.mime_type or "image/png",
                ),
            )
            for index, image in enumerate(images, start=1)
        ]

    def _parse_response(
        self,
        payload: dict[str, Any],
        *,
        size: str,
        output_format: str,
        model: str,
    ) -> GPTImageGenerationResult:
        images: list[GPTImageOutput] = []
        returned_url_count = 0

        for item in payload.get("data", []):
            if not isinstance(item, dict):
                continue
            if item.get("b64_json"):
                try:
                    images.append(
                        GPTImageOutput(
                            data=base64.b64decode(item["b64_json"]),
                            mime_type=self._mime_type_from_output_format(output_format),
                        )
                    )
                except ValueError as exc:
                    raise AIProviderError("DMX GPT Image 2 图片模型返回了不可解析的 base64 图片。") from exc
                continue
            if item.get("url"):
                returned_url_count += 1
                images.append(self._download_image(str(item["url"]), output_format))

        if not images:
            raise AIProviderError("DMX GPT Image 2 图片模型响应中没有找到图片数据。")

        return GPTImageGenerationResult(
            images=images,
            raw_response_summary={
                "image_count": len(images),
                "returned_url_count": returned_url_count,
                "size": size,
                "model": model,
                "output_format": output_format,
            },
        )

    def _download_image(self, url: str, output_format: str) -> GPTImageOutput:
        try:
            response = httpx.get(url, timeout=120, follow_redirects=True, trust_env=False)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise AIProviderError(f"DMX GPT Image 2 图片 URL 下载失败，HTTP {exc.response.status_code}。") from exc
        except httpx.RequestError as exc:
            raise AIProviderError("DMX GPT Image 2 图片 URL 下载失败，请检查网络。") from exc
        content_type = response.headers.get("content-type", "").split(";")[0].strip()
        return GPTImageOutput(data=response.content, mime_type=content_type or self._mime_type_from_output_format(output_format))

    def _mime_type_from_output_format(self, output_format: str) -> str:
        if output_format == "jpeg":
            return "image/jpeg"
        if output_format == "webp":
            return "image/webp"
        return "image/png"

    def _map_http_error(self, status_code: int) -> str:
        if status_code == 400:
            return "DMX GPT Image 2 图片模型参数不兼容，请检查 prompt、图片、比例、尺寸或质量参数。"
        if status_code == 401:
            return "DMXAPI 令牌无效，或令牌与 Base URL 域名不匹配。"
        if status_code == 404:
            return "DMX GPT Image 2 图片编辑接口不存在，请检查 Base URL 或模型名称。"
        if status_code == 429:
            return "DMXAPI 或上游 GPT Image 2 图片模型限流，请稍后重试。"
        if status_code in {500, 503, 524}:
            return "DMXAPI 上游 GPT Image 2 图片模型繁忙或不可用，请稍后重试。"
        return f"DMX GPT Image 2 图片模型调用失败，HTTP {status_code}。"
