# AI Yingge Drama Studio Backend

FastAPI backend skeleton for the AI Yingge Drama Studio.

## Scope

Backend Phase 6 includes the project skeleton, SQLAlchemy/Alembic database
infrastructure, P0 ORM tables, deterministic mock seed data, and the first batch
of read-only GET APIs.

This phase does not call model providers, run a real task queue, upload files,
implement authentication, or expose POST/PATCH business APIs.

## Setup

Using `uv`:

```bash
uv sync
uv run pytest
uv run ruff check app tests scripts
uv run uvicorn app.main:app --reload
```

Using `pip`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
pytest
ruff check app tests scripts
uvicorn app.main:app --reload
```

## Database Configuration

Set `DATABASE_URL` with a SQLAlchemy PostgreSQL URL:

```bash
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5434/yingge_studio
```

The default example value is:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/yingge_studio
```

`.env.example` contains only local example values. Do not commit real passwords,
API keys, tokens, or certificates.

## Local PostgreSQL Example

If you do not already have PostgreSQL running, you can start one manually with
Docker. This command is an example only; it is not run by the app:

```bash
docker run --name yingge-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=yingge_studio \
  -v yingge_pg_data:/var/lib/postgresql/data \
  -p 5434:5432 \
  -d postgres:16
```

Then point the backend at port `5434`:

```bash
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5434/yingge_studio
```

## Alembic

Alembic is initialized and wired to `app.db.base.Base.metadata`.

Useful commands:

```bash
uv run alembic current
uv run alembic revision --autogenerate -m "create p0 models"
uv run alembic upgrade head
```

Notes:

- `alembic/env.py` reads `DATABASE_URL` from `app.core.config`.
- Current head after Backend Phase 5 is `4ecfe89d7af3`.
- Business tables are created only through ORM models and Alembic migrations.
- `alembic current` and `alembic upgrade` require a reachable PostgreSQL
  database.

## Seed Mock Data

Run the deterministic Wusong seed data:

```bash
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5434/yingge_studio
uv run python scripts/seed_mock_data.py
```

The seed is repeatable. It uses fixed UUIDs and updates existing seed rows
instead of deleting data or inserting duplicate core records.

Seeded loop:

- Project: `英歌水浒人物介绍片`
- Character: `武松`
- Character bible, script, 6 shots, 12 panels
- Image/video prompts, mock generation tasks, assets, reviews, failure reasons,
  reflections, costs, and one export plan

## Swagger

Start the backend and open:

```text
http://127.0.0.1:8000/docs
```

## First Read APIs

```text
GET /api/v1/projects
GET /api/v1/projects/{project_id}
GET /api/v1/characters
GET /api/v1/characters/{character_id}
GET /api/v1/characters/{character_id}/bible
GET /api/v1/projects/{project_id}/script
GET /api/v1/scripts/{script_id}/shots
GET /api/v1/shots/{shot_id}/panels
GET /api/v1/projects/{project_id}/tasks
GET /api/v1/projects/{project_id}/assets
GET /api/v1/projects/{project_id}/costs
GET /api/v1/projects/{project_id}/export-plan
```

These APIs are read-only. There are no POST/PATCH business APIs in this phase.

## TablePlus Check

Use:

- Host: `127.0.0.1`
- Port: `5434`
- User: `postgres`
- Password: `postgres`
- Database: `yingge_studio`

Useful SQL:

```sql
SELECT COUNT(*) FROM characters;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM scripts;
SELECT COUNT(*) FROM shots;
SELECT COUNT(*) FROM panels;
SELECT COUNT(*) FROM prompt_drafts;
SELECT COUNT(*) FROM generation_tasks;
SELECT COUNT(*) FROM assets;
SELECT COUNT(*) FROM asset_reviews;
SELECT COUNT(*) FROM cost_records;
SELECT COUNT(*) FROM export_plans;

SELECT id, name, nickname, ranking, star
FROM characters
WHERE name = '武松';
```

## Health Check

```text
GET /api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "ai-yingge-drama-studio-backend",
  "version": "0.1.0"
}
```

## Database Health Check

```text
GET /api/health/db
```

When PostgreSQL is reachable:

```json
{
  "status": "ok",
  "database": "reachable"
}
```

When PostgreSQL is not reachable, the endpoint returns a structured error with
HTTP 503:

```json
{
  "status": "error",
  "database": "unreachable",
  "detail": "..."
}
```

`GET /api/health` does not depend on the database and should continue to work
even when PostgreSQL is unavailable.
