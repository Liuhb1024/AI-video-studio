# Script And Folder UX Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve script generation prompt quality, visible generation progress, version management, next-step flow, and project-folder UI.

**Architecture:** Backend adds script detail/delete APIs and richer timeline prompt schema. Frontend centralizes overlay feedback through portals, adds a generation progress panel, selectable/deletable script history, and file-explorer style project navigation.

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic, Next.js App Router, React, Tailwind CSS.

---

### Task 1: Backend Script Versions

**Files:**
- Modify: `apps/api/app/modules/scripts/router.py`
- Modify: `apps/api/app/modules/scripts/service.py`
- Test: `apps/api/tests/test_scripts_api.py`

- [ ] Add failing tests for `GET /projects/{project_id}/scripts/{script_id}` and `DELETE /projects/{project_id}/scripts/{script_id}`.
- [ ] Implement service methods that return a script plus its scenes, and delete a script with its scenes.
- [ ] Map missing scripts to 404 and successful delete to 204.
- [ ] Run `cd apps/api && . .venv/bin/activate && python -m pytest tests/test_scripts_api.py -q`.

### Task 2: Prompt Schema Upgrade

**Files:**
- Modify: `apps/api/app/ai/script_prompt.py`
- Modify: `apps/api/app/modules/scripts/schemas.py`
- Modify: `apps/api/app/modules/scripts/service.py`
- Test: `apps/api/tests/test_scripts_api.py`

- [ ] Extend generated timeline schema with `lens_language`, `storyboard_plan`, `generation_risk`, and `simplify_strategy`.
- [ ] Update system prompt to require shot size, angle, composition, movement, lighting, edit point, and AI generation risk mitigation.
- [ ] Persist those fields into scene `raw_text`.
- [ ] Run `cd apps/api && . .venv/bin/activate && python -m pytest tests/test_scripts_api.py -q`.

### Task 3: Global Feedback And Progress UI

**Files:**
- Modify: `apps/web/src/components/ui/feedback.tsx`
- Modify: `apps/web/src/features/scripts/project-script-screen.tsx`

- [ ] Render toast, confirm dialog, and generation progress with `createPortal(document.body)`.
- [ ] Add fixed visible generation progress panel with staged progress labels.
- [ ] Keep progress visible when page is scrolled.
- [ ] Run `cd apps/web && PATH=/Users/huabi/.nvm/versions/node/v24.14.0/bin:$PATH npm run lint && npm run typecheck`.

### Task 4: Script History Selection And Delete

**Files:**
- Modify: `apps/web/src/features/scripts/types.ts`
- Modify: `apps/web/src/lib/api/scripts.ts`
- Modify: `apps/web/src/features/scripts/project-script-screen.tsx`

- [ ] Add API helpers for script detail and delete.
- [ ] Selecting a history item loads its script and scenes into the result panel.
- [ ] Deleting uses custom confirm dialog, refreshes history, and switches selection to latest script.
- [ ] Add next-step button linking to `/projects/{projectId}/shots?scriptId={scriptId}`.

### Task 5: Project Folder UI

**Files:**
- Modify: `apps/web/src/features/projects/project-center-screen.tsx`
- Modify: `apps/web/src/features/projects/project-detail-screen.tsx`
- Create: `apps/web/src/components/layout/breadcrumbs.tsx`

- [ ] Convert project list to a folder grid with toolbar and modal create flow.
- [ ] Add breadcrumb navigation to project detail and project module pages.
- [ ] Make module folders feel like desktop folders with counts/status placeholders.

### Task 6: Full Verification

**Files:**
- Verify backend and frontend.

- [ ] Run `cd apps/api && . .venv/bin/activate && python -m pytest -q`.
- [ ] Run `cd apps/web && PATH=/Users/huabi/.nvm/versions/node/v24.14.0/bin:$PATH npm run lint`.
- [ ] Run `cd apps/web && PATH=/Users/huabi/.nvm/versions/node/v24.14.0/bin:$PATH npm run typecheck`.
- [ ] Run `cd apps/web && PATH=/Users/huabi/.nvm/versions/node/v24.14.0/bin:$PATH npm run build`.
