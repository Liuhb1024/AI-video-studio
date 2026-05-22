# Phase 2 AppShell Plan

## 当前 frontend 状态检查

- 工作目录：`/Users/huabi/code/AI-video-studio/yingge-app/frontend`
- 当前项目已初始化为 Next.js App Router + TypeScript + Tailwind CSS。
- `package.json` 已包含 `next`、`react`、`react-dom`、`typescript`、`tailwindcss`、`lucide-react`、`class-variance-authority`、`clsx`、`tailwind-merge`、`tailwindcss-animate`。
- `app/` 下已有 `/dashboard`、`/characters`、`/characters/[id]`、`/script-studio`、`/generation-workspace`、`/asset-review` 最小占位页面。
- `styles/tokens.css` 已包含视觉规范要求的核心 CSS variables。
- `styles/ink-texture.css` 已提供 `ink-texture` 背景类。
- `components/ui/` 已预留；本阶段不处理 shadcn/ui 证书问题。
- `frontend/AGENTS.md` 要求写代码前阅读 Next 本地文档；本阶段已读取 `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`、`03-layouts-and-pages.md`、`11-css.md`。

## 将要创建/修改的文件

计划创建：

- `components/layout/AppShell.tsx`
- `components/layout/AppSidebar.tsx`
- `components/layout/TopStatusBar.tsx`
- `components/layout/RightInspector.tsx`
- `components/layout/PageHeader.tsx`
- `components/common/StatusBadge.tsx`
- `components/common/CostBadge.tsx`
- `components/common/SectionCard.tsx`
- `components/common/MetricCard.tsx`
- `components/common/TaskQueueMini.tsx`
- `components/common/CostSummaryMini.tsx`
- `components/common/ModelCapabilityBadge.tsx`
- `components/common/ProviderHealthBadge.tsx`
- `components/common/AgentRunMini.tsx`

计划修改：

- `app/dashboard/page.tsx`
- `app/characters/page.tsx`
- `app/characters/[id]/page.tsx`
- `app/script-studio/page.tsx`
- `app/generation-workspace/page.tsx`
- `app/asset-review/page.tsx`
- 必要时微调 `app/globals.css`，只做基础滚动/背景辅助，不引入新主题。

计划保留：

- `app/page.tsx` 继续重定向到 `/dashboard`。
- `components/ui/` 继续只作为预留目录。

## AppShell 组件设计

`AppShell` 是所有业务页面的桌面工作台容器，props 设计为：

- `children`：主内容区域。
- `title`、`subtitle`、`eyebrow`：自动渲染 `PageHeader`。
- `actions`：注入页面标题区右侧操作。
- `pageHeader`：允许后续完全自定义标题区。
- `rightInspector`：右侧 Inspector 插槽内容。
- `inspectorType`：`default`、`task`、`agent`、`cost`、`consistency`、`asset`。
- `inspectorTitle`、`inspectorDescription`：右侧容器标题。

`AppShell` 内部固定组合：

- 左侧 `AppSidebar`
- 顶部 `TopStatusBar`
- 主工作区 `main`
- 可选右侧 `RightInspector`

## 全局布局设计

- 桌面优先，不做移动端适配。
- 最小宽度按 1440px 工作台思路设计，外层使用 `min-w-[1440px]`。
- 左侧导航宽度使用视觉规范推荐的 `240px`。
- 顶部状态栏高度控制在 `72px` 左右。
- 右侧 Inspector 宽度使用 `360px`，后续页面可再扩展到 `420px - 480px`。
- 主工作区使用独立滚动和 `24px` padding。
- 背景使用 `background-primary`、`background-secondary`、`ink-texture`，保留深墨黑分层，而不是纯黑。
- 卡片圆角保持 `8px` 左右，边框使用 `border-subtle` 低透明度。

## 如何吸收 frontend-plan-source-reference-patch.md 的结论

- `TopStatusBar` 不只展示当前项目，还常驻展示：
  - 当前项目：英歌水浒人物介绍短片
  - 当前角色：武松
  - Model Health
  - Provider Health
  - Running Tasks
  - Monthly Cost
  - Export Ready
- `TopStatusBar` 内加入 `TaskQueueMini` 和 `CostSummaryMini` 的紧凑摘要，提前给 Phase 3/5 的任务队列和成本面板留入口。
- `AppSidebar` 主导航保留 5 个当前页面，并以 disabled / soon 状态预留：
  - Task Queue
  - Model Config
  - Asset Library
  - Agent Runs
- `RightInspector` 支持 `default`、`task`、`agent`、`cost`、`consistency`、`asset`，后续页面不需要重写容器。
- `ProviderHealthBadge` 显示 OpenAI、Seedance、MiniMax 等 mock Provider 健康状态。
- `ModelCapabilityBadge` 预留 Image、Video、TTS、First-frame、First-last-frame 等模型能力标签。
- `AgentRunMini` 预留 ScriptAgent、StoryboardAgent、ProductionAgent 的运行摘要，不调用真实 Agent。

## token 使用方案

- 背景：`--background-primary`、`--background-secondary`、`--sidebar-background`
- 面板：`--card-background`、`--card-background-dark`
- 边框：`--border-subtle`
- 文字：`--text-primary`、`--text-secondary`、`--text-muted`
- 强调色：`--accent-cinnabar` 作为导航 active、主按钮、风险高亮
- 元数据：`--accent-gold` 作为成本、预算、版本、关键数字
- 成功状态：`--accent-jade`、`--status-success`
- 警告/错误/处理中：`--status-warning`、`--status-error`、`--status-processing`
- 信息型面板：`--accent-bluegray`

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端。
- 不接数据库。
- 不接真实模型 API。
- 不处理 shadcn/ui 证书问题。
- 不复制 Stitch `code.html` 到正式代码。
- 不实现具体业务页面，不做真实角色库、Dashboard 项目卡、Prompt 编辑器、生图、生视频、TTS、素材审核逻辑。
- 不实现完整 Task Queue 页面、Model Config 页面、Asset Library 页面、Agent Runs 页面。
- 不做移动端适配。

## 验收标准

- `components/layout/` 下存在 `AppShell`、`AppSidebar`、`TopStatusBar`、`RightInspector`、`PageHeader`。
- `components/common/` 下存在 `StatusBadge`、`CostBadge`、`SectionCard`、`MetricCard`、`TaskQueueMini`、`CostSummaryMini`、`ModelCapabilityBadge`、`ProviderHealthBadge`、`AgentRunMini`。
- 所有新组件使用 Tailwind CSS + 自定义轻量组件实现，不依赖 shadcn/ui。
- 新组件使用 `lib/utils.ts` 中的 `cn` 函数处理 className 合并。
- 6 个业务路由页面均已接入 `AppShell`。
- 每个页面都有 `PageHeader`、一个 `SectionCard`、一个右侧 `RightInspector` mock 内容。
- RightInspector 类型映射：
  - `/dashboard`：`task`
  - `/characters`：`consistency`
  - `/characters/[id]`：`consistency`
  - `/script-studio`：`agent`
  - `/generation-workspace`：`task`
  - `/asset-review`：`asset`
- `TopStatusBar` 展示任务队列、模型健康、Provider 健康、成本摘要和导出就绪状态。
- `AppSidebar` 当前路由高亮，并预留 Task Queue、Model Config、Asset Library、Agent Runs 入口。
- 执行 `npm run lint`，失败则修复或记录原因。
- 执行 `npm run build`，失败则修复或记录原因。
