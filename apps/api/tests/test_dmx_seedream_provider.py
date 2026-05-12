import httpx

from app.ai.dmx_seedream import DMXSeedreamImageProvider, SeedreamImageInput


def test_dmx_seedream_provider_builds_responses_payload_and_downloads_output(monkeypatch) -> None:
    calls = []
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
                "id": "resp-test",
                "status": "completed",
                "output": [
                    {
                        "type": "image_url",
                        "image_url": {"url": "https://cdn.test/seedream.png"},
                    }
                ],
                "usage": {"total_tokens": 6600},
            },
        )

    def fake_get(url, *, timeout, follow_redirects, trust_env):
        calls.append(("get", url, timeout, follow_redirects, trust_env))
        return httpx.Response(
            200,
            request=httpx.Request("GET", url),
            content=b"seedream-png",
            headers={"content-type": "image/png"},
        )

    monkeypatch.setattr("httpx.post", fake_post)
    monkeypatch.setattr("httpx.get", fake_get)
    provider = DMXSeedreamImageProvider(api_key="sk-test", base_url="https://www.dmxapi.cn/v1")

    result = provider.generate_images(
        prompt="生成角色四视图。",
        images=[SeedreamImageInput(data=b"input-image", mime_type="image/png")],
        image_size="4K",
        output_format="png",
    )

    assert captured["url"] == "https://www.dmxapi.cn/v1/responses"
    assert captured["headers"] == {"Content-Type": "application/json", "Authorization": "sk-test"}
    assert captured["json"]["model"] == "doubao-seedream-5.0-lite"
    assert captured["json"]["input"] == "生成角色四视图。"
    assert captured["json"]["size"] == "3K"
    assert captured["json"]["image"] == ["data:image/png;base64,aW5wdXQtaW1hZ2U="]
    assert captured["json"]["sequential_image_generation"] == "disabled"
    assert captured["json"]["sequential_image_generation_options"] == {"max_images": 1}
    assert captured["json"]["stream"] is False
    assert captured["json"]["output_format"] == "png"
    assert captured["json"]["response_format"] == "url"
    assert captured["json"]["watermark"] is False
    assert captured["json"]["optimize_prompt_options"] == {"mode": "standard"}
    assert captured["timeout"] == 300
    assert captured["trust_env"] is False
    assert calls == [("get", "https://cdn.test/seedream.png", 120, True, False)]
    assert result.images[0].data == b"seedream-png"
    assert result.images[0].mime_type == "image/png"
    assert result.raw_response_summary["image_count"] == 1
    assert result.raw_response_summary["resolved_size"] == "3K"


def test_dmx_seedream_provider_rejects_missing_reference_images() -> None:
    provider = DMXSeedreamImageProvider(api_key="sk-test", base_url="https://www.dmxapi.cn/v1")

    try:
        provider.generate_images(prompt="生成角色四视图。", images=[])
    except ValueError as exc:
        assert "至少需要一张参考图" in str(exc)
    else:
        raise AssertionError("Expected missing images to fail")
