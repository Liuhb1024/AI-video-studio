# Async GenerateTask Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make character image GenerateTask creation return immediately while model work runs in the background and frontends poll task progress.

**Architecture:** Keep the existing GenerateTask/asset/candidate/adoption model intact. Add a small generation queue adapter around FastAPI BackgroundTasks so API handlers enqueue execution after committing the traceable task; execution reopens a DB session, updates progress/current_step, and writes candidate assets.

**Tech Stack:** FastAPI BackgroundTasks, SQLAlchemy Session, existing Next.js polling with `fetch`.

---

### Task 1: Backend Async Task Creation

**Files:**
- Modify: `apps/api/app/modules/generation/router.py`
- Modify: `apps/api/app/modules/generation/service.py`
- Create: `apps/api/app/modules/generation/queue.py`
- Test: `apps/api/tests/test_generation_api.py`

- [ ] Add a test that POST returns a queued task before execution runs.
- [ ] Add a test that the queued task can be executed later and produces candidate assets.
- [ ] Move character task creation to commit `queued` state before execution.
- [ ] Add an enqueue seam that uses FastAPI `BackgroundTasks` in the router and can be disabled in tests.
- [ ] Keep retry as a new queued task with `retry_of_task_id`.

### Task 2: Frontend Polling

**Files:**
- Modify: `apps/web/src/features/characters/character-detail-screen.tsx`
- Modify: `apps/web/src/lib/api/generation.ts`

- [ ] Import `getCharacterImageTask`.
- [ ] After create/retry, show queued/running task immediately.
- [ ] Poll task detail while status is queued/running/pending.
- [ ] Refresh generated assets only after completed/mock_completed/failed.
- [ ] Update visible copy from synchronous completion to background queue.

### Task 3: Verification

**Commands:**
- `cd apps/api && .venv/bin/python -m pytest apps/api/tests -q`
- `cd apps/web && npm run typecheck`
- `cd apps/web && npm run lint`
- `cd apps/web && npm run build`
