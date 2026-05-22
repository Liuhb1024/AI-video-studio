# Phase 3.6 TopStatusBar 轻量化计划

## 当前 TopStatusBar 问题

- 当前 `TopStatusBar` 仍是重型全局监控栏，高度约 88px，承载了项目、角色、模型能力、Provider 健康、完整任务队列和完整成本摘要。
- 1440px 桌面宽度下，顶部栏横向信息过多，容易造成拥挤、遮挡和信息重复。
- Dashboard 已经有 `ModelHealthPanel`、`RecentTaskPanel`、`CostBreakdownPanel`、`RecentAgentRunPanel`，右侧 Inspector 也有 `TaskQueueMini`、`CostSummaryMini`、`AgentRunMini`，顶部不应重复完整监控信息。
- 当前信息层级不够清晰：顶部栏看起来像监控面板，削弱了页面主体工作区的视觉优先级。

## 将要修改的文件

计划修改：

- `yingge-app/frontend/components/layout/TopStatusBar.tsx`
- `yingge-app/frontend/components/layout/AppShell.tsx`
- `yingge-app/frontend/app/dashboard/page.tsx`
- `yingge-app/frontend/app/characters/page.tsx`
- `yingge-app/frontend/app/characters/[id]/page.tsx`
- `yingge-app/frontend/app/script-studio/page.tsx`
- `yingge-app/frontend/app/generation-workspace/page.tsx`
- `yingge-app/frontend/app/asset-review/page.tsx`

如有必要轻量检查但不删除：

- `yingge-app/frontend/components/common/TaskQueueMini.tsx`
- `yingge-app/frontend/components/common/CostSummaryMini.tsx`
- `yingge-app/frontend/components/common/ProviderHealthBadge.tsx`

## 新 TopStatusBar 信息架构

`TopStatusBar` 改为轻量项目上下文栏，默认高度控制在 60px 左右。

左侧：

- 当前项目：`英歌水浒人物介绍片`
- 当前角色：`武松`
- 当前页面阶段：由 `AppShell.currentStage` 传入，未传则显示 `项目总览`

右侧：

- 模型状态：一个状态点 + `模型正常` 或 `模型预警`
- 任务入口：`任务 3`
- 成本入口：`本月 ¥128.40`

视觉：

- 使用细分隔线、小图标、轻量 pill。
- 不使用大卡片。
- 不展示完整 Provider 列表、模型能力列表、任务队列明细或成本明细。
- 保持中文为主，模型、Provider、Agent 等英文只在页面下沉区域展示。

## 哪些信息保留在顶部

- 当前项目上下文。
- 当前角色上下文。
- 当前页面阶段。
- 模型健康的总览状态，不展开模型能力。
- 任务入口总数，不展开 running / queued / failed。
- 本月成本入口，不展开今日成本和下一任务预估。

## 哪些信息下沉到 Dashboard / RightInspector

下沉到 Dashboard：

- `ModelHealthPanel`：完整模型能力、Provider 健康、支持模式。
- `RecentTaskPanel`：任务类型、模型、状态、失败原因和成本。
- `CostBreakdownPanel`：今日/本月/按类型成本、预算使用率、下一任务预估。
- `RecentAgentRunPanel`：最近 Agent 运行摘要。

下沉到 RightInspector：

- `TaskQueueMini`：运行中、排队中、失败等任务队列摘要。
- `CostSummaryMini`：今日成本、本月成本、预计下次任务。
- `AgentRunMini`：最近 Agent 运行入口。
- 页面上下文 Inspector：角色一致性、素材复盘、成本检查等。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端、不接数据库、不接真实模型 API。
- 不复制 Stitch `code.html` 到正式代码。
- 不删除 `TaskQueueMini`、`CostSummaryMini`、`ProviderHealthBadge`，因为 Dashboard 和 RightInspector 仍需要这些组件。
- 不新增真实任务队列页面、真实成本计算、真实模型健康检查。
- 不做移动端适配。

## 验收标准

- 已创建本计划文档。
- `TopStatusBar` 高度控制在 56px 到 64px。
- 顶部栏只展示项目、角色、阶段、模型总状态、任务入口、本月成本入口。
- 顶部栏不再展示 Provider 三连卡、模型能力三连卡、完整任务队列、完整成本摘要。
- `/dashboard` 继续通过 Dashboard 面板展示完整任务、模型、成本和 Agent 运行信息。
- `/characters` 继续通过右侧 Inspector 展示角色详情和一致性上下文。
- 1440px 桌面下顶部栏不拥挤、不遮挡主内容、不出现文字竖排。
- `npm run lint` 通过。
- `npm run build` 通过。
