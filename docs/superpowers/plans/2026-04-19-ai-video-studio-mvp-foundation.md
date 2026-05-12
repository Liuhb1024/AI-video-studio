# AI Video Studio MVP Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the first runnable foundation for the AI 英歌漫剧 production workstation.

**Architecture:** Use a modular monorepo with a FastAPI backend, Next.js frontend, PostgreSQL database, and Tencent COS storage abstraction. Each product feature maps to a readable module boundary.

**Tech Stack:** Python FastAPI, SQLAlchemy, Pydantic, PostgreSQL, Next.js, TypeScript, Tailwind CSS, Tencent COS SDK.

---

## File Structure

- `apps/api`: FastAPI app, business modules, storage abstraction, AI prompt abstraction.
- `apps/web`: Next.js app, dashboard layout, product module pages.
- `infra/docker-compose.yml`: PostgreSQL local development.
- `.env.example`: environment variable template without secrets.
- `.gitignore`: excludes env files, virtualenvs, build output, uploads.
- `README.md`: setup and development guide.

## Task 1: Root Foundation

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`
- Create: `infra/docker-compose.yml`

- [ ] **Step 1: Add environment safety files**

Add root `.gitignore` to exclude secrets, virtualenvs, dependencies, generated output, and uploads.

- [ ] **Step 2: Add `.env.example`**

Include database, API, web, and Tencent COS variables with empty secret values.

- [ ] **Step 3: Add Docker PostgreSQL**

Use `postgres:16` with a named volume and expose host port `5433`.

- [ ] **Step 4: Add README**

Document local startup, env setup, storage note, and module rules.

- [ ] **Step 5: Verify**

Run:

```bash
git status --short
```

Expected: root files appear as new files, no `.env` file appears.

## Task 2: Backend Foundation

**Files:**
- Create under: `apps/api/**`

- [ ] **Step 1: Create FastAPI package**

Create `pyproject.toml`, `app/main.py`, `app/core/config.py`, `app/core/database.py`, and API router aggregation.

- [ ] **Step 2: Create business modules**

Create modules for projects, scripts, scenes, shots, characters, world settings, tags, prompts, generation, assets, final cuts, costs, and settings.

- [ ] **Step 3: Add storage abstraction**

Create `StorageProvider` interface, Tencent COS provider, local provider, and key builder.

- [ ] **Step 4: Add AI abstraction**

Create base provider, mock provider, prompt engine, and prompt directories.

- [ ] **Step 5: Add tests**

Add at least one API health test and one storage key test.

- [ ] **Step 6: Verify**

Run:

```bash
cd apps/api
python -m pytest
```

Expected: tests pass.

## Task 3: Frontend Foundation

**Files:**
- Create under: `apps/web/**`

- [ ] **Step 1: Create Next.js package**

Create package config, TypeScript config, Next config, Tailwind config, and app router files.

- [ ] **Step 2: Create dashboard shell**

Create dark cinematic layout with product navigation.

- [ ] **Step 3: Create initial pages**

Create pages for workbench, projects, scripts, shots, characters, generation, assets, final cuts, dashboard, and settings.

- [ ] **Step 4: Create feature placeholders**

Create focused feature folders for projects, shots, assets, generation, and characters.

- [ ] **Step 5: Verify**

Run:

```bash
cd apps/web
npm install
npm run lint
```

Expected: install succeeds and lint has no blocking errors.

## Task 4: Integration Check

**Files:**
- Review all created files.

- [ ] **Step 1: Confirm module boundaries**

Ensure backend modules map to product modules and frontend routes map to nav items.

- [ ] **Step 2: Confirm secret hygiene**

Search for exposed keys:

```bash
rg "AKID|SECRET_KEY_VALUE_SHOULD_NOT_APPEAR|PRIVATE_SECRET_VALUE_SHOULD_NOT_APPEAR" .
```

Expected: no real secret values appear.

- [ ] **Step 3: Run status**

Run:

```bash
git status --short
```

Expected: only intended files are changed.
