# 前端静态原型计划源码参考补丁

本文档是 `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-static-prototype-plan-v1.md` 的补丁，不重写原计划，只补充 `/Users/huabi/code/AI-video-studio/docs/01-source-analysis/reference-projects-frontend-workflow-audit.md` 中必须影响 Phase 2 / Phase 3 / Phase 4 / Phase 5 的内容。

## 1. 补丁目的

### 1.1 为什么需要补充源码参考

原前端静态原型计划主要来自 PRD、UI 模块规格、gpt-image-2 视觉基准图和 Stitch 页面模板，已经定义了 6 个页面、AppShell、组件池和基础 mock 数据。但三个开源参考项目的源码分析补充了更偏工程工作流的事实：

- `waoowaoo` 证明任务队列、模型能力、素材候选、成本记录必须在前端信息架构里提前出现。相关参考包括 `/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` 的 `Task`、`TaskEvent`、`UsageCost`、`MediaObject`、`NovelPromotionPanel`，以及 `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/model-config-contract.ts`。
- `Toonflow-app` 证明 Agent 不应只作为一句“AI 建议”文案，而应在前端静态原型中体现运行轨迹、Skill、Memory 和监督评审。相关参考包括 `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/index.ts`、`productionAgent/index.ts`、`src/utils/agent/memory.ts`、`src/utils/agent/skillsTools.ts`。
- `huobao-drama` 证明短剧生产链路里角色、场景、分镜、图片、视频、TTS、字幕、合成、素材库需要明确拆分。相关参考包括 `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts` 的 `storyboards`、`imageGenerations`、`videoGenerations`、`assets`、`videoMerges`。

因此本补丁要把源码分析结论压回前端开发计划：页面不接真实后端，但要在 UI 和 mock 数据中预留真实生产系统会需要的结构。

### 1.2 如何影响 Phase 2 / Phase 3 / Phase 4 / Phase 5

- Phase 2：AppShell 必须提前容纳任务、模型健康、成本、Agent 入口和多类型 Inspector，避免后续页面各自重复实现。
- Phase 3：Dashboard 和 Character Library 不能只做静态卡片，要展示任务、成本、模型状态、最近 Agent Run、多外观和素材引用。
- Phase 4：Character Detail 与 Script Studio 必须体现角色多外观、Asset lineage、AgentRunTimeline、SkillBadge，并把 `Shot` 与 `Panel` 拆开建模。
- Phase 5：Generation Workspace 与 Asset Review 必须成为最完整的生产闭环，突出 VideoGenerationPanel、候选对比、任务队列、成本、失败原因和下一轮 Prompt 建议。

### 1.3 静态原型边界不变

本补丁不改变“第一阶段只做静态原型”的边界：

- 不接后端。
- 不接真实模型 API。
- 不跑 BullMQ、Redis、worker。
- 不调用真实 Agent。
- 不执行真实 Skill。
- 不读取真实 Memory/vector store。
- 不执行 FFmpeg。
- 不做真实视频轮询。
- 不读取 `.env`、key、token、证书文件。
- 不复制 `/Users/huabi/code/AI-video-studio/references/` 中任何代码。

## 2. 需要立刻影响 Phase 2 AppShell 的点

Phase 2 的 AppShell 是后续所有页面的骨架。源码分析显示，任务、模型、成本、Agent 和 Inspector 类型都必须在 Phase 2 预留，否则 Phase 5 会被迫重构。

### 2.1 需要新增或调整的组件

| 组件 | 新增/调整 | Phase 2 是否必须实现 | 若不完整实现是否需要预留 | 说明 |
|---|---|---:|---:|---|
| `TopStatusBar` | 调整 | 是 | 是 | 除当前项目、任务数、预算外，增加 `ModelHealthSummary`、`ProviderHealthSummary`、`TaskQueueSummary`、`CostSummaryMini`。 |
| `AppSidebar` | 调整 | 是 | 是 | 主导航继续保留 6 页面；可预留“模型配置”“素材库”“任务队列”入口，但 Phase 2 只做禁用或占位状态。 |
| `RightInspector` | 调整 | 是 | 是 | 支持不同 inspector 类型：`dashboard`、`character`、`script`、`generation`、`assetReview`、`agent`、`cost`。 |
| `TaskQueuePanel` | 新增 | 否，入口必须 | 是 | Phase 2 可只做顶部摘要或右侧占位；完整面板到 Phase 3/5。 |
| `CostBadge` / `CostSummaryMini` | 强化 | 是 | 是 | 全局展示预算消耗、项目成本、最近任务成本。 |
| `ModelCapabilityBadge` | 新增 | 否，摘要必须 | 是 | Phase 2 可只展示模型健康点；能力细节到 Phase 5。 |
| `ProviderHealthBadge` | 新增 | 是 | 是 | 展示 `gpt-image-2`、`nano banana`、`Seedance 2.0`、`MiniMax TTS` 的 mock 健康状态。 |
| `AgentRunEntryButton` | 新增 | 否 | 是 | TopStatusBar 或 RightInspector 中预留 Agent Run 入口；完整时间线到 Phase 4。 |

### 2.2 需要增加的 mock 字段

| Mock 数据 | 字段 | 来源参考 | Phase 2 是否必须 | 说明 |
|---|---|---|---:|---|
| `Project` | `currentStage`、`modelConfigStatus`、`runningTaskCount`、`failedTaskCount`、`totalCostCny`、`budgetUsedPercent` | `waoowaoo.Project`、`NovelPromotionProject`、`UsageCost` | 是 | 支撑 TopStatusBar 和 Dashboard 首屏。 |
| `ModelConfig` | `provider`、`model`、`capabilityType`、`configured`、`healthStatus`、`displayName` | `waoowaoo.model-config-contract.ts`、`huobao-drama.aiServiceConfigs` | 是 | Phase 2 不配置，只显示 mock 健康。 |
| `GenerationTask` | `status`、`type`、`progress`、`provider`、`model`、`errorCode`、`queuedAt` | `waoowaoo.Task`、`TaskEvent` | 是 | 顶部任务数、任务队列入口依赖。 |
| `CostRecord` | `estimatedCostCny`、`actualCostCny`、`apiType`、`model`、`taskId` | `waoowaoo.UsageCost` | 是 | 支撑全局 CostBadge。 |
| `AgentRun` | `agentType`、`phase`、`status`、`score`、`issues` | `Toonflow-app.scriptAgent`、`productionAgent` | 否，预留 | Phase 2 可只显示最近 Agent Run 数。 |

### 2.3 Phase 2 实施规则

- 必须实现：`TopStatusBar` 中的模型健康摘要、任务数、成本摘要；`RightInspector` 的多类型插槽能力。
- 必须预留：任务队列入口、AgentRun 入口、模型配置入口、素材库入口。
- 可以不实现：完整任务队列页面、完整模型配置页、完整 AgentRunTimeline。
- 不允许：为了入口而接真实 API 或读取真实配置。

## 3. 需要立刻影响 Phase 3 Dashboard + Character Library 的点

### 3.1 Dashboard 页面调整建议

Dashboard 需要从“项目列表”升级为“生产控制台概览”。参考 `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/page.tsx` 的项目统计、成本和任务状态，以及 `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/index.vue` 的项目进度与统计。

必须展示：

- 项目状态：`currentStage`、`status`、`updatedAt`。
- 生产指标：角色数、场景数、分镜数、Panel 数、已采纳素材数。
- 任务指标：运行中、排队、失败、最近失败原因。
- 模型状态：文本、生图、生视频、TTS 的 mock health。
- 成本统计：项目总成本、今日成本、预算消耗。
- 最近 Agent Run：最近一次 ScriptAgent / PromptAgent / CriticAgent 状态。

### 3.2 Dashboard 组件调整建议

| 组件 | 调整 |
|---|---|
| `ProjectCard` | 增加 `currentStage`、`runningTaskCount`、`failedTaskCount`、`totalCostCny`、`modelConfigStatus`、`acceptedAssetCount`。 |
| `StatCard` | 新增任务数、失败数、预算消耗、已采纳素材数。 |
| `RecentTaskPanel` | 升级为 `TaskQueuePanel` 的轻量版本，展示任务类型、模型、状态、错误。 |
| `CostSummaryPanel` | 升级为 `CostBreakdownPanel` 的 Dashboard 版本，按模型和任务类型展示。 |
| `ModelCapabilityBadge` | 在项目卡或顶部摘要中展示关键模型是否可用。 |
| `AgentRunTimeline` | Phase 3 只展示最近 3 条 Agent Run 的简版，不做完整时间线。 |

### 3.3 Character Library 页面调整建议

Character Library 需要体现角色不只是一张卡，而是角色圣经、视觉一致性和素材引用的入口。参考 `waoowaoo` 的 `CharacterAppearance`、`GlobalCharacterAppearance`，以及 `huobao-drama.characters` 的 `appearance`、`referenceImages`、`voiceStyle`。

必须展示：

- `CharacterAppearance` 数量。
- 当前选中外观或定妆图。
- 参考素材数量。
- 字段完整度。
- Excel 来源：文件、sheet、行号、证据类型。
- 角色视觉一致性状态。
- voice / TTS 相关摘要：`voiceStyle`、`voiceId` 或 mock 音色状态。

### 3.4 Character Library 组件调整建议

| 组件 | 调整 |
|---|---|
| `CharacterCard` | 增加 `appearanceCount`、`referenceAssetCount`、`fieldCompleteness`、`consistencyStatus`、`voiceStyle`。 |
| `CharacterFilterPanel` | 增加按完整度、多外观、主色、声音状态、素材引用筛选的静态选项。 |
| `CharacterDetailInspector` | 增加 `AssetLineagePanel` 的轻量摘要：该角色被哪些项目、Prompt、素材引用。 |
| `FieldSourceBadge` | 保持 Excel 来源展示，并加入“推断 / 明确记录 / 未确认”状态。 |
| `ModelCapabilityBadge` | 角色库页面不是必须，但可在右侧展示“可用于 gpt-image-2 / nano banana 参考图”的 mock 能力。 |

### 3.5 Phase 3 mock 数据调整建议

| 类型 | 字段 |
|---|---|
| `Project` | `characterCount`、`sceneCount`、`panelCount`、`queuedTaskCount`、`recentAgentRunIds`、`modelConfigStatus`。 |
| `Character` | `appearanceIds`、`selectedAppearanceId`、`referenceAssetIds`、`fieldCompleteness`、`voiceStyle`、`profileConfirmed`。 |
| `CharacterAppearance` | Phase 3 必须新增独立 mock，而不是塞进 `Character.visualProfile.referenceImageUrls`。 |
| `GenerationTask` | Dashboard 至少准备 5-8 条任务 mock，覆盖 queued、processing、completed、failed。 |
| `CostRecord` | 至少准备按 text/image/video/tts 分组的成本 mock。 |
| `AgentRun` | 准备最近 3 条：ScriptAgent 完成、PromptAgent 运行中、CriticAgent 警告。 |

## 4. 需要影响 Phase 4 Character Detail + Script Studio 的点

### 4.1 Character Detail 页面调整建议

Character Detail 需要成为“角色圣经 + 视觉一致性 + 资产来源”的组合页，不只是 Excel 字段详情。

必须体现：

- `CharacterAppearance` 多外观列表：主外观、备选外观、变化原因、已选状态。
- `VisualProfilePanel`：脸谱主色、纹样、武器、服饰、动作关键词、正向词、禁止词。
- `AssetLineagePanel`：角色参考图来自 Excel、AI 生成、人工上传还是已采纳素材。
- `MemoryContextPanel` 轻量占位：展示“该角色在当前项目中被哪些 Prompt / Shot / Asset 使用”，不做真实 Memory。
- 视觉一致性风险：例如主色缺失、武器不一致、脸谱纹样未确认。

### 4.2 Script Studio 页面调整建议

Script Studio 需要显式展示 Agent 运行状态，但不能做真实 Agent 调用。参考 `Toonflow-app` 的 `scriptAgent`、`productionAgent`、`production_agent_supervision.md`，以及 `huobao-drama/skills/storyboard_breaker/SKILL.md` 的分镜字段。

必须体现：

- `AgentRunTimeline`：DecisionAgent、ScriptAgent、StoryboardAgent、PromptAgent、CriticAgent。
- `SkillBadge`：剧本生成、分镜拆解、角色一致性检查、英歌动作检查。
- `MemoryContextPanel`：引用的角色圣经字段、上一轮失败原因、已采纳素材摘要。
- 监督评审状态：A/B/C/D 或“通过 / 警告 / 需修改”。
- `Shot` 与 `Panel` 拆开建模：Script Studio 主要编辑 `Shot`，生成工作台主要使用 `Panel`。

### 4.3 Shot 和 Panel 拆分规则

`Shot` 代表叙事镜头，来源参考 `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts` 的 `storyboards` 字段，以及 `waoowaoo.NovelPromotionShot`。

`Panel` 代表生成绑定单元，来源参考 `waoowaoo.NovelPromotionPanel` 和 `Toonflow-app.productionAgent.tools.ts` 的 `storyboardSchema`。

| 类型 | 职责 | Phase 4 展示 |
|---|---|---|
| `Shot` | 叙事、旁白、镜头、动作、角色/场景绑定、时长 | 必须展示和编辑态 mock |
| `Panel` | 图片 Prompt、视频 Prompt、首尾帧、候选素材、任务、采纳结果 | Phase 4 可预览，Phase 5 完整展示 |

### 4.4 Phase 4 组件调整建议

| 组件 | 调整 |
|---|---|
| `CharacterBibleTabs` | 增加外观与素材引用入口，但不破坏五层圣经结构。 |
| `VisualProfilePanel` | 增加 `selectedAppearanceId`、`referenceAssetIds`、`consistencyStatus`。 |
| `ScriptEditor` | 保持静态编辑器，不接生成；旁边展示 Agent 状态和文案版本。 |
| `StoryboardTimeline` | 展示 `Shot` 列表，不直接承担视频候选。 |
| `ShotCard` | 增加 `sceneId`、`characterIds`、`shotType`、`angle`、`movement`、`panelCount`。 |
| `AgentInspector` | 升级为 `AgentRunTimeline` + `SkillBadge` + `MemoryContextPanel` 的组合。 |

### 4.5 Phase 4 mock 数据调整建议

| 类型 | 字段 |
|---|---|
| `CharacterAppearance` | `changeReason`、`imageUrls`、`selectedIndex`、`consistencyStatus`。 |
| `Shot` | `sceneId`、`characterIds`、`plot`、`shotType`、`angle`、`movement`、`action`、`dialogue`、`result`、`atmosphere`、`durationSec`。 |
| `Panel` | `shotId`、`panelIndex`、`description`、`videoDesc`、`imagePrompt`、`videoPrompt`、`shouldGenerateImage`、`associateAssetIds`。 |
| `AgentRun` | `agentType`、`phase`、`stepKey`、`status`、`score`、`issues`、`memoryRefs`。 |
| `SkillConfig` | `name`、`agentType`、`path`、`enabled`、`description`。 |
| `ReflectionNote` | `targetType`、`targetId`、`category`、`severity`、`message`、`suggestedPromptPatch`。 |

## 5. 需要影响 Phase 5 Generation Workspace + Asset Review 的点

### 5.1 Generation Workspace 页面调整建议

Phase 5 是源码分析影响最大的阶段。`Prompt & Generation Workspace` 必须是核心生产台，而不是 Prompt 列表页。

必须实现：

- `VideoGenerationPanel` 作为一级主模块，与 `ImageGenerationPanel`、`TTSGenerationPanel` 并列。
- `ModelCapabilityBadge` 展示当前模型是否支持首尾帧、多参考图、时长、分辨率、音频等。
- `ProviderSelector` 展示 mock provider：`gpt-image-2`、`nano banana`、`Seedance 2.0`、`MiniMax TTS`。
- `TaskQueuePanel` 展示当前分镜或项目的 queued / processing / failed / completed。
- `CostBreakdownPanel` 展示单分镜、单任务和项目级成本。
- `FirstLastFrameLinkControl` 至少以轻量 UI 出现，说明首尾帧模式和相邻 Panel 关联。
- `CandidateComparisonPanel` 用于对比同一 Panel 的多个候选图/视频。

### 5.2 VideoGenerationPanel 强化要求

`VideoGenerationPanel` 必须包含：

- 视频 Prompt。
- 当前 `Panel` / `Shot` 信息。
- 已采纳图片关键帧。
- 首帧 / 尾帧引用。
- 模型能力标签。
- provider/model 选择。
- 生成模式：图生视频、首帧、首尾帧；Phase 5 静态原型可只模拟状态。
- 任务状态。
- 候选视频列表。
- 采纳 / 拒绝按钮。
- 成本。
- 失败原因入口。

明确禁止：

- 不把视频生成缩成一个按钮。
- 不把视频候选塞进通用 Asset 卡后就结束。
- 不在静态原型里调用真实 Seedance 2.0。

### 5.3 Asset Review 页面调整建议

Asset Review 必须展示素材审核闭环。参考 `waoowaoo.MediaObject`、`GraphArtifact`、`huobao-drama.assets`、`imageGenerations`、`videoGenerations`。

必须实现：

- 按 Shot / Panel 分组查看素材。
- `CandidateAssetCard` 展示候选状态、模型、任务、成本、采纳/拒绝。
- `CandidateComparisonPanel` 展示同一 Panel 的候选对比。
- `AssetLineagePanel` 展示来源链路：`sourceShotId`、`sourcePanelId`、`promptDraftId`、`promptVersion`、`modelConfigId`、`generationTaskId`、`costRecordId`。
- `FailureReasonPanel` 展示拒绝原因。
- `ReflectionInspector` 展示下一轮提示词建议、负向词建议、角色/场景/动作检查结果。
- `ExportButton` 或 `ExportReadinessPanel` 只做静态导出就绪状态，不生成真实文件。

### 5.4 Phase 5 组件调整建议

| 组件 | MVP 必须项 | 可后置项 |
|---|---|---|
| `PromptEditor` | 图片 / 视频 / negative prompt、版本号、来源字段 | Prompt diff、复杂版本历史 |
| `ImageGenerationPanel` | provider、模型、任务状态、候选图、采纳/拒绝、成本 | 真实参考图上传、真实生图 |
| `VideoGenerationPanel` | 一级模块、关键帧、首尾帧 UI、候选视频、任务状态、成本、失败原因 | 真实视频生成、真实视频轮询 |
| `TTSGenerationPanel` | 文本、音色、任务状态、音频候选、字幕摘要 | 真实试听、真实 TTS |
| `TaskQueuePanel` | 静态任务队列、状态、错误、进度 | BullMQ、取消/重试真实操作 |
| `CostBreakdownPanel` | mock 成本汇总、按模型/任务分组 | 真实定价计算 |
| `CandidateComparisonPanel` | 候选横向对比、采纳/拒绝状态 | 视频逐帧比较 |
| `AssetLineagePanel` | prompt version、model、task、source shot/panel | 真实对象存储 lineage |
| `FailureReasonPanel` | 拒绝原因、错误信息、下一轮建议 | 自动改写 Prompt |

### 5.5 Phase 5 mock 数据调整建议

| 类型 | 字段 |
|---|---|
| `PromptDraft` | `promptType`、`targetType`、`targetId`、`content`、`negativePrompt`、`sourceFieldNames`、`version`、`qualityStatus`、`validationWarnings`、`modelConfigId`。 |
| `GenerationTask` | `targetType`、`targetId`、`status`、`progress`、`attempt`、`provider`、`model`、`errorCode`、`errorMessage`、`billingInfo`。 |
| `ImageAsset` | `panelId`、`taskId`、`promptDraftId`、`provider`、`model`、`width`、`height`、`status`、`failureReason`、`costRecordId`。 |
| `VideoAsset` | `panelId`、`durationSec`、`fps`、`resolution`、`aspectRatio`、`referenceMode`、`firstFrameAssetId`、`lastFrameAssetId`、`status`、`failureReason`。 |
| `AudioAsset` | `speaker`、`voiceId`、`voiceStyle`、`lineText`、`durationSec`、`taskId`。 |
| `SubtitleAsset` | `content`、`srtUrl`、`startSec`、`endSec`、`panelId`、`audioAssetId`。 |
| `ReflectionNote` | `suggestedPromptPatch`、`suggestedNegativeKeywords`、`agentScore`、`appliedStatus`。 |

## 6. Mock 数据补丁

以下表格补充 `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-static-prototype-plan-v1.md` 第 5 章的 mock 数据设计。后续实现时不需要修改原计划，但 mock 数据文件应按本表扩展。

| 类型 | 必须增加的字段 | 来源参考项目 | 静态原型是否展示 | 后端阶段是否需要 |
|---|---|---|---:|---:|
| `Project` | `currentStage`、`workflowMode`、`videoRatio`、`artStyle`、`modelConfigStatus`、`runningTaskCount`、`queuedTaskCount`、`failedTaskCount`、`budgetUsedPercent`、`panelCount`、`sceneCount`、`recentAgentRunIds` | `waoowaoo.Project`、`NovelPromotionProject`、`huobao-drama.dramas`、`episodes` | 是 | 是 |
| `Character` | `aliases`、`role`、`personality`、`appearanceSummary`、`appearanceIds`、`selectedAppearanceId`、`voiceStyle`、`voiceId`、`voiceProvider`、`profileConfirmed`、`referenceAssetIds`、`positivePromptKeywords`、`negativePromptKeywords` | `waoowaoo.NovelPromotionCharacter`、`GlobalCharacter`、`huobao-drama.characters` | 是 | 是 |
| `CharacterAppearance` | `id`、`characterId`、`appearanceIndex`、`label`、`changeReason`、`description`、`imageUrl`、`imageUrls`、`selectedIndex`、`previousImageUrl`、`consistencyStatus`、`sourceAssetId` | `waoowaoo.CharacterAppearance`、`GlobalCharacterAppearance` | 是 | 是 |
| `Scene` | `id`、`projectId`、`location`、`time`、`summary`、`atmosphere`、`prompt`、`storyboardCount`、`selectedImageId`、`imageUrls`、`consistencyStatus`、`sourceType` | `waoowaoo.NovelPromotionLocation`、`LocationImage`、`huobao-drama.scenes` | 是 | 是 |
| `Shot` | `sceneId`、`characterIds`、`plot`、`shotType`、`angle`、`movement`、`action`、`dialogue`、`result`、`atmosphere`、`durationSec`、`panelIds` | `waoowaoo.NovelPromotionShot`、`huobao-drama.storyboards`、`Toonflow-app.o_storyboard` | 是 | 是 |
| `Panel` | `id`、`shotId`、`panelIndex`、`panelNumber`、`description`、`videoDesc`、`imagePrompt`、`videoPrompt`、`firstLastFramePrompt`、`videoGenerationMode`、`linkedToNextPanel`、`track`、`shouldGenerateImage`、`associateAssetIds`、`candidateImageIds`、`candidateVideoIds` | `waoowaoo.NovelPromotionPanel`、`Toonflow-app.productionAgent.tools.ts`、`huobao-drama.storyboards` | 是 | 是 |
| `PromptDraft` | `promptType`、`targetType`、`targetId`、`content`、`negativePrompt`、`sourceFieldNames`、`version`、`qualityStatus`、`validationWarnings`、`modelConfigId` | `waoowaoo.NovelPromotionPanel.imagePrompt/videoPrompt`、`huobao-drama.imageGenerations/videoGenerations`、`Toonflow-app.o_prompt` | 是 | 是 |
| `ModelConfig` | `id`、`provider`、`model`、`capabilityType`、`capabilities`、`defaultParams`、`pricingMode`、`estimatedUnitCost`、`configured`、`healthStatus`、`displayName`、`priority` | `waoowaoo.model-config-contract.ts`、`model-capabilities/catalog.ts`、`model-pricing/catalog.ts`、`huobao-drama.aiServiceConfigs`、`Toonflow-app.o_vendorConfig` | 是 | 是 |
| `GenerationTask` | `type`、`targetType`、`targetId`、`status`、`progress`、`attempt`、`maxAttempts`、`dedupeKey`、`externalId`、`provider`、`model`、`errorCode`、`errorMessage`、`billingInfo`、`queuedAt`、`startedAt`、`finishedAt` | `waoowaoo.Task`、`TaskEvent`、`Toonflow-app.o_tasks`、`huobao-drama.imageGenerations/videoGenerations` | 是 | 是 |
| `ImageAsset` | `panelId`、`taskId`、`promptDraftId`、`provider`、`model`、`width`、`height`、`status`、`failureReason`、`referenceImageIds`、`costRecordId`、`sourceShotId` | `waoowaoo.MediaObject`、`NovelPromotionPanel.candidateImages`、`huobao-drama.imageGenerations`、`assets` | 是 | 是 |
| `VideoAsset` | `panelId`、`taskId`、`promptDraftId`、`provider`、`model`、`durationSec`、`fps`、`resolution`、`aspectRatio`、`referenceMode`、`firstFrameAssetId`、`lastFrameAssetId`、`status`、`failureReason`、`costRecordId` | `waoowaoo.NovelPromotionPanel.videoUrl`、`huobao-drama.videoGenerations`、`videoMerges`、`assets` | 是 | 是 |
| `AudioAsset` | `panelId`、`taskId`、`url`、`durationSec`、`speaker`、`voiceId`、`voiceStyle`、`provider`、`model`、`lineText`、`status` | `waoowaoo.NovelPromotionVoiceLine`、`GlobalVoice`、`huobao-drama.storyboards.ttsAudioUrl`、`tts-generation.ts` | 是 | 是 |
| `SubtitleAsset` | `panelId`、`audioAssetId`、`content`、`srtUrl`、`language`、`startSec`、`endSec`、`status` | `waoowaoo.NovelPromotionEpisode.srtContent`、`NovelPromotionPanel.srtSegment`、`huobao-drama.storyboards.subtitleUrl`、`ffmpeg-compose.ts` | 是 | 是 |
| `CostRecord` | `apiType`、`model`、`provider`、`action`、`quantity`、`unit`、`estimatedCostCny`、`actualCostCny`、`projectId`、`taskId`、`assetId`、`metadata` | `waoowaoo.UsageCost`、`BalanceTransaction`、`billing/cost.ts` | 是 | 是 |
| `ReflectionNote` | `targetType`、`targetId`、`severity`、`category`、`message`、`suggestedPromptPatch`、`suggestedNegativeKeywords`、`agentScore`、`appliedStatus` | `Toonflow-app.production_agent_supervision.md`、`script_agent_supervision.md`、`waoowaoo.Task.errorMessage`、`huobao-drama.errorMsg` | 是 | 是 |
| `AgentRun` | `agentType`、`phase`、`stepKey`、`status`、`inputSummary`、`outputSummary`、`toolCalls`、`score`、`issues`、`startedAt`、`finishedAt`、`memoryRefs` | `Toonflow-app.scriptAgent`、`productionAgent`、`memories`、`waoowaoo.GraphRun/GraphStep`、`huobao-drama.agentConfigs` | 是 | 是 |
| `SkillConfig` | `name`、`agentType`、`description`、`path`、`enabled`、`version`、`status`、`lastUsedAt` | `Toonflow-app.skillsTools.ts`、`o_skillList`、`huobao-drama.skills/*.md`、`agents/skills.ts` | 可展示为标签 | 是 |

## 7. 组件补丁

| 组件 | 用途 | 来源参考项目 | 出现页面 | MVP 静态原型是否必须 | Phase 几实现 |
|---|---|---|---|---:|---|
| `ModelCapabilityBadge` | 展示模型支持能力，例如首尾帧、多参考图、时长、分辨率、音频、价格提示 | `waoowaoo/src/lib/model-config-contract.ts`、`model-capabilities/catalog.ts` | TopStatusBar、Dashboard、Generation Workspace | 是 | Phase 2 预留，Phase 5 完整 |
| `ProviderSelector` | 选择或展示 provider/model，静态展示配置和健康状态 | `waoowaoo` model catalog、`huobao-drama.aiServiceConfigs`、`Toonflow-app.o_vendorConfig` | TopStatusBar、Generation Workspace | 是 | Phase 2 预留，Phase 5 完整 |
| `TaskQueuePanel` | 展示排队、处理中、失败、完成任务 | `waoowaoo.Task`、`TaskEvent`、`Toonflow-app.o_tasks` | Dashboard、Generation Workspace、RightInspector | 是 | Phase 2 入口，Phase 3 简版，Phase 5 完整 |
| `AgentRunTimeline` | 展示 Agent 决策、执行、监督的运行轨迹 | `Toonflow-app.scriptAgent`、`productionAgent`、`waoowaoo.GraphRun/GraphStep` | Script Studio、Generation Workspace、Asset Review | 是 | Phase 4 |
| `SkillBadge` | 展示当前 Agent 使用的技能或检查规则 | `Toonflow-app.skillsTools.ts`、`huobao-drama/skills/*.md` | Script Studio、RightInspector、ReflectionInspector | 否，建议有 | Phase 4 |
| `MemoryContextPanel` | 静态展示 Agent 引用的角色圣经、上一轮失败、已采纳素材 | `Toonflow-app.Memory`、`getMemory.ts` | Character Detail、Script Studio、Asset Review | 否，建议有 | Phase 4 |
| `CostBreakdownPanel` | 展示项目、分镜、任务、模型维度成本 | `waoowaoo.UsageCost`、`billing/cost.ts` | Dashboard、Generation Workspace、Asset Review | 是 | Phase 3 简版，Phase 5 完整 |
| `CandidateComparisonPanel` | 对比同一 Panel 的多候选图/视频 | `waoowaoo.NovelPromotionPanel.candidateImages`、`huobao-drama.imageGenerations/videoGenerations` | Generation Workspace、Asset Review | 是 | Phase 5 |
| `AssetLineagePanel` | 展示素材从 Shot/Panel/Prompt/Task/Model/Cost 到资产的链路 | `waoowaoo.MediaObject`、`GraphArtifact`、`huobao-drama.assets` | Character Detail、Generation Workspace、Asset Review | 是 | Phase 4 轻量，Phase 5 完整 |
| `FailureReasonPanel` | 展示拒绝原因、失败错误、下一轮 Prompt 建议 | `Toonflow-app.production_agent_supervision.md`、`waoowaoo.Task.errorMessage`、`huobao-drama.errorMsg` | Generation Workspace、Asset Review | 是 | Phase 5 |

## 8. 不进入第一阶段的内容

以下能力来自源码分析，但不进入第一阶段前端静态原型的真实实现范围：

- 真实 BullMQ / Redis / worker。
- 真实 `waoowaoo` worker 分发、watchdog、队列看板。
- 真实 Agent 调用。
- 真实 Agent 决策、执行、监督编排。
- 真实 Memory / vector store / embedding。
- 真实 Skill 执行、Skill 编辑器、Skill 文件读取。
- 真实 FFmpeg 合成与视频合并。
- 真实视频任务轮询、webhook、异步恢复。
- 真实模型价格计算、余额冻结、扣费账本。
- 真实对象存储、签名 URL、媒体去重、迁移脚本。
- 真实 API key 管理、provider 配置保存。
- 真实用户权限系统、多租户、团队权限。
- 真实上传、下载、导出文件。
- 真实数据库、Prisma、Drizzle、SQLite、Postgres 连接。

第一阶段只做这些能力的静态可视化：状态、占位、mock 数据、按钮禁用态、错误态、成本样例、失败原因样例。

## 9. 给后续 Codex 线程的使用规则

1. Phase 2 / Phase 3 / Phase 4 / Phase 5 开发前，必须同时阅读：
   - `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-static-prototype-plan-v1.md`
   - `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-plan-source-reference-patch.md`
   - `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-visual-spec-v1.md`
   - `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-module-spec-v1.md`
   - `/Users/huabi/code/AI-video-studio/docs/06-prd/PRD-v1.0.md`
2. 本补丁优先级高于原计划中遗漏的源码参考部分。例如原计划只写 `RecentTaskPanel`，实现时应按本补丁升级或预留 `TaskQueuePanel`。
3. 本补丁不覆盖原计划的页面顺序、视觉方向和静态原型边界。若冲突，优先保持“第一阶段只做静态原型”。
4. 不得复制 `/Users/huabi/code/AI-video-studio/references/` 中任何代码。
5. `/Users/huabi/code/AI-video-studio/references/` 只读，不得修改。
6. 不得读取 `.env`、key、token、证书文件。
7. 任何页面上的 Agent、Task、Model、Cost、Asset 都必须先用 mock 数据展示，不接真实后端。
8. `VideoGenerationPanel` 在 Phase 5 必须作为一级主模块出现，不得降级为按钮、弹窗或隐藏操作。

## 10. 总结

这份补丁把源码分析里的工程化要点压缩成前端实现约束：Phase 2 先预留全局入口，Phase 3 让 Dashboard 和角色库带上真实生产指标，Phase 4 把角色圣经和 Agent 运行痕迹放到页面里，Phase 5 完成 Prompt、生图、生视频、TTS、素材审核、失败复盘、成本记录的静态闭环。

前端实现时要始终记住：我们不是复制三个参考项目，也不是提前做后端平台；我们是在做一个英歌水浒人物介绍短视频的专业 AI 生产工作台静态原型，让后续真实工程接入时有清晰的页面、组件和数据落点。
