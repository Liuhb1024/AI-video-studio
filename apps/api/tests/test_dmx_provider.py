import httpx

from app.ai.dmx import DMXAIProvider


def test_dmx_provider_sends_openai_compatible_chat_request(monkeypatch) -> None:
    captured = {}

    def fake_post(url, *, headers, json, timeout, trust_env):
        captured["url"] = url
        captured["headers"] = headers
        captured["timeout"] = timeout
        captured["trust_env"] = trust_env
        captured["body"] = json
        return httpx.Response(
            200,
            request=httpx.Request("POST", url),
            json={
                "choices": [
                    {
                        "message": {
                            "content": "{\"title\":\"测试剧本\",\"timeline\":[]}",
                        },
                    },
                ],
            },
        )

    monkeypatch.setattr("app.ai.dmx.httpx.post", fake_post)

    provider = DMXAIProvider(
        api_key="sk-test",
        base_url="https://www.dmxapi.cn/v1",
        default_model="gemini-3.1-flash-lite-preview",
        timeout_seconds=12,
    )

    content = provider.generate_text(
        "用户输入",
        system_prompt="系统指令",
        model="gemini-3.1-flash-lite-preview",
        temperature=1.0,
        max_tokens=4000,
    )

    assert content == "{\"title\":\"测试剧本\",\"timeline\":[]}"
    assert captured["url"] == "https://www.dmxapi.cn/v1/chat/completions"
    assert captured["headers"]["Authorization"] == "sk-test"
    assert captured["timeout"] == 12
    assert captured["trust_env"] is False
    assert captured["body"]["model"] == "gemini-3.1-flash-lite-preview"
    assert captured["body"]["temperature"] == 1.0
    assert captured["body"]["max_tokens"] == 4000
    assert captured["body"]["messages"] == [
        {"role": "system", "content": "系统指令"},
        {"role": "user", "content": "用户输入"},
    ]


def test_dmx_provider_sends_multimodal_image_analysis_request(monkeypatch) -> None:
    captured = {}

    def fake_post(url, *, headers, json, timeout, trust_env):
        captured["url"] = url
        captured["headers"] = headers
        captured["body"] = json
        return httpx.Response(
            200,
            request=httpx.Request("POST", url),
            json={
                "choices": [
                    {
                        "message": {
                            "content": "{\"style_category\":\"暗色电影国漫\",\"visual_summary\":\"测试摘要\"}",
                        },
                    },
                ],
            },
        )

    monkeypatch.setattr("app.ai.dmx.httpx.post", fake_post)

    provider = DMXAIProvider(
        api_key="sk-test",
        base_url="https://www.dmxapi.cn/v1",
        default_model="gpt-5.4-nano",
        timeout_seconds=12,
    )

    content = provider.analyze_image(
        "https://example.com/style.png",
        "识别风格并输出 JSON",
        system_prompt="你是视觉导演",
        model="gpt-5.4-nano",
        temperature=1.0,
    )

    assert content == "{\"style_category\":\"暗色电影国漫\",\"visual_summary\":\"测试摘要\"}"
    assert captured["url"] == "https://www.dmxapi.cn/v1/chat/completions"
    assert captured["headers"]["Authorization"] == "sk-test"
    assert captured["body"]["model"] == "gpt-5.4-nano"
    assert captured["body"]["temperature"] == 1.0
    assert captured["body"]["messages"][0] == {"role": "system", "content": "你是视觉导演"}
    assert captured["body"]["messages"][1]["role"] == "user"
    assert captured["body"]["messages"][1]["content"][0] == {"type": "text", "text": "识别风格并输出 JSON"}
    assert captured["body"]["messages"][1]["content"][1] == {
        "type": "image_url",
        "image_url": {"url": "https://example.com/style.png"},
    }
