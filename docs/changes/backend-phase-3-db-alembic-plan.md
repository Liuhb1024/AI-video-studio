# Backend Phase 3 数据库与 Alembic 初始化计划

## 当前后端状态

- Backend Phase 2 已完成，后端骨架位于 `/Users/huabi/code/AI-video-studio/yingge-app/backend/`。
- `GET /api/health` 已通过，且不依赖数据库。
- `uv sync`、`uv run pytest`、`uv run ruff check app tests`、`uv run ruff format --check app tests` 已通过。
- 当前阶段只做数据库基础设施和 Alembic 初始化，不创建业务 ORM 模型，不实现业务 CRUD。

## 将要修改的文件

- `yingge-app/backend/app/core/config.py`
- `yingge-app/backend/app/db/base.py`
- `yingge-app/backend/app/db/session.py`
- `yingge-app/backend/app/db/init_db.py`
- `yingge-app/backend/app/api/health.py`
- `yingge-app/backend/app/api/v1/deps.py`
- `yingge-app/backend/tests/api/test_health.py`
- `yingge-app/backend/.env.example`
- `yingge-app/backend/README.md`

## 将要创建的文件

- `yingge-app/backend/alembic.ini`
- `yingge-app/backend/alembic/env.py`
- `yingge-app/backend/alembic/script.py.mako`
- `yingge-app/backend/alembic/versions/.gitkeep`

可选：

- 如果不需要连接真实数据库即可生成空 revision，则创建一个空 initial migration。
- 如果 Alembic 命令要求真实数据库或当前环境不可用，则不假装成功，只记录未验证原因。

## 数据库配置方案

- 使用 `pydantic-settings` 从环境变量读取配置。
- 支持 `DATABASE_URL`。
- 默认示例值为：
  - `postgresql+psycopg://postgres:postgres@localhost:5432/yingge_studio`
- `.env.example` 只放示例值，不放真实密码、key、token、证书。
- 不读取真实 `.env`、key、token、证书文件。

## SQLAlchemy session/Base 方案

- 使用 SQLAlchemy 2.x。
- `app/db/base.py` 定义 `Base(DeclarativeBase)`。
- `app/db/session.py` 提供 lazy `get_engine()` 和 `SessionLocal`。
- 不在模块 import 或 FastAPI 启动时强制连接数据库。
- 提供 `get_db()` generator 依赖，供未来 API 使用。
- `api/v1/deps.py` 暴露数据库依赖别名，后续 endpoint 统一从这里引入。
- `init_db.py` 只保留占位，不执行 `create_all()`。

## Alembic 初始化方案

- 手工创建 Alembic 标准目录和配置，避免交互式命令污染结构。
- `alembic/env.py` 使用 `app.db.base.Base.metadata` 作为 `target_metadata`。
- `alembic/env.py` 从 `app.core.config.get_settings()` 读取 `DATABASE_URL` 并注入 Alembic config。
- 当前没有业务 ORM 模型，因此 autogenerate 不应产生业务表。
- 未来 Backend Phase 4 添加模型后，Alembic 可基于 `Base.metadata` 自动生成迁移。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不修改 `/Users/huabi/code/AI-video-studio/yingge-app/frontend/`。
- 不读取真实 `.env`、key、token、证书文件。
- 不接真实模型 API。
- 不做真实任务队列。
- 不创建业务表。
- 不创建业务 ORM 模型。
- 不实现业务 CRUD。
- 不在应用启动时连接数据库。
- 不执行 `Base.metadata.create_all()`。

## 验收标准

- `/api/health` 继续返回 200，且不依赖数据库。
- `/api/health/db` 在数据库可达时返回 `status=ok`，不可达时返回结构化错误。
- 无 PostgreSQL 环境时，测试仍然通过。
- `uv run pytest` 通过。
- `uv run ruff check app tests` 通过。
- `uv run ruff format --check app tests` 通过。
- Alembic 文件存在，并引用 `Base.metadata` 和 settings 中的 `DATABASE_URL`。
- 当前阶段不产生业务表 migration。
