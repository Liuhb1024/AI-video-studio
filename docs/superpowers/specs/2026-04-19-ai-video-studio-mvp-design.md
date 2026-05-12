# AI Video Studio MVP Design

## Goal

Build an internal production workstation for AI 英歌漫剧 creation. MVP focuses on one usable production loop:

`Project -> Script -> Scene -> Shot Card -> Prompt -> Generation Task -> Asset -> Final Cut -> Cost Review`

## Product Principles

- Shot Card is the core production unit.
- Assets must be reusable, not one-off output.
- AI output stays semi-automatic: system drafts, human confirms.
- Every generated result keeps prompt, model, parameters, asset, and cost trace.
- Code maps directly to product modules for readability.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS.
- Backend: Python FastAPI.
- Database: PostgreSQL on local port `5433` to avoid colliding with existing local Postgres containers.
- ORM: SQLAlchemy with Alembic migrations.
- Storage: Tencent COS for MVP, behind a storage abstraction.
- AI: Provider abstraction with mock provider first; real third-party APIs added later.
- Tasks: synchronous MVP task records first; Redis worker can be added later.

## Repository Layout

```text
apps/
  api/                    # FastAPI backend
  web/                    # Next.js frontend
infra/
  docker-compose.yml      # PostgreSQL and optional services
docs/
  superpowers/
    specs/
    plans/
```

## Backend Module Rules

Every business module lives under `apps/api/app/modules/<module_name>/`.

Common files:

```text
models.py        # SQLAlchemy models
schemas.py       # Pydantic request/response DTOs
router.py        # FastAPI routes
service.py       # Business logic
repository.py    # Database access
constants.py     # Enums and status values when useful
```

MVP modules:

- `projects`
- `scripts`
- `scenes`
- `shots`
- `characters`
- `world_settings`
- `tags`
- `prompts`
- `generation`
- `assets`
- `final_cuts`
- `costs`
- `settings`

## Frontend Module Rules

App routes map to product navigation:

```text
/workbench
/projects
/scripts
/shots
/characters
/generation
/assets
/final-cuts
/dashboard
/settings
```

Feature code lives under `apps/web/src/features/<feature_name>/`. Shared layout/UI code lives under `apps/web/src/components`.

## Core Data Objects

### Project

Container for all production data.

Key fields:

- `id`
- `name`
- `summary`
- `ip_name`
- `genre`
- `visual_style`
- `stage`
- `cover_asset_id`
- `created_at`
- `updated_at`

### Script and Scene

Script stores source text and versions. Scene stores structured story sections extracted from scripts.

Key fields:

- `script.project_id`
- `script.title`
- `script.version`
- `script.content`
- `script.status`
- `scene.script_id`
- `scene.order_index`
- `scene.title`
- `scene.summary`
- `scene.raw_text`

### Shot

Core production unit.

Key fields:

- `project_id`
- `scene_id`
- `shot_no`
- `description`
- `setting`
- `emotion`
- `action`
- `expression`
- `shot_size`
- `composition`
- `camera_movement`
- `duration_seconds`
- `image_prompt`
- `video_prompt`
- `status`

### Character

Reusable IP asset for visual consistency.

Key fields:

- `name`
- `alias`
- `bio`
- `appearance`
- `costume`
- `weapon`
- `personality_tags`
- `visual_keywords`
- `negative_keywords`
- `reference_asset_id`

### Asset

Metadata record for files stored in COS.

Key fields:

- `project_id`
- `shot_id`
- `character_id`
- `asset_type`
- `filename`
- `mime_type`
- `size_bytes`
- `provider`
- `bucket`
- `region`
- `object_key`
- `thumbnail_key`
- `width`
- `height`
- `duration_seconds`
- `status`

### GenerateTask

Record of prompt execution and model result.

Key fields:

- `task_type`
- `project_id`
- `shot_id`
- `model_name`
- `model_version`
- `parameters`
- `input_prompt`
- `raw_response`
- `output_asset_id`
- `status`
- `cost_record_id`

## Tencent COS Storage Design

Bucket stays private. Backend generates signed URLs for upload/download/preview. Code never stores real secrets.

Environment variables:

```env
COS_SECRET_ID=
COS_SECRET_KEY=
COS_BUCKET=ai-video-1322336489
COS_REGION=ap-guangzhou
```

Object key pattern:

```text
projects/{project_id}/characters/{character_id}/refs/{asset_id}.{ext}
projects/{project_id}/shots/{shot_id}/keyframes/{asset_id}.{ext}
projects/{project_id}/shots/{shot_id}/videos/{asset_id}.{ext}
projects/{project_id}/final-cuts/{final_cut_id}/{asset_id}.{ext}
projects/{project_id}/assets/{asset_type}/{asset_id}.{ext}
```

MVP upload flow:

```text
Frontend -> FastAPI upload endpoint -> COS -> Asset DB record
```

Later direct upload flow:

```text
Frontend -> presign endpoint -> COS direct upload -> Asset finalize endpoint
```

## AI Prompt Architecture

Prompts are not scattered in route handlers. They live in files and can later be overridden by database prompt templates.

```text
apps/api/app/ai/
  providers/
    base.py
    mock.py
  prompts/
    script_generate/
      system.md
      user_template.md
      output_schema.json
    scene_split/
    shot_generate/
    image_prompt/
    video_prompt/
  prompt_engine.py
```

AI call flow:

```text
Business data -> PromptEngine -> AIProvider -> Schema validation -> Save task/result/cost
```

## MVP Phases

### Phase 1: Foundation

- Monorepo layout.
- FastAPI backend skeleton.
- Next.js frontend skeleton.
- PostgreSQL Docker setup.
- Tencent COS configuration and storage abstraction.
- Health checks and initial tests.

### Phase 2: Project and Asset Base

- Project CRUD.
- Asset upload/list/preview URL/delete.
- COS integration.
- Workbench project summary.

### Phase 3: IP Assets

- Character CRUD.
- Character reference image upload.
- World setting text records.
- Tag base management.

### Phase 4: Script and Shot Flow

- Script create/edit/version.
- Scene split mock AI.
- Shot card CRUD.
- Shot sorting and status.

### Phase 5: Prompt and Generation

- Prompt templates.
- Image prompt generation.
- Video prompt generation.
- GenerateTask history.
- CostRecord basics.

### Phase 6: Archive and Dashboard

- FinalCut upload/link.
- Dashboard stats.
- Project-level review page.

## Testing Strategy

- Backend unit tests for config, storage key generation, and service logic.
- Backend API tests for health and key CRUD endpoints.
- Frontend smoke tests through build/lint first.
- No success claim without running relevant verification.

## Security Notes

- Never commit `.env`.
- Never hardcode COS keys.
- Bucket private by default.
- Preview/download through short-lived signed URLs.
- Rotate exposed cloud keys before production.
