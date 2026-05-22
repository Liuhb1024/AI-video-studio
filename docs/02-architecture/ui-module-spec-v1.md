# UI 功能模块规格说明 v1

本文档定义“AI 英歌漫剧内容生产工作台”的页面功能模块。它服务于后续 Google Stitch UI 生成、Next.js 前端拆分和 MVP 范围控制，不包含业务代码，不复制参考项目代码。

## 1. 参考项目页面模块拆解

### Toonflow

| 页面/区域 | 功能模块 | 可借鉴点 | 不适合我们的点 | 参考文件路径 |
| --- | --- | --- | --- | --- |
| 项目列表 / 首页截图 | 项目入口、项目卡片、左侧主导航 | 用卡片承载项目状态、封面、最近更新时间；左侧固定导航适合生产工作台快速切换 | Toonflow 偏通用 AI 生产平台，缺少英歌角色库、Excel 角色圣经和文创转化语境 | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md`，`/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/1.png` |
| Production Canvas 截图 | 节点式生产工作台、右侧 Agent 上下文栏 | 可借鉴“中间主工作区 + 右侧 Agent/上下文 Inspector”的布局，让分镜、Prompt、生成任务处在同一生产视野中 | 无限画布和自由节点对一个月 MVP 过重，容易增加拖拽、连线、缩放等非核心成本 | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/5.png` |
| Image Generation 节点截图 | 图片生成卡片、参考图、结果图、参数区 | 可借鉴“参考图 + Prompt + 模型参数 + 生成结果”的单元式组织，适合我们的图片关键帧生成 | 不能照搬节点外观；我们需要围绕英歌脸谱、主色系、禁止词和角色一致性质检重组信息 | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/6.png` |
| Agent / Skill / Production 描述 | Agent 协作、Skill 文件、记忆与生产上下文 | 可借鉴“Agent 不直接取代用户，而是作为生产助手”的交互定位；右侧显示 Agent 建议和失败复盘 | 复杂三层 Agent、事件图、可编程供应商系统超出 MVP，不应在 UI 上暴露过多工程概念 | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md` |
| 构建后的 Web 入口 | 前端打包页面入口 | 仅能确认其前端为应用式页面，不建议从压缩产物读取视觉细节 | 文件为构建产物，不适合做 UI 结构借鉴，更不能复制 | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/web/index.html` |

### Huobao

| 页面/区域 | 功能模块 | 可借鉴点 | 不适合我们的点 | 参考文件路径 |
| --- | --- | --- | --- | --- |
| 首页项目列表 | ProjectCard、创建项目弹窗、项目统计、空状态、loading 状态 | 项目卡片清楚展示标题、描述、统计和创建入口；适合我们的 Dashboard / Project List | 视觉偏短剧项目管理，不应照搬影片胶片式装饰；我们的项目卡要突出英歌 IP、角色数量、成本和素材沉淀 | `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/index.vue` |
| 剧集列表页 | 项目详情、剧集卡片、创建剧集时锁定模型配置 | 可借鉴“项目下分集/内容单元”的层级；创建时锁定部分生成配置有利于保持一致性 | 第一版聚焦 30-60 秒人物介绍视频，不需要复杂剧集季/集管理 | `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/index.vue` |
| 单集生产页顶部栏 | 项目/剧集信息、当前阶段、进度、角色数、分镜数 | 可借鉴顶部栏展示当前生产进度和关键计数，适合放角色、分镜、素材、成本摘要 | 其流程面向通用短剧单集，我们需要改为“角色 -> 文案 -> 分镜 -> Prompt -> 图/视频/TTS -> 审核” | `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue` |
| 单集生产页左侧流程栏 | PipelineSidebar、阶段步骤、阶段完成状态 | 可借鉴固定流程导航，帮助用户按 MVP 主流程推进 | 不能设计过多阶段；一个月 MVP 应保持 5-6 个关键步骤 | `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue` |
| 剧本文案与抽取面板 | 原始内容、AI 改写、角色/场景抽取、配音分配 | 可借鉴“输入内容 -> AI 处理 -> 抽取结构化信息 -> 进入下一步”的页面节奏 | 我们的第一版要从英歌水浒角色圣经出发，剧本生成页不应变成通用小说改写器 | `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue` |
| 设置页 | AI 服务配置、Agent 配置、Skill 编辑分区 | 可借鉴模型配置和 Agent 配置入口的组织方式，后续用于模型 Provider 和 Agent Skill 管理 | MVP 不建议暴露复杂 Skill 编辑器；模型 Key 管理应在后端配置，不在页面直接展示敏感信息 | `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/settings.vue` |
| Studio CSS | 卡片、按钮、标签、输入、空状态、loading、遮罩状态 | 可借鉴状态覆盖的完整性：空、加载、错误、禁用、弹窗 | 不借鉴其具体配色和装饰，我们需要东方非遗内容工作台气质 | `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/assets/studio.css` |
| BaseSelect | 搜索选择器 | 可借鉴角色选择、模型选择、音色选择的基础交互 | 组件实现不能复制；后续应用 shadcn/ui / Tailwind 自行实现 | `/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/components/BaseSelect.vue` |

### waoowaoo

| 页面/区域 | 功能模块 | 可借鉴点 | 不适合我们的点 | 参考文件路径 |
| --- | --- | --- | --- | --- |
| Workspace 项目页 | 搜索、分页、项目统计、成本、模型配置检查 | 可借鉴 Dashboard 同时展示项目状态、产出数量、总成本和模型配置健康度 | 不需要复制其多模式项目入口；我们的首页要聚焦英歌 IP 项目 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/page.tsx` |
| 项目详情页 | URL stage、任务状态、模型配置 gating、剧集选择 | 可借鉴以 stage 驱动的工作台框架，适合从剧本到视频的顺序流程 | 其模式较多，MVP 不应暴露小说推广等业务模式 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/page.tsx` |
| Novel Promotion Workspace | 顶部操作、胶囊式阶段导航、阶段内容区 | 可借鉴 ProductionStepRail：每个阶段有空、处理中、可用、当前状态 | 我们的阶段命名必须来自 PRD，而不是参考项目业务文案 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/NovelPromotionWorkspace.tsx`，`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/hooks/useWorkspaceStageNavigation.ts` |
| Storyboard Header / Panel | 分镜统计、运行中数量、批量生成、分镜卡 | 可借鉴分镜卡的固定比例图片区、编号、状态标签、单卡操作和批量生成入口 | 分镜内容要绑定英歌角色、脸谱、动作、场景一致性，不是普通图像面板 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/ui/patterns/StoryboardHeaderV2.tsx`，`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/ui/patterns/PanelCardV2.tsx` |
| Image Section | 图片生成、候选图、确认/取消、错误、预览、重新生成 | 非常适合借鉴“候选素材不直接覆盖正式素材，先进入候选态，再采纳”的交互 | 需增加正向词/禁止词、角色参考图、场景参考图、英歌脸谱一致性检查 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/storyboard/ImageSection.tsx` |
| Prompt Stage | Prompt 列表、卡片/表格切换、批量生成图片、追加内容 | 可借鉴 Prompt 工作台的列表/表格双视图，以及批量任务状态 | 我们需要把图片 Prompt 和视频 Prompt 明确分区，并显示角色字段来源 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/prompts-stage/PromptListPanel.tsx`，`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/prompts-stage/PromptEditorPanel.tsx` |
| Video Panel Card | 视频预览、生成/重试、模型能力下拉、Prompt 编辑、任务遮罩、错误提示 | 可借鉴视频卡片作为独立生产模块，而不是把视频当成 Asset 附件；适合我们的 Seedance 2.0 任务 | 我们不做复杂口型同步切换为第一优先级；MVP 保留 TTS 关联即可 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/video/panel-card/VideoPanelCardHeader.tsx`，`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/video/panel-card/VideoPanelCardBody.tsx` |
| First / Last Frame Panel | 首尾帧生视频、首帧/尾帧预览、模型能力参数、Prompt 编辑 | 可借鉴“把相邻分镜链接为首尾帧视频”的交互；非常适合控制视频连续性 | MVP 可先做手动选择首帧/尾帧，不必做复杂自动链接逻辑 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/video/FirstLastFramePanel.tsx` |
| Video Stage Render / Timeline | 视频卡片网格、视频阶段与配音阶段折叠关联 | 可借鉴视频生成区和 TTS/Voice 区的上下游联动 | 第一版不需要完整时间线编辑器，只需要按分镜顺序管理视频和音频 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/video-stage/VideoRenderPanel.tsx`，`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/video-stage/VideoTimelinePanel.tsx` |
| Asset Hub | 文件夹侧栏、资产分组、角色/场景/道具/音色卡片、下载 | 可借鉴素材库的分组、筛选、预览、批量下载和空状态 | 我们的素材库要增加采纳/拒绝/失败原因/成本，不只是资产仓库 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/asset-hub/page.tsx`，`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/asset-hub/components/AssetGrid.tsx` |
| Task Status | 内联任务状态、遮罩任务状态 | 可借鉴同一任务在按钮、卡片、遮罩中的多种表达方式 | 状态枚举要按我们的 `GenerateTask` 统一，不复制其资源命名 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/task/TaskStatusInline.tsx` |

## 2. 我们自己的模块池

### 1. Project Module

- 模块名称：Project Module
- 模块目标：管理英歌漫剧项目入口，承载项目级配置、内容目标、成本与产出概览。
- 输入数据：`Project`、项目统计、最近 `GenerateTask`、成本汇总、角色数量、素材数量。
- 输出数据：新建/更新项目、项目状态、进入生产工作台的上下文。
- 核心组件：ProjectCard、ProjectCreateDialog、ProjectStatsStrip、RecentActivityList、CostBadge。
- 主要操作：新建项目、进入项目、编辑项目名称/目标平台/画风、查看成本与素材数量。
- 状态：空项目、正常、处理中、存在失败任务、模型配置未完成。
- 空状态：提示创建第一个“英歌水浒人物介绍”项目，可提供“导入角色 Excel”入口。
- loading 状态：项目卡骨架屏、统计数字占位。
- 错误状态：项目加载失败、统计加载失败、模型配置异常。
- 适合放在哪些页面：Dashboard / Project List。
- MVP 是否必须：必须。

### 2. Character Bible Module

- 模块名称：Character Bible Module
- 模块目标：展示从 Excel 导入的英歌水浒角色圣经，作为角色、Prompt 和文创转化的源头。
- 输入数据：`Character`、`ProjectCharacter`、Excel 来源字段、五层字段结构。
- 输出数据：角色详情视图、项目角色快照、字段确认状态。
- 核心组件：CharacterCard、CharacterBibleTabs、FieldSourceBadge、PromptKeywordChips、CommercialPositionPanel。
- 主要操作：搜索角色、筛选主色系/人格标签/商业定位、查看详情、加入项目、标记字段是否确认。
- 状态：未导入、已导入、字段缺失、字段推断、字段已确认。
- 空状态：提示导入 `data/英歌水浒角色基础信息.xlsx`。
- loading 状态：角色卡骨架、字段表 loading。
- 错误状态：Excel 导入失败、表头识别失败、字段映射缺失。
- 适合放在哪些页面：Yingge Character Library、Character Detail / Character Bible。
- MVP 是否必须：必须。

### 3. Character Consistency Module

- 模块名称：Character Consistency Module
- 模块目标：维护角色在图片、视频和文案中的一致性，尤其是脸谱、主色、武器、人格和禁忌词。
- 输入数据：`CharacterVisualProfile`、`CharacterNarrativeProfile`、正向词、禁止词、参考图、已采纳素材。
- 输出数据：角色一致性摘要、Prompt 约束、CriticAgent 检查结果。
- 核心组件：VisualProfilePanel、PromptKeywordChips、ReferenceImageStrip、ConsistencyChecklist。
- 主要操作：查看主色/脸谱/视觉关键词、选择角色参考图、执行一致性检查、记录不一致原因。
- 状态：未生成参考图、已有参考图、检查通过、检查警告、检查失败。
- 空状态：提示先导入角色或生成角色定妆图。
- loading 状态：一致性检查中、参考图加载中。
- 错误状态：参考图缺失、角色字段不足、CriticAgent 检查失败。
- 适合放在哪些页面：Character Detail / Character Bible、Prompt & Generation Workspace、Asset Review / Final Video Library。
- MVP 是否必须：必须。

### 4. Scene Consistency Module

- 模块名称：Scene Consistency Module
- 模块目标：沉淀英歌漫剧的场景设定，保证同一项目中场景风格、空间、天气、时代质感一致。
- 输入数据：`ProjectScene`、`SceneAsset`、分镜场景描述、场景参考图、项目视觉风格模板。
- 输出数据：场景一致性档案、场景 Prompt 片段、场景检查结果。
- 核心组件：SceneProfilePanel、SceneReferenceGrid、ScenePromptTemplateCard、SceneConsistencyChecklist。
- 主要操作：新增场景、绑定分镜、选择参考图、检查场景是否偏离风格。
- 状态：未定义、已定义、引用中、检查通过、检查失败。
- 空状态：提示从分镜自动抽取或手动创建第一个场景。
- loading 状态：场景抽取中、参考图生成中。
- 错误状态：场景描述不足、参考图不可用、风格冲突。
- 适合放在哪些页面：Script & Storyboard Generator、Prompt & Generation Workspace。
- MVP 是否必须：建议必须，先做轻量版本。

### 5. Script Module

- 模块名称：Script Module
- 模块目标：从角色圣经生成 30-60 秒人物介绍文案，或导入用户已有文案。
- 输入数据：角色身份层、内核层、叙事素材层、目标平台、时长、用户补充要求。
- 输出数据：`Script`、旁白文本、角色对白草稿、核心叙事原点摘要。
- 核心组件：ScriptEditor、CharacterBriefPanel、ScriptVersionList、AgentSuggestionPanel。
- 主要操作：选择角色、生成文案、手动编辑、保存版本、进入分镜拆解。
- 状态：草稿、生成中、可编辑、已确认、生成失败。
- 空状态：提示选择角色或粘贴文案。
- loading 状态：ScriptAgent 生成中。
- 错误状态：模型调用失败、角色字段不足、文案长度超出目标时长。
- 适合放在哪些页面：Script & Storyboard Generator。
- MVP 是否必须：必须。

### 6. Storyboard / Shot Module

- 模块名称：Storyboard / Shot Module
- 模块目标：将脚本拆成 5-8 个分镜，形成后续图片、视频、TTS 的最小生产单元。
- 输入数据：`Script`、角色档案、场景档案、时长、目标比例。
- 输出数据：`ScriptScene`、`Shot`、分镜描述、镜头类型、角色/场景绑定、预估时长。
- 核心组件：ProductionStepRail、StoryboardTimeline、ShotCard、ShotDetailInspector。
- 主要操作：生成分镜、编辑分镜、调整顺序、绑定角色/场景、确认进入 Prompt。
- 状态：未拆分、拆分中、待确认、已确认、部分缺字段。
- 空状态：提示先生成或导入脚本。
- loading 状态：StoryboardAgent 拆分中。
- 错误状态：脚本为空、分镜数量不在 5-8 个、角色/场景绑定失败。
- 适合放在哪些页面：Script & Storyboard Generator、Prompt & Generation Workspace。
- MVP 是否必须：必须。

### 7. Prompt Module

- 模块名称：Prompt Module
- 模块目标：为每个分镜生成图片 Prompt 和视频 Prompt，并显示来源字段、正向词、禁止词。
- 输入数据：`Shot`、角色视觉档案、场景档案、风格模板、PromptKeywordSet。
- 输出数据：`PromptDraft`，包含图片 Prompt、视频 Prompt、negative prompt、字段来源。
- 核心组件：PromptEditor、PromptKeywordChips、PromptSourcePanel、PromptQualityChecklist。
- 主要操作：生成 Prompt、编辑 Prompt、复制 Prompt、批量生成、检查禁止词、保存版本。
- 状态：未生成、生成中、已生成、已编辑、检查警告、检查失败。
- 空状态：提示先确认分镜。
- loading 状态：PromptAgent 生成中。
- 错误状态：字段缺失、Prompt 过长、出现禁止词、模型失败。
- 适合放在哪些页面：Prompt & Generation Workspace。
- MVP 是否必须：必须。

### 8. Image Generation Module

- 模块名称：Image Generation Module
- 模块目标：围绕分镜生成候选关键帧图片，并把被采纳图片沉淀为分镜关键帧或角色/场景参考图。
- 输入数据：图片 Prompt、negative prompt、gpt-image-2 / nano banana 模型选择、角色参考图、场景参考图、比例、清晰度、候选数量。
- 输出数据：图片 `GenerateTask`、候选图 `Asset`、采纳关键帧、失败原因。
- 核心组件：ImageGenerationPanel、ModelSelector、PromptEditor、ReferenceImagePicker、CandidateAssetCard、GenerationTaskStatus、CostBadge。
- 主要操作：编辑图片 Prompt、编辑 negative prompt、选择 gpt-image-2 / nano banana、选择角色参考图、选择场景参考图、提交生成、查看候选图、采纳为关键帧、拒绝并记录原因、重试。
- 状态：未生成、排队中、生成中、候选待审核、已采纳、已拒绝、失败、可重试。
- 空状态：提示先生成图片 Prompt 并选择角色/场景参考。
- loading 状态：卡片遮罩显示生成中，按钮显示任务状态，候选区显示占位。
- 错误状态：模型未配置、Prompt 缺失、参考图不可用、生成失败、成本记录失败。
- 适合放在哪些页面：Prompt & Generation Workspace、Asset Review / Final Video Library。
- MVP 是否必须：必须。

### 9. Video Generation Module

- 模块名称：Video Generation Module
- 模块目标：围绕已确认关键帧和视频 Prompt，使用 Seedance 2.0 生成候选视频，并完成预览、采纳、拒绝、质检和成本记录。
- 输入数据：视频 Prompt、Seedance 2.0 模型选择、生成模式、关键帧、参考图、图片关键帧 `Asset`、角色一致性档案、场景一致性档案、分镜时长、比例、运动强度、清晰度参数。
- 输出数据：视频 `GenerateTask`、候选视频 `Asset`、采纳视频、拒绝原因、重试记录、成本记录、CriticAgent 检查结果。
- 核心组件：VideoGenerationPanel、VideoPromptEditor、ModelSelector、KeyframePicker、ReferenceImagePicker、VideoCandidatePlayer、CandidateAssetCard、GenerationTaskStatus、ConsistencyChecklist、CostBadge、FailureReasonDialog。
- 主要操作：
  - 视频 Prompt 编辑：支持按分镜编辑、保存、恢复 PromptAgent 默认版本。
  - Seedance 2.0 模型选择：显示模型、能力、预计成本；MVP 可先只暴露 Seedance 2.0 单模型和少量参数。
  - 生成模式选择：图生视频、首帧生视频、首尾帧生视频；MVP 必须支持至少图生视频/首帧生视频，首尾帧模式保留 UI 入口或轻量实现。
  - 关键帧选择：从已采纳图片中选择当前分镜关键帧，首尾帧模式可选择当前分镜和下一分镜关键帧。
  - 参考图选择：选择角色参考图、场景参考图、风格参考图。
  - 参数设置：时长、比例、运动强度、清晰度；v0.2 可扩展镜头运动、帧率、种子等。
  - 生视频任务提交：提交前检查关键帧、Prompt、模型、成本预估。
  - 视频任务状态：草稿、排队中、生成中、完成、失败、取消、可重试。
  - 候选视频管理：同一分镜可保留多个候选，默认不覆盖已采纳视频。
  - 视频预览：卡片内播放，支持静音、全屏预览、查看来源分镜。
  - 采纳/拒绝：采纳后绑定到 `Shot`；拒绝时必须选择或填写失败原因。
  - 失败原因记录：角色不一致、场景不一致、动作不准、画面崩坏、运动过强/过弱、时长不符、模型错误、其他。
  - 角色一致性检查：检查脸谱主色、纹样、武器、人格气质、禁止词是否被违反。
  - 场景一致性检查：检查场景、天气、空间关系、风格模板是否一致。
  - 英歌动作准确性检查：检查舞姿、阵势、鼓点感、武器/道具是否偏离英歌语境；MVP 可先用人工勾选 + CriticAgent 文本建议。
  - 成本显示：提交前显示预计成本，完成后显示实际成本。
  - 重试机制：可基于同一 Prompt 重试，也可基于拒绝原因生成改进 Prompt 后重试。
- 状态：未选择关键帧、待提交、排队中、生成中、候选待审核、已采纳、已拒绝、检查警告、失败、重试中。
- 空状态：提示先采纳图片关键帧，或从 Image Generation Module 生成关键帧。
- loading 状态：视频卡片遮罩、进度条、任务状态文案、禁用重复提交。
- 错误状态：缺关键帧、Seedance 2.0 未配置、参数不支持、生成失败、视频预览失败、成本记录失败。
- 适合放在哪些页面：Prompt & Generation Workspace、Asset Review / Final Video Library。
- MVP 是否必须：必须，且必须作为独立模块实现。

### 10. TTS Module

- 模块名称：TTS Module
- 模块目标：为旁白和角色对白生成音频，并与分镜、字幕、视频候选关联。
- 输入数据：旁白文本、角色对白、MiniMax TTS 模型选择、音色选择、语速/情绪、分镜关联、字幕文本。
- 输出数据：TTS `GenerateTask`、音频 `Asset`、字幕文本、分镜音频绑定、成本记录。
- 核心组件：TTSGenerationPanel、VoiceSelector、NarrationEditor、DialogueLineList、AudioPreviewPlayer、SubtitleEditor、CostBadge。
- 主要操作：编辑旁白文本、编辑角色对白、选择音色、选择 MiniMax TTS 模型、试听、生成音频、关联分镜、编辑字幕、重试、记录成本。
- 状态：未生成、试听中、生成中、已生成、已绑定分镜、失败、可重试。
- 空状态：提示先生成文案或分镜。
- loading 状态：试听 loading、生成任务状态、音频波形占位。
- 错误状态：文本为空、音色未选择、MiniMax 未配置、生成失败、音频无法播放。
- 适合放在哪些页面：Script & Storyboard Generator、Prompt & Generation Workspace、Asset Review / Final Video Library。
- MVP 是否必须：必须。

### 11. Generation Task Module

- 模块名称：Generation Task Module
- 模块目标：统一展示生图、生视频、TTS 等异步任务状态，是前端与后端任务队列的状态桥。
- 输入数据：`GenerateTask`、任务类型、模型、状态、错误、成本、关联分镜/资产。
- 输出数据：任务状态展示、重试请求、取消请求、失败记录入口。
- 核心组件：GenerationTaskStatus、TaskQueuePanel、TaskProgressBar、RetryButton、CostBadge。
- 主要操作：查看任务、轮询刷新、取消、重试、打开关联素材、查看错误。
- 状态：draft、queued、processing、completed、failed、canceled。
- 空状态：当前项目暂无生成任务。
- loading 状态：任务列表骨架、任务状态刷新中。
- 错误状态：任务查询失败、任务超时、任务状态不一致。
- 适合放在哪些页面：Prompt & Generation Workspace、Asset Review / Final Video Library、Dashboard。
- MVP 是否必须：必须。

### 12. Asset Review Module

- 模块名称：Asset Review Module
- 模块目标：审核图片、视频、音频、字幕等素材，沉淀采纳/拒绝记录和失败原因。
- 输入数据：`Asset`、`GenerateTask`、`Shot`、角色/场景检查结果、用户标记。
- 输出数据：采纳素材、拒绝素材、失败原因、复盘输入、最终视频制作方案。
- 核心组件：AssetReviewGrid、CandidateAssetCard、VideoCandidatePlayer、FailureReasonDialog、ReflectionInspector。
- 主要操作：按类型/角色/分镜筛选、预览、采纳、拒绝、填写失败原因、批量导出素材清单。
- 状态：候选、已采纳、已拒绝、已归档、缺少关联信息。
- 空状态：提示先生成图片/视频/TTS。
- loading 状态：素材网格骨架、预览加载中。
- 错误状态：素材加载失败、COS 链接失效、预览失败。
- 适合放在哪些页面：Asset Review / Final Video Library、Prompt & Generation Workspace。
- MVP 是否必须：必须。

### 13. Reflection / Memory Module

- 模块名称：Reflection / Memory Module
- 模块目标：在用户拒绝素材或任务失败后，结构化记录原因，让下一次 Prompt 和生成策略更好。
- 输入数据：拒绝原因、失败任务、PromptDraft、角色/场景检查结果、用户备注。
- 输出数据：`AgentMemory`、失败案例、改进建议、下次 Prompt 约束。
- 核心组件：ReflectionInspector、FailureReasonDialog、AgentMemoryList、ImprovementSuggestionCard。
- 主要操作：选择失败原因、填写备注、让 ReflectionAgent 总结、应用建议到 Prompt。
- 状态：未复盘、待总结、已总结、已应用、总结失败。
- 空状态：暂无失败案例。
- loading 状态：ReflectionAgent 总结中。
- 错误状态：复盘生成失败、缺少关联 Prompt、记忆保存失败。
- 适合放在哪些页面：Asset Review / Final Video Library、Prompt & Generation Workspace。
- MVP 是否必须：必须，但先做轻量。

### 14. Cost Module

- 模块名称：Cost Module
- 模块目标：记录并展示模型调用成本，帮助 4000 元预算下控制 MVP 试错。
- 输入数据：`CostRecord`、GenerateTask、模型、token/图片/视频/音频用量、人民币估算。
- 输出数据：成本标签、项目成本汇总、单分镜成本、失败成本。
- 核心组件：CostBadge、CostSummaryPanel、CostByModelTable、BudgetWarningBanner。
- 主要操作：查看单任务成本、查看项目累计成本、按模型筛选、导出成本明细。
- 状态：未记录、预估、已记录、超预算、记录失败。
- 空状态：暂无成本记录。
- loading 状态：成本统计加载中。
- 错误状态：成本计算失败、汇率/价格未配置、任务完成但成本缺失。
- 适合放在哪些页面：Dashboard、Prompt & Generation Workspace、Asset Review / Final Video Library。
- MVP 是否必须：必须，先做基础记录和展示。

### 15. Export Module

- 模块名称：Export Module
- 模块目标：导出一条视频制作方案，供人工剪辑或后续自动剪辑使用。
- 输入数据：项目、角色、脚本、分镜、采纳图片、采纳视频、TTS 音频、字幕、成本、失败复盘摘要。
- 输出数据：制作方案 Markdown/JSON、素材清单、分镜表、Prompt 清单。
- 核心组件：ExportProductionPlanButton、ExportPreviewDialog、ShotExportTable、AssetManifestPanel。
- 主要操作：预览导出内容、选择导出范围、导出制作方案、复制 Prompt 清单。
- 状态：不可导出、可导出、导出中、已导出、导出失败。
- 空状态：提示至少需要确认脚本、分镜和一组采纳素材。
- loading 状态：导出生成中。
- 错误状态：缺关键素材、文件生成失败、素材链接失效。
- 适合放在哪些页面：Asset Review / Final Video Library。
- MVP 是否必须：必须。

## 3. 六个页面的模块组合

### 1. Dashboard / Project List

- 页面目标：让团队快速进入项目、查看当前生产状态和预算消耗。
- 页面布局：左侧全局导航 + 顶部工作台标题/模型状态 + 中间项目卡片网格 + 右侧近期任务与成本摘要。
- 左侧区域：项目、角色库、素材库、设置入口。
- 中间区域：ProjectCard 网格、创建项目入口、项目搜索/筛选。
- 右侧 Inspector：最近生成任务、成本摘要、模型配置健康度。
- 顶部栏：产品名、当前用户、创建项目按钮、导入 Excel 快捷入口。
- 底部栏：MVP 可不做固定底栏。
- 使用哪些模块：Project Module、Generation Task Module、Cost Module。
- 主按钮：新建英歌项目。
- 次按钮：导入角色 Excel、查看素材库。
- 关键状态：无项目、项目加载中、任务失败、预算接近上限。
- MVP 必须实现的组件：ProjectCard、GenerationTaskStatus、CostBadge。
- v0.2 再做的组件：预算趋势图、跨项目搜索、批量归档。
- Stitch 生成时必须突出什么：项目卡、当前生产进度、成本摘要、角色/素材数量，让首页一眼看出这是英歌 IP 内容生产工作台。
- Stitch 不要画什么：不要画营销首页、通用 SaaS 大屏、复杂 BI 图表或无关社区入口。

### 2. Yingge Character Library

- 页面目标：管理英歌水浒角色圣经，支持搜索、筛选、加入项目。
- 页面布局：左侧筛选栏 + 中间角色卡片/表格 + 右侧字段来源与导入状态 Inspector。
- 左侧区域：主色系、人格标签、英歌角色定位、商业文化定位、字段完整度筛选。
- 中间区域：CharacterCard 网格，支持卡片/表格切换。
- 右侧 Inspector：Excel 来源、导入批次、字段缺失统计、Prompt 关键词摘要。
- 顶部栏：搜索框、导入 Excel、字段映射状态、加入项目按钮。
- 底部栏：选中角色批量操作栏。
- 使用哪些模块：Character Bible Module、Character Consistency Module、Cost Module 只显示无成本。
- 主按钮：导入/更新角色 Excel。
- 次按钮：加入当前项目、查看详情、导出角色字段。
- 关键状态：未导入、导入成功、字段缺失、存在推断字段。
- MVP 必须实现的组件：CharacterCard、PromptKeywordChips、CharacterBibleTabs 简版。
- v0.2 再做的组件：批量字段校验、角色关系图谱可视化。
- Stitch 生成时必须突出什么：英歌水浒角色卡、主色系、脸谱特征、人格标签、Prompt 正向词/禁止词和 Excel 来源感。
- Stitch 不要画什么：不要画成普通联系人列表、游戏角色商城或泛二次元角色库。

### 3. Character Detail / Character Bible

- 页面目标：展示单个角色的身份、内核、视觉、叙事、商业文化字段，并作为角色一致性的依据。
- 页面布局：左侧角色概览 + 中间五层 Tabs + 右侧 Prompt/一致性 Inspector。
- 左侧区域：角色头像/参考图、姓名、绰号、排名、星位、英歌定位、主色系。
- 中间区域：CharacterBibleTabs，包括身份层、内核层、文化视觉层、叙事素材层、商业文化层。
- 右侧 Inspector：VisualProfilePanel、PromptKeywordChips、禁止词、字段来源、确认状态。
- 顶部栏：返回角色库、加入项目、生成定妆 Prompt。
- 底部栏：字段保存状态和最后更新时间。
- 使用哪些模块：Character Bible Module、Character Consistency Module、Prompt Module。
- 主按钮：加入项目 / 生成角色定妆 Prompt。
- 次按钮：编辑字段备注、复制 Prompt 关键词、查看来源 Excel 行。
- 关键状态：字段完整、字段缺失、字段推断、未生成参考图。
- MVP 必须实现的组件：CharacterBibleTabs、VisualProfilePanel、PromptKeywordChips。
- v0.2 再做的组件：角色关系图谱、多个视觉版本对比。
- Stitch 生成时必须突出什么：五层角色圣经、视觉档案、脸谱/主色/纹样、叙事原点、商业文化定位和字段来源。
- Stitch 不要画什么：不要只画一张大头像详情页，不要做成游戏人物属性面板，不要弱化结构化字段。

### 4. Script & Storyboard Generator

- 页面目标：从角色生成 30-60 秒人物介绍文案，并拆成 5-8 个分镜。
- 页面布局：左侧 ProductionStepRail + 中间脚本/分镜双区 + 右侧角色与 Agent Inspector。
- 左侧区域：选择角色、生成文案、拆分镜、确认分镜步骤。
- 中间区域：上半部分 ScriptEditor，下半部分 StoryboardTimeline / ShotCard 列表。
- 右侧 Inspector：角色核心叙事原点、英歌角色定位、ScriptAgent/StoryboardAgent 输出说明。
- 顶部栏：项目选择、目标平台、视频时长、画幅比例、生成按钮。
- 底部栏：保存状态、进入 Prompt 工作台按钮。
- 使用哪些模块：Script Module、Storyboard / Shot Module、Character Bible Module、TTS Module 简版。
- 主按钮：生成 60 秒人物介绍文案 / 拆成分镜。
- 次按钮：导入文案、保存版本、重新生成、进入 Prompt。
- 关键状态：未选择角色、文案生成中、分镜生成中、分镜待确认、分镜数量异常。
- MVP 必须实现的组件：ProductionStepRail、ScriptEditor、StoryboardTimeline、ShotCard。
- v0.2 再做的组件：多版本脚本对比、节奏评分、自动口播时长估算增强。
- Stitch 生成时必须突出什么：从角色到 30-60 秒文案再到 5-8 个分镜的生产链路，脚本编辑和分镜时间线要同屏可见。
- Stitch 不要画什么：不要画成通用在线文档、小说写作软件或完整视频剪辑器。

### 5. Prompt & Generation Workspace

- 页面目标：围绕分镜完成图片 Prompt、视频 Prompt、生图、生视频、TTS 的核心生产。
- 页面布局：左侧分镜列表 + 中间生成工作区 + 右侧上下文 Inspector + 顶部任务/成本栏。
- 左侧区域：ShotCard 列表，显示分镜状态、关键帧、视频、音频完成度。
- 中间区域：PromptEditor、ImageGenerationPanel、VideoGenerationPanel、TTSGenerationPanel，按分镜切换。
- 右侧 Inspector：角色一致性、场景一致性、英歌动作检查、Prompt 来源字段、失败复盘。
- 顶部栏：当前项目、当前角色、批量生成图片、批量生成视频、任务状态、成本。
- 底部栏：当前分镜上一步/下一步、保存状态。
- 使用哪些模块：Prompt Module、Image Generation Module、Video Generation Module、TTS Module、Generation Task Module、Character Consistency Module、Scene Consistency Module、Reflection / Memory Module、Cost Module。
- 视频生成模块必须是主区域一级模块，不能只是 ShotCard 上的状态按钮。需要展示关键帧选择、Seedance 2.0 参数、视频 Prompt、候选视频、预览、采纳/拒绝、失败原因和成本。
- 主按钮：生成图片 / 生成视频 / 生成 TTS。
- 次按钮：保存 Prompt、复制 Prompt、重试、采纳候选、拒绝候选。
- 关键状态：无 Prompt、无关键帧、任务运行中、候选待审核、检查警告、任务失败。
- MVP 必须实现的组件：PromptEditor、ModelSelector、ImageGenerationPanel、VideoGenerationPanel、TTSGenerationPanel、GenerationTaskStatus、CostBadge。
- v0.2 再做的组件：批量参数模板、首尾帧自动链接、跨分镜一致性热力图。
- Stitch 生成时必须突出什么：Prompt 编辑、生图、生视频、TTS 三块生产区，尤其要把 VideoGenerationPanel 画成主区域一级模块。
- Stitch 不要画什么：不要把视频生成画成一个小按钮、不要画复杂剪辑时间线、不要让模型参数藏在设置页。

### 6. Asset Review / Final Video Library

- 页面目标：集中审核候选素材和已采纳素材，导出一条视频制作方案。
- 页面布局：左侧筛选与分镜导航 + 中间素材审核网格 + 右侧复盘/导出 Inspector。
- 左侧区域：素材类型、角色、场景、分镜、状态筛选。
- 中间区域：AssetReviewGrid，图片、视频、音频、字幕卡片；视频可直接预览。
- 右侧 Inspector：采纳记录、拒绝原因、ReflectionAgent 总结、成本明细、导出预览。
- 顶部栏：项目/角色/视频方案状态、导出制作方案按钮。
- 底部栏：批量操作栏。
- 使用哪些模块：Asset Review Module、Reflection / Memory Module、Cost Module、Export Module、Generation Task Module。
- 主按钮：导出视频制作方案。
- 次按钮：采纳、拒绝、记录失败原因、重新生成、下载素材。
- 关键状态：无素材、候选待审核、存在失败原因未填写、可导出、导出失败。
- MVP 必须实现的组件：AssetReviewGrid、CandidateAssetCard、VideoCandidatePlayer、ReflectionInspector、ExportProductionPlanButton。
- v0.2 再做的组件：成片版本管理、自动剪辑接口、素材批量打包。
- Stitch 生成时必须突出什么：候选素材审核、视频预览、采纳/拒绝、失败原因、复盘建议、成本和导出制作方案。
- Stitch 不要画什么：不要画成普通网盘、图片瀑布流或成片播放站，不要弱化失败复盘闭环。

## 4. 核心组件清单

| 组件名 | 用途 | 出现页面 | 数据来源 | MVP 必须 | 备注 |
| --- | --- | --- | --- | --- | --- |
| ProjectCard | 展示项目封面、名称、状态、产出数量和成本 | Dashboard / Project List | Project、GenerateTask、CostRecord | 是 | 卡片点击进入项目 |
| CharacterCard | 展示角色姓名、英歌定位、主色、人格标签、字段完整度 | Yingge Character Library | Character、ProjectCharacter | 是 | 支持筛选和加入项目 |
| CharacterBibleTabs | 按五层结构展示角色字段 | Character Detail / Character Bible | CharacterVisualProfile、CharacterNarrativeProfile、CharacterCommercialProfile | 是 | 五层结构来自 Excel 分析 |
| VisualProfilePanel | 展示主色系、脸谱特征、视觉关键词、参考图 | Character Detail、Prompt Workspace | CharacterVisualProfile、Asset | 是 | 是角色一致性依据 |
| PromptKeywordChips | 展示正向词、禁止词、商业转化关键词 | Character Library、Character Detail、Prompt Workspace | PromptKeywordSet、Excel 字段 | 是 | 禁止词必须醒目 |
| ProductionStepRail | 展示生产步骤和阶段状态 | Script & Storyboard、Prompt Workspace | Script、Shot、GenerateTask | 是 | 借鉴流程栏但使用我们自己的步骤 |
| ScriptEditor | 编辑或生成 30-60 秒人物介绍文案 | Script & Storyboard | Script、Character | 是 | 需要版本保存 |
| ShotCard | 展示单个分镜的描述、时长、角色、场景和素材状态 | Script & Storyboard、Prompt Workspace | Shot、Asset、GenerateTask | 是 | 是生产最小单元 |
| StoryboardTimeline | 按顺序展示 5-8 个分镜 | Script & Storyboard | ScriptScene、Shot | 是 | MVP 可用横向/纵向列表 |
| PromptEditor | 编辑图片 Prompt、视频 Prompt 和 negative prompt | Prompt Workspace | PromptDraft、Shot、PromptKeywordSet | 是 | 显示字段来源和检查结果 |
| ModelSelector | 选择文本/生图/生视频/TTS 模型和参数 | Prompt Workspace | ModelConfig、Provider Adapter | 是 | 不展示 API Key |
| ImageGenerationPanel | 生图操作区，包含参考图、候选图、采纳关键帧 | Prompt Workspace | PromptDraft、Asset、GenerateTask | 是 | 必须支持 gpt-image-2 / nano banana |
| VideoGenerationPanel | 生视频操作区，包含模式、关键帧、Seedance 2.0、候选视频 | Prompt Workspace | PromptDraft、Asset、GenerateTask、Shot | 是 | 必须独立于通用任务模块 |
| TTSGenerationPanel | 旁白/对白 TTS、音色、试听、字幕关联 | Prompt Workspace | Script、Shot、Asset、GenerateTask | 是 | 必须支持 MiniMax TTS |
| GenerationTaskStatus | 显示任务排队、处理中、完成、失败、取消 | 多页面 | GenerateTask | 是 | 可用于按钮、卡片、列表 |
| CandidateAssetCard | 展示候选图片/视频/音频及采纳/拒绝操作 | Prompt Workspace、Asset Review | Asset、GenerateTask | 是 | 拒绝时要填失败原因 |
| VideoCandidatePlayer | 预览候选视频和已采纳视频 | Prompt Workspace、Asset Review | Asset | 是 | 支持播放失败状态 |
| AssetReviewGrid | 按类型/分镜/状态审核素材 | Asset Review | Asset、Shot、CostRecord | 是 | MVP 核心审核页 |
| ReflectionInspector | 展示失败原因、Agent 总结和改进建议 | Prompt Workspace、Asset Review | AgentMemory、Asset、PromptDraft | 是 | 第一版轻量实现 |
| CostBadge | 展示预估/实际成本 | Dashboard、Prompt Workspace、Asset Review | CostRecord、GenerateTask | 是 | 预算 4000 元必须可见 |
| ExportProductionPlanButton | 导出视频制作方案 | Asset Review | Project、Script、Shot、Asset、CostRecord | 是 | MVP 验收项 |

## 5. Stitch 设计输入建议

### 第一轮

- 应生成页面：Dashboard / Project List、Yingge Character Library。
- 强调模块：ProjectCard、CharacterCard、PromptKeywordChips、CostBadge。
- 设计重点：先把“英歌非遗 IP 工作台”的入口和角色库气质定住，让页面看起来是围绕英歌水浒角色圣经和 IP 沉淀，而不是通用 SaaS。
- 不让 Stitch 过度发挥：不要生成复杂营销首页，不要做古风网页游戏，不要添加无关社交/社区/商城页面。

### 第二轮

- 应生成页面：Character Detail / Character Bible、Script & Storyboard Generator。
- 强调模块：CharacterBibleTabs、VisualProfilePanel、PromptKeywordChips、ProductionStepRail、ScriptEditor、StoryboardTimeline、ShotCard。
- 设计重点：强化“角色圣经 -> 人物介绍文案 -> 5-8 个分镜”的前半段生产流，突出角色字段如何驱动内容生成。
- 不让 Stitch 过度发挥：不要把角色详情画成单纯头像页；不要把脚本页画成通用在线文档或小说写作器。

### 第三轮

- 应生成页面：Prompt & Generation Workspace、Asset Review / Final Video Library。
- 强调模块：PromptEditor、ImageGenerationPanel、VideoGenerationPanel、TTSGenerationPanel、AssetReviewGrid、CandidateAssetCard、VideoCandidatePlayer、ReflectionInspector、GenerationTaskStatus、ExportProductionPlanButton。
- 设计重点：表现 Prompt、生图、生视频、TTS、采纳/拒绝/失败原因/复盘/成本/导出的完整闭环，让素材沉淀成为 IP 资产库。
- 不让 Stitch 过度发挥：不要把视频生成简化为单个“Generate”按钮；不要做成普通网盘或完整剪辑软件；不要弱化失败复盘和成本统计。

### 模块发挥边界

- 可以让 Stitch 发挥：东方水墨质感、桌面工作台信息密度、卡片状态、右侧 Inspector、分镜网格和素材审核布局。
- 需要严格约束：角色字段必须来自英歌水浒角色圣经；视频生成必须包含 Seedance 2.0、关键帧、首帧/首尾帧模式、候选视频、质检和成本；Prompt 区必须包含正向词、禁止词和字段来源。
- 不建议让 Stitch 设计：API Key 管理、复杂 Agent Skill 编辑器、完整自动剪辑器、商城/订单/客户管理、无限画布、移动端优先页面。
