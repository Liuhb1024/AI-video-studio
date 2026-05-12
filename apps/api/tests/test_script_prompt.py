import json

from app.ai.script_prompt import SCRIPT_PROMPT_VERSION, build_script_user_prompt
from app.modules.projects.models import Project
from app.modules.scripts.schemas import ScriptGenerationRequest


def test_build_script_user_prompt_keeps_aspect_ratio_out_and_includes_taboos() -> None:
    project = Project(
        name="岭南夜巡",
        summary="英歌短剧项目",
        ip_name="英歌少年宇宙",
        genre="民俗奇幻",
        visual_style="暗色电影感",
    )
    payload = ScriptGenerationRequest(
        story_seed="夜里听见祠堂鼓点，少年循声走入老街。",
        duration_seconds=60,
        platform="抖音",
        aspect_ratio="9:16",
        taboos=["避免戏谑民俗", "避免低俗化"],
    )

    prompt = build_script_user_prompt(project, payload)
    data = json.loads(prompt)

    assert "aspect_ratio" not in prompt
    assert data["script_constraints"]["duration_seconds"] == 60
    assert data["style_controls"]["taboos"] == ["避免戏谑民俗", "避免低俗化"]
    assert data["output_contract"]["prompt_version"] == SCRIPT_PROMPT_VERSION
