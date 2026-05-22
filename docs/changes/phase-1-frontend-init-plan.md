# Phase 1 Frontend Init Plan

## 当前目录检查结果

- 工作目录：`/Users/huabi/code/AI-video-studio`
- 前端目标目录：`/Users/huabi/code/AI-video-studio/yingge-app/frontend`
- `yingge-app/` 已存在。
- `yingge-app/design-references/gpt-image-ui-v1/` 已存在，包含 6 张页面视觉参考图。
- `yingge-app/design-references/stitch-from-gpt-image/` 已存在，包含 6 个页面目录及 `DESIGN.md`、`notes.md`、`screen.png`。
- 本阶段只读取项目文档和设计参考目录清单，不复制 Stitch `code.html` 到正式代码。

## 是否已存在 frontend 项目

- `yingge-app/frontend/` 当前不存在。
- 因此本阶段将新建 frontend 项目，而不是覆盖已有项目。

## 初始化方案

1. 在 `yingge-app/` 下初始化 `frontend/`。
2. 使用 Next.js App Router 静态原型结构。
3. 使用 TypeScript、Tailwind CSS、ESLint。
4. 使用 npm 作为包管理器。
5. 不使用 `src/` 目录，直接使用 `app/`。
6. 初始化后补齐 Phase 1 要求的路由、目录、样式 token 和最小占位页面。
7. 尝试初始化 shadcn/ui；如果 CLI 或网络失败，则记录原因，并至少保留 `components/ui/` 目录。

## 技术栈选择

- Next.js：用于 App Router、静态原型页面和后续 AppShell。
- React：用于组件化页面。
- TypeScript：用于后续 mock data、组件 props 和模块边界。
- Tailwind CSS：用于实现 `Ink & Cinnabar Production` 视觉系统。
- lucide-react：用于后续工作台导航和按钮图标。
- class-variance-authority、clsx、tailwind-merge：用于后续 shadcn/ui 与组件变体。
- tailwindcss-animate：用于 shadcn/ui 动画基础。

## 将要创建/修改的文件

预计创建：

- `yingge-app/frontend/package.json`
- `yingge-app/frontend/package-lock.json`
- `yingge-app/frontend/next.config.*`
- `yingge-app/frontend/tsconfig.json`
- `yingge-app/frontend/eslint.config.*` 或等效 ESLint 配置
- `yingge-app/frontend/postcss.config.*`
- `yingge-app/frontend/tailwind.config.*`
- `yingge-app/frontend/app/layout.tsx`
- `yingge-app/frontend/app/page.tsx`
- `yingge-app/frontend/app/globals.css`
- `yingge-app/frontend/app/dashboard/page.tsx`
- `yingge-app/frontend/app/characters/page.tsx`
- `yingge-app/frontend/app/characters/[id]/page.tsx`
- `yingge-app/frontend/app/script-studio/page.tsx`
- `yingge-app/frontend/app/generation-workspace/page.tsx`
- `yingge-app/frontend/app/asset-review/page.tsx`
- `yingge-app/frontend/styles/tokens.css`
- `yingge-app/frontend/styles/ink-texture.css`
- `yingge-app/frontend/components/layout/`
- `yingge-app/frontend/components/dashboard/`
- `yingge-app/frontend/components/characters/`
- `yingge-app/frontend/components/script/`
- `yingge-app/frontend/components/generation/`
- `yingge-app/frontend/components/assets/`
- `yingge-app/frontend/components/common/`
- `yingge-app/frontend/components/ui/`
- `yingge-app/frontend/data/mock/`
- `yingge-app/frontend/lib/`

预计修改：

- `docs/changes/phase-1-frontend-init-plan.md` 本计划文件。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不修改 `/Users/huabi/code/AI-video-studio/yingge-app/design-references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端。
- 不做登录。
- 不做数据库。
- 不接真实模型 API。
- 不复制 Stitch `code.html` 到正式代码。
- 不实现正式 AppShell、角色卡、分镜、Prompt、生图、生视频、TTS、素材审核等业务 UI；这些留到 Phase 2 及后续阶段。

## 验收标准

- `yingge-app/frontend/` 存在，并是可安装、可构建的 Next.js + TypeScript + Tailwind CSS 项目。
- 使用 App Router，且没有 `src/` 目录。
- 使用 npm，存在 `package-lock.json`。
- `package.json` 包含或可解析到基础依赖：Next.js、React、TypeScript、Tailwind CSS、lucide-react、class-variance-authority、clsx、tailwind-merge、tailwindcss-animate。
- `components/ui/` 已预留；shadcn/ui 若初始化失败，需记录原因。
- 推荐目录结构已建立或确认。
- `styles/tokens.css` 包含 UI 视觉规范要求的核心 CSS variables。
- `styles/ink-texture.css` 已创建，并在全局样式中引入。
- `/` 可重定向或链接到 `/dashboard`。
- `/dashboard`、`/characters`、`/characters/[id]`、`/script-studio`、`/generation-workspace`、`/asset-review` 均有最小占位页面。
- 执行 `npm run lint`，如不可用需说明原因。
- 执行 `npm run build`，失败则尝试修复；无法修复则保留错误信息。
