# Phase 6 整体静态原型验收与统一打磨计划

## 当前项目状态

- 工作区：`/Users/huabi/code/AI-video-studio/yingge-app/frontend`
- 前端技术栈：Next.js App Router、TypeScript、Tailwind CSS、自定义轻量组件。
- Phase 1 已完成 frontend 初始化。
- Phase 2 已完成 AppShell、左侧导航、轻量 TopStatusBar、RightInspector 和通用基础组件。
- Phase 3 已完成 `/dashboard` 与 `/characters`。
- Phase 4 已完成 `/characters/[id]` 与 `/script-studio`，Phase 4.5 已修复 Script Studio 竖排与布局问题。
- Phase 5 已完成 `/generation-workspace` 与 `/asset-review`，Phase 5.5 已打磨生成链路首屏和素材审核室感。
- 当前项目仍是静态原型，数据来自 mock 文件，不接后端、不接真实模型 API、不接数据库。

## 6 个页面验收范围

| 页面 | 路由 | 验收重点 |
| --- | --- | --- |
| 项目总览 | `/dashboard` | 项目、任务、模型状态、成本、Agent 运行是否形成生产控制台概览。 |
| 英歌角色库 | `/characters` | Excel 来源、字段完整度、外观数量、参考素材、角色入口是否清楚。 |
| 角色圣经详情 | `/characters/wusong` | 五层角色圣经、文化视觉层、正向/禁止提示词、一致性检查是否清楚。 |
| 剧本分镜工作台 | `/script-studio` | 角色 -> 剧本 -> Shot -> Panel -> Agent/Skill/Memory 链路是否清楚。 |
| 提示词与生成工作台 | `/generation-workspace` | 当前 Shot、Prompt、生图、生视频、TTS、任务状态、成本和一致性检查是否同屏形成生产闭环。 |
| 素材审核与成片库 | `/asset-review` | 图片/视频/音频/字幕、采纳/候选/拒绝、失败原因、Reflection、最终时间线和导出方案是否清楚。 |

## 统一打磨策略

- 全局布局：确认所有业务页都使用 `AppShell`，左侧导航高亮、TopStatusBar 阶段名、RightInspector 类型与页面语义一致。
- 视觉系统：统一深墨黑背景、青灰面板、细边框、朱砂主按钮、鎏金数据、暗玉绿成功态、低饱和朱砂错误态。
- 文案系统：基于 `frontend-ui-copywriting-guide-v1.md`，页面主标题、导航、按钮、状态、字段名均以中文为主；英文只保留为模型名、Agent 名、Prompt、Provider、Task 等技术辅助标签。
- 生产链路：从 Dashboard 到 Asset Review 检查是否能读出“角色库 -> 角色圣经 -> 剧本分镜 -> 提示词生成 -> 素材审核 -> 导出方案”的闭环。
- 1440px 桌面体验：重点检查横向溢出、文字竖排、顶部遮挡、卡片过窄、按钮挤压、首屏核心模块缺失。
- 小修优先：只做必要一致性、可读性和文案修补，不大改组件架构、不重写页面。

## 可能修改的文件

- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/dashboard/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/characters/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/characters/[id]/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/script-studio/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/generation-workspace/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/asset-review/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/layout/*`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/common/*`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/dashboard/*`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/characters/*`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/*`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/*`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/*`
- `/Users/huabi/code/AI-video-studio/docs/05-tasks/static-prototype-acceptance-report-v1.md`

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端、不接数据库、不接真实模型 API。
- 不做真实生成、真实上传、真实导出、真实任务轮询、真实视频播放。
- 不复制 Stitch `code.html`。
- 不处理 shadcn/ui 证书问题。
- 不新增大型依赖，不做大规模重构，不重写已有页面。

## 验收标准

- 已创建本计划文档。
- 6 个页面均可访问，并使用统一 AppShell。
- 左侧导航高亮、TopStatusBar 阶段名、RightInspector 语义与页面匹配。
- 全局视觉保持深墨黑、水墨质感、朱砂鎏金、暗玉绿状态和专业 AI 视频生产工作台气质。
- 用户可见文案中文为主，英文仅作为技术辅助标签。
- 6 个页面能形成清晰产品链路：角色库 -> 角色圣经 -> 剧本分镜 -> 提示词生成 -> 素材审核 -> 导出方案。
- 1440px 桌面下无明显横向溢出、文字竖排、遮挡和按钮挤压。
- 已新增静态原型验收报告。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器检查 `/dashboard`、`/characters`、`/characters/wusong`、`/script-studio`、`/generation-workspace`、`/asset-review`。
