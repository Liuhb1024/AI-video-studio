# Backend Phase 4 P0 ORM 第一批计划

## 当前后端状态

- Backend Phase 2 已完成 FastAPI 后端骨架，目录位于 `/Users/huabi/code/AI-video-studio/yingge-app/backend/`。
- Backend Phase 3 已完成 SQLAlchemy Base/Session、Alembic 初始化和 `/api/health/db`。
- `GET /api/health` 已通过，且不依赖数据库。
- `GET /api/health/db` 已实现，但此前默认本机 5432 示例连接未验证成功。
- `uv run pytest`、`uv run ruff check app tests`、`uv run ruff format --check app tests` 已通过。
- 当前阶段只做第一批 P0 ORM 模型、独立 PostgreSQL 容器验证和 Alembic 建表，不实现业务 CRUD。

## 将要创建/修改的文件

计划文件：

- `docs/changes/backend-phase-4-p0-orm-batch1-plan.md`

后端模型：

- `yingge-app/backend/app/models/enums.py`
- `yingge-app/backend/app/models/project.py`
- `yingge-app/backend/app/models/character.py`
- `yingge-app/backend/app/models/character_bible.py`
- `yingge-app/backend/app/models/script.py`
- `yingge-app/backend/app/models/shot.py`
- `yingge-app/backend/app/models/panel.py`
- `yingge-app/backend/app/models/__init__.py`

数据库 metadata：

- `yingge-app/backend/app/db/base.py`

测试：

- `yingge-app/backend/tests/models/test_metadata.py`
- 可能补充或保持 `yingge-app/backend/tests/api/test_health.py`

迁移：

- `yingge-app/backend/alembic/versions/<revision>_create_project_character_script_shot_panel_tables.py`

## 第一批 ORM 模型范围

只实现：

- `Project`
- `Character`
- `CharacterBible`
- `Script`
- `Shot`
- `Panel`

暂不实现：

- `PromptDraft`
- `GenerationTask`
- `Asset`
- `AssetReview`
- `CostRecord`
- `Scene`
- `User`
- `ModelProvider`
- `ModelConfig`
- `AgentRun`
- `SkillConfig`

## 表关系设计

- `Project` 与 `Script`：一对多。
- `Project.current_character_id`：只保留 UUID 字段，不强制 relationship，避免第一批循环依赖复杂化。
- `Character` 与 `CharacterBible`：一对一，`character_bibles.character_id` 唯一且非空。
- `Character` 与 `Script`：一对多，`scripts.character_id` 可空。
- `Character` 与 `Shot`：一对多，`shots.character_id` 可空。
- `Script` 与 `Shot`：一对多，`shots.script_id` 非空。
- `Shot` 与 `Panel`：一对多，`panels.shot_id` 非空。

约束：

- `character_bibles.character_id` unique。
- `shots` 使用 `unique(script_id, shot_no)`。
- `panels` 使用 `unique(shot_id, panel_no)`。

## Enum 设计

使用 Python Enum + SQLAlchemy Enum，PostgreSQL enum type 名称稳定：

- `project_status`
  - `draft`
  - `active`
  - `archived`
  - `completed`
- `script_status`
  - `draft`
  - `generated`
  - `reviewed`
  - `locked`
- `shot_status`
  - `draft`
  - `ready`
  - `generating`
  - `completed`
  - `failed`
- `panel_status`
  - `draft`
  - `ready`
  - `generating`
  - `completed`
  - `failed`

## Docker PostgreSQL 隔离方案

只允许使用：

- 容器名：`yingge-postgres`
- 端口映射：`5434:5432`
- volume：`yingge_pg_data`
- 数据库：`yingge_studio`
- 用户：`postgres`
- 示例密码：`postgres`

预检：

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | grep -E "yingge-postgres|postgres" || true
```

如果 `yingge-postgres` 不存在，创建：

```bash
docker run --name yingge-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=yingge_studio \
  -v yingge_pg_data:/var/lib/postgresql/data \
  -p 5434:5432 \
  -d postgres:16
```

如果 `yingge-postgres` 已存在但未运行，只执行：

```bash
docker start yingge-postgres
```

禁止：

- 不使用本机 5432。
- 不使用本机 5433。
- 不停止、删除、修改任何已有 Postgres 容器。
- 不删除任何 Docker volume。
- 不进入或操作其他数据库容器。

## Alembic migration 方案

1. 先确认独立容器数据库可达：
   - `export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5434/yingge_studio`
   - `uv run alembic current`
   - `GET /api/health/db` 返回 reachable。
2. 创建 ORM 模型和 metadata 导入。
3. 新增 metadata 测试，确保 `Base.metadata.tables` 包含：
   - `projects`
   - `characters`
   - `character_bibles`
   - `scripts`
   - `shots`
   - `panels`
4. 执行：
   - `uv run alembic revision --autogenerate -m "create project character script shot panel tables"`
   - `uv run alembic upgrade head`
5. 使用 `alembic current` 和 `docker exec yingge-postgres psql ... -c "\dt"` 验证真实建表。

所有业务表必须由 SQLAlchemy ORM -> Alembic autogenerate -> migration -> upgrade head 创建，禁止手写 SQL 直接建表。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不修改 `/Users/huabi/code/AI-video-studio/yingge-app/frontend/`。
- 不读取 `.env`、key、token、证书文件。
- 不接真实模型 API。
- 不做真实任务队列。
- 不实现业务 CRUD。
- 不写 repository / service 业务逻辑。
- 不写 seed 数据。
- 不做前端联调。
- 不实现第二批模型：PromptDraft / GenerationTask / Asset / Review / CostRecord。
- 不删除 Docker 容器。
- 不删除 Docker volume。
- 不操作 5432 / 5433 上的已有数据库。

## 验收标准

- `yingge-postgres` 独立容器运行，使用端口 `5434:5432` 和 volume `yingge_pg_data`。
- `DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5434/yingge_studio` 可连接。
- `/api/health/db` 真实返回 `{"status":"ok","database":"reachable"}`。
- `Base.metadata.tables` 包含第一批 6 张表。
- Alembic migration 文件创建在 `yingge-app/backend/alembic/versions/`。
- migration 不是空迁移，包含 enum 和 6 张业务表。
- `uv run alembic upgrade head` 真实执行成功。
- 数据库中实际存在：
  - `projects`
  - `characters`
  - `character_bibles`
  - `scripts`
  - `shots`
  - `panels`
- `uv run pytest` 通过。
- `uv run ruff check app tests` 通过。
- `uv run ruff format --check app tests` 通过。
