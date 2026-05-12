from __future__ import annotations

from pathlib import Path


class PromptEngine:
    def __init__(self, template_dir: str | Path | None = None) -> None:
        self.template_dir = Path(template_dir or Path(__file__).resolve().parent / "prompts")

    def render_user_prompt(self, prompt_name: str, **context: object) -> str:
        template_path = self.template_dir / prompt_name / "user_template.md"
        template = template_path.read_text(encoding="utf-8")
        return template.format(**context)

    def load_system_prompt(self, prompt_name: str) -> str:
        return (self.template_dir / prompt_name / "system.md").read_text(encoding="utf-8")
