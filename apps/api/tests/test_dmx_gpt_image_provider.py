import base64

import httpx

from app.ai.dmx_gpt_image import DMXGPTImageProvider, GPTImageInput


def test_dmx_gpt_image_provider_builds_multipart_edit_payload(monkeypatch) -> None:
    captured = {}

    def fake_post(url, *, headers, data, files, timeout, trust_env):
        captured["url"] = url
        captured["headers"] = headers
        captured["data"] = data
        captured["files"] = files
        captured["timeout"] = timeout
        captured["trust_env"] = trust_env
        return httpx.Response(
            200,
            request=httpx.Request("POST", url),
            json={"data": [{"b64_json": base64.b64encode(b"generated-png").decode()}]},
        )

    monkeypatch.setattr("httpx.post", fake_post)
    provider = DMXGPTImageProvider(api_key="sk-test", base_url="https://www.dmxapi.cn/v1")

    result = provider.generate_images(
        prompt="把真人妆照转成英歌漫剧风格。",
        images=[GPTImageInput(data=b"input-image", mime_type="image/png", filename="front.png")],
        aspect_ratio="16:9",
        image_size="4K",
    )

    assert captured["url"] == "https://www.dmxapi.cn/v1/images/edits"
    assert captured["headers"] == {"Authorization": "Bearer sk-test"}
    assert captured["data"] == {
        "model": "gpt-image-2-ssvip",
        "prompt": "把真人妆照转成英歌漫剧风格。",
        "size": "3840x2160",
        "background": "auto",
        "output_format": "png",
        "quality": "auto",
        "n": "1",
    }
    assert captured["files"] == [("image", ("front.png", b"input-image", "image/png"))]
    assert captured["timeout"] == 300
    assert captured["trust_env"] is False
    assert result.images[0].data == b"generated-png"
    assert result.images[0].mime_type == "image/png"
    assert result.raw_response_summary["image_count"] == 1
    assert result.raw_response_summary["size"] == "3840x2160"


def test_dmx_gpt_image_provider_downloads_url_response(monkeypatch) -> None:
    calls = []

    def fake_post(url, *, headers, data, files, timeout, trust_env):
        calls.append(("post", url))
        return httpx.Response(
            200,
            request=httpx.Request("POST", url),
            json={"data": [{"url": "https://cdn.test/generated.webp"}]},
        )

    def fake_get(url, *, timeout, follow_redirects, trust_env):
        calls.append(("get", url, timeout, follow_redirects, trust_env))
        return httpx.Response(
            200,
            request=httpx.Request("GET", url),
            content=b"webp-bytes",
            headers={"content-type": "image/webp"},
        )

    monkeypatch.setattr("httpx.post", fake_post)
    monkeypatch.setattr("httpx.get", fake_get)
    provider = DMXGPTImageProvider(api_key="sk-test", base_url="https://www.dmxapi.cn/v1")

    result = provider.generate_images(
        prompt="编辑图片",
        images=[GPTImageInput(data=b"input-image", mime_type="image/jpeg", filename="front.jpg")],
        aspect_ratio="3:4",
        image_size="2K",
        output_format="webp",
    )

    assert calls == [
        ("post", "https://www.dmxapi.cn/v1/images/edits"),
        ("get", "https://cdn.test/generated.webp", 120, True, False),
    ]
    assert result.images[0].data == b"webp-bytes"
    assert result.images[0].mime_type == "image/webp"
    assert result.raw_response_summary["returned_url_count"] == 1


def test_dmx_gpt_image_provider_rejects_unknown_size_mapping() -> None:
    provider = DMXGPTImageProvider(api_key="sk-test", base_url="https://www.dmxapi.cn/v1")

    try:
        provider.generate_images(
            prompt="编辑图片",
            images=[GPTImageInput(data=b"input-image", mime_type="image/png", filename="front.png")],
            aspect_ratio="5:4",
            image_size="1K",
        )
    except ValueError as exc:
        assert "Unsupported GPT Image 2 size mapping" in str(exc)
    else:
        raise AssertionError("Expected unsupported mapping to fail")
