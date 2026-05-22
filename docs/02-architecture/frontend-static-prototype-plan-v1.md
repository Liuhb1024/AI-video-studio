# 前端静态原型实现计划 v1

本文档用于指导“AI 英歌漫剧内容生产工作台”前端静态原型开发。当前线程只做架构、规划和文档，不写正式前端代码。

分析输入：

- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/`
- `/Users/huabi/code/AI-video-studio/docs/06-prd/PRD-v1.0.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-module-spec-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/stitch-assets-organization-report.md`

补充说明：任务要求的 `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-visual-spec-v1.md` 当前未找到；本计划的视觉部分基于 6 个 Stitch 截图、各页面 `DESIGN.md`、`notes.md`、`ui-module-spec-v1.md` 和 PRD 提炼，相关结论标记为“由 Stitch 资产归纳”。

## 1. Stitch 设计资产总览

| 页面 | 对应目录 | 主要布局 | 主要组件 | 可借鉴点 | 不应直接采用的点 |
|---|---|---|---|---|---|
| Dashboard / Project List | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-01-dashboard` | 左侧 240px 导航 + 顶部状态栏 + 中央项目总览 + 右侧任务/成本 Inspector | AppSidebar、TopStatusBar、ProjectCard、StatCard、RecentTaskPanel、CostSummaryPanel、CostBadge | 项目卡、统计卡、成本预算、最近任务形成了清晰首页工作台；右侧 Inspector 很适合放成本提醒和任务队列 | `code.html` 中写死图片 URL、用户头像、金额和项目名；部分中文文案不符合 PRD，需要重写 |
| Yingge Character Library | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-02-character-library` | 左侧导航 + 顶部状态栏 + 搜索/导入栏 + 左侧筛选 + 中央角色卡网格 + 右侧角色详情 Inspector | CharacterCard、CharacterFilterPanel、PromptKeywordChips、FieldSourceBadge、CharacterDetailInspector | 角色卡信息密度高，能突出脸谱主色、星位、英歌职能、完整度、Excel 行号；右侧 Inspector 适合展示五层字段完整度和关键词 | Stitch 角色数量、Excel 文件名和字段名有不准确内容；不能照搬截图内文案和图片；筛选字段要按 Excel 分析重设 |
| Character Detail / Character Bible | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-03-character-detail` | 左侧导航 + 顶部来源/操作栏 + 左侧角色视觉概览 + 中央五层 Tabs + 右侧一致性 Inspector | CharacterBibleTabs、VisualProfilePanel、PromptKeywordChips、FieldSourceBadge、CharacterDetailInspector | 五层角色圣经非常清晰；视觉层的脸谱主色、纹样、武器、正负向词可直接指导组件拆分 | 截图以武松为例但字段不完全等同真实 Excel；英文关键词和负向词需人工校对；图片只作占位 |
| Script & Storyboard Generator | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-04-script-storyboard` | 左侧导航 + 顶部项目栏 + 左侧 ProductionStepRail + 中央 ScriptEditor / StoryboardTimeline + 右侧 Agent Inspector | ProductionStepRail、ScriptEditor、StoryboardTimeline、ShotCard、AgentInspector | “角色 -> 剧本 -> 分镜 -> Prompt 工作台”的生产链路强；ScriptEditor 与 ShotCard 同屏，适合静态原型 | 不做真实编辑器能力；截图内剧本文案需替换为 mock；不实现自动分镜、导出 PDF 等真实逻辑 |
| Prompt & Generation Workspace | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-05-generation-workspace` | 左侧导航 + 顶部任务/成本栏 + 左侧 ShotList + 中央 Prompt/Image/Video/TTS 生产区 + 右侧一致性 Inspector | PromptEditor、ImageGenerationPanel、VideoGenerationPanel、TTSGenerationPanel、ModelSelector、GenerationTaskStatus、VideoCandidatePlayer、ConsistencyInspector | 页面 5 是核心参考：VideoGenerationPanel 已作为一级主模块，展示 Seedance 2.0、关键帧、参数、候选视频、采纳/拒绝、成本 | 不能把生成逻辑接 API；不能照搬外链素材；Video 面板需按 PRD 补齐首尾帧、失败原因、角色/场景/英歌动作检查 |
| Asset Review / Final Video Library | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-06-asset-review` | 左侧导航 + 顶部项目成片状态 + 左侧筛选 + 中央素材分组/视频预览 + 右侧 Reflection/成本/导出 Inspector + 底部分镜条 | AssetReviewGrid、CandidateAssetCard、VideoCandidatePlayer、ReflectionInspector、FailureReasonChips、ExportProductionPlanButton | 素材审核闭环清楚：按分镜分组、候选状态、视频预览、拒绝原因统计、下一轮建议、成本提醒 | 不做真实上传、真实视频播放队列、真实导出；拒绝原因和模型失败数据需从 mock 生成 |

已读取资产：

- 6 个页面的 `DESIGN.md`：统一为 `Ink & Cinnabar Production` 视觉系统。
- 6 个页面的 `notes.md`：确认每页重点组件和不直接采用项。
- 6 个页面的 `screen.png`：用于提炼布局、信息密度和视觉层级。
- 6 个页面的 `code.html`：仅作为结构参考，未作为可复制实现方案。

## 2. 全局布局抽象

### 2.1 AppShell

建议所有页面复用统一 `AppShell`：

- 左侧：`AppSidebar`
- 顶部：`TopStatusBar`
- 主体：`MainWorkspace`
- 右侧：`RightInspector`
- 可选底部：`BottomActionBar`

全局组件：

| 组件 | 类型 | 说明 | 复用页面 |
|---|---|---|---|
| AppShell | 全局布局 | 控制左导航、顶部栏、主区、右 Inspector 的整体框架 | 全部页面 |
| AppSidebar | 全局导航 | 固定左侧导航，保留英歌剧场品牌、主路由、用户入口 | 全部页面 |
| TopStatusBar | 全局状态 | 显示当前项目、模型健康度、任务数、预算剩余、通知入口 | 全部页面 |
| MainWorkspace | 全局容器 | 承载页面主内容，控制滚动区域和宽度 | 全部页面 |
| RightInspector | 全局插槽 | 右侧上下文面板，内容由页面注入 | Dashboard、Characters、Generation、Asset Review 等 |
| PageHeader | 全局页面头 | 页面标题、说明、主操作、次操作 | 全部页面 |
| StatusBadge | 通用状态 | 展示生成中、已采纳、失败、已完成等 | 全部页面 |
| CostBadge | 通用成本 | 展示单任务、单分镜、项目级成本 | Dashboard、Generation、Asset Review |
| BottomActionBar | 可选全局 | 用于批量操作、上一步/下一步、导出等 | Character Library、Generation、Asset Review |

页面专属组件：

- Dashboard：`ProjectCard`、`StatCard`、`RecentTaskPanel`、`CostSummaryPanel`
- Character Library：`CharacterCard`、`CharacterFilterPanel`、`CharacterDetailInspector`
- Character Detail：`CharacterBibleTabs`、`VisualProfilePanel`、`FieldSourceBadge`
- Script Studio：`ProductionStepRail`、`ScriptEditor`、`StoryboardTimeline`、`ShotCard`、`AgentInspector`
- Generation Workspace：`PromptEditor`、`ImageGenerationPanel`、`VideoGenerationPanel`、`TTSGenerationPanel`、`ConsistencyInspector`
- Asset Review：`AssetReviewGrid`、`CandidateAssetCard`、`VideoCandidatePlayer`、`ReflectionInspector`

多个页面复用组件：

- `PromptKeywordChips`：角色库、角色详情、生成工作台。
- `FieldSourceBadge`：角色库、角色详情、生成工作台。
- `ShotCard`：Script Studio、Generation Workspace、Asset Review 时间线。
- `GenerationTaskStatus`：Dashboard、Generation Workspace、Asset Review。
- `VideoCandidatePlayer`：Generation Workspace、Asset Review。
- `CostBadge`：Dashboard、Generation Workspace、Asset Review。

必须保留的视觉元素：

- 深墨黑分层背景。
- 左侧稳定导航与朱砂红 active indicator。
- 顶部模型健康度、任务数、预算剩余。
- 鎏金用于成本、进度和关键数据。
- 朱砂红用于主按钮和风险提示。
- 暗玉绿用于通过、采纳、健康状态。
- 卡片 1px 暗色边框、8px 左右圆角、低饱和阴影。
- 轻量水墨纹理背景，但不能影响可读性。

## 3. Next.js 路由设计

| 路由 | 页面目标 | 使用组件 | 使用 mock 数据 | 对应 Stitch 参考图 | MVP 静态原型范围 |
|---|---|---|---|---|---|
| `/dashboard` | 展示项目列表、项目状态、成本、近期任务 | AppShell、PageHeader、ProjectCard、StatCard、RecentTaskPanel、CostSummaryPanel | `projects.ts`、`tasks.ts`、`costs.ts`、`assets.ts` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-01-dashboard/screen.png` | 静态项目卡、统计卡、任务列表、成本图块；按钮无真实行为 |
| `/characters` | 浏览角色库，筛选和查看角色摘要 | AppShell、CharacterFilterPanel、CharacterCard、CharacterDetailInspector、PromptKeywordChips | `characters.ts`、`costs.ts` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-02-character-library/screen.png` | 展示 8-12 个 mock 角色卡、筛选面板和右侧详情；筛选不需要真实联动 |
| `/characters/[id]` | 展示单角色五层圣经与视觉一致性档案 | AppShell、CharacterBibleTabs、VisualProfilePanel、PromptKeywordChips、FieldSourceBadge | `characters.ts`、`assets.ts` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-03-character-detail/screen.png` | 静态展示一个角色详情，Tabs 可先用静态 active 状态或轻量切换 |
| `/script-studio` | 从角色生成文案并拆分 5-8 个分镜 | AppShell、ProductionStepRail、ScriptEditor、StoryboardTimeline、ShotCard、AgentInspector | `characters.ts`、`shots.ts` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-04-script-storyboard/screen.png` | 展示脚本文案、6 个分镜卡、Agent 建议；不做真实编辑/生成 |
| `/generation-workspace` | 展示 Prompt、生图、生视频、TTS 的核心生产工作台 | AppShell、ShotCard、PromptEditor、ImageGenerationPanel、VideoGenerationPanel、TTSGenerationPanel、ConsistencyInspector | `characters.ts`、`shots.ts`、`tasks.ts`、`assets.ts`、`costs.ts` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-05-generation-workspace/screen.png` | 必须还原四个一级生产模块，尤其 VideoGenerationPanel；仅模拟状态 |
| `/asset-review` | 审核素材、记录失败原因、查看复盘和导出方案 | AppShell、AssetReviewGrid、CandidateAssetCard、VideoCandidatePlayer、ReflectionInspector、ExportProductionPlanButton | `shots.ts`、`assets.ts`、`tasks.ts`、`costs.ts` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-06-asset-review/screen.png` | 静态素材分组、视频预览占位、拒绝原因、导出按钮；不做真实下载/导出 |

## 4. 组件拆分计划

推荐目录结构：

```text
frontend/
├── app/
│   ├── dashboard/
│   ├── characters/
│   ├── characters/[id]/
│   ├── script-studio/
│   ├── generation-workspace/
│   └── asset-review/
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── characters/
│   ├── script/
│   ├── generation/
│   ├── assets/
│   └── common/
├── data/
│   └── mock/
├── lib/
└── styles/
```

### 4.1 Layout

| 文件名 | 职责 | 出现页面 | 依赖数据 | MVP 必须 |
|---|---|---|---|---|
| `components/layout/AppShell.tsx` | 组合侧边栏、顶部栏、主工作区、右 Inspector 插槽 | 全部 | currentProject、topStatus | 是 |
| `components/layout/AppSidebar.tsx` | 左侧导航、品牌、路由 active 状态、用户区 | 全部 | navigationItems、currentUser | 是 |
| `components/layout/TopStatusBar.tsx` | 当前项目、模型健康度、运行中任务、预算剩余 | 全部 | Project、GenerateTask[]、CostRecord[] | 是 |
| `components/layout/RightInspector.tsx` | 统一右侧面板容器 | 多页面 | children | 是 |
| `components/layout/PageHeader.tsx` | 标题、描述、主按钮、次按钮 | 全部 | title、actions | 是 |

### 4.2 Dashboard

| 文件名 | 职责 | 出现页面 | 依赖数据 | MVP 必须 |
|---|---|---|---|---|
| `components/dashboard/ProjectCard.tsx` | 展示项目封面、状态、角色、分镜、成本、失败数 | `/dashboard` | Project、CostRecord、Asset | 是 |
| `components/dashboard/StatCard.tsx` | 首页统计数字 | `/dashboard` | projects、characters、assets、costs | 是 |
| `components/dashboard/RecentTaskPanel.tsx` | 右侧最近生成任务 | `/dashboard` | GenerateTask[] | 是 |
| `components/dashboard/CostSummaryPanel.tsx` | 项目总成本和模型成本拆分 | `/dashboard` | CostRecord[] | 是 |

### 4.3 Characters

| 文件名 | 职责 | 出现页面 | 依赖数据 | MVP 必须 |
|---|---|---|---|---|
| `components/characters/CharacterCard.tsx` | 角色卡，展示身份、主色、人格、完整度 | `/characters` | Character | 是 |
| `components/characters/CharacterFilterPanel.tsx` | 角色筛选面板 | `/characters` | Character[] | 是 |
| `components/characters/CharacterDetailInspector.tsx` | 角色库右侧详情摘要 | `/characters` | Character | 是 |
| `components/characters/CharacterBibleTabs.tsx` | 五层角色圣经 Tabs | `/characters/[id]` | Character profiles | 是 |
| `components/characters/VisualProfilePanel.tsx` | 脸谱、主色、纹样、武器、视觉词 | `/characters/[id]`、`/generation-workspace` | CharacterVisualProfile | 是 |
| `components/characters/PromptKeywordChips.tsx` | 正向词、禁止词 chips | 多页面 | PromptKeywordSet fields | 是 |
| `components/characters/FieldSourceBadge.tsx` | Excel 路径、工作表、行号、证据类型 | `/characters`、`/characters/[id]` | source fields | 是 |

### 4.4 Script

| 文件名 | 职责 | 出现页面 | 依赖数据 | MVP 必须 |
|---|---|---|---|---|
| `components/script/ProductionStepRail.tsx` | 展示选择角色、生成剧本、拆分镜、确认镜头等流程 | `/script-studio` | step states | 是 |
| `components/script/ScriptEditor.tsx` | 静态脚本文案编辑区 | `/script-studio` | Script | 是 |
| `components/script/StoryboardTimeline.tsx` | 分镜时间线 / 卡片列表 | `/script-studio` | Shot[] | 是 |
| `components/script/ShotCard.tsx` | 单分镜信息卡，可被多页面复用 | `/script-studio`、`/generation-workspace`、`/asset-review` | Shot、Asset、GenerateTask | 是 |
| `components/script/AgentInspector.tsx` | ScriptAgent、StoryboardAgent、CriticAgent 建议 | `/script-studio` | ReflectionNote[] 或 mock agent notes | 是 |

### 4.5 Generation

| 文件名 | 职责 | 出现页面 | 依赖数据 | MVP 必须 |
|---|---|---|---|---|
| `components/generation/PromptEditor.tsx` | 图片 Prompt、视频 Prompt、negative prompt | `/generation-workspace` | PromptDraft、Shot | 是 |
| `components/generation/ImageGenerationPanel.tsx` | gpt-image-2 / nano banana 生图静态面板 | `/generation-workspace` | PromptDraft、Asset、GenerateTask | 是 |
| `components/generation/VideoGenerationPanel.tsx` | Seedance 2.0 视频生成一级模块 | `/generation-workspace` | PromptDraft、Asset、GenerateTask、CostRecord | 是 |
| `components/generation/TTSGenerationPanel.tsx` | MiniMax TTS 静态面板 | `/generation-workspace` | Script、Shot、Asset | 是 |
| `components/generation/ModelSelector.tsx` | 模型和参数选择控件 | `/generation-workspace` | model options mock | 是 |
| `components/generation/GenerationTaskStatus.tsx` | 任务状态显示 | 多页面 | GenerateTask | 是 |
| `components/generation/VideoCandidatePlayer.tsx` | 候选视频预览区域 | `/generation-workspace`、`/asset-review` | Asset | 是 |
| `components/generation/ConsistencyInspector.tsx` | 角色、场景、英歌动作一致性检查 | `/generation-workspace` | Character、Shot、PromptDraft | 是 |

### 4.6 Assets

| 文件名 | 职责 | 出现页面 | 依赖数据 | MVP 必须 |
|---|---|---|---|---|
| `components/assets/AssetReviewGrid.tsx` | 按分镜/类型分组展示素材 | `/asset-review` | Asset[]、Shot[] | 是 |
| `components/assets/CandidateAssetCard.tsx` | 候选素材卡，含状态、成本、采纳/拒绝 | `/asset-review`、`/generation-workspace` | Asset、GenerateTask、CostRecord | 是 |
| `components/assets/ReflectionInspector.tsx` | 失败原因、复盘建议、下一轮约束 | `/asset-review` | ReflectionNote[] | 是 |
| `components/assets/FailureReasonChips.tsx` | 失败原因标签 | `/asset-review`、`/generation-workspace` | failure reasons | 是 |
| `components/assets/ExportProductionPlanButton.tsx` | 导出制作方案按钮占位 | `/asset-review` | Project、Shot[]、Asset[] | 是 |

### 4.7 Common

| 文件名 | 职责 | 出现页面 | 依赖数据 | MVP 必须 |
|---|---|---|---|---|
| `components/common/CostBadge.tsx` | 成本显示 | 多页面 | CostRecord 或 number | 是 |
| `components/common/StatusBadge.tsx` | 状态标签 | 多页面 | status | 是 |
| `components/common/SectionCard.tsx` | 通用面板容器 | 多页面 | children | 是 |
| `components/common/MetricCard.tsx` | 指标卡 | Dashboard、Asset Review | label、value、trend | 是 |
| `components/common/EmptyState.tsx` | 空状态 | 多页面 | title、description、action | 是 |
| `components/common/LoadingSkeleton.tsx` | 静态加载骨架 | 多页面 | variant | 是 |

## 5. Mock 数据设计

以下为静态原型所需 TypeScript interface 草案，仅写入本文档，不创建代码文件。

```ts
interface Project {
  id: string
  title: string
  targetPlatform: 'douyin' | 'wechat_channels' | 'tiktok' | 'youtube_shorts'
  targetDurationSec: number
  status: 'draft' | 'scripting' | 'storyboarding' | 'generating' | 'reviewing' | 'completed'
  characterIds: string[]
  shotCount: number
  acceptedAssetCount: number
  failedTaskCount: number
  totalCostCny: number
  updatedAt: string
}

interface Character {
  id: string
  name: string
  nickname?: string
  ranking?: number
  starPosition?: string
  origin?: string
  liangshanRole?: string
  primaryWeapon?: string
  yinggeRolePosition?: string
  fieldCompleteness: number
  sourceExcelPath: string
  sourceSheetName: string
  sourceRowNumber: number
  evidenceType?: 'explicit_record' | 'inferred' | 'unconfirmed'
  visualProfile: CharacterVisualProfile
  narrativeProfile: CharacterNarrativeProfile
  commercialProfile: CharacterCommercialProfile
}

interface CharacterVisualProfile {
  facePrimaryColor?: string
  faceSecondaryColors?: string[]
  colorSymbolism?: string[]
  facePatterns?: string[]
  sourceColorClues?: string
  visualToneKeywords?: string[]
  positiveKeywords?: string[]
  negativeKeywords?: string[]
  referenceImageUrls?: string[]
}

interface CharacterNarrativeProfile {
  personalityTags: string[]
  innerConflict?: string
  lifeEventNodes?: Array<{ title: string; summary: string }>
  audienceEmotionTrigger?: string
  coreSceneTitle?: string
  coreSceneSource?: string
  coreSceneText?: string
  relationshipGraph?: Array<{ targetName: string; relation: string; note: string }>
}

interface CharacterCommercialProfile {
  targetUserProfile?: string
  commercialPositioning?: string
  symbolicMeaning?: string
  namingDirections?: string[]
  productToneTags?: string[]
  blessingMeaning?: string
  merchandisingElements?: string[]
}

interface Script {
  id: string
  projectId: string
  characterId: string
  title: string
  version: string
  targetDurationSec: number
  narrationText: string
  status: 'draft' | 'generated' | 'edited' | 'confirmed'
}

interface Shot {
  id: string
  scriptId: string
  index: number
  title: string
  durationSec: number
  narration: string
  visualDescription: string
  actionDescription: string
  emotion: string
  characterIds: string[]
  sceneName?: string
  status: 'empty' | 'prompt_ready' | 'image_ready' | 'video_ready' | 'tts_ready' | 'accepted'
}

interface PromptDraft {
  id: string
  shotId: string
  type: 'image' | 'video' | 'negative'
  modelScope: 'gpt-image-2' | 'nano-banana' | 'seedance-2' | 'minimax-tts' | 'all'
  content: string
  sourceFieldNames: string[]
  positiveKeywords: string[]
  negativeKeywords: string[]
  version: string
  status: 'generated' | 'edited' | 'checked' | 'warning'
}

interface GenerateTask {
  id: string
  projectId: string
  shotId?: string
  type: 'text' | 'image' | 'video' | 'tts'
  provider: string
  model: string
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed' | 'canceled'
  progress?: number
  errorMessage?: string
  estimatedCostCny?: number
  actualCostCny?: number
  createdAt: string
}

interface Asset {
  id: string
  projectId: string
  shotId?: string
  taskId?: string
  type: 'image' | 'video' | 'audio' | 'subtitle'
  title: string
  url: string
  thumbnailUrl?: string
  status: 'candidate' | 'accepted' | 'rejected' | 'archived'
  model?: string
  promptVersion?: string
  failureReasons?: string[]
  createdAt: string
}

interface CostRecord {
  id: string
  projectId: string
  taskId?: string
  model: string
  capability: 'text' | 'image' | 'video' | 'tts'
  estimatedCostCny?: number
  actualCostCny: number
  createdAt: string
}

interface ReflectionNote {
  id: string
  projectId: string
  shotId?: string
  assetId?: string
  reasonCategory: 'character_inconsistent' | 'scene_inconsistent' | 'yingge_action_wrong' | 'face_pattern_wrong' | 'color_wrong' | 'motion_too_strong' | 'motion_too_weak' | 'duration_mismatch' | 'model_error' | 'other'
  userNote?: string
  agentSummary: string
  suggestedPromptPatch?: string
  suggestedNegativeKeywords?: string[]
  createdAt: string
}
```

Mock 数据文件建议：

| 文件 | 内容 |
|---|---|
| `data/mock/projects.ts` | 项目列表、当前项目、项目状态统计 |
| `data/mock/characters.ts` | 宋江、武松、林冲、关胜等角色及五层档案 |
| `data/mock/shots.ts` | 6 个分镜、旁白、动作、时长、状态 |
| `data/mock/tasks.ts` | 生图、生视频、TTS 任务状态 |
| `data/mock/assets.ts` | 候选图片、候选视频、TTS 音频、字幕 |
| `data/mock/costs.ts` | 项目成本、单任务成本、模型成本拆分 |

## 6. 设计 Token 和 Tailwind 方案

`ui-visual-spec-v1.md` 未找到，因此以下为由 Stitch 资产归纳的 Tailwind 方案。

### 6.1 颜色 token

| Token | 建议值 | 用途 |
|---|---|---|
| `ink-950` | `#0e0e0e` | 全局最深背景 |
| `ink-900` | `#131313` | 页面背景 |
| `ink-850` | `#1c1b1b` | 侧栏、低层容器 |
| `ink-800` | `#20201f` | 卡片、面板 |
| `ink-700` | `#2a2a2a` | hover、active surface |
| `paper-100` | `#e5e2e1` | 主文字 |
| `paper-300` | `#c9c1bd` | 次级文字 |
| `cinnabar-600` | `#b22222` | 主按钮、active、风险 |
| `cinnabar-300` | `#ffb4ac` | 高亮文字、focus |
| `gold-500` | `#e9c349` | 成本、预算、重点数值 |
| `gold-700` | `#af8d11` | 金色容器/进度 |
| `jade-600` | `#0e6b08` | 通过、采纳、健康状态 |
| `line-muted` | `#5a403e` | 暗色边框 |

### 6.2 背景纹理策略

- 全局背景使用 `bg-ink-900`。
- 在 AppShell 背景叠加低透明水墨纹理，控制在 2%-4% opacity。
- 不在卡片内部大面积使用复杂纹理，避免影响中文可读性。
- 页面左侧可保留淡淡英歌脸谱/水墨插画作为品牌氛围，但不作为交互内容。

### 6.3 字体层级

- 中文字体：优先 `PingFang SC` / `Source Han Sans SC` / `Noto Sans CJK SC`。
- 英文/数字：可用 `Inter` 或 `Plus Jakarta Sans`；成本和任务编号可用 `JetBrains Mono`。
- 页面主标题：32-36px，700。
- 分区标题：18-24px，600。
- 卡片标题：15-18px，600。
- 正文：13-14px。
- 元数据/标签：10-12px，使用 uppercase 英文时保持少量 letter spacing。

### 6.4 边框和阴影

- 面板边框：`border border-white/10` 或自定义 `border-line-muted/40`。
- 卡片圆角：8px 为主，按钮/输入 4px。
- 阴影：轻量 `shadow-[0_4px_20px_rgba(0,0,0,0.45)]`。
- active 卡片可使用朱砂红左边框或鎏金顶边框。

### 6.5 状态色

| 状态 | 色彩 |
|---|---|
| 健康 / 通过 / 已采纳 | 暗玉绿 |
| 生成中 / 待处理 | 鎏金 |
| 失败 / 风险 / 拒绝 | 朱砂红 |
| 草稿 / 未开始 | 灰色 |
| 当前选中 | 朱砂红边框 + 深色高亮面 |

### 6.6 卡片样式

- `SectionCard`：深色背景、1px 边框、8px 圆角、16px 内边距。
- `ProjectCard`：上图下信息，底部展示进度和成本。
- `CharacterCard`：图片背景 + 信息遮罩 + 主色圆点 + 标签 + 完整度。
- `ShotCard`：固定比例缩略图、编号、时长、状态、成本。
- `CandidateAssetCard`：缩略图、模型、任务状态、采纳/拒绝、失败原因。

### 6.7 滚动区域样式

- 左侧导航固定，不滚动。
- 顶部状态栏 sticky。
- 主工作区独立滚动。
- 右侧 Inspector 独立滚动。
- 滚动条使用细线、低对比色，hover 时增强。

## 7. 实现顺序

### Phase 1：初始化 frontend 项目

- 目标：建立 Next.js 静态原型工程基础。
- 输入文档：PRD、技术架构、UI 模块规格、Stitch 整理报告。
- 产出文件：`frontend/` 基础目录、路由骨架、Tailwind/shadcn 基础配置、mock 数据目录。
- 验收标准：能启动本地页面；6 个路由可访问空壳页面。
- 不做什么：不接后端、不接数据库、不接真实 API、不做登录。

### Phase 2：实现 AppShell

- 目标：实现所有页面共享的左侧导航、顶部状态栏、主区和右侧 Inspector 框架。
- 输入文档：6 张 Stitch 截图、`DESIGN.md` 视觉规范。
- 产出文件：`AppShell`、`AppSidebar`、`TopStatusBar`、`RightInspector`、`PageHeader`、通用 token。
- 验收标准：布局与 Stitch 基准图气质一致，Dashboard/角色库/生成页可复用同一 shell。
- 不做什么：不做移动端响应式，不做权限菜单。

### Phase 3：实现 Dashboard + Character Library

- 目标：完成项目入口和角色库静态页面。
- 输入文档：page-01、page-02 的 `screen.png`、`notes.md`、`code.html` 结构参考。
- 产出文件：`/dashboard`、`/characters`、ProjectCard、StatCard、CharacterCard、CharacterFilterPanel。
- 验收标准：首页可看到项目卡、统计、任务和成本；角色库可看到筛选、角色卡网格和右侧详情。
- 不做什么：不做真实筛选、不做 Excel 上传、不做项目创建。

### Phase 4：实现 Character Detail + Script Studio

- 目标：完成角色五层圣经页和脚本/分镜页。
- 输入文档：page-03、page-04 的截图与 UI 模块规格。
- 产出文件：`/characters/[id]`、`/script-studio`、CharacterBibleTabs、VisualProfilePanel、ScriptEditor、StoryboardTimeline、ShotCard、AgentInspector。
- 验收标准：角色详情展示五层结构；Script Studio 展示 30-60 秒脚本和 5-8 个分镜卡。
- 不做什么：不做真实 Tab 数据加载、不做 AI 生成、不做真实编辑保存。

### Phase 5：实现 Generation Workspace + Asset Review

- 目标：完成核心生成工作台和素材审核页。
- 输入文档：page-05、page-06 的截图、`ui-module-spec-v1.md` 中 Video Generation Module 要求。
- 产出文件：`/generation-workspace`、`/asset-review`、PromptEditor、ImageGenerationPanel、VideoGenerationPanel、TTSGenerationPanel、AssetReviewGrid、ReflectionInspector。
- 验收标准：VideoGenerationPanel 作为一级模块出现；展示 Seedance 2.0、关键帧、生成模式、视频 Prompt、候选视频、预览、采纳/拒绝、失败原因、成本。
- 不做什么：不接模型 API、不做真实视频生成、不做真实上传、不做真实导出。

### Phase 6：统一打磨

- 目标：统一视觉 token、间距、字体、状态色、滚动区域和中文文案。
- 输入文档：6 页截图、PRD、Excel 分析、UI 模块规格。
- 产出文件：统一样式、mock 文案修正、空状态/错误状态/加载骨架。
- 验收标准：6 页看起来来自同一个产品；信息层级和 PRD 一致；没有明显英文错位和不准确中文。
- 不做什么：不追求像素级复刻，不引入复杂动画，不做移动端。

## 8. 实现边界

- 第一阶段只做静态页面。
- 不接后端。
- 不接真实模型 API。
- 不做登录。
- 不做数据库。
- 不做上传。
- 不做真实任务队列。
- 不做响应式移动端。
- 不追求像素级复刻。
- 重点还原布局、气质、信息层级和组件结构。
- 所有按钮、筛选、生成、导出、采纳/拒绝操作只做静态状态或轻量 mock 交互。
- 所有图片、视频、音频都用 mock asset 占位。

## 9. 风险和注意事项

- Stitch `code.html` 不能直接搬进正式项目，只能作为布局和层级参考。
- 需要用 React 组件化重写，组件边界以本计划和 `ui-module-spec-v1.md` 为准。
- 中文文案需要人工校对，尤其是角色字段、Excel 来源、模型名称、失败原因。
- 图片占位需要替换成 mock asset，不直接依赖 Stitch HTML 中的外部图片 URL。
- 复杂交互先用静态状态模拟，例如筛选、Tab、生成进度、采纳/拒绝。
- 页面 5 的 `VideoGenerationPanel` 必须作为一级模块实现，不能退化成 ShotCard 上的状态按钮。
- `ui-visual-spec-v1.md` 当前未找到；后续若补充该文件，需要回看本计划第 6 章的 token 建议。
- Dashboard 截图为 1600 x 1280，其余页面多为 1600 x 900，静态原型统一按 1440px 桌面宽度适配。
- Stitch 生成的 CSS 类和设计 token 命名不等同于项目正式 token，后续要收敛为 Tailwind 主题。
- 不要把 Stitch 的错别字、英文混排、未确认字段带入正式 mock 数据。
