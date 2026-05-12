from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

import httpx


class AIProviderError(RuntimeError):
    def __init__(self, message: str, *, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


@dataclass(frozen=True)
class DMXAIProvider:
    api_key: str
    base_url: str
    default_model: str
    timeout_seconds: int = 120
    name: str = "dmx"

    def generate_text(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        temperature: float = 1.0,
        max_tokens: int | None = None,
        model: str | None = None,
    ) -> str:
        payload: dict[str, Any] = {
            "model": model or self.default_model,
            "temperature": temperature,
            "messages": self._build_messages(prompt, system_prompt),
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        try:
            response = httpx.post(
                f"{self.base_url.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": self.api_key,
                    "Content-Type": "application/json",
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
            raise AIProviderError("模型网关连接失败，请检查网络或 DMXAPI 地址。") from exc
        except json.JSONDecodeError as exc:
            raise AIProviderError("模型网关返回了非 JSON 响应。") from exc

        try:
            return response_payload["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise AIProviderError("模型网关响应缺少 choices[0].message.content。") from exc

    def analyze_image(
        self,
        image_url: str,
        prompt: str,
        *,
        system_prompt: str | None = None,
        temperature: float = 1.0,
        max_tokens: int | None = None,
        model: str | None = None,
    ) -> str:
        payload: dict[str, Any] = {
            "model": model or self.default_model,
            "temperature": temperature,
            "messages": self._build_multimodal_messages(image_url, prompt, system_prompt),
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        try:
            response = httpx.post(
                f"{self.base_url.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": self.api_key,
                    "Content-Type": "application/json",
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
            raise AIProviderError("模型网关连接失败，请检查网络或 DMXAPI 地址。") from exc
        except json.JSONDecodeError as exc:
            raise AIProviderError("模型网关返回了非 JSON 响应。") from exc

        try:
            return response_payload["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise AIProviderError("模型网关响应缺少 choices[0].message.content。") from exc

    def _build_messages(self, prompt: str, system_prompt: str | None) -> list[dict[str, str]]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return messages

    def _build_multimodal_messages(self, image_url: str, prompt: str, system_prompt: str | None) -> list[dict[str, Any]]:
        messages: list[dict[str, Any]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append(
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        )
        return messages

    def _map_http_error(self, status_code: int) -> str:
        if status_code == 400:
            return "模型参数不兼容或输出格式请求无效。"
        if status_code == 401:
            return "DMXAPI 令牌无效，或令牌与 Base URL 域名不匹配。"
        if status_code == 404:
            return "DMXAPI 接口地址不存在，请检查 Base URL 是否包含 /v1。"
        if status_code == 429:
            return "DMXAPI 或上游模型限流，请稍后重试。"
        if status_code in {500, 503, 524}:
            return "DMXAPI 上游通道繁忙或模型不可用，请检查模型名称或稍后重试。"
        return f"DMXAPI 调用失败，HTTP {status_code}。"
