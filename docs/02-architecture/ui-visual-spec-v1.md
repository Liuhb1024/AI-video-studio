# UI 视觉规范 v1

本文档定义“AI 英歌漫剧内容生产工作台”的 MVP 前端视觉规范。它基于 gpt-image-2 视觉基准图、Stitch 页面模板、PRD v1.0 和 UI 模块规格提炼，只作为后续 Next.js + Tailwind + shadcn/ui 静态原型实现依据，不包含业务代码。

## 0. 输入与边界

### 0.1 使用的参考文件

- `/Users/huabi/code/AI-video-studio/CODEX_RULES.md`
- `/Users/huabi/code/AI-video-studio/docs/06-prd/PRD-v1.0.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-module-spec-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/stitch-assets-organization-report.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-static-prototype-plan-v1.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/gpt-image-ui-v1/01-dashboard.jpeg`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/gpt-image-ui-v1/02-character-library.jpeg`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/gpt-image-ui-v1/03-character-detail.jpeg`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/gpt-image-ui-v1/04-script-storyboard.jpeg`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/gpt-image-ui-v1/05-generation-workspace.jpeg`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/gpt-image-ui-v1/06-asset-review.jpeg`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-01-dashboard/DESIGN.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-01-dashboard/notes.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-01-dashboard/code.html`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-02-character-library/DESIGN.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-02-character-library/notes.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-02-character-library/code.html`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-03-character-detail/DESIGN.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-03-character-detail/notes.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-03-character-detail/code.html`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-04-script-storyboard/DESIGN.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-04-script-storyboard/notes.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-04-script-storyboard/code.html`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-05-generation-workspace/DESIGN.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-05-generation-workspace/notes.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-05-generation-workspace/code.html`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-06-asset-review/DESIGN.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-06-asset-review/notes.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-06-asset-review/code.html`

### 0.2 相关数据表 / 实体名

本规范涉及的前端数据实体来自 PRD 与 UI 模块规格：`Project`、`Character`、`ProjectCharacter`、`CharacterVisualProfile`、`CharacterNarrativeProfile`、`CharacterCommercialProfile`、`PromptKeywordSet`、`ProjectScene`、`Script`、`ScriptScene`、`Shot`、`PromptDraft`、`GenerateTask`、`Asset`、`CostRecord`、`AgentMemory`。

### 0.3 相关函数名

当前任务只写文档，不读取或修改正式业务代码，因此未确认已有前端函数名。后续静态原型建议按组件职责预留事件函数名：`handleCreateProject`、`handleImportCharacterExcel`、`handleSelectCharacter`、`handleGenerateScript`、`handleSplitStoryboard`、`handleSavePrompt`、`handleGenerateImage`、`handleGenerateVideo`、`handleGenerateTTS`、`handleAcceptAsset`、`handleRejectAsset`、`handleExportProductionPlan`。这些函数名仅为前端原型命名建议，未确认已存在。

### 0.4 执行边界

- 本文档只定义视觉规范，不写代码。
- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不修改 `/Users/huabi/code/AI-video-studio/yingge-app/design-references/`。
- 不接后端，不接真实模型 API，不接数据库。
- 不读取任何 `.env`、key、token、证书文件。

## 1. 整体视觉方向

### 1.1 产品视觉关键词

- 英歌非遗 IP
- 水浒角色圣经
- AI 漫剧生产
- 国风水墨
- 朱砂印记
- 鎏金数据
- 暗玉质检
- 黑神话悟空质感
- 剑来漫剧氛围
- 专业 AI 视频生产工作台
- 高信息密度
- 角色一致性与素材沉淀

### 1.2 整体气质

整体气质应是“东方非遗内容生产控制台”，不是营销页面，也不是普通 SaaS。界面底色以深墨黑为主，用水墨肌理、脸谱剪影、朱砂 active 状态和鎏金成本/进度提示建立英歌文化记忆；同时保留专业工具的冷静结构：固定导航、任务状态、模型健康度、成本预算、分镜列表、Prompt 编辑器、素材审核网格和右侧 Inspector。

视觉情绪应接近“古老叙事进入 AI 工坊”：有黑神话悟空式厚重、粗粝、暗金、烟尘和角色压迫感，也有剑来漫剧式的江湖叙事、人物宿命感和东方幻想氛围。但 UI 本体必须克制，不能让装饰盖过生产信息。

### 1.3 适合保留的风格

- 深墨黑分层背景：保留 `#0e0e0e`、`#131313`、`#1c1b1b`、`#20201f` 的 tonal layers。
- 朱砂红主操作：保留主按钮、active route、危险/失败提示中的朱砂色。
- 鎏金数字和成本：预算、成本、关键进度、premium metadata 使用金色。
- 暗玉绿成功状态：模型健康、已采纳、检查通过使用低饱和绿色。
- 水墨与脸谱纹理：可用于 AppSidebar 背景和页面底纹，透明度应低。
- 高密度工作台布局：保留 1440px 桌面优先、三栏/四栏生产区、右侧 Inspector。
- 素材候选卡：图片、视频、TTS 候选素材均要保留采纳、拒绝、成本、失败原因入口。

### 1.4 不适合继续强化的风格

- 不要普通 SaaS：避免大面积纯白、蓝紫渐变、圆润营销卡片、空泛 KPI 大屏。
- 不要古风网页游戏：避免过多卷轴、龙纹、金边大框、装备属性面板和游戏商城质感。
- 不要赛博朋克：避免霓虹紫蓝、强荧光、玻璃拟态过度、科幻城市背景。
- 不要纯暗黑游戏 UI：不要把界面做成只剩角色大图和战斗氛围，生产控件必须清楚。
- 不要过度装饰：水墨、朱砂、金色只能强化层级，不应抢 Prompt、分镜和素材状态的注意力。

### 1.5 与 PRD 的匹配度

匹配度高。PRD 明确产品不是通用 AI 短剧平台，而是“英歌非遗 IP 内容 + 文创产品引流”的内部 AI 漫剧生产工作台。当前 gpt-image-2 基准图与 Stitch 模板已经覆盖 Dashboard、角色库、角色圣经、脚本分镜、Prompt 生成、素材审核六个页面，能支撑 PRD 中“角色、脚本、分镜、Prompt、生图、生视频、TTS、采纳拒绝、失败复盘、成本记录、导出制作方案”的闭环。

需要修正的点：Stitch 与图片里的部分中文、角色数量、Excel 文件名、字段名、模型状态和素材数据不应照抄，必须按 PRD、Excel 分析和后续 mock 数据重写。

## 2. 全局布局规范

### 2.1 桌面优先布局

MVP 以 1440px 桌面布局为第一优先级，适配 1600px 宽屏。当前阶段不做移动端优先，不以手机单列布局指导组件设计。

推荐 AppShell：

```text
AppShell
├── AppSidebar: 240px fixed
├── ContentColumn: flex-1
│   ├── TopStatusBar: 72px sticky
│   └── MainWorkspace: independent scroll
└── RightInspector: 320px - 480px, page dependent
```

### 2.2 左侧导航宽度和结构

- 宽度：标准 `240px`。在 Script 页面内可额外出现 `192px` 左侧 ProductionStepRail；在角色库和素材审核页可额外出现 `256px` 筛选栏。
- 背景：`sidebar-background #0e0e0e` 或 `#131313`，叠加低透明英歌脸谱/水墨插画。
- 结构：品牌区、产品定位副标题、主路由导航、底部当前用户。
- active 状态：朱砂红左侧竖条 + 深红褐色 brush 背景 + 图标高亮。
- 导航项：Dashboard、Character Bible、Script Studio、Generation Workspace、Asset Review、Settings。
- 图标：后续用 lucide icons 或 shadcn 推荐图标系统，避免手写复杂 SVG。

### 2.3 顶部状态栏结构

- 高度建议：`64px - 72px`。
- 左侧：当前工作区 / 当前项目 / 返回按钮。
- 中间：当前角色、目标平台、视频时长、画幅比例、当前阶段。
- 右侧：模型健康度、运行中任务数、预算剩余、帮助文档、任务队列、通知、用户头像。
- 样式：深色透明背景、底部 1px 暗边框、必要时 sticky。
- 数据感：模型健康、运行任务、预算剩余必须常驻，体现 AI 生产工作台而不是内容展示站。

### 2.4 主工作区结构

- Dashboard：统计卡 + 项目卡网格 + 右侧近期任务/成本。
- Character Library：筛选栏 + 角色卡网格 + 右侧角色详情。
- Character Detail：左侧视觉概览 + 中间五层 Tabs + 右侧一致性 Inspector。
- Script & Storyboard：ProductionStepRail + ScriptEditor / ShotCard 时间线 + Agent Inspector。
- Prompt & Generation Workspace：ShotList + PromptEditor / ImageGenerationPanel / VideoGenerationPanel / TTSGenerationPanel + 一致性 Inspector。
- Asset Review：筛选栏 + 素材审核分组 + 视频预览/Prompt 信息 + Reflection Inspector + 底部分镜条。

### 2.5 右侧 Inspector 结构

- 标准宽度：`320px`。
- 角色库详情可用：`360px - 380px`。
- 素材审核视频与复盘页可用：`420px - 480px`。
- Inspector 内容不应成为杂项堆叠，应按页面上下文固定职责：
  - Dashboard：最近任务、成本概览、预算提醒。
  - Character Library：字段来源、缺失字段、关键词摘要。
  - Character Detail：视觉一致性、字段来源、错误示例。
  - Generation：角色一致性、场景一致性、英歌动作检查、Prompt 来源字段、失败复盘。
  - Asset Review：拒绝原因统计、模型失败模式、提示词优化建议、成本与导出。

### 2.6 卡片间距

- 全局 spacing unit：`4px`。
- 页面 padding：`24px`。
- 网格 gutter：`16px`。
- 卡片 gap：`12px - 16px`。
- 卡片内部 padding：小卡 `12px`，面板 `16px`，Inspector 分区 `16px - 20px`。
- 列表行高：小数据行 `32px`，标准任务行 `48px`。
- 圆角：容器 `8px`，按钮/输入/标签 `4px`，不使用大圆角卡片。

### 2.7 页面背景质感

- 背景底色：深墨黑，不使用纯黑。
- 可叠加 2%-4% opacity 水墨噪声/纹理。
- AppSidebar 可放更明显的英歌脸谱水墨插画，但主工作区只保留极弱纹理。
- 卡片内部不要使用复杂背景图，保证中文、Prompt 和数字可读。

### 2.8 页面信息密度

页面应保持高信息密度，适合专业生产人员长时间使用。避免首页式大 hero、空泛介绍、超大插画和过宽留白。每个首屏要尽量出现核心生产信息：项目进度、角色字段、分镜、Prompt、模型、任务状态、候选素材、成本。

## 3. 色彩系统

以下 token 为近似 HEX 值，来自 Stitch `Ink & Cinnabar Production` 设计系统、gpt-image-2 基准图和前端计划第 6 章归纳。

| Token | HEX | 用途 |
|---|---:|---|
| `background-primary` | `#0E0E0E` | 全局最深页面底色、App 最外层背景 |
| `background-secondary` | `#131313` | 主工作区背景、顶部栏背景 |
| `sidebar-background` | `#0B0B0A` | 左侧导航，允许叠加水墨纹理 |
| `card-background` | `#20201F` | 标准卡片、主面板 |
| `card-background-dark` | `#1C1B1B` | 次级面板、输入区、深色卡片 |
| `border-subtle` | `#5A403E` | 低对比边框，可配合 30%-50% opacity |
| `text-primary` | `#E5E2E1` | 主文字 |
| `text-secondary` | `#C9C1BD` | 次级文字、说明文字 |
| `text-muted` | `#8F817D` | 弱提示、占位、禁用文字 |
| `accent-cinnabar` | `#B22222` | 主按钮、active、风险、失败 |
| `accent-gold` | `#E9C349` | 成本、预算、进度、重点元数据 |
| `accent-jade` | `#0E6B08` | 成功、采纳、健康状态 |
| `accent-bluegray` | `#6F8490` | 信息提示、来源字段、非关键状态 |
| `status-success` | `#82DB6F` | 检查通过、完成、健康点亮 |
| `status-warning` | `#E9C349` | 生成中、待审核、预算提醒 |
| `status-error` | `#FF6B5F` | 失败、拒绝、字段错误 |
| `status-processing` | `#7AA6C2` | 排队、处理中、模型任务运行 |

辅助色建议：

| Token | HEX | 用途 |
|---|---:|---|
| `surface-hover` | `#2A2A2A` | hover / active surface |
| `surface-raised` | `#353535` | 浮层、Dropdown、Popover |
| `cinnabar-soft` | `#FFB4AC` | 朱砂高亮文字、focus halo |
| `gold-deep` | `#AF8D11` | 金色容器、进度条深色端 |
| `jade-deep` | `#064F18` | 成功容器背景 |
| `error-deep` | `#93000A` | 错误容器背景 |

## 4. 字体和排版

### 4.1 字体策略

- 中文：优先 `PingFang SC`，备选 `Source Han Sans SC`、`Noto Sans CJK SC`、系统 sans-serif。
- 英文辅助文字：可用 `Plus Jakarta Sans` 或 `Inter`，保持现代专业感。
- 数字金额 / 任务编号 / 时间戳：优先 `JetBrains Mono`，用于强调 AI Engine 与生产数据。
- 不建议使用书法字体作为 UI 正文字体。书法气质可留给 Logo 或极少量装饰，不进入操作界面。

### 4.2 中文标题风格

中文标题要清晰、稳重、有力量。页面标题建议 24-32px，字重 600-700；卡片标题 15-18px，字重 600。不要使用负 letter-spacing，不做过度古风化。

### 4.3 英文辅助文字风格

英文可作为中文标题的辅助标签，例如 `Prompt Editor`、`Video Generation`、`Character Bible`。建议 11-13px，色彩使用 `text-muted` 或 `text-secondary`，不要抢中文主标题。

### 4.4 数字金额风格

成本、预算、时长、分镜编号、任务进度使用等宽数字。金额使用 `accent-gold`，字号可比普通正文略大，Dashboard 统计数字可到 28-32px；卡片内成本为 13-16px。

### 4.5 标签文字风格

标签使用 10-12px，短词优先，圆角 4px。状态标签应有明确语义：

- `已采纳`：暗玉绿容器。
- `生成中`：金色或 bluegray 容器。
- `失败` / `拒绝`：朱砂或错误红。
- `字段推断` / `未确认`：bluegray 或 muted。

### 4.6 Prompt 文本风格

Prompt 是生产核心，不应被当成普通备注。建议：

- 编辑区字体：`JetBrains Mono` 或系统 sans-serif + 等宽 fallback，字号 12-13px。
- 行高：1.6，方便阅读中英混排。
- 正向词和负向词分区明显，负向词使用 muted red / error outline。
- 显示字段来源，如角色脸谱、主色、武器、场景、风格模板。
- 长 Prompt 使用 fixed-height textarea + ScrollArea，不让页面整体被拉高。

### 4.7 字号建议

| 层级 | 建议字号 | 字重 | 用途 |
|---|---:|---:|---|
| 页面标题 | 28-32px | 700 | Dashboard、角色库、核心页面标题 |
| 页面副标题 | 13-14px | 400 | 页面说明、当前项目说明 |
| 顶部栏主信息 | 16-20px | 600 | 当前角色、项目名、预算 |
| 分区标题 | 18-20px | 600 | 角色圣经分区、生成面板标题 |
| 卡片标题 | 15-18px | 600 | ProjectCard、ShotCard、CharacterCard |
| 正文 | 13-14px | 400 | 字段、说明、脚本文案 |
| 辅助说明 | 12-13px | 400 | metadata、来源、状态说明 |
| 标签/胶囊 | 10-12px | 500 | 状态、关键词、模型名 |
| 数字金额 | 14-32px | 500-700 | 成本、预算、统计数字 |

## 5. 核心组件视觉规范

### 5.1 组件规范表

| 组件 | 用途 | 视觉结构 | 关键状态 | Tailwind 实现建议 | MVP 必须 |
|---|---|---|---|---|---|
| AppSidebar | 全局主导航和品牌识别 | 240px 固定侧栏，顶部 Logo，中部路由，底部用户；背景有低透明水墨脸谱 | active、hover、collapsed 未确认 | `w-[240px] bg-[#0B0B0A] border-r border-white/10`, active 用 `before:w-1 before:bg-[--accent-cinnabar]` | 是 |
| TopStatusBar | 项目、模型、任务、预算的全局状态 | 64-72px 横栏，左项目，中状态，右操作 | 模型良好、任务运行、预算警告、通知 | `h-16 sticky top-0 border-b border-white/10 bg-[#131313]/95 backdrop-blur` | 是 |
| PageHeader | 页面标题和主操作 | 标题/说明 + 主按钮/次按钮，位于主区顶部 | 默认、筛选中、可创建、不可操作 | `flex items-center justify-between gap-4 mb-6`，标题 `text-2xl font-semibold` | 是 |
| RightInspector | 上下文检查和复盘面板 | 320-480px 右栏，分区卡片垂直堆叠，独立滚动 | 空状态、检查通过、警告、失败 | `w-[320px] border-l border-white/10 bg-[#1C1B1B] overflow-y-auto p-5` | 是 |
| ProjectCard | 项目入口和生产状态 | 上方封面图，中部角色/阶段，底部进度、成本、失败数 | 进行中、审核中、完成、失败、归档 | `rounded-lg bg-[#20201F] border border-white/10 overflow-hidden hover:border-[#E9C349]/50` | 是 |
| StatCard | 首页统计 | 小型数据卡，label、数字、趋势、图标 | 上升、下降、空数据 | `rounded-lg border border-white/10 bg-[#20201F] p-4`，数字金色等宽 | 是 |
| CharacterCard | 角色库卡片 | 角色图/水墨底图 + 姓名、绰号、排名、主色、标签、Excel 行号 | 选中、字段缺失、字段完整、可加入项目 | `aspect-[4/5] rounded-lg overflow-hidden border`, overlay 用 `bg-gradient-to-t from-black/80` | 是 |
| CharacterBibleTabs | 五层角色圣经切换 | 顶部 Tabs：身份层、内核层、文化视觉层、叙事素材层、商业文化层 | active、字段缺失、未确认 | 基于 shadcn `Tabs`，active 用朱砂背景和金色细边 | 是 |
| VisualProfilePanel | 角色视觉一致性档案 | 主色块、脸谱纹样、服饰纹样、武器、材质关键词 | 通过、缺字段、未确认、错误示例 | `grid grid-cols-2 gap-3` + 色块 `rounded-md shadow-inner` | 是 |
| ProductionStepRail | 生产流程步骤 | 纵向步骤：选角色、生成剧本、拆分镜、确认镜头、进入 Prompt | 当前、完成、待处理、失败 | `w-48 border-r p-4`, step circle 用 `border accent-gold/cinnabar` | 是 |
| ScriptEditor | 脚本文案编辑 | 顶部参数栏 + 分行脚本文本 + 时间段 + 分析卡 | 草稿、生成中、已保存、长度异常 | `rounded-lg bg-[#131313] border border-white/10`, 行高 1.7 | 是 |
| ShotCard | 单分镜最小生产单元 | 缩略图、编号、时长、标题、画面/动作/情绪、素材状态 | 未生成、Prompt ready、图片 ready、视频 ready、TTS ready、已采纳 | `rounded-md border bg-[#20201F]`, active 用朱砂边框，缩略图固定比例 | 是 |
| PromptEditor | 图片/视频/负向 Prompt 编辑 | 三段 textarea + 来源字段 + 正/负向 keyword chips + 质量检查 | 未生成、生成中、已编辑、警告、失败 | shadcn `Textarea` + `ScrollArea`，`font-mono text-xs leading-6` | 是 |
| ImageGenerationPanel | 生图一级模块 | 模型选择、参考图、参数、生成按钮、候选图、成本 | 缺 Prompt、排队、生成中、候选待审核、已采纳、失败 | `Card` 内部 `grid grid-cols-[1fr_220px]`，按钮朱砂，候选网格 3 列 | 是 |
| VideoGenerationPanel | 生视频一级主模块 | Seedance 2.0、模式、关键帧、视频 Prompt、参数、候选视频播放器、采纳/拒绝 | 缺关键帧、待提交、生成中、候选、检查警告、已采纳、失败 | 必须大面板：`min-h-[360px] border-[#B22222]/40`，播放器 `aspect-video` | 是 |
| TTSGenerationPanel | TTS 一级模块 | 旁白文本、音色选择、TTS 模型、语速音量、音频预览、字幕 | 未生成、试听中、生成中、已绑定、失败 | `Card` + shadcn `Select`、`Slider`、音频波形 mock | 是 |
| GenerationTaskStatus | 任务状态展示 | 小状态点/进度条/任务文案/错误原因 | draft、queued、processing、completed、failed、canceled | `Badge` + `Progress`，processing 用 bluegray，warning 用 gold | 是 |
| CandidateAssetCard | 候选素材卡 | 缩略图/播放器、模型、成本、状态、采纳/拒绝 | candidate、accepted、rejected、archived、预览失败 | `group relative rounded-md border`, accepted 绿勾，rejected 红叉 | 是 |
| VideoCandidatePlayer | 视频候选播放器 | 大预览、播放控制、时长、分辨率、模型、Prompt 版本 | 加载、可播放、播放失败、已采纳 | `aspect-video bg-black rounded-md`, 控制条用低对比深色 | 是 |
| AssetReviewGrid | 素材审核网格 | 按分镜/类型分组，图片、视频、音频、字幕卡片混排 | 空、候选、已采纳、已拒绝、筛选中 | `grid gap-3`, 分组 header sticky 可选 | 是 |
| ReflectionInspector | 失败复盘面板 | 拒绝原因统计、模型失败模式、优化建议、负向词建议 | 暂无失败、待总结、已总结、已应用、总结失败 | `space-y-4`, 失败原因数字用 error，建议用 gold bullet | 是 |
| CostBadge | 成本展示 | 小金额 badge，可显示预估/实际 | 未记录、预估、已记录、超预算、失败成本 | `font-mono text-[#E9C349] bg-[#AF8D11]/10 border-[#AF8D11]/30` | 是 |
| ExportButton | 导出制作方案 | 主按钮，通常在 Asset Review 顶部或右侧底部 | 不可导出、可导出、导出中、已导出、失败 | shadcn `Button` cinnabar variant，带 `FileOutput` 图标 | 是 |

### 5.2 VideoGenerationPanel 的强制规则

`VideoGenerationPanel` 必须作为 Prompt & Generation Workspace 的一级主模块。它不能退化为 ShotCard 上的“生成视频”按钮，也不能藏在弹窗或二级 Tab。首屏应直接看到：

- `Seedance 2.0` 模型名称。
- 生成模式：图生视频、首帧生视频、首尾帧生视频。
- 当前分镜关键帧与可选尾帧。
- 视频 Prompt 编辑区。
- 时长、比例、运动强度、清晰度等参数。
- 候选视频预览。
- 采纳、拒绝、重试、失败原因、成本。
- 角色一致性、场景一致性、英歌动作检查结果。

## 6. 页面级视觉要求

### 6.1 Dashboard / Project List

- 页面目标：快速进入项目、查看当前生产进度、任务状态和预算消耗。
- 页面布局：240px AppSidebar + TopStatusBar + 主区域统计卡/项目卡网格 + 320px 右侧任务/成本 Inspector。
- 主视觉重点：项目卡封面、当前阶段、分镜进度、成功/失败任务、成本。
- 核心组件：AppSidebar、TopStatusBar、PageHeader、ProjectCard、StatCard、GenerationTaskStatus、CostBadge。
- 前端实现难点：项目卡信息密度高，需保证封面图、状态、进度、成本不互相挤压；右侧成本概览要清晰但不做复杂 BI。
- MVP 静态原型范围：展示项目统计、6-8 个项目卡、近期任务、成本概览、预算提醒；按钮无真实行为。

### 6.2 Yingge Character Library

- 页面目标：浏览和筛选英歌水浒角色圣经，把角色作为项目创建入口。
- 页面布局：AppSidebar + TopStatusBar + 256px 筛选栏 + 角色卡网格 + 360-380px 角色详情 Inspector。
- 主视觉重点：角色脸谱/主色、绰号、梁山排名、英歌职能、字段完整度、Excel 来源行号。
- 核心组件：CharacterCard、PromptKeywordChips、FieldSourceBadge、RightInspector、CostBadge。
- 前端实现难点：不能做成游戏角色商城；卡片要同时承载文化视觉、结构化字段和生产入口。
- MVP 静态原型范围：展示 8-12 个 mock 角色、筛选面板、搜索框、导入 Excel 按钮、右侧详情；筛选可只做静态状态。

### 6.3 Character Detail / Character Bible

- 页面目标：展示单个角色的五层圣经，作为角色一致性和 Prompt 的依据。
- 页面布局：AppSidebar + 顶部来源/操作栏 + 左侧角色视觉概览 + 中间 CharacterBibleTabs + 右侧一致性 Inspector。
- 主视觉重点：文化视觉层、脸谱主色、脸谱纹样、服饰纹样、武器、正向/负向 Prompt 关键词。
- 核心组件：CharacterBibleTabs、VisualProfilePanel、PromptKeywordChips、FieldSourceBadge、RightInspector。
- 前端实现难点：要体现“英歌水浒角色圣经”，不要只是一张大头像；字段明确记录、推导、未确认应有视觉区分。
- MVP 静态原型范围：先展示一个角色完整详情，Tabs 可轻量切换或静态 active；显示来源 Excel、字段完整度、一致性检查清单。

### 6.4 Script & Storyboard Generator

- 页面目标：从角色生成 30-60 秒人物介绍文案，并拆分为 5-8 个分镜。
- 页面布局：AppSidebar + TopStatusBar + 192px ProductionStepRail + 中央 ScriptEditor / StoryboardTimeline + 右侧角色与 Agent Inspector。
- 主视觉重点：角色 -> 剧本 -> 分镜 -> Prompt 工作台的流程推进；脚本和分镜必须同屏。
- 核心组件：ProductionStepRail、ScriptEditor、ShotCard、StoryboardTimeline、RightInspector。
- 前端实现难点：不要变成通用在线文档或完整剪辑器；ShotCard 要固定尺寸，承载时长、画面、动作、情绪和一致性状态。
- MVP 静态原型范围：展示 45-60 秒脚本文案、6 个分镜卡、ScriptAgent/StoryboardAgent/CriticAgent 建议；不做真实生成和保存。

### 6.5 Prompt & Generation Workspace

- 页面目标：围绕分镜完成图片 Prompt、视频 Prompt、生图、生视频、TTS，是 MVP 核心页面。
- 页面布局：AppSidebar + TopStatusBar + 280px ShotList + 中央四个一级生产模块 + 320px 一致性/复盘 Inspector。
- 主视觉重点：PromptEditor、ImageGenerationPanel、VideoGenerationPanel、TTSGenerationPanel 四块生产区。`VideoGenerationPanel` 必须作为一级主模块，不是按钮。
- 核心组件：ShotCard、PromptEditor、ImageGenerationPanel、VideoGenerationPanel、TTSGenerationPanel、GenerationTaskStatus、CandidateAssetCard、VideoCandidatePlayer、CostBadge、ReflectionInspector。
- 前端实现难点：页面信息量最大，要用分栏、卡片标题、状态条和 ScrollArea 控制复杂度；视频生成面板要展示 Seedance 2.0、关键帧、参数、候选视频、采纳/拒绝、失败原因和成本。
- MVP 静态原型范围：只模拟状态，不接 API；必须展示 gpt-image-2 / nano banana 生图、Seedance 2.0 生视频、MiniMax TTS、任务进度、候选素材、采纳/拒绝、成本和检查结果。

### 6.6 Asset Review / Final Video Library

- 页面目标：集中审核候选素材和已采纳素材，记录失败原因，导出视频制作方案。
- 页面布局：AppSidebar + TopStatusBar + 256px 筛选栏 + 中央素材分组/视频预览 + 420-480px Reflection/成本/导出 Inspector + 底部分镜条。
- 主视觉重点：素材审核闭环：候选、采纳、拒绝、失败原因、复盘建议、成本、导出。
- 核心组件：AssetReviewGrid、CandidateAssetCard、VideoCandidatePlayer、ReflectionInspector、GenerationTaskStatus、CostBadge、ExportButton。
- 前端实现难点：不要做成普通网盘或图片瀑布流；必须按分镜和素材类型展示生产上下文。
- MVP 静态原型范围：展示素材筛选、按镜头分组、视频预览、Prompt 信息、失败原因统计、成本风险、导出按钮；不做真实下载和导出。

## 7. 与 shadcn/ui 的映射

| shadcn/ui 组件 | 可改造用途 | 定制建议 |
|---|---|---|
| `Button` | 主操作、次操作、图标按钮、导出按钮 | 增加 cinnabar、gold-outline、ghost-dark variants；圆角 4px |
| `Card` | ProjectCard、StatCard、生成面板、Inspector 分区 | 默认深色背景、1px 暗边框、8px 圆角；不要卡片套卡片 |
| `Badge` | 状态、模型、关键词、成本 | 增加 success、warning、error、processing、cost variants |
| `Tabs` | CharacterBibleTabs、素材信息/Prompt/任务日志切换 | active 使用朱砂背景或金色下划线 |
| `Dialog` | 失败原因填写、导出预览、候选素材大图预览 | 暗色遮罩 + 10px blur，内容不要过宽 |
| `DropdownMenu` | 项目菜单、排序、更多操作 | 背景 `surface-raised`，hover 使用 `surface-hover` |
| `ScrollArea` | Prompt 编辑区、右侧 Inspector、ShotList、素材列表 | 细滚动条、低对比，hover 增强 |
| `Progress` | 预算、字段完整度、任务进度、成片进度 | 金色用于预算/生成中，绿色用于完成度 |
| `Separator` | 顶部栏分隔、Inspector 分区 | 使用 `border-subtle` 低透明度 |
| `Input` | 搜索、成本范围、项目名 | 深色背景，focus border gold |
| `Textarea` | ScriptEditor、PromptEditor、拒绝备注 | Prompt 版本使用等宽字体，小字号高行高 |
| `Select` | 模型、音色、比例、状态筛选 | 深色触发器，Dropdown 不要发光过度 |
| `Sheet` | 移动端或临时 Inspector | MVP 桌面优先，Sheet 可作为后续小屏 fallback |

## 8. 前端实现建议

### 8.1 frontend 目录结构

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

### 8.2 app routes

| Route | 页面 |
|---|---|
| `/dashboard` | Dashboard / Project List |
| `/characters` | Yingge Character Library |
| `/characters/[id]` | Character Detail / Character Bible |
| `/script-studio` | Script & Storyboard Generator |
| `/generation-workspace` | Prompt & Generation Workspace |
| `/asset-review` | Asset Review / Final Video Library |

### 8.3 components 目录

- `components/layout/`：`AppShell`、`AppSidebar`、`TopStatusBar`、`RightInspector`、`PageHeader`。
- `components/dashboard/`：`ProjectCard`、`StatCard`、`RecentTaskPanel`、`CostSummaryPanel`。
- `components/characters/`：`CharacterCard`、`CharacterBibleTabs`、`VisualProfilePanel`、`PromptKeywordChips`、`FieldSourceBadge`。
- `components/script/`：`ProductionStepRail`、`ScriptEditor`、`StoryboardTimeline`、`ShotCard`。
- `components/generation/`：`PromptEditor`、`ImageGenerationPanel`、`VideoGenerationPanel`、`TTSGenerationPanel`、`GenerationTaskStatus`、`VideoCandidatePlayer`。
- `components/assets/`：`AssetReviewGrid`、`CandidateAssetCard`、`ReflectionInspector`、`FailureReasonChips`、`ExportProductionPlanButton`。
- `components/common/`：`CostBadge`、`StatusBadge`、`SectionPanel`、`EmptyState`、`LoadingSkeleton`。

### 8.4 mock data 目录

- `data/mock/projects.ts`
- `data/mock/characters.ts`
- `data/mock/shots.ts`
- `data/mock/prompts.ts`
- `data/mock/tasks.ts`
- `data/mock/assets.ts`
- `data/mock/costs.ts`
- `data/mock/reflections.ts`

### 8.5 styles / token 文件

建议建立：

- `styles/tokens.css`：CSS variables，如 `--background-primary`、`--accent-cinnabar`。
- `styles/ink-texture.css`：低透明水墨纹理，不与组件 token 混在一起。
- `tailwind.config.ts`：把本规范第 3 章 token 映射到 Tailwind theme。

### 8.6 第一阶段静态页面优先级

第一阶段建议先实现：

1. `AppShell`、`AppSidebar`、`TopStatusBar`、`RightInspector`、视觉 token。
2. `/dashboard`，确认整体工作台气质。
3. `/characters` 和 `/characters/[id]`，确认英歌水浒角色圣经气质。
4. `/script-studio`，确认角色到脚本分镜的生产链路。
5. `/generation-workspace`，重点实现四个一级模块，尤其 `VideoGenerationPanel`。
6. `/asset-review`，补齐采纳/拒绝/复盘/导出闭环。

## 9. 不要做什么

- 不要照抄图片里的错别字。
- 不要直接复制 Stitch `code.html`。
- 不要直接复制 `/Users/huabi/code/AI-video-studio/references/` 中的大段代码。
- 不要做成纯暗黑游戏 UI。
- 不要做成普通 SaaS。
- 不要做成古风网页游戏。
- 不要做成赛博朋克。
- 不要过度装饰。
- 不要在主工作区铺满复杂水墨纹理。
- 不要先接真实 API。
- 不要先接后端、数据库、任务队列或真实模型。
- 不要先做复杂交互。
- 不要做完整视频剪辑器。
- 不要做 API Key 管理页面。
- 不要读取或展示任何 `.env`、key、token、证书内容。
- 不要移动端优先。
- 不要把 `VideoGenerationPanel` 做成一个小按钮、弹窗或隐藏二级功能。

## 10. 关键结论

- 本产品视觉方向应是“国风水墨 + 朱砂鎏金 + 专业 AI 视频生产工作台”，服务英歌非遗 IP、英歌水浒角色圣经和 AI 漫剧生产闭环。
- gpt-image-2 基准图与 Stitch 模板的整体方向可用，但文案、字段、角色数据和模型数据必须按 PRD 与 mock 数据重写。
- 全局布局应桌面优先，保留 240px 左侧导航、顶部状态栏、主工作区和右侧 Inspector。
- 颜色系统以深墨黑为底，朱砂用于主操作和风险，鎏金用于成本和重点数据，暗玉绿用于采纳和通过。
- Prompt & Generation Workspace 是核心页面，`VideoGenerationPanel` 必须是一级主模块，且必须展示 Seedance 2.0、关键帧、视频 Prompt、候选视频、采纳/拒绝、失败原因和成本。
- MVP 静态原型应先验证信息架构和视觉气质，不接真实 API，不做复杂交互。

