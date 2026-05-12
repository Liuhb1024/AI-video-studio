from sqlalchemy import text

from app.core.database import get_engine
from app.db.base import Base

# 导入模型是为了把表注册到 SQLAlchemy metadata。
from app.modules.assets.models import Asset  # noqa: F401
from app.modules.characters.models import Character  # noqa: F401
from app.modules.costs.models import CostRecord  # noqa: F401
from app.modules.final_cuts.models import FinalCut  # noqa: F401
from app.modules.generation.models import GenerateTask  # noqa: F401
from app.modules.project_characters.models import ProjectCharacter  # noqa: F401
from app.modules.projects.models import Project  # noqa: F401
from app.modules.prompts.models import PromptTemplate  # noqa: F401
from app.modules.scenes.models import Scene  # noqa: F401
from app.modules.scripts.models import Script  # noqa: F401
from app.modules.settings.models import SystemSetting  # noqa: F401
from app.modules.shots.models import Shot  # noqa: F401
from app.modules.tags.models import Tag  # noqa: F401
from app.modules.style_templates.models import StyleTemplate  # noqa: F401
from app.modules.world_settings.models import WorldSetting  # noqa: F401


def init_db() -> None:
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    apply_dev_schema_patches(engine)


def apply_dev_schema_patches(engine) -> None:
    """MVP 阶段没有接入 Alembic，先用安全补丁兼容本地旧表结构。"""
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE scripts ADD COLUMN IF NOT EXISTS generation_settings JSON"))
        if engine.dialect.name == "postgresql":
            connection.execute(text("ALTER TABLE shots ALTER COLUMN shot_no TYPE TEXT USING shot_no::TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS script_id VARCHAR(36)"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS story_beat TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS characters JSON DEFAULT '[]'"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS props JSON DEFAULT '[]'"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS camera_angle TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS lighting TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS transition_in TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS transition_out TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS edit_point TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS negative_prompt TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS reference_asset_ids JSON DEFAULT '[]'"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS continuity_constraints JSON DEFAULT '[]'"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS generation_risk TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS simplify_strategy TEXT"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS readiness VARCHAR DEFAULT 'draft'"))
        connection.execute(text("ALTER TABLE shots ADD COLUMN IF NOT EXISTS metadata JSON DEFAULT '{}'"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS rank TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS star TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS origin TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS ip_name TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS role_type TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS liangshan_role TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS weapons TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS personality_tags TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS internal_conflict TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS life_events TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS audience_hook TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS target_audience TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS yingge_role TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS facepaint_main_color TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS color_symbolism TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS facepaint_patterns TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS source_color_clues TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS visual_tone_keywords TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS positive_prompt_terms TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS negative_prompt_terms TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS narrative_origin TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS relationship_map TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS product_tone TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS blessing_meaning TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS appearance TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS costume TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS weapon TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS visual_keywords TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS negative_keywords TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS image_consistency_prompt TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS video_consistency_prompt TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS three_view_prompt TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS negative_prompt TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS reference_asset_ids JSON DEFAULT '[]'"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS reference_asset_id TEXT"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS source_row INTEGER"))
        connection.execute(text("ALTER TABLE characters ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS url TEXT"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS title TEXT"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS note TEXT"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS reference_type TEXT"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS style_board TEXT"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_origin TEXT DEFAULT 'uploaded'"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS generation_type TEXT"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS source_reference_asset_ids JSON DEFAULT '[]'"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS style_template_id TEXT"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS generate_task_id TEXT"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS accepted_for_keyframe BOOLEAN DEFAULT FALSE"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS quality_note TEXT"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE"))
        connection.execute(text("ALTER TABLE assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS character_id VARCHAR(36)"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS generation_type TEXT"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS model_provider TEXT"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS params_json JSON"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS input_asset_ids JSON DEFAULT '[]'"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS style_template_id TEXT"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS prompt_template_id TEXT"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS prompt_version TEXT"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS prompt_text TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS negative_prompt TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS input_snapshot_json JSON"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS output_asset_ids JSON DEFAULT '[]'"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS current_step VARCHAR DEFAULT 'queued'"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS error_code TEXT"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS error_message TEXT"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS retry_of_task_id TEXT"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS cost_json JSON"))
        connection.execute(text("ALTER TABLE generate_tasks ADD COLUMN IF NOT EXISTS estimated_cost FLOAT"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS source_asset_id TEXT"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS cover_asset_id TEXT"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS source_image_url TEXT"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS style_category TEXT"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS visual_summary TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS line_style TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS color_palette TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS lighting_style TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS composition_style TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS character_rendering TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS background_rendering TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS texture_keywords TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS yingge_adaptation TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS image_prompt_template TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS video_prompt_template TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS negative_prompt TEXT DEFAULT ''"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS analysis_model TEXT"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS analysis_version TEXT"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'manual'"))
        connection.execute(text("ALTER TABLE style_templates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'"))
        connection.execute(text("ALTER TABLE project_characters ADD COLUMN IF NOT EXISTS role_in_project TEXT"))
        connection.execute(text("ALTER TABLE project_characters ADD COLUMN IF NOT EXISTS usage_note TEXT"))
        connection.execute(text("ALTER TABLE project_characters ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'selected'"))
        connection.execute(text("ALTER TABLE project_characters ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0"))


if __name__ == "__main__":
    init_db()
