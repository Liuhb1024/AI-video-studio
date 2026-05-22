# 三个参考项目前端工作流审计

本文档用于在正式继续前端 Phase 2 前，重新分析 `/Users/huabi/code/AI-video-studio/references/` 下三个开源项目，对“AI 英歌漫剧内容生产工作台”前端静态原型的页面、组件、mock 数据和后续后端设计给出参考建议。

## 0. 范围与边界

### 0.1 本次读取的本项目文件

- `/Users/huabi/code/AI-video-studio/CODEX_RULES.md`
- `/Users/huabi/code/AI-video-studio/docs/06-prd/PRD-v1.0.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-module-spec-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-static-prototype-plan-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-visual-spec-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/stitch-assets-organization-report.md`

### 0.2 本次读取的参考项目文件

waoowaoo：

- `/Users/huabi/code/AI-video-studio/references/waoowaoo/package.json`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/page.tsx`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/NovelPromotionWorkspace.tsx`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/StageNavigation.tsx`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/asset-hub/page.tsx`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/asset-hub/components/AssetGrid.tsx`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/asset-hub/components/CharacterCard.tsx`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/task/TaskStatusInline.tsx`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/task/TaskStatusOverlay.tsx`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/types.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/presentation.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/model-config-contract.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/model-capabilities/catalog.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/model-pricing/catalog.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/billing/cost.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/workers/`

Toonflow-app：

- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/package.json`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/index.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/tools.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/index.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/tools.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/memory.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/embedding.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/skillsTools.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/types/database.d.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/lib/initDB.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/routes/agents/getMemory.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/routes/production/getFlowData.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/script_agent_decision.md`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/production_agent_decision.md`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/production_agent_supervision.md`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/production_execution_storyboard_panel.md`

huobao-drama：

- `/Users/huabi/code/AI-video-studio/references/huobao-drama/README.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/index.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/skills.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/routes/storyboards.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/routes/images.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/routes/videos.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/image-generation.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/video-generation.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/tts-generation.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/ffmpeg-compose.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/ffmpeg-merge.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/index.vue`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/index.vue`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/layouts/studio.vue`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/script_rewriter/SKILL.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/extractor/SKILL.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/storyboard_breaker/SKILL.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/voice_assigner/SKILL.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/grid_prompt_generator/SKILL.md`

### 0.3 执行边界

- 本文档只做源码分析和前端原型建议，不写业务代码。
- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取任何 `.env`、key、token、证书文件；只提及 schema 中存在的配置字段，不读取值。
- 不接真实 Agent、不接真实模型、不跑任务队列、不跑 FFmpeg。
- 参考项目代码只学习设计思想，不复制代码、不搬运实现。

## 1. 关键参考结论

1. `waoowaoo` 最值得学习的是“任务队列 + 模型能力 + 资产候选 + 成本记录”的工程化结构。它的 `Task`、`TaskEvent`、`GraphRun`、`GraphStep`、`UsageCost`、`MediaObject` 和 `NovelPromotionPanel` 对我们的 `Generation Workspace` 与 `Asset Review` 直接有参考价值。
2. `Toonflow-app` 最值得学习的是 Agent 分层：Decision Agent 负责编排，Execution Agent 负责具体产出，Supervision Agent 负责评审；`Memory` 与 `Skill` 可以在第一阶段做成静态“上下文依据”和“技能标签”，不要做真实 RAG。
3. `huobao-drama` 最值得学习的是短剧生产数据流：`dramas -> episodes -> characters/scenes -> storyboards -> imageGenerations/videoGenerations/TTS -> compose/merge -> assets`。它给我们的 `Shot`、`Panel`、TTS、字幕、视频候选、导出字段提供了最完整的后端字段参考。
4. 当前前端静态原型应该强化“生产控制台”感：模型能力、任务状态、候选素材、成本、失败原因、Agent 评审都要可见；但所有生成、排队、Agent、合成只做 mock 展示。
5. `Prompt & Generation Workspace` 必须保留为核心页面，并把 `VideoGenerationPanel` 做成一级主模块，不隐藏成按钮或弹窗。

## 2. waoowaoo 分析

### 2.1 项目结构与技术栈

`/Users/huabi/code/AI-video-studio/references/waoowaoo/package.json` 显示该项目是 Next.js 15、React 19、Prisma、BullMQ、Redis、Remotion、S3/COS、NextAuth、Zod、OpenAI/AI SDK 组合。脚本中有 `dev:worker`、`dev:watchdog`、`dev:board`，说明它把 Web 页面、任务 Worker、看门狗、队列看板拆开运行。

对我们当前阶段的意义：

- 前端 Phase 2 只需要用 mock 表达“队列存在”和“任务可追踪”，不要接 BullMQ。
- 后端阶段可以参考它把 `Task`、`TaskEvent`、`GraphRun` 拆开的思路。
- `scripts/check-no-console.ts`、`scripts/check-model-config-contract.ts`、`scripts/check-pricing-catalog.ts` 等工程脚本适合作为后续质量门思路，不属于静态原型范围。

### 2.2 数据组织方式

核心表来自 `/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma`。

项目与剧集：

- `Project`，映射表名 `projects`，包含 `name`、`description`、`userId`、`novelPromotionData`、`usageCosts`。
- `NovelPromotionProject`，映射表名 `novel_promotion_projects`，包含 `analysisModel`、`imageModel`、`videoModel`、`audioModel`、`videoRatio`、`ttsRate`、`globalAssetText`、`artStyle`、`artStylePrompt`、`characterModel`、`locationModel`、`storyboardModel`、`editModel`、`videoResolution`、`capabilityOverrides`、`workflowMode`、`imageResolution`。
- `NovelPromotionEpisode`，映射表名 `novel_promotion_episodes`，包含 `episodeNumber`、`novelText`、`audioUrl`、`srtContent`、`speakerVoices`，并关联 `clips`、`shots`、`storyboards`、`voiceLines`、`editorProject`。

角色与场景：

- `NovelPromotionCharacter`，映射表名 `novel_promotion_characters`，包含 `name`、`aliases`、`customVoiceUrl`、`voiceId`、`voiceType`、`profileData`、`profileConfirmed`、`introduction`、`sourceGlobalCharacterId`。
- `CharacterAppearance`，映射表名 `character_appearances`，包含 `appearanceIndex`、`changeReason`、`description`、`imageUrl`、`imageUrls`、`selectedIndex`、`previousImageUrl`、`imageMediaId`。
- `NovelPromotionLocation`，映射表名 `novel_promotion_locations`，包含 `name`、`summary`、`assetKind`、`sourceGlobalLocationId`、`selectedImageId`。
- `LocationImage`，映射表名 `location_images`，包含 `imageIndex`、`description`、`availableSlots`、`imageUrl`、`isSelected`、`previousImageUrl`。

分镜、面板、视频：

- `NovelPromotionShot`，映射表名 `novel_promotion_shots`，包含 `shotId`、`srtStart`、`srtEnd`、`srtDuration`、`sequence`、`locations`、`characters`、`plot`、`imagePrompt`、`scale`、`module`、`focus`、`zhSummarize`、`imageUrl`、`pov`。
- `NovelPromotionStoryboard`，映射表名 `novel_promotion_storyboards`，包含 `storyboardImageUrl`、`panelCount`、`storyboardTextJson`、`imageHistory`、`candidateImages`、`lastError`、`photographyPlan`。
- `NovelPromotionPanel`，映射表名 `novel_promotion_panels`，包含 `panelIndex`、`panelNumber`、`shotType`、`cameraMove`、`description`、`location`、`characters`、`props`、`srtSegment`、`duration`、`imagePrompt`、`imageUrl`、`imageHistory`、`videoPrompt`、`firstLastFramePrompt`、`videoUrl`、`videoGenerationMode`、`candidateImages`、`linkedToNextPanel`、`lipSync` 相关字段、`actingNotes`、`matchedVoiceLines`。
- `SupplementaryPanel`，映射表名 `supplementary_panels`，用于补充面板。

任务、成本、运行图：

- `Task`，映射表名 `tasks`，包含 `type`、`targetType`、`targetId`、`status`、`progress`、`attempt`、`maxAttempts`、`priority`、`dedupeKey`、`externalId`、`payload`、`result`、`errorCode`、`errorMessage`、`billingInfo`、`queuedAt`、`startedAt`、`finishedAt`、`heartbeatAt`。
- `TaskEvent`，映射表名 `task_events`，包含 `eventType`、`payload`、`taskId`、`projectId`。
- `GraphRun`，映射表名 `graph_runs`，包含 `workflowType`、`taskType`、`taskId`、`targetType`、`targetId`、`status`、`input`、`output`、`error`、`workflowVersion`。
- `GraphStep`、`GraphStepAttempt`、`GraphEvent`、`GraphCheckpoint`、`GraphArtifact` 组成可追踪的工作流运行记录。
- `UsageCost`，映射表名 `usage_costs`，包含 `apiType`、`model`、`action`、`quantity`、`unit`、`cost`、`metadata`、`projectId`、`userId`。

资产库：

- `GlobalAssetFolder`、`GlobalCharacter`、`GlobalCharacterAppearance`、`GlobalLocation`、`GlobalLocationImage`、`GlobalVoice` 组成全局资产库。
- `MediaObject` 保存统一媒体对象，包含 `publicId`、`storageKey`、`sha256`、`mimeType`、`sizeBytes`、`width`、`height`、`durationMs`。

对我们数据模型的直接启发：

- `Shot` 与 `Panel` 应分开。`Shot` 是叙事和镜头意图，`Panel` 是实际生成图/视频/TTS 绑定点。
- `Panel` 要保存 `imagePrompt`、`videoPrompt`、`firstLastFramePrompt`、候选图、候选视频、采纳状态、失败原因。
- `Task` 要独立于素材。素材不是任务本身，而是任务的结果或候选结果。
- `CostRecord` 要独立于任务和素材，后续才便于按项目、模型、分镜、资产做统计。

### 2.3 值得参考的页面与组件

`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/page.tsx`：

- 组件 `WorkspacePage`。
- 函数 `fetchProjects`、`handleSearch`、`openCreateModal`、`handlePageChange`、`handleCreateProject`、`formatDate`、`handleEditProject`。
- 类型 `ProjectStats`、`Project`、`Pagination`。
- 使用 `TaskStatusInline`、`resolveTaskPresentationState`、`formatProjectCost`。

参考价值：我们的 Dashboard / Project List 可以显示项目成本、项目进度、图像数、视频数、面板数、最近任务，而不只是项目标题。

`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/StageNavigation.tsx`：

- 组件 `StageNavigation`。
- 阶段包括 `config`、`assets`、`storyboard`、`videos`、`voice`。
- 状态字段包括 `hasNovelText`、`hasAudio`、`hasAssets`、`hasStoryboards`、`hasVideos`、`hasVoiceLines`。

参考价值：我们的 `ProductionStepRail` 不应只是装饰步骤条，应显示每一步是否可进入、是否完成、是否缺依赖。

`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/asset-hub/components/AssetGrid.tsx`：

- 组件 `AssetGrid`、`AddAssetDropdown`。
- 函数 `groupAssetsByKind`。
- 按 `character`、`location`、`prop`、`voice` 分组。

参考价值：我们的 `AssetReviewGrid` 可以按 `image`、`video`、`audio`、`subtitle`、`character-ref`、`scene-ref` 分组，并保留筛选栏。

`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/asset-hub/components/CharacterCard.tsx`：

- 组件 `CharacterCard`。
- 函数 `handleGenerate`、`handleSelectImage`、`handleConfirmSelection`、`handleUndo`、`handleUpload`。
- 支持多候选 `imageUrls`、`selectedIndex`、上一版回退、任务 overlay。

参考价值：我们的 `CharacterCard` 和 `CharacterAppearance` 应展示“主视觉已选候选 + 备选候选 + 一致性状态”，而不是只有一张头像。

`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/task/TaskStatusInline.tsx` 与 `TaskStatusOverlay.tsx`：

- 用于区分已有素材上的任务 overlay、无素材时的 placeholder、失败状态、进行中状态。
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/presentation.ts` 的函数 `resolveTaskPresentationState` 把任务状态映射为 UI 呈现状态。

参考价值：我们的 `GenerationTaskStatus` 不应只显示“生成中”，还要根据是否已有候选素材决定显示为占位、覆盖层、内联状态或错误提示。

### 2.4 任务状态、成本统计、素材流程启发

`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/types.ts` 定义：

- `TASK_STATUS`：`queued`、`processing`、`completed`、`failed`、`canceled`、`dismissed`。
- `TASK_TYPE` 包含 `image_panel`、`image_character`、`image_location`、`video_panel`、`lip_sync`、`voice_line`、`regenerate_storyboard_text`、`panel_variant`、`story_to_script_run`、`script_to_storyboard_run`、`clips_build` 等。
- 类型 `TaskJobData`、`TaskBillingInfo`、`SSEEvent`、`CreateTaskInput`。

对我们的启发：

- `GenerationTask.status` 建议覆盖 `queued`、`processing`、`completed`、`failed`、`canceled`、`needs_review`、`accepted`、`rejected`。
- `GenerationTask.type` 建议拆成 `script_agent`、`storyboard_agent`、`image_generation`、`video_generation`、`tts_generation`、`subtitle_generation`、`asset_review`。
- `TaskQueuePanel` 在 Dashboard 和 Generation Workspace 都要出现。
- `FailureReasonPanel` 要与 `GenerationTask.errorCode`、`errorMessage`、`ReflectionNote` 联动。

`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/model-config-contract.ts`、`model-capabilities/catalog.ts`、`model-pricing/catalog.ts`、`billing/cost.ts` 提供：

- `CapabilitySelections`、`ModelCapabilities`、`ImageCapabilities`、`VideoCapabilities`、`AudioCapabilities`。
- 视频能力包括 `generationModeOptions`、`durationOptions`、`fpsOptions`、`resolutionOptions`、`firstlastframe`、`supportGenerateAudio`。
- 函数 `validateModelCapabilities`、`validateCapabilitySelectionsPayload`、`listBuiltinCapabilityCatalog`、`findBuiltinCapabilities`、`listBuiltinPricingCatalog`、`resolveModelPriceStrict`、`resolveVideoDurationRangeFromCapabilities`、`validateVideoSelectionsAgainstCapabilitiesOrThrow`。

对我们的启发：

- `ModelCapabilityBadge` 应展示当前模型是否支持首尾帧、参考图、多图、音频、时长、分辨率。
- `ProviderSelector` 不需要真实配置，但 mock 要体现 `gpt-image-2`、`nano banana`、`Seedance 2.0`、`MiniMax TTS` 的能力差异。
- `CostBreakdownPanel` 要按模型、任务类型、分镜、项目汇总成本。

### 2.5 worker 相关代码启发

`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/workers/` 下存在 `index.ts`、`image.worker.ts`、`video.worker.ts`、`voice.worker.ts`、`text.worker.ts` 以及多个 task handler。它体现了图像、视频、语音、文本分 worker 处理的工程思路。

对我们当前阶段的结论：

- 静态原型只显示 worker-like 状态，不实现 worker。
- 后端阶段可考虑把生图、生视频、TTS、Agent 文本任务分队列。
- 前端不要假装“立即完成”，应该用 mock 展示排队、处理中、失败、重试、采纳的生命周期。

### 2.6 不能借鉴或不能商用复制

- 不复制 `/Users/huabi/code/AI-video-studio/references/waoowaoo/` 内任何页面、组件、worker、schema 的实现代码。
- 用户要求中明确指出 `waoowaoo` 存在非商业协议限制；本次仅学习架构思想，具体协议细节以该仓库 LICENSE/README 为准，本文未确认完整授权条款。
- 不照搬其小说推广业务字段，例如 `NovelPromotionProject`、`NovelPromotionPanel` 名称不应出现在我们的正式领域模型中。
- 不照搬其 UI 视觉。我们的视觉方向是英歌非遗、国风水墨、黑神话悟空质感、剑来漫剧氛围，不是通用小说视频工具。

## 3. Toonflow-app 分析

### 3.1 项目定位与技术栈

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/package.json` 显示该项目为 Apache-2.0，使用 Electron、Express、SQLite、Knex、Socket.io、AI SDK、`@huggingface/transformers`、`better-sqlite3`、`vm2` 等。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md` 描述其核心能力：

- 无限画布式生产工作台。
- 三层 Agent 协作：决策层、执行层、监督层。
- 本地 ONNX 向量检索和长期记忆。
- 可编程厂商系统。
- 章节事件图。
- Skill 文件驱动 Agent 能力。

对我们当前阶段的意义：

- 它是 Agent 架构参考，不是 UI 代码来源。
- 我们可以在静态原型里展示 Agent 编排、Memory、Skill、Supervision 的“状态与痕迹”，不实现真实 Agent。

### 3.2 Agent 分层设计

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/index.ts`：

- 类型 `AgentContext`。
- 函数 `buildMemPrompt`、`runDecisionAI`、`createSubAgent`、`consumeFullStream`、`removeAllXmlTags`。
- `runDecisionAI` 创建 `new Memory("scriptAgent", isolationKey)`，读取 `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/script_agent_decision.md`，查询 `o_project`、`o_novel`。
- `createSubAgent` 注册 `run_sub_agent_storySkeleton`、`run_sub_agent_adaptationStrategy`、`run_sub_agent_script`、`run_supervision_agent`。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/tools.ts`：

- Zod schema：`ScriptSchema`、`planData`。
- 工具函数：`get_novel_events`、`get_planData`、`get_novel_text`、`get_script_content`。
- 读取表 `o_novel`、`o_script`。

对我们的 Script Studio 启发：

- `Script & Storyboard Generator` 页面右侧 `AgentRunTimeline` 应显示：`DecisionAgent` 规划、`StorySkeletonAgent` 梳理人物短视频叙事、`AdaptationStrategyAgent` 调整英歌文化表达、`ScriptAgent` 输出文案、`SupervisionAgent` 评审。
- 静态原型只展示这些运行记录和评分，不真的调用 Agent。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/index.ts`：

- 类型 `AgentContext`。
- 函数 `buildMemPrompt`、`runDecisionAI`、`createSubAgent`。
- 读取 `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/production_agent_decision.md`。
- 查询 `o_project`，读取项目模型配置 `imageModel`、`videoModel`、`mode`。
- 子 Agent 包含 `run_sub_agent_derive_assets`、`run_sub_agent_generate_assets`、`run_sub_agent_director_plan`，并继续衍生分镜表和分镜面板相关 Agent。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/tools.ts`：

- Zod schema `deriveAssetSchema`：字段 `id`、`assetsId`、`prompt`、`name`、`desc`、`src`、`state`、`type`，其中 `state` 包含 `未生成`、`生成中`、`已完成`、`生成失败`，`type` 包含 `role`、`tool`、`scene`、`clip`。
- Zod schema `assetItemSchema`：字段 `id`、`name`、`type`、`prompt`、`desc`、`derive`。
- Zod schema `storyboardSchema`：字段 `id`、`duration`、`prompt`、`associateAssetsIds`、`src`、`index`。
- 工具函数 `get_flowData`、`add_deriveAsset`、`del_deriveAsset`、`generate_deriveAsset`、`generate_storyboard`。

对我们的 Generation Workspace 启发：

- 前端应展示“衍生资产”概念：角色参考图、场景参考图、道具参考图、分镜候选图都来自某个 Prompt 或 Agent 建议。
- `AssetLineagePanel` 应显示 asset 从哪个 `PromptDraft`、哪个 `AgentRun`、哪个 `GenerationTask` 来。

### 3.3 Skill 系统与 Memory

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/skillsTools.ts`：

- 类型 `SkillAttribution`、`SkillInput`、`SkillPaths`。
- 函数 `parseFrontmatter`、`useSkill`、`buildSkillPrompt`、`createSkillTools`、`scanSkills`、`read_skill_file`。
- 使用 `is-path-inside` 限制技能文件读取范围。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/memory.ts`：

- 类 `Memory`。
- 函数 `vectorSearch`、`generateSummary`、`judgeSummaryRelevance`、`getConfigData`、`add`、`get`、`deepRetrieve`、`getTools`。
- 表 `memories` 字段包括 `isolationKey`、`type`、`embedding`、`relatedMessageIds`、`summarized`。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/embedding.ts`：

- 函数 `initEmbedding`、`getEmbedding`、`cosineSimilarity`、`disposeEmbedding`。
- 使用本地 embedding 模型，`transformersEnv.allowRemoteModels=false`。

对我们的 Reflection Inspector 启发：

- `MemoryContextPanel` 可在静态原型中展示“本次 Agent 引用的角色圣经字段、上一轮失败原因、已采纳素材、禁止词”，但不做真实向量检索。
- `SkillBadge` 可展示 `script_agent_decision.md`、`production_agent_decision.md`、`production_agent_supervision.md` 这类技能概念的 mock 对应物，例如“英歌动作校验”“角色一致性校验”“Prompt 负向词检查”。

### 3.4 数据库与服务结构

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/types/database.d.ts` 定义了大量表接口：

- `memories`
- `o_agentDeploy`
- `o_agentWorkData`
- `o_artStyle`
- `o_assets`
- `o_assets2Storyboard`
- `o_assetsRole2Audio`
- `o_event`
- `o_eventChapter`
- `o_image`
- `o_imageFlow`
- `o_modelPrompt`
- `o_novel`
- `o_outline`
- `o_project`
- `o_prompt`
- `o_script`
- `o_scriptAssets`
- `o_setting`
- `o_skillAttribution`
- `o_skillList`
- `o_storyboard`
- `o_tasks`
- `o_vendorConfig`
- `o_video`
- `o_videoTrack`

重点字段：

- `o_storyboard`：`duration`、`filePath`、`flowId`、`prompt`、`reason`、`shouldGenerateImage`、`state`、`track`、`trackId`、`videoDesc`。
- `o_tasks`：`describe`、`model`、`projectId`、`reason`、`relatedObjects`、`startTime`、`state`、`taskClass`。
- `o_videoTrack`：`duration`、`prompt`、`reason`、`selectVideoId`、`state`、`videoId`。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/lib/initDB.ts` 初始化 `o_agentDeploy`，包含 `scriptAgent`、`productionAgent`、`universalAi`、`ttsDubbing`，以及 `scriptAgent:decisionAgent`、`scriptAgent:supervisionAgent`、`scriptAgent:storySkeletonAgent`、`scriptAgent:adaptationStrategyAgent`、`scriptAgent:scriptAgent`、`productionAgent:decisionAgent` 等。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/routes/agents/getMemory.ts`：

- 读取 `projectId`、`agentType`、`episodesId`。
- 计算 `isolationKey`。
- 从 `memories` 读取历史消息并归一化 role。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/routes/production/getFlowData.ts`：

- 读取 `o_agentWorkData`、`o_script`、`o_scriptAssets`、`o_assets`、`o_image`、`o_storyboard`、`o_assets2Storyboard`。
- 构造 `FlowData`：`script`、`scriptPlan`、`assets`、`storyboardTable`、`storyboard`。

对我们 mock 数据的启发：

- `AgentRun` 应包含 `agentType`、`stepKey`、`status`、`inputSummary`、`outputSummary`、`score`、`issues`。
- `SkillConfig` 应包含 `path`、`agentType`、`enabled`、`description`、`status`。
- `Panel` 应增加 `videoDesc`、`track`、`shouldGenerateImage`、`associateAssetIds`。

### 3.5 技能文件里的生产流程启发

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/script_agent_decision.md`：

- 决策层只调度，不读取工作区详情。
- 执行层和监督层负责读写具体内容。
- 剧本流水线：项目初始化、故事骨架、改编策略、剧本编写。
- 评审报告使用 A/B/C/D 评级。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/production_agent_decision.md`：

- 生产流水线：导演规划、衍生资产分析、衍生资产生成、构建分镜表、分镜面板写入、分镜图生成。
- 明确“生成视频 / 合成视频相关请求不执行，提醒用户视频生成请前往视频生成面板操作”。

这点对我们非常关键：`VideoGenerationPanel` 必须是独立一级主模块。Agent 可以辅助生成视频 Prompt 和建议参数，但视频生成动作应在视频生成面板中被用户确认。

`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/production_agent_supervision.md`：

- Supervision Agent 只评审，不修改。
- 评审维度包括资产引用、剧本忠实度、风格一致性、必填字段、可感知具体性、父资产/衍生资产选择。

对我们的 `ReflectionInspector` 启发：

- 复盘不只是失败日志，还应展示“为什么这一轮素材不该采纳”。
- 评审维度建议：角色一致性、场景一致性、英歌动作准确性、Prompt 可执行性、视频运动合理性、成本风险。

### 3.6 第一阶段应该 mock 展示的 Agent 状态

建议静态原型展示以下 Agent 状态：

- `DecisionAgent`：已规划 / 等待输入 / 阻塞。
- `ScriptAgent`：生成中 / 已生成 / 需要人工修改 / 失败。
- `StoryboardAgent`：已拆分 5-8 个分镜 / 缺角色绑定 / 缺场景绑定。
- `PromptAgent`：图片 Prompt 已生成 / 视频 Prompt 已生成 / 负向词待补充。
- `CriticAgent` 或 `SupervisionAgent`：评级 A/B/C/D，列出问题和建议。
- `ProductionAgent`：仅做资产分析和分镜图建议，不自动生成视频。

### 3.7 第一阶段后置能力

- 不做真实 Agent 编排。
- 不做真实 Skill 编辑器。
- 不做真实 Memory/RAG。
- 不做本地向量模型。
- 不做 Electron 或无限画布。
- 不做可编程 vendor 执行沙箱。
- 不把 Toonflow 的数据库结构直接 fork 到本项目。

## 4. huobao-drama 分析

### 4.1 项目定位、协议与技术栈

`/Users/huabi/code/AI-video-studio/references/huobao-drama/README.md` 显示该项目使用 Nuxt3/Vue3 前端，Hono + Drizzle + Mastra Agents + better-sqlite3 后端，并覆盖角色管理、分镜、视频生成、TTS、FFmpeg 合成、素材管理、任务进度。

README 中许可证标识为 CC BY-NC-SA 4.0。按照用户要求，它存在非商业协议限制，只能学习设计思想，不可复制代码或商用迁移。

### 4.2 后端数据结构参考

核心 schema 来自 `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts`。

项目与剧集：

- `dramas`：`id`、`title`、`description`、`genre`、`style`、`totalEpisodes`、`totalDuration`、`status`、`thumbnail`、`tags`、`metadata`。
- `episodes`：`dramaId`、`episodeNumber`、`title`、`content`、`scriptContent`、`description`、`duration`、`status`、`videoUrl`、`thumbnail`、`imageConfigId`、`videoConfigId`、`audioConfigId`。

角色、场景、道具：

- `characters`：`dramaId`、`name`、`role`、`description`、`appearance`、`personality`、`voiceStyle`、`imageUrl`、`referenceImages`、`seedValue`、`sortOrder`、`localPath`、`voiceSampleUrl`、`voiceProvider`。
- `scenes`：`dramaId`、`episodeId`、`location`、`time`、`prompt`、`storyboardCount`、`imageUrl`、`status`、`localPath`。
- `props`：`dramaId`、`name`、`type`、`description`、`prompt`、`imageUrl`、`referenceImages`、`localPath`。
- `episodeCharacters`、`episodeScenes`、`storyboardCharacters` 处理多对多绑定。

分镜与素材：

- `storyboards`：`episodeId`、`sceneId`、`storyboardNumber`、`title`、`location`、`time`、`shotType`、`angle`、`movement`、`action`、`result`、`atmosphere`、`imagePrompt`、`videoPrompt`、`bgmPrompt`、`soundEffect`、`dialogue`、`description`、`duration`、`composedImage`、`firstFrameImage`、`lastFrameImage`、`referenceImages`、`videoUrl`、`ttsAudioUrl`、`subtitleUrl`、`composedVideoUrl`、`status`。
- `imageGenerations`：`storyboardId`、`dramaId`、`sceneId`、`characterId`、`propId`、`imageType`、`frameType`、`provider`、`prompt`、`negativePrompt`、`model`、`size`、`quality`、`style`、`steps`、`cfgScale`、`seed`、`imageUrl`、`status`、`taskId`、`errorMsg`、`width`、`height`、`referenceImages`。
- `videoGenerations`：`storyboardId`、`dramaId`、`provider`、`prompt`、`model`、`imageGenId`、`referenceMode`、`imageUrl`、`firstFrameUrl`、`lastFrameUrl`、`referenceImageUrls`、`duration`、`fps`、`resolution`、`aspectRatio`、`style`、`motionLevel`、`cameraMotion`、`seed`、`videoUrl`、`status`、`taskId`、`errorMsg`、`width`、`height`。
- `assets`：`dramaId`、`episodeId`、`storyboardId`、`storyboardNum`、`name`、`description`、`type`、`category`、`url`、`thumbnailUrl`、`localPath`、`fileSize`、`mimeType`、`width`、`height`、`duration`、`format`、`imageGenId`、`videoGenId`、`isFavorite`、`viewCount`。
- `videoMerges`：`episodeId`、`dramaId`、`title`、`provider`、`model`、`status`、`scenes`、`mergedUrl`、`duration`、`taskId`、`errorMsg`。

模型与 Agent 配置：

- `aiServiceConfigs`：`serviceType`、`provider`、`name`、`baseUrl`、`apiKey`、`model`、`endpoint`、`queryEndpoint`、`priority`、`isDefault`、`isActive`、`settings`。本次只读取字段名，不读取任何值。
- `aiServiceProviders`、`aiVoices`、`agentConfigs`。

对我们数据模型的直接启发：

- `Shot` 需要 `shotType`、`angle`、`movement`、`action`、`result`、`atmosphere`、`dialogue`、`duration`。
- `Panel` 或 `Shot` 需要 `firstFrameImage`、`lastFrameImage`、`referenceImages`。
- `VideoAsset` 需要 `referenceMode`、`duration`、`fps`、`resolution`、`aspectRatio`、`motionLevel`、`cameraMotion`。
- `AudioAsset` 和 `SubtitleAsset` 应独立建模，不要塞进视频资产。

### 4.3 短剧生产流程组织

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/routes/storyboards.ts`：

- 函数 `parseDialogueForTTS` 从对白中解析 TTS 内容。
- 函数 `syncStoryboardCharacters` 同步分镜角色绑定。
- 函数 `getStoryboardCharacterIds` 获取分镜角色。
- 函数 `validateStoryboardBindings` 校验分镜与角色、场景绑定。
- 路由 `POST /storyboards` 创建分镜。
- 路由 `PUT /:id` 更新分镜，并在对白变化时重置 TTS。
- 路由 `POST /:id/generate-tts` 根据角色 `voiceStyle` 调用 `generateTTS` 并更新 `ttsAudioUrl`。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/routes/images.ts`：

- `POST /images` 校验 prompt，按 storyboard/episode 解析配置，调用 `generateImage`，写入 image generation 记录。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/routes/videos.ts`：

- `POST /videos` 校验 prompt，按 storyboard/episode 解析配置，调用 `generateVideo`。
- 参数包括 `referenceMode`、`imageUrl`、`firstFrameUrl`、`lastFrameUrl`、`referenceImageUrls`、`duration`、`aspectRatio`。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/image-generation.ts`：

- 类型 `GenerateImageParams`。
- 函数 `generateImage`、`processImageGeneration`、`normalizeReferenceImages`、`pollImageTask`。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/video-generation.ts`：

- 类型 `GenerateVideoParams`。
- 函数 `generateVideo`、`processVideoGeneration`、`normalizeVideoReferenceUrl`、`normalizeVideoReferenceUrls`、`pollVideoTask`、`handleVideoComplete`。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/tts-generation.ts`：

- 函数 `generateTTS`、`generateVoiceSample`。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/ffmpeg-compose.ts`：

- 函数 `toAbsPath`、`supportsSubtitleFilter`、`parseDialogueForTTS`、`composeStoryboard`。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/ffmpeg-merge.ts`：

- 函数 `mergeEpisodeVideos`、`doMerge`、`getVideoDuration`。

对我们流程的启发：

- 第一阶段静态原型只需要展示“分镜视频制作方案”导出，不做 FFmpeg 合成。
- TTS 应在 `TTSGenerationPanel` 中作为一级模块出现，并显示角色声音、对白、音频候选、字幕状态。
- 分镜创建与更新必须保留角色/场景绑定状态，避免后续 Prompt 脱离角色圣经。

### 4.4 Mastra Agents 与 Skill 参考

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/index.ts`：

- 常量 `DEFAULT_PROMPTS` 包含 `script_rewriter`、`extractor`、`storyboard_breaker`、`voice_assigner`、`grid_prompt_generator`。
- 函数 `getAgentConfig`、`getModel`、`createAgent`。
- `createAgent` 加载 DB agent config、文本模型和 `loadAgentSkills`，再选择 `createScriptTools`、`createExtractTools`、`createStoryboardTools`、`createVoiceTools`、`createGridPromptTools`。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/skills.ts`：

- 函数 `stripFrontmatter`、`readSkill`、`loadAgentSkills`。

Skill 文件参考：

- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/script_rewriter/SKILL.md`：剧本格式、场景标题、对白规则，不强调镜头语言。
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/extractor/SKILL.md`：抽取角色 `name`、`role`、`appearance`、`personality`、`description`，抽取场景 `location`、`time`、`atmosphere`、`prompt`。
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/storyboard_breaker/SKILL.md`：分镜字段包括 `title`、`time`、`location`、`shot_type`、`angle`、`movement`、`action`、`dialogue`、`result`、`atmosphere`、`duration`、`image_prompt`、`video_prompt`、`bgm_prompt`、`sound_effect`、`scene_id`、`character_ids`。
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/voice_assigner/SKILL.md`：按性别、年龄、人格、角色匹配声音。
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/grid_prompt_generator/SKILL.md`：支持 character、scene、grid prompt，以及 `first_frame`、`first_last`、`multi_ref` 模式。

对我们的 Agent mock 启发：

- `SkillConfig` 不应只是技术技能，而应映射业务能力：剧本改写、角色/场景抽取、分镜拆解、声音匹配、首尾帧 Prompt。
- `AgentRunTimeline` 可以展示这些技能被哪个 Agent 使用，以及输出是否通过 Critic。

### 4.5 前端页面结构参考

`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/index.vue`：

- 函数 `load`、`create`、`delDrama`、`fmtDate`、`getProgress`。
- 项目卡显示集数、角色数、场景数、风格标签、进度。

对 Dashboard 的启发：项目卡应显示角色数、场景数、分镜数、素材完成度、成本，而不只是项目状态。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/index.vue`：

- 函数 `hasScript`、`configLabel`、`load`、`loadConfigs`、`openAddEpisode`、`addEpisode`。
- 创建 episode 时锁定 image/video/audio config。

对我们的启发：项目创建时可 mock 展示模型配置是否已就绪；未配置不阻断静态展示，但应提示。

`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue`：

- 页面包含 raw content、AI rewrite、extract characters/scenes、voice assignment、storyboard list。
- 相关函数名包括 `doRewrite`、`skipRewrite`、`doExtract`、`doVoice`、`batchGenSamples`、`doBreakdown`、`addShot`。

对 Script Studio 的启发：`ProductionStepRail` 可以明确展示“剧本生成/改写 -> 角色场景抽取 -> 声音匹配 -> 分镜拆解 -> Prompt 生成”。

### 4.6 第一阶段只做静态占位的流程

- 不真实执行 `generateImage`、`generateVideo`、`generateTTS`。
- 不真实调用 Mastra Agent。
- 不真实执行 `composeStoryboard`、`mergeEpisodeVideos` 或 FFmpeg。
- 不真实上传、下载或存储媒体。
- 不真实读取或保存 `aiServiceConfigs.apiKey`。
- 不做 webhook、轮询、后台任务，只展示 mock 状态。

## 5. 对 6 个页面的影响

### 5.1 Dashboard / Project List

应参考：

- `waoowaoo` 的 `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/page.tsx`，项目卡附带 `ProjectStats`、成本、任务状态。
- `huobao-drama` 的 `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/index.vue`，项目卡显示集数、角色数、场景数、进度。

应增加状态/指标/mock 字段：

- `currentStage`：角色选择、剧本、分镜、生成、审核、已导出。
- `runningTaskCount`、`failedTaskCount`、`queuedTaskCount`。
- `totalCostCny`、`estimatedRemainingCostCny`、`budgetUsedPercent`。
- `characterCount`、`sceneCount`、`shotCount`、`panelCount`、`acceptedAssetCount`。
- `modelConfigStatus`：文本/生图/生视频/TTS 是否已配置，静态展示。

页面实现建议：

- 右侧保留 `TaskQueuePanel` 与 `CostBreakdownPanel`。
- 项目卡显示“下一步动作”，例如“进入视频生成面板”。

### 5.2 Yingge Character Library

应参考：

- `waoowaoo` 的 `NovelPromotionCharacter`、`CharacterAppearance`、`GlobalCharacter`、`GlobalCharacterAppearance`。
- `huobao-drama` 的 `characters` 表，尤其 `appearance`、`personality`、`voiceStyle`、`referenceImages`、`voiceSampleUrl`。

应增加字段：

- `appearanceCount`、`selectedAppearanceId`、`voiceId`、`voiceStyle`、`voiceSampleStatus`。
- `referenceImageIds`、`positivePromptKeywords`、`negativePromptKeywords`。
- `profileConfirmed`、`fieldCompleteness`、`sourceExcelRow`。

页面实现建议：

- 角色卡要显示主视觉候选和字段完整度。
- 右侧 Inspector 显示“角色圣经字段来源”和“可用于 Prompt 的正负向词”。

### 5.3 Character Detail / Character Bible

应参考：

- `waoowaoo` 的 `CharacterAppearance`：多外观、多候选、已选 index、上一版回退。
- `Toonflow-app` 的 Memory 思路：角色详情页可以静态展示“已被哪些项目/Prompt/Agent 引用”。
- `huobao-drama` 的 `characters.referenceImages` 与 `voiceStyle`。

应增加字段：

- `CharacterAppearance.changeReason`、`description`、`imageUrls`、`selectedIndex`、`consistencyStatus`。
- `visualDo`、`visualDont`、`culturalAccuracyNotes`、`voiceStyle`。
- `assetLineage`：该角色视觉来自 Excel、人工上传、AI 生成或已采纳候选。

页面实现建议：

- `VisualProfilePanel` 展示脸谱主色、纹样、武器、服装、动作关键词。
- `CharacterBibleTabs` 保留身份层、内核层、文化视觉层、叙事素材层、商业文化层。

### 5.4 Script & Storyboard Generator

应参考：

- `Toonflow-app` 的 `scriptAgent`：`runDecisionAI`、`createSubAgent`、`run_sub_agent_storySkeleton`、`run_sub_agent_adaptationStrategy`、`run_sub_agent_script`、`run_supervision_agent`。
- `huobao-drama` 的 `storyboard_breaker/SKILL.md` 分镜字段。
- `waoowaoo` 的 `StageNavigation` 依赖状态。

应增加字段：

- `AgentRun`：`agentType`、`stepKey`、`status`、`score`、`issues`。
- `Shot`：`shotType`、`angle`、`movement`、`action`、`dialogue`、`atmosphere`、`durationSec`。
- `Panel`：`videoDesc`、`shouldGenerateImage`、`associateAssetIds`。

页面实现建议：

- 左侧 `ProductionStepRail` 要展示依赖关系，而不是纯序号。
- 右侧 `AgentRunTimeline` 和 `ReflectionInspector` 展示 Agent 评级、风险和可修正项。

### 5.5 Prompt & Generation Workspace

应参考：

- `waoowaoo` 的 `NovelPromotionPanel`、`Task`、`TaskEvent`、`TaskStatusOverlay`、`resolveTaskPresentationState`。
- `waoowaoo` 的 `model-config-contract.ts`、`model-capabilities/catalog.ts`、`model-pricing/catalog.ts`。
- `Toonflow-app` 的 `production_agent_decision.md`：视频生成必须前往视频面板操作。
- `huobao-drama` 的 `imageGenerations`、`videoGenerations`、`storyboards.firstFrameImage`、`storyboards.lastFrameImage`。

应增加字段：

- `PromptDraft.promptType`：image、video、negative、tts、subtitle。
- `ModelConfig.capabilities`：首尾帧、多参考图、分辨率、时长、是否生音频。
- `GenerationTask`：`queuedAt`、`startedAt`、`attempt`、`errorCode`、`billingInfo`。
- `VideoAsset.referenceMode`、`firstFrameAssetId`、`lastFrameAssetId`。

页面实现建议：

- `VideoGenerationPanel` 是一级模块，和 `ImageGenerationPanel`、`TTSGenerationPanel` 并列。
- `TaskQueuePanel`、`ModelCapabilityBadge`、`CostBreakdownPanel` 必须可见。
- 生成按钮只是静态控件，不接真实 API。

### 5.6 Asset Review / Final Video Library

应参考：

- `waoowaoo` 的 `MediaObject`、`UsageCost`、`TaskEvent`、`GraphArtifact`。
- `huobao-drama` 的 `assets`、`imageGenerations`、`videoGenerations`、`videoMerges`。
- `Toonflow-app` 的 `production_agent_supervision.md` 评审维度。

应增加字段：

- `asset.status`：candidate、accepted、rejected、failed、archived。
- `failureReason`、`reviewNote`、`acceptedBy`、`acceptedAt`。
- `lineage`：`promptDraftId`、`generationTaskId`、`modelConfigId`、`costRecordId`。
- `exportPlanStatus`：未导出、可导出、缺素材、已导出。

页面实现建议：

- `CandidateComparisonPanel` 支持同一 Panel 多候选对比。
- `AssetLineagePanel` 显示素材来源链路。
- `ExportButton` 只导出占位，不生成真实文件。

## 6. 对 mock 数据的影响

| 类型 | 参考来源 | 建议字段补充 | MVP 是否需要 | 静态原型是否展示 | 后端阶段是否需要 |
|---|---|---|---|---|---|
| `Project` | `waoowaoo.Project`、`NovelPromotionProject`、`huobao-drama.dramas`、`episodes` | `currentStage`、`workflowMode`、`targetDurationSec`、`videoRatio`、`artStyle`、`modelConfigStatus`、`runningTaskCount`、`failedTaskCount`、`totalCostCny`、`budgetUsedPercent`、`shotCount`、`panelCount`、`acceptedAssetCount` | 是 | 是 | 是 |
| `Character` | `waoowaoo.NovelPromotionCharacter`、`GlobalCharacter`、`huobao-drama.characters` | `aliases`、`role`、`personality`、`appearanceSummary`、`voiceStyle`、`voiceId`、`voiceProvider`、`profileConfirmed`、`referenceImageIds`、`positivePromptKeywords`、`negativePromptKeywords`、`sourceExcelRow` | 是 | 是 | 是 |
| `CharacterAppearance` | `waoowaoo.CharacterAppearance`、`GlobalCharacterAppearance` | `appearanceIndex`、`label`、`changeReason`、`description`、`imageUrl`、`imageUrls`、`selectedIndex`、`previousImageUrl`、`consistencyStatus`、`sourceAssetId` | 是 | 是 | 是 |
| `Scene` | `waoowaoo.NovelPromotionLocation`、`LocationImage`、`huobao-drama.scenes` | `location`、`time`、`summary`、`atmosphere`、`prompt`、`storyboardCount`、`selectedImageId`、`imageUrls`、`consistencyStatus` | 是 | 是 | 是 |
| `Shot` | `waoowaoo.NovelPromotionShot`、`huobao-drama.storyboards`、`Toonflow-app.o_storyboard` | `sequence`、`title`、`sceneId`、`characterIds`、`plot`、`shotType`、`angle`、`movement`、`action`、`dialogue`、`result`、`atmosphere`、`durationSec`、`status` | 是 | 是 | 是 |
| `Panel` | `waoowaoo.NovelPromotionPanel`、`Toonflow-app.storyboardSchema`、`huobao-drama.storyboards` | `panelIndex`、`panelNumber`、`shotId`、`description`、`videoDesc`、`imagePrompt`、`videoPrompt`、`firstLastFramePrompt`、`videoGenerationMode`、`linkedToNextPanel`、`track`、`associateAssetIds`、`candidateImageIds`、`candidateVideoIds` | 是 | 是 | 是 |
| `PromptDraft` | `waoowaoo.NovelPromotionPanel.imagePrompt/videoPrompt`、`huobao-drama.imageGenerations.prompt/videoGenerations.prompt`、`Toonflow-app.o_prompt` | `promptType`、`targetType`、`targetId`、`content`、`negativePrompt`、`sourceFieldNames`、`version`、`qualityStatus`、`validationWarnings`、`modelConfigId` | 是 | 是 | 是 |
| `ModelConfig` | `waoowaoo.model-config-contract.ts`、`model-capabilities/catalog.ts`、`model-pricing/catalog.ts`、`huobao-drama.aiServiceConfigs`、`Toonflow-app.o_vendorConfig` | `provider`、`model`、`capabilityType`、`capabilities`、`defaultParams`、`pricingMode`、`estimatedUnitCost`、`configured`、`displayName`、`priority` | 是 | 是 | 是 |
| `GenerationTask` | `waoowaoo.Task`、`TaskEvent`、`Toonflow-app.o_tasks`、`huobao-drama.imageGenerations/videoGenerations` | `type`、`targetType`、`targetId`、`status`、`progress`、`attempt`、`maxAttempts`、`dedupeKey`、`externalId`、`provider`、`model`、`errorCode`、`errorMessage`、`billingInfo`、`queuedAt`、`startedAt`、`finishedAt` | 是 | 是 | 是 |
| `ImageAsset` | `waoowaoo.MediaObject`、`NovelPromotionPanel.candidateImages`、`huobao-drama.imageGenerations`、`assets` | `url`、`thumbnailUrl`、`panelId`、`taskId`、`promptDraftId`、`provider`、`model`、`width`、`height`、`status`、`failureReason`、`referenceImageIds`、`costRecordId` | 是 | 是 | 是 |
| `VideoAsset` | `waoowaoo.NovelPromotionPanel.videoUrl`、`huobao-drama.videoGenerations`、`videoMerges`、`assets` | `url`、`thumbnailUrl`、`durationSec`、`fps`、`resolution`、`aspectRatio`、`referenceMode`、`firstFrameAssetId`、`lastFrameAssetId`、`status`、`failureReason`、`costRecordId` | 是 | 是 | 是 |
| `AudioAsset` | `waoowaoo.NovelPromotionVoiceLine`、`GlobalVoice`、`huobao-drama.storyboards.ttsAudioUrl`、`tts-generation.ts` | `url`、`durationSec`、`speaker`、`voiceId`、`voiceStyle`、`provider`、`model`、`lineText`、`status`、`taskId` | 是 | 是 | 是 |
| `SubtitleAsset` | `waoowaoo.NovelPromotionEpisode.srtContent`、`NovelPromotionPanel.srtSegment`、`huobao-drama.storyboards.subtitleUrl`、`ffmpeg-compose.ts` | `content`、`srtUrl`、`language`、`startSec`、`endSec`、`panelId`、`audioAssetId`、`status` | 是 | 是 | 是 |
| `CostRecord` | `waoowaoo.UsageCost`、`BalanceTransaction`、`billing/cost.ts` | `apiType`、`model`、`action`、`quantity`、`unit`、`estimatedCostCny`、`actualCostCny`、`projectId`、`taskId`、`assetId`、`metadata` | 是 | 是 | 是 |
| `ReflectionNote` | `Toonflow-app.production_agent_supervision.md`、`script_agent_supervision.md`、`waoowaoo.Task.errorMessage`、`huobao-drama.errorMsg` | `targetType`、`targetId`、`severity`、`category`、`message`、`suggestedPromptPatch`、`suggestedNegativeKeywords`、`agentScore`、`appliedStatus` | 是 | 是 | 是 |
| `AgentRun` | `Toonflow-app.scriptAgent`、`productionAgent`、`memories`、`waoowaoo.GraphRun/GraphStep`、`huobao-drama.agentConfigs` | `agentType`、`phase`、`stepKey`、`status`、`inputSummary`、`outputSummary`、`toolCalls`、`score`、`issues`、`startedAt`、`finishedAt`、`memoryRefs` | 是 | 是 | 是 |
| `SkillConfig` | `Toonflow-app.skillsTools.ts`、`o_skillList`、`huobao-drama.skills/*.md`、`agents/skills.ts` | `name`、`agentType`、`description`、`path`、`enabled`、`version`、`status`、`lastUsedAt` | 否，轻量需要 | 可展示为标签 | 是 |

## 7. 对组件的影响

| 组件 | 类型 | 参考来源 | 出现页面 | MVP 静态原型必须 |
|---|---|---|---|---|
| `ModelCapabilityBadge` | 新增 | `waoowaoo/src/lib/model-config-contract.ts`、`model-capabilities/catalog.ts` | Dashboard、Prompt & Generation Workspace | 是 |
| `ProviderSelector` | 强化 | `waoowaoo` model catalog、`huobao-drama.aiServiceConfigs`、`Toonflow-app.o_vendorConfig` | Prompt & Generation Workspace、TopStatusBar | 是 |
| `TaskQueuePanel` | 新增 | `waoowaoo.Task`、`TaskEvent`、`Toonflow-app.o_tasks` | Dashboard、Prompt & Generation Workspace | 是 |
| `AgentRunTimeline` | 新增 | `Toonflow-app.scriptAgent`、`productionAgent`、`waoowaoo.GraphRun/GraphStep` | Script & Storyboard Generator、Prompt & Generation Workspace、Asset Review | 是 |
| `SkillBadge` | 新增 | `Toonflow-app.skillsTools.ts`、`huobao-drama/skills/*.md` | Script & Storyboard Generator、RightInspector | 否，建议有 |
| `MemoryContextPanel` | 新增 | `Toonflow-app.Memory`、`getMemory.ts` | ReflectionInspector、Character Detail | 否，静态轻量展示 |
| `CostBreakdownPanel` | 强化 | `waoowaoo.UsageCost`、`billing/cost.ts` | Dashboard、Prompt & Generation Workspace、Asset Review | 是 |
| `CandidateComparisonPanel` | 新增 | `waoowaoo.NovelPromotionPanel.candidateImages`、`huobao-drama.imageGenerations/videoGenerations` | Prompt & Generation Workspace、Asset Review | 是 |
| `AssetLineagePanel` | 新增 | `waoowaoo.MediaObject`、`GraphArtifact`、`huobao-drama.assets` | Asset Review、Character Detail、Prompt & Generation Workspace | 是 |
| `FailureReasonPanel` | 强化 | `Toonflow-app.production_agent_supervision.md`、`waoowaoo.Task.errorMessage`、`huobao-drama.errorMsg` | Prompt & Generation Workspace、Asset Review | 是 |
| `FirstLastFrameLinkControl` | 新增 | `waoowaoo.FirstLastFramePanel.tsx`、`huobao-drama.storyboards.firstFrameImage/lastFrameImage` | Prompt & Generation Workspace | 是 |
| `VoiceLineBindingPanel` | 新增 | `waoowaoo.NovelPromotionVoiceLine`、`huobao-drama.generate-tts` 路由 | Prompt & Generation Workspace | 是 |
| `SceneConsistencyPanel` | 新增 | `waoowaoo.NovelPromotionLocation/LocationImage`、`huobao-drama.scenes` | Character Detail、Script & Storyboard Generator、Prompt & Generation Workspace | 是 |
| `ExportReadinessPanel` | 新增 | `huobao-drama.videoMerges`、`ffmpeg-merge.ts`、本项目 PRD 导出制作方案 | Asset Review / Final Video Library | 是，静态占位 |

## 8. 对后续后端设计的影响

后端阶段可以吸收的结构：

- 采用 `Task` + `TaskEvent` 记录任务生命周期，参考 `waoowaoo` 的 `tasks`、`task_events`。
- 采用 `AgentRun` + `AgentStep` 或 `GraphRun` + `GraphStep` 记录 Agent 与工作流运行，参考 `waoowaoo` 的 `graph_runs` 和 `Toonflow-app` 的 `o_agentDeploy`。
- 将 `MediaObject` 或统一 `Asset` 作为媒体底座，图片、视频、音频、字幕分别有业务资产表。
- 模型能力和定价用 catalog/config 管理，不把模型参数散落在页面里。
- 角色、场景、分镜、面板、Prompt、生成任务、素材、成本之间保留 lineage。

后端阶段不应照搬的结构：

- 不直接复用 `NovelPromotion*` 命名。
- 不直接复用 Toonflow 的 Electron/SQLite/无限画布模型。
- 不直接复用 huobao-drama 的 CC BY-NC-SA 代码或 DB schema。
- 不在第一版引入复杂账本冻结、余额系统、完整媒体迁移脚本。

## 9. 风险和边界

- 不复制三方项目代码，只学习架构、字段和流程思想。
- `waoowaoo` 和 `huobao-drama` 按用户要求视为存在非商业协议限制，只能学习设计思想，不能商用复制；其中 `huobao-drama` README 显示 CC BY-NC-SA 4.0。
- `Toonflow-app` 虽然 `package.json` 显示 Apache-2.0，也不能无脑 fork；其 Electron、VM、Skill 文件读取、vendor 执行、Memory/RAG 架构都需要安全审查和本项目适配。
- 第一阶段前端只做静态原型，不接真实 Agent、不接真实模型、不跑任务队列、不执行 FFmpeg、不上传真实资产。
- `/Users/huabi/code/AI-video-studio/references/` 只读，不得修改。
- 不要读取 `.env`、key、token、证书文件；本文仅记录公开 schema 中出现的字段名。
- 不确定的细节标记为“未确认”。例如 `waoowaoo` 的完整协议文件未在本次审计中确认，具体授权应另行核对 LICENSE/README。

## 10. 需要立刻影响 Phase 2 / Phase 3 的点

Phase 2 前端静态原型立即调整：

- 在 Dashboard 增加任务数、失败数、成本、模型配置状态、项目进度。
- 在 Character Library 和 Character Detail 增加多外观候选、声音风格、参考图、字段完整度、素材 lineage。
- 在 Script & Storyboard Generator 增加 `AgentRunTimeline`、`ProductionStepRail` 依赖状态、Shot 的镜头语言字段。
- 在 Prompt & Generation Workspace 强化 `VideoGenerationPanel` 为一级模块，并增加 `ModelCapabilityBadge`、`TaskQueuePanel`、`FirstLastFrameLinkControl`、`CostBreakdownPanel`。
- 在 Asset Review 增加候选对比、采纳/拒绝原因、素材 lineage、导出就绪度。

Phase 3 mock 数据立即调整：

- 补齐 `GenerationTask`、`ModelConfig`、`AgentRun`、`SkillConfig`、`ReflectionNote`。
- 将 `ImageAsset`、`VideoAsset`、`AudioAsset`、`SubtitleAsset` 分开，不再用一个泛 `Asset` 塞所有字段。
- 将 `Shot` 与 `Panel` 分开，Panel 承担生成绑定、首尾帧、候选素材和 Prompt 版本。
- 所有素材 mock 都要有 `promptDraftId`、`generationTaskId`、`modelConfigId`、`costRecordId` 之一或多个，用于展示来源链路。

## 11. 可以后置到后端阶段的点

- 真实 BullMQ/Redis/Worker 队列。
- 真实模型能力校验和定价计算。
- 真实 Agent 编排、Skill 编辑器、Memory/RAG、向量检索。
- 真实图片、视频、TTS 调用。
- 真实 webhook、轮询和异步任务恢复。
- 真实 FFmpeg `composeStoryboard`、`mergeEpisodeVideos`。
- 真实媒体对象去重、对象存储、签名 URL、迁移脚本。
- 真实成本扣费、余额冻结、账本对账。

## 12. 总结

三个参考项目分别补上了我们前端静态原型的三个缺口：

- `waoowaoo` 补工程化：任务、成本、模型能力、素材候选、状态呈现。
- `Toonflow-app` 补 Agent 化：决策、执行、监督、Skill、Memory、运行轨迹。
- `huobao-drama` 补短剧化：角色、场景、分镜、TTS、视频、字幕、合成、素材库字段。

最终落到当前项目，最重要的不是复制它们，而是把“英歌水浒角色圣经 + 专业 AI 视频生产工作台”的信息结构做扎实：每个分镜为什么这么写、每个 Prompt 从哪里来、每个素材为什么采纳或拒绝、每次生成花了多少钱、失败后下一轮怎么改。这些都应该在 Phase 2 / Phase 3 的页面和 mock 数据中立刻体现。
