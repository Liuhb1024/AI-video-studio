# Phase 5 Generation Workspace + Asset Review 静态页面计划

## 当前 frontend 状态检查

- 工作目录：`/Users/huabi/code/AI-video-studio/yingge-app/frontend`
- 当前项目为 Next.js App Router + TypeScript + Tailwind CSS 静态原型。
- Phase 1 已完成 frontend 初始化。
- Phase 2 已完成 AppShell、AppSidebar、轻量 TopStatusBar、RightInspector 和通用组件。
- Phase 3 已完成 `/dashboard` 与 `/characters`。
- Phase 4 已完成 `/characters/[id]` 与 `/script-studio`。
- Phase 4.5 已修复 `/script-studio` 竖排与布局挤压问题，并优化角色详情层级。
- 当前 `/generation-workspace` 与 `/asset-review` 仍是占位页。
- 当前阶段只做静态页面和 mock 数据，不接后端、不接真实模型 API、不做任务轮询、不做真实上传、不做真实视频播放。

## 将要创建/修改的文件

计划新增或完善 mock 数据：

- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/prompts.ts`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/generationTasks.ts`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/imageAssets.ts`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/videoAssets.ts`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/audioAssets.ts`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/subtitleAssets.ts`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/assetReview.ts`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/failureReasons.ts`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/productionPlan.ts`

计划新增 Generation 组件：

- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/ShotList.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/PromptEditor.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/ImageGenerationPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/VideoGenerationPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/TTSGenerationPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/GenerationTaskStatus.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/ModelSelector.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/ProviderSelector.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/VideoCandidatePlayer.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/ConsistencyInspector.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/CandidateComparisonPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/AssetLineagePanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/FailureReasonPanel.tsx`

计划新增 Asset Review 组件：

- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/AssetFilterPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/AssetReviewGrid.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/CandidateAssetCard.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/AssetPreviewPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/ReflectionInspector.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/FailureReasonChips.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/CostSummaryPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/FinalProductionTimeline.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/ExportProductionPlanButton.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/AssetLineagePanel.tsx`

计划修改页面：

- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/generation-workspace/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/asset-review/page.tsx`

## Generation Workspace 组件设计

`/generation-workspace` 使用三栏生产工作台结构：

- 左侧：`ShotList`，展示 6 个镜头、时长、图像/视频/TTS 状态、成本和当前选中状态。
- 中间：四个一级生产模块，按生产顺序展示 `PromptEditor`、`ImageGenerationPanel`、`VideoGenerationPanel`、`TTSGenerationPanel`。
- 右侧：`RightInspector type=consistency`，注入 `ConsistencyInspector`、`FailureReasonPanel`、`AssetLineagePanel` 和 Reflection 建议。

`VideoGenerationPanel` 是本页最高优先级模块，必须作为一级主模块展示，而不是按钮、状态行或小卡片。它会包含 Seedance 2.0、Provider、图生视频/首帧/首尾帧模式、关键帧、尾帧、角色参考、场景参考、视频 Prompt、时长、画幅、运动强度、分辨率、任务进度、候选视频、采纳/拒绝、失败原因、重试和成本。

## Asset Review 组件设计

`/asset-review` 使用“筛选 + 素材墙 + 大预览 + 复盘 Inspector + 底部成片时间线”的审核结构：

- 左侧：`AssetFilterPanel`，包含素材类型、镜头、模型、状态、失败原因、成本范围。
- 中央：`AssetReviewGrid`，按 Shot 分组展示图片、视频、TTS 音频、字幕候选。
- 中间右侧：`AssetPreviewPanel`，展示大预览、视频 mock player、Prompt version、Model、Task id、Cost、Accept / Reject。
- 右侧：`ReflectionInspector`，展示拒绝原因统计、模型失败模式、Prompt 改进建议、下一轮 negative constraints、成本风险和重试建议。
- 底部：`FinalProductionTimeline` 和 `ExportProductionPlanButton`，展示 6 个镜头的图片、视频、音频、字幕采纳状态和导出就绪。

## mock 数据补充设计

- `prompts.ts`：图片 Prompt、视频 Prompt、negative Prompt、TTS 文案、版本、来源字段和质量检查清单。
- `generationTasks.ts`：生图、生视频、TTS 任务的 provider、model、mode、status、progress、成本、失败原因和重试次数。
- `imageAssets.ts`：候选/采纳/拒绝图片，包含模型、缩略图占位、成本、一致性分数和失败原因。
- `videoAssets.ts`：Seedance 2.0 候选/采纳/拒绝视频，包含模式、时长、画幅、分辨率、运动强度、一致性分数、失败原因和成本。
- `audioAssets.ts`：MiniMax TTS 音频 mock，包含文本、音色、状态、时长和成本。
- `subtitleAssets.ts`：字幕文本、状态和时间轴状态。
- `assetReview.ts`：素材审核页的分组、预览素材、统计和拒绝原因计数。
- `failureReasons.ts`：角色不一致、脸谱错误、色彩错误、场景不匹配、风格漂移、英歌动作错误、运动过强/过弱、解剖错误、时长不符、模型错误等。
- `productionPlan.ts`：最终制作时间线、导出就绪度和导出包摘要。

## 如何吸收三个开源项目源码参考

- 吸收 `waoowaoo`：用 `generationTasks.ts`、`GenerationTaskStatus`、`ModelSelector`、`CandidateComparisonPanel`、成本和素材状态表达任务队列、模型能力、候选素材和成本记录；保留 Shot / Panel / Task / Asset 的分离。
- 吸收 `Toonflow-app`：在右侧 Inspector 和 Asset Review 复盘里展示 Agent / Reflection / Memory 的反馈入口、失败后的 Prompt 优化建议和下一轮 negative constraints，但不做真实 Agent。
- 吸收 `huobao-drama`：把图片生成、视频生成、TTS、字幕和导出制作方案放入同一生产链路；Asset Review 展示图片、视频、音频、字幕、成片方案的完整静态闭环。

## 如何执行中文化规范

- 页面标题、字段名、按钮、状态、说明文字使用中文为主。
- 模型名和技术标签保留英文：`Seedance 2.0`、`gpt-image-2`、`nano banana`、`MiniMax TTS`、`Prompt`、`Provider`、`Task`、`Agent`。
- 不使用整页英文，不把模型名机械翻译。
- 避免“信息列表 / 管理中心 / 数据维护”等低端后台文案，使用“提示词与生成工作台”“素材审核与成片库”“一致性检查”“素材来源链路”“复盘建议”等业务化文案。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端、不接数据库、不接真实模型 API。
- 不做真实生成、真实任务轮询、真实视频播放、真实上传。
- 不复制 Stitch `code.html`。
- 不实现真实导出、真实素材下载、真实成本计算、真实 Agent 复盘。
- 不做完整非线性剪辑器，也不做云盘素材库。
- 不处理 shadcn/ui 证书问题。

## 验收标准

- 已创建本计划文档。
- 新增或完善 Phase 5 所需 mock 数据文件。
- `/generation-workspace` 已实现提示词与生成工作台静态页面。
- `VideoGenerationPanel` 是一级主模块，并展示 Seedance 2.0、Provider、模式、关键帧、Prompt、参数、任务进度、候选视频、采纳/拒绝、失败原因、重试和成本。
- `ImageGenerationPanel` 展示 gpt-image-2 / nano banana、生图 Prompt、候选图、关键帧采纳、失败原因和成本。
- `PromptEditor` 展示 image / video / negative / TTS Prompt、来源字段、质量检查和版本。
- `TTSGenerationPanel` 展示 MiniMax TTS、旁白、音色、字幕、音频 mock 和成本。
- `/asset-review` 已实现素材审核与成片库静态页面。
- `AssetReviewGrid` 按 Shot 分组展示图片、视频、音频和字幕。
- `AssetPreviewPanel` 展示大预览、素材信息、Prompt version、model、task id、cost、采纳/拒绝入口。
- `ReflectionInspector` 展示拒绝原因统计、模型失败模式、Prompt 改进建议、下一轮 negative constraints 和成本风险。
- `FinalProductionTimeline` 展示 6 个镜头的采纳状态，`ExportProductionPlanButton` 只做静态导出入口。
- 用户可见文案中文为主，英文仅作为技术辅助。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器检查 `/generation-workspace` 与 `/asset-review` 可访问，无明显文字竖排、遮挡或主内容被压缩问题。
