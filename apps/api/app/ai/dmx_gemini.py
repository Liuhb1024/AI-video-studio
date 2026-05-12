from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from typing import Any

import httpx

from app.ai.dmx import AIProviderError


@dataclass(frozen=True)
class GeminiImageInput:
    data: bytes
    mime_type: str


@dataclass(frozen=True)
class GeminiImageOutput:
    data: bytes
    mime_type: str


@dataclass(frozen=True)
class GeminiImageGenerationResult:
    images: list[GeminiImageOutput]
    text_parts: list[str]
    raw_response_summary: dict[str, Any]


@dataclass(frozen=True)
class DMXGeminiImageProvider:
    api_key: str
    base_url: str
    default_model: str = "gemini-3.1-flash-image-preview"
    timeout_seconds: int = 300
    name: str = "dmx-gemini"

    def generate_images(
        self,
        *,
        prompt: str,
        images: list[GeminiImageInput],
        aspect_ratio: str = "1:1",
        image_size: str = "1K",
        model: str | None = None,
    ) -> GeminiImageGenerationResult:
        payload = self._build_payload(
            prompt=prompt,
            images=images,
            model=model or self.default_model,
            aspect_ratio=aspect_ratio,
            image_size=image_size,
        )
        try:
            response = httpx.post(
                f"{self.base_url.rstrip('/')}/models/{payload['model']}:generateContent",
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": self.api_key,
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
            raise AIProviderError("DMX Gemini 图片模型连接失败，请检查网络或 v1beta Base URL。") from exc
        except json.JSONDecodeError as exc:
            raise AIProviderError("DMX Gemini 图片模型返回了非 JSON 响应。") from exc

        return self._parse_response(response_payload)

    def _build_payload(
        self,
        *,
        prompt: str,
        images: list[GeminiImageInput],
        model: str,
        aspect_ratio: str,
        image_size: str,
    ) -> dict[str, Any]:
        image_parts = [
            {
                "inline_data": {
                    "mime_type": image.mime_type,
                    "data": base64.b64encode(image.data).decode("utf-8"),
                }
            }
            for image in images
        ]
        return {
            "model": model,
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        *image_parts,
                    ]
                }
            ],
            "generationConfig": {
                "responseModalities": ["IMAGE"],
                "imageConfig": {
                    "aspectRatio": aspect_ratio,
                    "imageSize": image_size,
                },
            },
        }

    def _parse_response(self, payload: dict[str, Any]) -> GeminiImageGenerationResult:
        images: list[GeminiImageOutput] = []
        text_parts: list[str] = []

        for candidate in payload.get("candidates", []):
            content = candidate.get("content", {})
            for part in content.get("parts", []):
                if isinstance(part.get("text"), str):
                    text_parts.append(part["text"])
                inline_data = part.get("inlineData") or part.get("inline_data")
                if not isinstance(inline_data, dict):
                    continue
                encoded = inline_data.get("data")
                if not encoded:
                    continue
                mime_type = inline_data.get("mimeType") or inline_data.get("mime_type") or "image/png"
                try:
                    images.append(GeminiImageOutput(data=base64.b64decode(encoded), mime_type=mime_type))
                except ValueError as exc:
                    raise AIProviderError("DMX Gemini 图片模型返回了不可解析的 base64 图片。") from exc

        if not images:
            raise AIProviderError("DMX Gemini 图片模型响应中没有找到图片数据。")

        return GeminiImageGenerationResult(
            images=images,
            text_parts=text_parts,
            raw_response_summary={
                "candidate_count": len(payload.get("candidates", [])),
                "image_count": len(images),
                "text_parts": text_parts,
                "model_version": payload.get("modelVersion"),
                "usage_metadata": payload.get("usageMetadata"),
            },
        )

    def _map_http_error(self, status_code: int) -> str:
        if status_code == 400:
            return "DMX Gemini 图片模型参数不兼容，请检查 prompt、图片数量、比例或清晰度。"
        if status_code == 401:
            return "DMXAPI 令牌无效，或令牌与 Base URL 域名不匹配。"
        if status_code == 404:
            return "DMX Gemini 图片模型接口不存在，请检查 v1beta Base URL 或模型名称。"
        if status_code == 429:
            return "DMXAPI 或上游 Gemini 图片模型限流，请稍后重试。"
        if status_code in {500, 503, 524}:
            return "DMXAPI 上游图片模型繁忙或不可用，请稍后重试。"
        return f"DMX Gemini 图片模型调用失败，HTTP {status_code}。"
