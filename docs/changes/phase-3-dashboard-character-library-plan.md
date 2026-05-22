# Phase 3 Dashboard + Character Library Plan

## 当前 frontend 状态检查

- 工作目录：`/Users/huabi/code/AI-video-studio/yingge-app/frontend`
- 当前项目为 Next.js App Router + TypeScript + Tailwind CSS。
- Phase 1 已完成初始化，`npm run lint` 与 `npm run build` 曾通过。
- Phase 2 已完成 `AppShell`，6 个业务路由已接入。
- shadcn/ui 因本机证书问题未初始化，本阶段继续使用 Tailwind CSS + 自定义轻量组件。
- 当前已有中文化规范：`/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-ui-copywriting-guide-v1.md`。
- 本阶段只做静态页面和 mock 数据，不接后端、不接数据库、不接真实模型 API。

## 将要创建/修改的文件

计划创建：

- `yingge-app/frontend/data/mock/projects.ts`
- `yingge-app/frontend/data/mock/characters.ts`
- `yingge-app/frontend/data/mock/tasks.ts`
- `yingge-app/frontend/data/mock/costs.ts`
- `yingge-app/frontend/data/mock/agents.ts`
- `yingge-app/frontend/data/mock/models.ts`
- `yingge-app/frontend/data/mock/assets.ts`
- `yingge-app/frontend/components/dashboard/DashboardStats.tsx`
- `yingge-app/frontend/components/dashboard/ProjectCard.tsx`
- `yingge-app/frontend/components/dashboard/ProjectGrid.tsx`
- `yingge-app/frontend/components/dashboard/RecentTaskPanel.tsx`
- `yingge-app/frontend/components/dashboard/ModelHealthPanel.tsx`
- `yingge-app/frontend/components/dashboard/CostBreakdownPanel.tsx`
- `yingge-app/frontend/components/dashboard/RecentAgentRunPanel.tsx`
- `yingge-app/frontend/components/characters/CharacterFilterPanel.tsx`
- `yingge-app/frontend/components/characters/CharacterCard.tsx`
- `yingge-app/frontend/components/characters/CharacterGrid.tsx`
- `yingge-app/frontend/components/characters/CharacterLibraryToolbar.tsx`
- `yingge-app/frontend/components/characters/CharacterDetailInspector.tsx`
- `yingge-app/frontend/components/characters/PromptKeywordChips.tsx`
- `yingge-app/frontend/components/characters/FieldSourceBadge.tsx`
- `yingge-app/frontend/components/characters/FieldCompletenessBadge.tsx`
- `yingge-app/frontend/components/characters/CharacterAppearanceSummary.tsx`

计划修改：

- `yingge-app/frontend/app/dashboard/page.tsx`
- `yingge-app/frontend/app/characters/page.tsx`
- `yingge-app/frontend/components/layout/AppSidebar.tsx`
- `yingge-app/frontend/components/layout/TopStatusBar.tsx`
- `yingge-app/frontend/components/layout/RightInspector.tsx`
- `yingge-app/frontend/components/common/TaskQueueMini.tsx`
- `yingge-app/frontend/components/common/CostSummaryMini.tsx`
- `yingge-app/frontend/components/common/AgentRunMini.tsx`
- `yingge-app/frontend/components/common/StatusBadge.tsx`
- `yingge-app/frontend/components/common/ProviderHealthBadge.tsx`
- 如有必要，轻量增强 `CostBadge`、`ModelCapabilityBadge`、`MetricCard`。

## Phase 2 文案中文化改造范围

按 `frontend-ui-copywriting-guide-v1.md` 中文化以下用户可见文案：

- `AppSidebar`：主导航改为“项目总览 / 角色圣经 / 剧本分镜 / 生成工作台 / 素材审核”；预留入口改为“任务队列 / 模型配置 / 素材库 / Agent 运行”；英文只作为小字副标题保留。
- `TopStatusBar`：改为“当前项目 / 当前角色 / 模型状态 / 服务商状态 / 运行中任务 / 本月成本 / 可导出”。
- `RightInspector`：`task` 为“任务检查”，`agent` 为“Agent 运行”，`cost` 为“成本检查”，`consistency` 为“一致性检查”，`asset` 为“素材复盘”，`default` 为“工作台检查”。
- `TaskQueueMini`：`running / queued / failed / completed` 改为“运行中 / 排队中 / 失败 / 已完成”。
- `CostSummaryMini`：`today / month / next est.` 改为“今日成本 / 本月成本 / 预计下次任务”。
- `AgentRunMini`：`completed / reviewing / idle` 改为“已完成 / 评审中 / 空闲”。
- `StatusBadge`：代码枚举保持英文，显示文案由调用处传入中文业务语义。
- `ProviderHealthBadge`：`healthy / warning / error / idle` 显示为“正常 / 预警 / 异常 / 空闲”。

## Dashboard 组件设计

`/dashboard` 使用 `AppShell`，中文标题为“项目总览”，英文辅助标题为 `AI Yingge Drama Studio`。

布局：

- 顶部：`PageHeader`，右侧主按钮“新建英歌短片项目”。
- 指标区：`DashboardStats`，复用 `MetricCard`，展示进行中项目、已导入角色、运行中任务、已采纳视频、失败任务、本月成本。
- 主区域左侧：`ProjectGrid` + `ProjectCard`，展示项目标题、角色、英歌定位、阶段、分镜/面板、素材采纳、失败任务、成本、就绪度、标签和 mock thumbnail。
- 主区域右侧 / 下方：`RecentTaskPanel`、`ModelHealthPanel`、`CostBreakdownPanel`、`RecentAgentRunPanel`。

Dashboard 必须显式体现：

- 任务队列 / 最近任务。
- 模型能力和服务商状态。
- 成本拆解。
- 最近 Agent 运行。
- 项目生产进度和素材采纳状态。

## Character Library 组件设计

`/characters` 使用 `AppShell`，中文标题为“英歌角色库”，英文辅助标题为 `Yingge Character Bible`。

布局：

- 顶部：`PageHeader`，操作按钮为“导入角色 Excel”“从角色创建短片”。
- 工具条：`CharacterLibraryToolbar`，展示搜索占位、导入状态、角色数量、字段映射状态。
- 左侧筛选：`CharacterFilterPanel`，展示脸谱主色、梁山职务、英歌定位、武器、人格标签、字段完整度、素材引用状态。
- 中央网格：`CharacterGrid` + `CharacterCard`，高密度展示角色名、绰号、排名、星宿、梁山职务、武器、英歌定位、脸谱主色、脸谱纹样、人格标签、正向提示词、禁止提示词、外观数量、参考素材数、字段完整度、Excel 来源行。
- 右侧：`CharacterDetailInspector`，通过 `AppShell` 的 `rightInspector` 插槽注入，展示选中角色五层摘要、视觉档案、外观摘要、字段来源、正向/禁止提示词和创建短片按钮。

Character Library 必须显式体现：

- `CharacterAppearance` 外观数量。
- 参考素材数量。
- 字段完整度。
- Excel 来源可追溯。
- 视觉一致性状态。
- 正向提示词与禁止提示词。

## mock 数据设计

新增 `data/mock/` 下静态 TypeScript 数据文件：

- `projects.ts`：围绕“英歌水浒人物介绍短片”，包含项目阶段、角色、英歌定位、分镜/面板、素材数量、任务数量、成本、就绪度、标签。
- `characters.ts`：包含武松、林冲、鲁智深、李逵、关胜、花荣、杨志、张飞等 mock 角色，覆盖五层角色圣经摘要、提示词关键词、字段完整度、Excel 行号、外观与参考素材。
- `tasks.ts`：覆盖 image / video / tts / agent / export，状态覆盖 queued / processing / completed / failed。
- `costs.ts`：按 text / image / video / tts / agent / export 拆分成本。
- `agents.ts`：包含 ScriptAgent、StoryboardAgent、PromptAgent、CriticAgent、ProductionAgent。
- `models.ts`：包含 OpenAI/gpt-image-2、nano banana、Seedance 2.0、MiniMax TTS，展示能力、健康、成本提示和模式。
- `assets.ts`：记录静态素材条目，用于项目和角色引用数量，不使用真实外部图片。

所有 mock 数据只服务静态 UI，不做真实请求。

## 如何吸收 reference-projects-frontend-workflow-audit.md 和 frontend-plan-source-reference-patch.md

- 吸收 `waoowaoo` 的任务队列、模型能力、成本、素材候选和 `Task` / `UsageCost` / `MediaObject` 思路，但不复制其实现、不使用其业务字段命名。
- 吸收 `Toonflow-app` 的 Agent 运行轨迹、监督评审和 Memory/Skill 可见性思路，在 Dashboard 中展示最近 Agent 运行摘要。
- 吸收 `huobao-drama` 的短剧生产链路拆分，在 Dashboard 项目卡中保留角色、分镜、图片、视频、TTS、素材和导出方案的生产阶段表达。
- 按 `frontend-plan-source-reference-patch.md` 要求，Dashboard 不只做项目卡，而要展示任务、成本、模型状态、最近 Agent Run；Character Library 不只做角色卡，而要展示多外观、参考素材、字段完整度和来源追溯。

## 如何执行 frontend-ui-copywriting-guide-v1.md

- 页面和导航中文为主，英文只作为技术辅助。
- 模型名、Agent 名、Provider 名、Prompt、API 不机械翻译。
- Dashboard 显示“项目总览”，不是英文 `Dashboard`。
- Character Library 显示“英歌角色库 / 角色圣经”，不是整页英文 `Character Bible`。
- 状态、按钮、字段名、卡片标题全部中文化。
- 避免“管理中心 / 信息列表 / 数据维护”等低端后台文案。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端。
- 不接数据库。
- 不接真实模型 API。
- 不修 shadcn/ui 证书问题。
- 不复制 Stitch `code.html` 到正式代码。
- 不实现真实筛选、搜索、导入 Excel、创建项目、生成任务、Agent 调用、成本计算。
- 不实现 `/characters/[id]` 详情页、`/script-studio`、`/generation-workspace`、`/asset-review` 的正式业务 UI。

## 验收标准

- `docs/changes/phase-3-dashboard-character-library-plan.md` 已创建。
- Phase 2 AppShell 用户可见文案已中文化。
- `data/mock/` 下新增 `projects.ts`、`characters.ts`、`tasks.ts`、`costs.ts`、`agents.ts`、`models.ts`、`assets.ts`。
- `/dashboard` 展示项目总览、指标、项目网格、最近任务、模型状态、成本拆解、最近 Agent 运行。
- `/characters` 展示英歌角色库、工具条、筛选面板、角色网格、角色详情 Inspector。
- 组件文件名和组件名继续使用英文，页面显示文本中文为主。
- 不引入外部图片，不复制参考项目代码。
- 执行 `npm run lint` 通过，失败则修复或记录原因。
- 执行 `npm run build` 通过，失败则修复或记录原因。
