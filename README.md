# AI Video Studio

AI 英歌漫剧生产工作台 MVP。

## MVP Scope

This repository starts with one production loop:

```text
Project -> Script -> Scene -> Shot Card -> Prompt -> Generate Task -> Asset -> Final Cut -> Cost Review
```

## Stack

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: Python FastAPI
- Database: PostgreSQL
- Storage: Tencent COS through a storage abstraction
- AI: Mock provider by default, DMXAPI provider for real generation

## Local Setup

1. Copy environment template:

```bash
cp .env.example .env
```

2. Fill Tencent COS secrets in `.env`.

Never commit `.env`.

3. Start PostgreSQL:

```bash
docker compose -f infra/docker-compose.yml up -d
```

4. Backend:

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
python -m app.db.init_db
uvicorn app.main:app --reload
```

5. Frontend:

```bash
cd apps/web
nvm use
npm install
npm run dev
```

For acceptance checks, prefer a production preview so Next dev cache cannot drift:

```bash
cd apps/web
nvm use
npm run preview -- --hostname 0.0.0.0 --port 3000
```

If npm registry access stalls or reports `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, make sure `nvm use` selects Node 24 before installing:

```bash
nvm use
npm install
```

## Module Rules

Backend product modules live under `apps/api/app/modules/<module_name>/`.

Frontend product features live under `apps/web/src/features/<feature_name>/`.

Keep business code close to the module it serves. Add Chinese comments only for non-obvious business rules, AI prompt assembly, storage signing, and cost logic.

## AI Provider Rules

- `AI_PROVIDER=mock` keeps local development offline.
- `AI_PROVIDER=dmx` enables DMXAPI through OpenAI-compatible chat completions.
- Each production module owns its model environment variable, for example `DMX_SCRIPT_MODEL` and `DMX_SHOT_MODEL`.
- Keep API keys in `.env` only. Never commit real DMXAPI or cloud secrets.
- Script generation uses non-streaming output first because the backend must parse and persist a complete timeline JSON.

## Storage Rules

- PostgreSQL stores asset metadata.
- Tencent COS stores files.
- Bucket should stay private.
- Frontend gets preview/download through signed URLs.
- Code reads COS credentials from environment variables only.

## Security Note

Cloud keys shared during planning should be rotated before production use.
