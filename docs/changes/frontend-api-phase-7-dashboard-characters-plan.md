# Frontend API Phase 7 Dashboard / Character Library 切 API 计划

## 当前前端状态

- 前端静态原型已完成并验收，目录为 `/Users/huabi/code/AI-video-studio/yingge-app/frontend/`。
- `/dashboard` 当前由 `app/dashboard/page.tsx` 直接渲染 mock 组件。
- `/characters` 当前由 `app/characters/page.tsx` 直接使用 `data/mock/characters.ts`。
- 现有 UI 视觉为深墨黑、朱砂、鎏金、暗玉绿的 `Ink & Cinnabar Production` 工作台风格。
- 本轮只切 `/dashboard` 和 `/characters`，不切 `/characters/wusong`、`/script-studio`、`/generation-workspace`、`/asset-review`。

## 当前后端 API 状态

- 后端已完成 Backend Phase 6。
- PostgreSQL seed 数据已存在于 `yingge-postgres`，端口 `5434`。
- API base URL：`http://127.0.0.1:8000`。
- 本轮使用：
  - `GET /api/v1/projects`
  - `GET /api/v1/projects/{project_id}`
  - `GET /api/v1/characters`
  - `GET /api/v1/characters/{character_id}`
  - `GET /api/v1/characters/{character_id}/bible`
  - `GET /api/v1/projects/{project_id}/tasks`
  - `GET /api/v1/projects/{project_id}/assets`
  - `GET /api/v1/projects/{project_id}/costs`
  - `GET /api/v1/projects/{project_id}/export-plan`

## 将要修改的文件

新增：

- `yingge-app/frontend/lib/api/config.ts`
- `yingge-app/frontend/lib/api/client.ts`
- `yingge-app/frontend/lib/api/types.ts`
- `yingge-app/frontend/lib/api/projects.ts`
- `yingge-app/frontend/lib/api/characters.ts`
- `yingge-app/frontend/app/dashboard/loading.tsx`
- `yingge-app/frontend/app/characters/loading.tsx`

修改：

- `yingge-app/frontend/app/dashboard/page.tsx`
- `yingge-app/frontend/app/characters/page.tsx`
- `yingge-app/frontend/components/dashboard/DashboardStats.tsx`
- `yingge-app/frontend/components/dashboard/ProjectGrid.tsx`
- `yingge-app/frontend/components/dashboard/ProjectCard.tsx`
- `yingge-app/frontend/components/dashboard/RecentTaskPanel.tsx`
- `yingge-app/frontend/components/dashboard/CostBreakdownPanel.tsx`
- `yingge-app/frontend/components/common/TaskQueueMini.tsx`
- `yingge-app/frontend/components/common/CostSummaryMini.tsx`
- `yingge-app/frontend/components/characters/CharacterGrid.tsx`
- `yingge-app/frontend/components/characters/CharacterCard.tsx`
- `yingge-app/frontend/components/characters/CharacterDetailInspector.tsx`

## API client 设计

- `lib/api/config.ts` 提供 `API_BASE_URL`，读取 `NEXT_PUBLIC_API_BASE_URL`，默认 `http://127.0.0.1:8000`。
- `lib/api/client.ts` 提供 `apiGet<T>(path: string): Promise<T>`。
- `apiGet` 自动拼接 base URL，使用 `fetch`，非 2xx 抛出包含状态码的错误，网络错误抛出可读错误。
- Server Component 中默认禁用缓存或短缓存，避免 seed 数据更新后页面长时间不刷新。
- 不读取任何密钥，不写真实 key。

## /dashboard 数据切换策略

- `app/dashboard/page.tsx` 改为 async server component。
- 先调用 `getProjects()`。
- 若有第一个 project：
  - 并行调用 `getProjectTasks(project.id)`、`getProjectAssets(project.id)`、`getProjectCosts(project.id)`、`getProjectExportPlan(project.id)`。
  - 将 API 数据映射为现有 Dashboard 组件 props。
- 统计卡由 API 聚合：项目数、运行中任务、失败任务、已采纳素材、视频素材、本轮成本。
- 项目卡继续复用 `ProjectCard`，通过轻量 view model 补齐 UI 所需字段。
- 模型状态、Agent 运行等后端暂未提供的数据继续显示静态摘要，但不作为主项目数据来源。

## /characters 数据切换策略

- `app/characters/page.tsx` 改为 async server component。
- 调用 `getCharacters()`。
- 将 `ApiCharacter` 映射成现有 `CharacterCard` / `CharacterDetailInspector` 所需字段。
- 后端暂缺的字段显示“待补充”、默认完整度、默认来源行号等轻量 fallback。
- 右侧 inspector 使用 API 返回列表中的第一个角色。
- `/characters/wusong` 不修改，仍使用 mock。

## mock fallback 策略

- 不删除 mock 文件。
- 组件层保留默认 mock props，避免其它未切 API 页面受影响。
- `/dashboard` 和 `/characters` 主数据来源改为 API；只有后端字段缺失时使用少量字段级 fallback 文案。
- API 不可用时显示错误态，不回退到全量 mock 列表，避免误判为真实联调成功。

## loading / error / empty 状态设计

- 新增 `app/dashboard/loading.tsx` 和 `app/characters/loading.tsx`，沿用现有暗色面板风格。
- API 报错时页面内显示错误卡片：说明 API 地址、错误信息和后端启动提示，不白屏。
- API 返回空列表时显示空状态卡片：提示后端暂无 seed 数据或需要运行 seed。
- 保持原 UI 结构，避免大改布局。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/yingge-app/backend/`。
- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不切 `/characters/wusong`。
- 不切 `/script-studio`、`/generation-workspace`、`/asset-review`。
- 不接真实模型 API。
- 不做 POST/PATCH。
- 不做前端写操作。
- 不做上传、登录、真实任务队列。
- 不大改 UI，不删除 mock 数据。

## 验收标准

- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000 npm run dev` 后：
  - `/dashboard` 能显示后端项目 `英歌水浒人物介绍片`。
  - `/characters` 能显示后端角色 `武松`。
  - API 不可用时显示错误态，不白屏。
  - API 空列表时显示空态。
  - 页面无明显文字竖排和大幅视觉回退。
- 后端 API 验证：
  - `/api/health`
  - `/api/health/db`
  - `/api/v1/projects`
  - `/api/v1/characters`
- `npm run lint` 通过。
- `npm run build` 通过。
