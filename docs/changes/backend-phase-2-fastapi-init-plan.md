# Backend Phase 2 FastAPI 初始化计划

## 当前项目状态

- 前端静态原型已完成并验收，验收文档：`/Users/huabi/code/AI-video-studio/docs/05-tasks/static-prototype-acceptance-report-v1.md`。
- 后端目录结构规范已完成：`/Users/huabi/code/AI-video-studio/docs/02-architecture/backend-directory-structure-v1.md`。
- 后端数据模型与 API 草案已完成：`/Users/huabi/code/AI-video-studio/docs/03-data-model/backend-data-model-and-api-design-v1.md`。
- 当前目录 `/Users/huabi/code/AI-video-studio/yingge-app/backend/` 尚不存在。
- 本阶段只初始化 FastAPI 后端工程骨架，不实现复杂业务。

## 将要创建的目录

目标根目录：

- `/Users/huabi/code/AI-video-studio/yingge-app/backend/`

将创建：

- `app/`
- `app/api/`
- `app/api/v1/`
- `app/api/v1/endpoints/`
- `app/core/`
- `app/db/`
- `app/models/`
- `app/schemas/`
- `app/repositories/`
- `app/services/`
- `app/ai/`
- `app/ai/clients/`
- `app/ai/prompt_templates/`
- `app/tasks/`
- `app/storage/`
- `app/utils/`
- `tests/`
- `tests/api/`
- `scripts/`

## 将要创建的文件

文档和项目配置：

- `yingge-app/backend/pyproject.toml`
- `yingge-app/backend/.env.example`
- `yingge-app/backend/README.md`
- `yingge-app/backend/.gitignore`
- `yingge-app/backend/scripts/README.md`

FastAPI 入口和 API：

- `yingge-app/backend/app/__init__.py`
- `yingge-app/backend/app/main.py`
- `yingge-app/backend/app/api/__init__.py`
- `yingge-app/backend/app/api/health.py`
- `yingge-app/backend/app/api/v1/__init__.py`
- `yingge-app/backend/app/api/v1/router.py`
- `yingge-app/backend/app/api/v1/deps.py`
- `yingge-app/backend/app/api/v1/endpoints/__init__.py`

Core：

- `yingge-app/backend/app/core/__init__.py`
- `yingge-app/backend/app/core/config.py`
- `yingge-app/backend/app/core/logging.py`
- `yingge-app/backend/app/core/errors.py`
- `yingge-app/backend/app/core/constants.py`
- `yingge-app/backend/app/core/security.py`

Database 占位：

- `yingge-app/backend/app/db/__init__.py`
- `yingge-app/backend/app/db/session.py`
- `yingge-app/backend/app/db/base.py`
- `yingge-app/backend/app/db/init_db.py`

分层占位：

- `yingge-app/backend/app/models/__init__.py`
- `yingge-app/backend/app/schemas/__init__.py`
- `yingge-app/backend/app/schemas/common.py`
- `yingge-app/backend/app/repositories/__init__.py`
- `yingge-app/backend/app/services/__init__.py`

AI 占位：

- `yingge-app/backend/app/ai/__init__.py`
- `yingge-app/backend/app/ai/ai_gateway.py`
- `yingge-app/backend/app/ai/model_registry.py`
- `yingge-app/backend/app/ai/model_capabilities.py`
- `yingge-app/backend/app/ai/model_pricing.py`
- `yingge-app/backend/app/ai/clients/__init__.py`
- `yingge-app/backend/app/ai/clients/base.py`
- `yingge-app/backend/app/ai/prompt_templates/README.md`

Tasks / Storage / Utils：

- `yingge-app/backend/app/tasks/__init__.py`
- `yingge-app/backend/app/tasks/task_types.py`
- `yingge-app/backend/app/tasks/task_status.py`
- `yingge-app/backend/app/storage/__init__.py`
- `yingge-app/backend/app/storage/base.py`
- `yingge-app/backend/app/storage/local_storage.py`
- `yingge-app/backend/app/utils/__init__.py`
- `yingge-app/backend/app/utils/ids.py`
- `yingge-app/backend/app/utils/time.py`
- `yingge-app/backend/app/utils/pagination.py`

测试：

- `yingge-app/backend/tests/__init__.py`
- `yingge-app/backend/tests/api/test_health.py`

## 依赖选择

运行依赖：

- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic v2
- pydantic-settings
- SQLAlchemy 2.x
- Alembic
- psycopg

开发依赖：

- pytest
- httpx
- ruff

`pyproject.toml` 将配置脚本：

- `dev`：`uvicorn app.main:app --reload`
- `test`：`pytest`
- `lint`：`ruff check app tests`
- `format`：`ruff format app tests`

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不修改 `/Users/huabi/code/AI-video-studio/yingge-app/frontend/`。
- 不读取 `.env`、key、token、证书文件。
- 不接 OpenAI、Seedance、MiniMax、nano banana 或任何真实模型 API。
- 不发起任何模型网络请求。
- 不连接真实数据库。
- 不创建业务 ORM 模型。
- 不生成 Alembic migration。
- 不初始化真实任务队列。
- 不实现真实文件上传或对象存储。
- 不实现登录权限系统。

## 验收标准

- `yingge-app/backend/` 目录存在，并符合本阶段要求的基础结构。
- `GET /api/health` 返回 HTTP 200。
- health response 包含：
  - `status: "ok"`
  - `service: "ai-yingge-drama-studio-backend"`
  - `version: "0.1.0"`
- `app/main.py` 注册：
  - health router，prefix `/api`
  - v1 router，prefix `/api/v1`
  - 根路径 `/`
- `app/core/config.py` 使用 `pydantic-settings`，只读取示例配置字段，不读取真实密钥。
- 数据库层只有 SQLAlchemy Base / engine / sessionmaker 占位，不执行真实连接。
- AI 层只有接口占位和 TODO，不调用真实 provider。
- `pytest` 通过。
- `ruff check app tests` 通过。
- 可以用 `uvicorn app.main:app --reload` 启动服务；如启动失败，记录真实错误。
