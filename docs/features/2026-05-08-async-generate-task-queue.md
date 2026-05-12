# 异步 GenerateTask 队列

状态：done
负责人线程：Codex 功能开发线程
创建时间：2026-05-08
最后更新：2026-05-08

## 1. 为什么现在做

角色生图已经跑通第一版真实闭环，但当前任务执行仍依赖 FastAPI `BackgroundTasks` 和前端轮询。后续关键帧生成、生视频生成、批量任务都会复用 GenerateTask，如果不先稳定任务地基，后续模块会重复返工。

本功能目标是把 GenerateTask 从“接口触发后后台轻量执行”推进到“可追踪、可恢复、可扩展的异步任务队列 MVP”。

## 2. 目标链路

```text
前端创建 GenerateTask
  ↓
后端立即返回 task_id
  ↓
任务进入队列
  ↓
worker 执行任务
  ↓
DB 更新 status/progress/current_step/error/output_asset_ids
  ↓
前端轮询任务详情
  ↓
用户查看结果、失败原因或重试
```

## 3. 本次范围

- 为 GenerateTask 建立真正的队列执行入口。
- 保留角色生图现有业务链路，并迁移到新队列执行方式。
- 保证创建任务接口立即返回，不等待模型执行。
- 明确任务状态流转：`queued`、`running`、`completed`、`failed`、`mock_completed`。
- 继续支持失败记录和 retry_of_task_id。
- 前端继续使用轮询，不要求 WebSocket。
- 补齐后端测试，覆盖创建、执行、失败、重试和状态查询。
- 更新相关文档和完成记录。

## 4. 明确不做

- 不做多用户权限。
- 不做复杂工作流编排。
- 不做任务优先级和限流。
- 不做任务取消。
- 不做 WebSocket/SSE 实时推送。
- 不做关键帧生成。
- 不做生视频生成。
- 不做完整成本统计贯通。

## 5. 涉及模块

后端：

- `apps/api/app/modules/generation/models.py`
- `apps/api/app/modules/generation/schemas.py`
- `apps/api/app/modules/generation/router.py`
- `apps/api/app/modules/generation/service.py`
- `apps/api/app/modules/generation/queue.py`
- `apps/api/tests/test_generation_api.py`

前端：

- `apps/web/src/lib/api/generation.ts`
- `apps/web/src/features/characters/character-detail-screen.tsx`
- `apps/web/src/features/generation/generation-screen.tsx`

可能新增：

- 后端 worker/queue 配置文件。
- 队列启动说明文档。

## 6. 验收标准

- 创建角色生图任务时，接口立即返回 `queued` 任务。
- worker 能独立执行队列中的角色生图任务。
- 任务执行过程中会写入 `running`、`progress` 和 `current_step`。
- 任务成功后输出资产仍写入 Asset，并回填 `output_asset_ids`。
- 任务失败后记录 `error_code` 和 `error_message`。
- 失败任务可以重试，新任务记录 `retry_of_task_id`。
- 前端角色详情页仍能看到任务进度、结果资产、失败信息和重试入口。
- 后端测试覆盖任务创建、执行、失败、重试。
- 前端 `npm run typecheck` 和 `npm run lint` 通过。

## 7. 建议测试

后端：

```bash
cd apps/api
python3 -m pytest tests/test_generation_api.py -q
```

前端：

```bash
cd apps/web
npm run typecheck
npm run lint
```

本地体验：

```bash
cd apps/api
uvicorn app.main:app --reload
```

```bash
cd apps/web
npm run dev
```

## 8. 开发记录

- 读取并确认任务边界：本次只做 GenerateTask 队列 MVP，保留角色生图链路，不做关键帧、生视频、权限、复杂工作流、WebSocket/SSE 或完整成本统计。
- 检查现有实现后确认旧链路为：`generation/router.py` 创建任务后用 FastAPI `BackgroundTasks` 调用 `run_character_image_task`，测试依赖 TestClient 等后台任务执行完成。
- 先调整 `apps/api/tests/test_generation_api.py`，把角色生图测试改为“创建后只入队，显式 drain worker 后才完成”，并新增运行态断言，覆盖 worker 执行前写入 `running`、`current_step=assembling_prompt`、`progress=15`。
- 实现 `apps/api/app/modules/generation/queue.py` 中的进程内 FIFO `GenerateTaskQueue`：
  - `enqueue_character_image_task` 只负责入队。
  - 默认自动启动 daemon worker 线程处理队列。
  - 测试可设置 `app.state.disable_generation_worker = True`，再用 `drain_generation_task_queue(app)` 同步执行队列任务。
  - worker 复用 `GenerateTaskService.execute_character_image_task`，保留 mock 和 `dmx-gemini` 角色生图业务链路。
  - worker 顶层异常会把任务标记为 `failed`，写入 `GENERATION_WORKER_ERROR` 和错误信息。
- 更新 `generation/router.py`，移除 `BackgroundTasks` 依赖，创建和重试接口都改为任务创建后入队并立即返回。
- 更新 `app/main.py`，通过 FastAPI lifespan 在应用关闭时停止队列 worker。
- 检查前端轮询和状态展示：角色详情页已有 `getCharacterImageTask` 轮询，非终态会显示后台执行中，终态覆盖 `completed`、`mock_completed`、`failed`，无需修改前端。

## 9. 完成记录

- 完成了什么：
  - GenerateTask 角色生图任务从 FastAPI `BackgroundTasks` 迁移为进程内异步 FIFO 队列 MVP。
  - 创建角色生图任务和重试任务时接口立即返回 `queued` 任务。
  - worker 独立消费队列，执行时写入 `running`、`progress`、`current_step`，成功后继续写入 Asset 并回填 `output_asset_ids`，失败后写入 `error_code` 和 `error_message`。
  - 失败任务重试仍会创建新任务并记录 `retry_of_task_id`。
  - 前端角色详情页继续使用原有轮询、结果资产、失败信息和重试入口。
- 改动文件：
  - `apps/api/app/modules/generation/queue.py`
  - `apps/api/app/modules/generation/router.py`
  - `apps/api/app/main.py`
  - `apps/api/tests/test_generation_api.py`
  - `docs/features/2026-05-08-async-generate-task-queue.md`
- 验证方式和结果：
  - `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py -q`：5 passed。
  - `cd apps/api && .venv/bin/python -m pytest -q`：34 passed。
  - `cd apps/web && npm run typecheck`：通过。
  - `cd apps/web && npm run lint`：通过。
- 未能按原建议命令运行的测试：
  - `cd apps/api && python3 -m pytest tests/test_generation_api.py -q` 未能运行，原因是系统 `python3` 环境缺少 pytest：`No module named pytest`。已改用项目本地 `.venv/bin/python` 完成验证。
- 遗留问题：
  - 当前队列是单进程内存队列，适合作为 MVP 地基；服务重启后尚不能恢复内存中已入队但未执行的任务。
  - 当前 worker 与 API 进程同生命周期，不是独立进程或外部 broker。
  - 还没有任务取消、优先级、限流、并发 worker 数配置和队列可观测指标。
- 是否建议进入关键帧生成阶段：
  - 建议可以进入关键帧生成阶段，但关键帧模块接入前应明确是否接受当前单进程内存队列，还是先升级为可恢复的 DB 扫描/外部队列 worker。

## 10. 遗留问题

- 单进程内存队列无法在服务重启后恢复未消费队列项；DB 里已创建的 `queued` 任务仍存在，但当前没有启动时扫描补偿逻辑。
- 当前没有队列管理 API、worker 心跳、任务超时、取消、优先级、限流和并发数配置。
- 当前只把角色生图迁到新队列，其他可能使用 GenerateTask 的模块仍需逐步接入统一执行入口。

## 11. 下一步建议

- 回到指挥官线程更新 `docs/current-development-map.md`。
- 关键帧生成可以基于本队列 MVP 接入，但建议先补一个启动时扫描 `queued/running` 陈旧任务的恢复策略，至少避免本地开发重启后任务永久停在 `queued`。
- 进入关键帧生成时继续沿用：创建任务立即返回、worker 更新 `running/progress/current_step`、资产落库并回填 `output_asset_ids`、失败可重试。
