# Backend Phase 5 P0/P1 ORM 第二批计划

## 当前后端状态

- Backend Phase 2 已完成 FastAPI 后端骨架，目录位于 `/Users/huabi/code/AI-video-studio/yingge-app/backend/`。
- Backend Phase 3 已完成 SQLAlchemy Base/Session、Alembic 初始化和 `/api/health/db`。
- Backend Phase 4 已完成第一批 P0 ORM 模型，并通过 Alembic 真实建表到独立 PostgreSQL 容器。
- 当前独立 PostgreSQL 容器为 `yingge-postgres`，端口映射 `5434:5432`，数据库 `yingge_studio`，volume `yingge_pg_data`。
- 当前 Alembic head 应为 `51238682fed0`。
- 当前阶段只做第二批 ORM 模型和 Alembic migration，不实现 CRUD API、repository、service、seed、真实模型 API 或真实任务队列。

## 已有表和关系

已有表：

- `projects`
- `characters`
- `character_bibles`
- `scripts`
- `shots`
- `panels`
- `alembic_version`

已有关系：

- `Project -> Script` 一对多。
- `Character -> CharacterBible` 一对一。
- `Character -> Script` 一对多。
- `Character -> Shot` 一对多。
- `Script -> Shot` 一对多。
- `Shot -> Panel` 一对多。

## 将要创建/修改的文件

计划文件：

- `docs/changes/backend-phase-5-p0-orm-batch2-plan.md`

后端模型：

- `yingge-app/backend/app/models/prompt.py`
- `yingge-app/backend/app/models/generation_task.py`
- `yingge-app/backend/app/models/asset.py`
- `yingge-app/backend/app/models/review.py`
- `yingge-app/backend/app/models/failure_reason.py`
- `yingge-app/backend/app/models/reflection.py`
- `yingge-app/backend/app/models/cost.py`
- `yingge-app/backend/app/models/export_plan.py`
- `yingge-app/backend/app/models/enums.py`
- `yingge-app/backend/app/models/__init__.py`

测试：

- `yingge-app/backend/tests/models/test_metadata.py`

迁移：

- `yingge-app/backend/alembic/versions/<revision>_create_prompt_task_asset_review_cost_export_tables.py`

## 第二批 ORM 模型范围

本阶段实现：

- `PromptDraft`
- `GenerationTask`
- `Asset`
- `ImageAsset`
- `VideoAsset`
- `AudioAsset`
- `SubtitleAsset`
- `AssetReview`
- `FailureReason`
- `ReflectionNote`
- `CostRecord`
- `ExportPlan`

暂不实现：

- `ModelProvider`
- `ModelConfig`
- `AgentRun`
- `SkillConfig`
- `User`
- `Scene`
- `CharacterAppearance`

## 表关系设计

- `Project -> PromptDraft / GenerationTask / Asset / AssetReview / CostRecord / ExportPlan` 一对多。
- `Script -> PromptDraft` 一对多。
- `Shot -> PromptDraft / GenerationTask / Asset / AssetReview / ReflectionNote` 一对多。
- `Panel -> PromptDraft / GenerationTask / Asset / AssetReview / ReflectionNote` 一对多。
- `PromptDraft -> GenerationTask / Asset / ReflectionNote` 一对多。
- `GenerationTask -> Asset / CostRecord / ReflectionNote` 一对多。
- `Asset -> ImageAsset / VideoAsset / AudioAsset / SubtitleAsset` 一对一。
- `Asset -> AssetReview / CostRecord / ReflectionNote` 一对多。
- `ExportPlan -> Project` 多对一。

为避免本阶段引入复杂循环，关系优先在第二批模型侧建立；必要时只保留 foreign key 和单向 relationship，后续 CRUD 阶段再补齐反向访问。

## Enum 设计

在 `app/models/enums.py` 追加，不破坏 Phase 4 已有 enum：

- `prompt_type`: `image`、`video`、`negative`、`tts`、`storyboard`、`script`
- `prompt_status`: `draft`、`optimized`、`locked`、`deprecated`
- `generation_task_type`: `image`、`video`、`tts`、`subtitle`、`prompt_optimize`
- `generation_task_status`: `pending`、`queued`、`running`、`succeeded`、`failed`、`cancelled`
- `asset_type`: `image`、`video`、`audio`、`subtitle`
- `asset_status`: `candidate`、`accepted`、`rejected`、`archived`
- `review_status`: `pending`、`accepted`、`rejected`、`needs_retry`
- `failure_reason_code`: `character_inconsistent`、`face_pattern_wrong`、`color_wrong`、`scene_mismatch`、`style_drift`、`yingge_motion_wrong`、`motion_too_strong`、`motion_too_weak`、`bad_anatomy`、`duration_mismatch`、`model_error`、`prompt_weak`
- `cost_record_type`: `estimated`、`actual`、`adjustment`
- `reflection_severity`: `info`、`warning`、`error`
- `export_plan_status`: `draft`、`ready`、`exported`

PostgreSQL enum type 名称必须和上述 snake_case 名称一致。

## Alembic migration 方案

1. 预检 Docker 容器：
   - 只检查并使用 `yingge-postgres`。
   - 如果存在但未运行，只执行 `docker start yingge-postgres`。
   - 如果不存在，停止任务并说明，不创建其他容器。
2. 使用：
   - `DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5434/yingge_studio`
3. 在后端目录确认：
   - `uv run alembic current` 返回 Phase 4 head `51238682fed0`。
   - `/api/health/db` 返回 reachable。
4. 创建 ORM 模型并更新 `app/models/__init__.py`。
5. 更新 metadata 测试，确保 `Base.metadata.tables` 包含第一批和第二批全部业务表。
6. 执行：
   - `uv run alembic revision --autogenerate -m "create prompt task asset review cost export tables"`
   - `uv run alembic upgrade head`
7. 使用 `uv run alembic current` 和 `docker exec -i yingge-postgres psql -U postgres -d yingge_studio -c "\dt"` 验证真实建表。

所有业务表必须由 SQLAlchemy ORM -> Alembic autogenerate -> migration -> upgrade head 创建，禁止手写 SQL 直接建表。

## metadata 字段处理规范

SQLAlchemy Declarative 保留 `metadata` 作为类属性，不允许 ORM Python 属性直接命名为 `metadata`。

本阶段所有数据库列名为 `metadata` 的字段统一写为：

```python
metadata_ = mapped_column("metadata", JSONB, nullable=True)
```

测试中需要检查第二批模型未直接暴露 `metadata` 为 ORM mapped attribute。

## TablePlus 人工验收方式

连接信息：

- Host: `127.0.0.1`
- Port: `5434`
- User: `postgres`
- Password: `postgres`
- Database: `yingge_studio`

TablePlus 中应看到新增表：

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

并且原有表仍在：

- `projects`
- `characters`
- `character_bibles`
- `scripts`
- `shots`
- `panels`
- `alembic_version`

本阶段只建表，表里没有业务数据是正常的；后续 seed 阶段才会看到武松、剧本、镜头、素材等数据。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不修改 `/Users/huabi/code/AI-video-studio/yingge-app/frontend/`。
- 不读取 `.env`、key、token、证书文件。
- 不接真实模型 API。
- 不做真实任务队列。
- 不实现 CRUD API。
- 不写 repository / service 业务逻辑。
- 不写 seed 数据。
- 不做前端联调。
- 不实现 `ModelProvider / ModelConfig / AgentRun / SkillConfig`。
- 不做复杂权限、多租户。
- 不删除 Docker 容器。
- 不删除 Docker volume。
- 不操作 5432 / 5433 上的已有数据库。

## 验收标准

- `yingge-postgres` 正在运行，使用端口 `5434:5432`。
- `uv run alembic current` 在执行 migration 前确认位于 `51238682fed0`。
- `/api/health/db` 真实返回 `{"status":"ok","database":"reachable"}`。
- `Base.metadata.tables` 包含第一批和第二批全部业务表。
- Alembic migration 文件创建在 `yingge-app/backend/alembic/versions/`。
- migration 不是空迁移，包含第二批业务表和新增 enum。
- `uv run alembic upgrade head` 真实执行成功。
- 数据库中实际存在第二批 12 张新增表。
- 已规避 SQLAlchemy `metadata` 保留名问题。
- `uv run pytest` 通过。
- `uv run ruff check app tests` 通过。
- `uv run ruff format --check app tests` 通过。
