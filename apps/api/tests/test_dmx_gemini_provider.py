import base64

import httpx

from app.ai.dmx_gemini import DMXGeminiImageProvider, GeminiImageInput


def test_dmx_gemini_provider_builds_generate_content_payload(monkeypatch) -> None:
    captured = {}

    def fake_post(url, *, headers, json, timeout, trust_env):
        captured["url"] = url
        captured["headers"] = headers
        captured["json"] = json
        captured["timeout"] = timeout
        captured["trust_env"] = trust_env
        return httpx.Response(
            200,
            request=httpx.Request("POST", url),
            json={
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {"text": "ok"},
                                {"inlineData": {"mimeType": "image/png", "data": base64.b64encode(b"png-bytes").decode()}},
                            ]
                        }
                    }
                ],
                "usageMetadata": {"totalTokenCount": 1120},
            },
        )

    monkeypatch.setattr("httpx.post", fake_post)
    provider = DMXGeminiImageProvider(api_key="sk-test", base_url="https://www.dmxapi.cn/v1beta", default_model="gemini-3.1-flash-image-preview")

    result = provider.generate_images(
        prompt="把真人妆照转成英歌漫剧风格。",
        images=[GeminiImageInput(data=b"input-image", mime_type="image/png")],
        aspect_ratio="3:4",
        image_size="1K",
    )

    assert captured["url"] == "https://www.dmxapi.cn/v1beta/models/gemini-3.1-flash-image-preview:generateContent"
    assert captured["headers"]["x-goog-api-key"] == "sk-test"
    payload = captured["json"]
    assert payload["generationConfig"]["responseModalities"] == ["IMAGE"]
    assert payload["generationConfig"]["imageConfig"] == {"aspectRatio": "3:4", "imageSize": "1K"}
    parts = payload["contents"][0]["parts"]
    assert parts[0]["text"] == "把真人妆照转成英歌漫剧风格。"
    assert parts[1]["inline_data"]["mime_type"] == "image/png"
    assert result.images[0].data == b"png-bytes"
    assert result.text_parts == ["ok"]
    assert result.raw_response_summary["usage_metadata"] == {"totalTokenCount": 1120}


def test_dmx_gemini_provider_passes_new_ratio_and_4k_size(monkeypatch) -> None:
    captured = {}

    def fake_post(url, *, headers, json, timeout, trust_env):
        captured["json"] = json
        return httpx.Response(
            200,
            request=httpx.Request("POST", url),
            json={
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {"inlineData": {"mimeType": "image/png", "data": base64.b64encode(b"png-bytes").decode()}},
                            ]
                        }
                    }
                ],
            },
        )

    monkeypatch.setattr("httpx.post", fake_post)
    provider = DMXGeminiImageProvider(api_key="sk-test", base_url="https://www.dmxapi.cn/v1beta")

    provider.generate_images(
        prompt="生成超宽角色图。",
        images=[GeminiImageInput(data=b"input-image", mime_type="image/png")],
        aspect_ratio="21:9",
        image_size="4K",
    )

    assert captured["json"]["generationConfig"]["imageConfig"] == {"aspectRatio": "21:9", "imageSize": "4K"}
