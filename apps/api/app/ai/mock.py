class MockAIProvider:
    name = "mock"

    def generate_text(
        self,
        prompt: str,
        *,
        system_prompt: str | None = None,
        temperature: float = 1.0,
        max_tokens: int | None = None,
        model: str | None = None,
    ) -> str:
        token_suffix = f" / max_tokens={max_tokens}" if max_tokens is not None else ""
        model_suffix = f" / model={model}" if model is not None else ""
        return f"[mock-ai temperature={temperature}{token_suffix}{model_suffix}] {prompt}"
