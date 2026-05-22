# Backend Phase 6 Seed Mock Data + 第一批 GET API 计划

## 当前后端状态

- Backend Phase 2 已完成 FastAPI 后端骨架。
- Backend Phase 3 已完成 SQLAlchemy Base/Session、Alembic 初始化和 `/api/health/db`。
- Backend Phase 4 已完成第一批 P0 ORM 模型并真实建表。
- Backend Phase 5 已完成 Prompt / Task / Asset / Review / Cost / Export 闭环模型并真实建表。
- 当前独立 PostgreSQL 容器为 `yingge-postgres`，端口映射 `5434:5432`，数据库 `yingge_studio`，volume `yingge_pg_data`。
- 当前 Alembic head 应为 `4ecfe89d7af3`。
- 当前阶段只做 seed 数据和第一批只读 GET API，不做 POST/PATCH，不接真实模型 API，不做真实任务队列。

## 已有数据库表

已存在：

- `projects`
- `characters`
- `character_bibles`
- `scripts`
- `shots`
- `panels`
- `prompt_drafts`
- `generation_tasks`
- `assets`
- `image_assets`
- `video_assets`
- `audio_assets`
- `subtitle_assets`
- `asset_reviews`
- `failure_reasons`
- `reflection_notes`
- `cost_records`
- `export_plans`
- `alembic_version`

## 本轮 seed 数据范围

使用 `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/` 作为参考，只在后端 seed 脚本中手工写入最小闭环数据，不修改前端 mock 文件。

写入：

- 1 个 Project：`英歌水浒人物介绍片`
- 1 个 Character：`武松`
- 1 个 CharacterBible：武松五层角色圣经
- 1 个 Script：`武松英歌角色介绍短片`
- 6 个 Shot
- 12 个 Panel
- 每个 Shot 1 条 image prompt 和 1 条 video prompt
- 若干 GenerationTask：image / video / tts，状态覆盖 succeeded / running / failed / queued
- 若干 Asset：image / video / audio / subtitle，至少包含 accepted、candidate、rejected
- 对应 ImageAsset / VideoAsset / AudioAsset / SubtitleAsset 扩展表记录
- AssetReview：accepted / rejected / needs_retry
- FailureReason：常见失败原因
- ReflectionNote：3-5 条反思建议
- CostRecord：estimated / actual
- 1 个 ExportPlan

seed 必须可重复执行：

- 不 drop 表。
- 不 truncate 表。
- 不删除已有数据。
- 通过固定 UUID 或唯一字段判断已存在记录，避免重复插入核心数据。

## 本轮 GET API 范围

必须实现：

- `GET /api/v1/projects`
- `GET /api/v1/projects/{project_id}`
- `GET /api/v1/characters`
- `GET /api/v1/characters/{character_id}`
- `GET /api/v1/characters/{character_id}/bible`
- `GET /api/v1/projects/{project_id}/script`
- `GET /api/v1/scripts/{script_id}/shots`
- `GET /api/v1/shots/{shot_id}/panels`

可控范围内顺手实现：

- `GET /api/v1/projects/{project_id}/tasks`
- `GET /api/v1/projects/{project_id}/assets`
- `GET /api/v1/projects/{project_id}/costs`
- `GET /api/v1/projects/{project_id}/export-plan`

本轮不实现任何 POST/PATCH 业务接口。

## 将要创建/修改的文件

计划文件：

- `docs/changes/backend-phase-6-seed-get-api-plan.md`

Seed：

- `yingge-app/backend/scripts/seed_mock_data.py`

Schemas：

- `yingge-app/backend/app/schemas/project.py`
- `yingge-app/backend/app/schemas/character.py`
- `yingge-app/backend/app/schemas/script.py`
- `yingge-app/backend/app/schemas/shot.py`
- `yingge-app/backend/app/schemas/panel.py`
- `yingge-app/backend/app/schemas/prompt.py`
- `yingge-app/backend/app/schemas/generation_task.py`
- `yingge-app/backend/app/schemas/asset.py`
- `yingge-app/backend/app/schemas/review.py`
- `yingge-app/backend/app/schemas/cost.py`
- `yingge-app/backend/app/schemas/export_plan.py`

Repositories：

- `yingge-app/backend/app/repositories/project_repository.py`
- `yingge-app/backend/app/repositories/character_repository.py`
- `yingge-app/backend/app/repositories/script_repository.py`
- `yingge-app/backend/app/repositories/shot_repository.py`
- `yingge-app/backend/app/repositories/prompt_repository.py`
- `yingge-app/backend/app/repositories/generation_task_repository.py`
- `yingge-app/backend/app/repositories/asset_repository.py`
- `yingge-app/backend/app/repositories/review_repository.py`
- `yingge-app/backend/app/repositories/cost_repository.py`
- `yingge-app/backend/app/repositories/export_plan_repository.py`

Services：

- `yingge-app/backend/app/services/project_service.py`
- `yingge-app/backend/app/services/character_service.py`
- `yingge-app/backend/app/services/script_service.py`
- `yingge-app/backend/app/services/storyboard_service.py`
- `yingge-app/backend/app/services/prompt_service.py`
- `yingge-app/backend/app/services/generation_task_service.py`
- `yingge-app/backend/app/services/asset_service.py`
- `yingge-app/backend/app/services/review_service.py`
- `yingge-app/backend/app/services/cost_service.py`
- `yingge-app/backend/app/services/export_plan_service.py`

Endpoints：

- `yingge-app/backend/app/api/v1/endpoints/projects.py`
- `yingge-app/backend/app/api/v1/endpoints/characters.py`
- `yingge-app/backend/app/api/v1/endpoints/scripts.py`
- `yingge-app/backend/app/api/v1/endpoints/shots.py`
- `yingge-app/backend/app/api/v1/endpoints/panels.py`
- `yingge-app/backend/app/api/v1/endpoints/prompts.py`
- `yingge-app/backend/app/api/v1/endpoints/generation_tasks.py`
- `yingge-app/backend/app/api/v1/endpoints/assets.py`
- `yingge-app/backend/app/api/v1/endpoints/reviews.py`
- `yingge-app/backend/app/api/v1/endpoints/costs.py`
- `yingge-app/backend/app/api/v1/endpoints/exports.py`
- `yingge-app/backend/app/api/v1/router.py`

测试和文档：

- `yingge-app/backend/tests/api/test_v1_read_endpoints.py`
- `yingge-app/backend/tests/scripts/test_seed_mock_data.py`
- `yingge-app/backend/README.md`

## repository / service / schema / endpoint 分层方案

- endpoint：只接收 HTTP 参数、注入 `Session`、调用 service、返回 schema，不直接查库，不调用 AI。
- service：组织 repository 查询结果，本轮只做只读聚合，不做真实生成。
- repository：只做 SQLAlchemy 查询，不返回 FastAPI response，不写业务流程。
- schema：使用 Pydantic v2，第一批以 Read/ListItem 为主，enum 输出字符串。
- seed：使用 SQLAlchemy SessionLocal + ORM 模型写入，不清空、不删除、不读取真实 `.env`。

## TablePlus 人工验收方式

连接：

- Host: `127.0.0.1`
- Port: `5434`
- User: `postgres`
- Password: `postgres`
- Database: `yingge_studio`

应能看到：

- `characters` 表中有 `武松`
- `character_bibles` 表中有武松角色圣经
- `projects` 表中有 `英歌水浒人物介绍片`
- `scripts` 表中有 `武松英歌角色介绍短片`
- `shots` 表中有 6 条 shot
- `panels` 表中有 12 条 panel
- `prompt_drafts` 表中有 image/video prompt
- `generation_tasks` 表中有 mock 任务
- `assets` 表中有 mock 素材
- `asset_reviews` 表中有审核记录
- `failure_reasons` 表中有失败原因
- `reflection_notes` 表中有反思建议
- `cost_records` 表中有成本记录
- `export_plans` 表中有导出方案

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不修改 `/Users/huabi/code/AI-video-studio/yingge-app/frontend/`。
- 不读取 `.env`、key、token、证书文件。
- 不接真实模型 API。
- 不做真实任务队列。
- 不做文件上传。
- 不做登录权限。
- 不实现 POST/PATCH 业务 API。
- 不做前端切 API。
- 不做前端联调。
- 不 drop / truncate 数据库表。
- 不删除已有数据。
- 不删除 Docker 容器。
- 不删除 Docker volume。
- 不操作 5432 / 5433 上的已有数据库。

## 验收标准

- `yingge-postgres` 正在运行，使用端口 `5434:5432`。
- `uv run alembic current` 返回 `4ecfe89d7af3`。
- `/api/health/db` 真实返回 reachable。
- `uv run python scripts/seed_mock_data.py` 成功，并可重复执行。
- TablePlus / SQL 查询能看到最小闭环业务数据。
- Swagger `/docs` 能看到第一批 GET API。
- curl 能访问核心 GET API。
- `uv run pytest` 通过。
- `uv run ruff check app tests` 通过。
- `uv run ruff format --check app tests` 通过。
- README 已补充 seed、Swagger、GET API、TablePlus 验收说明。
