# Google Stitch UI Prompt v1

本文用于生成“AI 英歌漫剧内容生产工作台”的 Google Stitch UI 参考稿。参考项目仅用于提炼信息架构、页面组织方式、交互流程和设计模式，不复制 UI 文案、代码或视觉样式。

## 1. Reference UI Findings

### Toonflow-app

**可借鉴的信息架构**

- 项目列表以卡片组织，每个项目展示标题、类型标签、内容摘要、时间和编辑/删除操作，适合我们的 Dashboard / Project List 页面借鉴“项目即内容生产容器”的入口模式。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/1.png`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md`
- 左侧竖向图标导航 + 大面积主工作区的结构清晰，适合我们的 6 个核心页面形成稳定导航框架。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/1.png`
- README 描述其围绕“策划、编剧、分镜、出片”的闭环组织功能，这可借鉴为我们的“角色、文案、分镜、Prompt、生成、素材复盘”生产链路。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md`

**可借鉴的工作台布局**

- 无限画布式生产工作区将角色/场景/分镜素材以节点或卡片排列，适合借鉴为 Prompt & Generation Workspace 的“分镜网格 + 右侧 Inspector”布局，但不需要完整无限画布。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/5.png`
- 单个生成节点包含参考图、结果图、Prompt 编辑区、模型选择、比例/清晰度参数和提交按钮，适合借鉴为单镜头生成卡片。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/6.png`
- 右侧上下文面板展示 Agent 阶段结果、校验项和下一步建议，适合我们的 CriticAgent/ReflectionAgent Inspector。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/5.png`

**可借鉴的 Agent / Skill / Production 交互**

- README 中强调三层 Agent 协作和 Skill 文件化配置，适合我们在 UI 中显示 Agent 状态、当前输入来源、产物版本和检查结果。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md`
- Production 工作台中“节点生成、节点回流、右侧 Agent 消息”的模式适合 Prompt 工作台，但我们的版本应更线性、更易懂，围绕单条 30-60 秒人物介绍视频。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/5.png`
- 图像生成节点中把 Prompt、模型、比例、输出图放在一个闭环卡片内，适合我们的生图/生视频任务卡片。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/6.png`

**不建议借鉴的地方**

- 不建议复刻无限画布的复杂度。我们的 MVP 只需要 5-8 个分镜，不需要大型自由编排画布。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/docs/screenshot/5.png`
- 不建议复刻通用短剧平台表达。我们的产品必须围绕英歌非遗、水浒人物和文创引流。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md`
- 不建议借鉴其可编程供应商 UI 的复杂配置入口，MVP 只需要明确的模型选择与任务记录。参考：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md`

### Huobao Drama

**可借鉴的短剧生产流程页面**

- 项目首页使用项目卡片、项目风格、角色/场景数量、进度条、新建弹窗和空状态，适合我们的 Dashboard 借鉴。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/index.vue`
- 单集页面采用顶部项目栏、左侧制作流程 Sidebar、中间主内容区的生产工作台布局，适合我们的 Script & Storyboard Generator。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue`
- 制作流程拆成原始内容、AI 改写、角色/场景提取、音色分配、分镜、生成等步骤，适合我们改造为“选择角色、文案、分镜、Prompt、生成、复盘”。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue`

**可借鉴的角色/场景/分镜/素材组织方式**

- 角色和场景提取结果用 summary panel + list cards 展示，适合我们的角色一致性设定和场景一致性设定区。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue`
- 项目详情页以剧集列表卡片展示每集状态、角色数量、场景数量和进度，适合我们的项目内视频方案列表。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/index.vue`
- 设置页把 AI 服务配置、Agent 配置、Skills 管理分区，适合我们后续设置页参考，但 Stitch v1 不必生成设置页。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/settings.vue`

**可借鉴的生成任务交互**

- 每个步骤都有明确空状态、加载状态、重新生成按钮和进度提示，适合我们的 Script、Storyboard、Prompt、TTS 和生成任务交互。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue`
- 顶部栏展示当前阶段、进度数值、角色数量、镜头数量，适合我们的项目顶部状态栏。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue`
- `studio.css` 中的卡片、标签、按钮、输入区、空状态、加载动画形成了完整工作台组件系统，可借鉴“密度适中、状态明确”的模式。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/assets/studio.css`

**不建议借鉴的地方**

- 不建议复刻冷蓝 SaaS 视觉调性。我们的产品需要深墨黑、宣纸白、朱砂红、鎏金、青灰、暗玉绿的东方非遗气质。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/assets/studio.css`
- 不建议保留“短剧项目/剧集”作为主表达。我们的第一版是英歌水浒人物介绍短视频，不是泛短剧剧集系统。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/index.vue`
- 不建议让流程过长。Huobao 的单集生产流程较完整，我们的 MVP 应压缩为 6 个页面和 5-8 个分镜。参考：`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/app/pages/drama/[id]/episode/[episodeNumber].vue`

### waoowaoo

**可借鉴的 Studio 布局**

- Workspace 项目列表支持搜索、分页、项目成本、项目统计、模型配置提醒，适合我们的 Dashboard 展示成本和生产状态。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/page.tsx`
- 项目详情页用 URL stage 管理阶段：config、script、assets、storyboard、videos、voice，适合我们的页面间阶段导航和当前项目顶部栏。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/page.tsx`
- `NovelPromotionWorkspace` 将顶部动作、阶段导航和 StageContent 分离，适合我们的“顶部项目栏 + 主工作区 + Inspector”组合。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/NovelPromotionWorkspace.tsx`

**可借鉴的项目/剧集/分镜/面板管理**

- 阶段导航将当前阶段、已完成阶段、空阶段和禁用阶段用状态区分，适合我们的生产流导航。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/modes/novel-promotion/hooks/useWorkspaceStageNavigation.ts`
- 分镜面板卡片包含竖版画幅、镜头编号、镜头类型、生成/重生/编辑/AI 数据入口、候选图选择与确认，适合我们的 Prompt & Generation Workspace。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/ui/patterns/PanelCardV2.tsx`
- Storyboard Header 展示镜头总数、运行任务数、待生成数、批量生成和下载操作，适合我们的分镜工作台顶部工具条。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/ui/patterns/StoryboardHeaderV2.tsx`

**可借鉴的模型配置、任务队列、素材管理、成本统计展示**

- `TaskStatusInline` 用紧凑状态组件展示运行中和错误状态，适合我们的任务进度条、素材卡片和顶部状态栏。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/task/TaskStatusInline.tsx`
- Asset Hub 使用左侧文件夹、资产网格、创建/编辑弹窗、图片预览、声音设计、批量下载，适合我们的 Asset Review / Final Video Library。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/asset-hub/page.tsx`
- 项目列表和 API 有成本展示入口，适合我们的项目卡片与顶部预算标签。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/page.tsx`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/api/projects/[projectId]/costs/route.ts`

**不建议借鉴的地方**

- 不建议复刻完整小说工作流、剧集分集和复杂资产中心。我们的 MVP 要聚焦一个角色、一条 30-60 秒人物介绍视频。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/[locale]/workspace/[projectId]/page.tsx`
- 不建议复刻过多模型/能力配置页面。Stitch v1 只需表现模型选择、任务状态和成本标签。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/components/ui/config-modals/ModelCapabilityDropdown.tsx`
- 不建议采用过强的通用 AI Studio 品牌感。我们的设计必须第一眼体现英歌、水浒、非遗、角色 IP 圣经。参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/README.md`

## 2. Our Product UI Direction

产品名称：AI 英歌漫剧内容生产工作台。

核心定位：服务于英歌非遗 IP 内容生产、英歌水浒人物短视频、文创引流和素材沉淀。它不是通用短剧平台，而是内部团队用来沉淀英歌水浒角色、生成 30-60 秒人物介绍短视频、管理 Prompt 和素材抽卡结果的生产中枢。

第一版主流程：

选择英歌水浒人物 / 输入剧本  
→ 生成 30-60 秒人物介绍文案  
→ 拆成 5-8 个分镜  
→ 生成角色一致性设定  
→ 生成场景一致性设定  
→ 生成图片 Prompt  
→ 调用 gpt-image-2 / nano banana 生图  
→ 调用 Seedance 2.0 生视频  
→ 调用 MiniMax TTS  
→ 管理素材、采纳/拒绝、记录失败原因。

视觉方向：国风水墨 + 游戏 CG + 黑神话悟空质感 + 剑来漫剧氛围。整体不要做成普通 SaaS，也不要做成古风网页游戏。界面应像一个现代、专业、安静但有东方文化气质的内容生产工作台：深墨黑、宣纸白、朱砂红、鎏金、青灰、暗玉绿；轻量水墨纹理；竖版视频生产感；角色脸谱、纹样、星位、武器和文化寓意应成为信息层级的一部分。

设计关键词：

- 专业内容生产工具
- 英歌非遗 IP 资产沉淀
- 角色圣经与 Prompt 工程
- 分镜、任务、素材、成本一体化
- 东方水墨气质，但交互现代清晰

## 3. Page List for Stitch

### 1. Dashboard / Project List

| 项目 | 内容 |
|---|---|
| 页面目标 | 管理所有英歌人物短视频项目，快速查看生产阶段、成本和素材状态 |
| 主要区域 | 左侧导航、顶部项目栏、项目统计卡、项目卡片网格、最近任务列表 |
| 关键组件 | 项目卡片、阶段进度条、成本标签、角色头像/脸谱色块、任务状态小组件、搜索和筛选 |
| 关键按钮 | New Yingge Video Project、Import Character Bible、Open Project、Export Plan |
| 数据展示内容 | 项目名称、关联角色、目标平台、当前阶段、分镜数量、素材数量、成本、更新时间 |
| 空状态 | 宣纸背景上的空项目提示，主按钮引导导入 Excel 或创建第一个人物视频 |
| loading 状态 | 项目卡片 skeleton、顶部统计 skeleton、任务列表 shimmer |
| 错误状态 | 顶部错误横幅 + 重试按钮，提示项目数据或成本数据加载失败 |

### 2. Yingge Character Library

| 项目 | 内容 |
|---|---|
| 页面目标 | 浏览从 Excel 导入的 45 个英歌水浒角色，作为内容生产入口 |
| 主要区域 | 筛选栏、角色卡片/表格切换、五层字段概览、右侧快速预览 Inspector |
| 关键组件 | 搜索框、排名筛选、星位筛选、主色系 swatch、脸谱纹样标签、可信度标签、导入状态 |
| 关键按钮 | Import Excel、Preview Mapping、Create Video from Character、Open Character Bible |
| 数据展示内容 | 姓名、绰号、排名、星位、梁山职务、英歌角色定位、主色、正向词/禁止词摘要 |
| 空状态 | 角色库为空时引导导入 `英歌水浒角色基础信息.xlsx` |
| loading 状态 | 角色卡片 skeleton、表头固定、右侧预览加载中 |
| 错误状态 | Excel 导入解析失败卡片，展示失败行数和查看导入报告入口 |

### 3. Character Detail / Character Bible

| 项目 | 内容 |
|---|---|
| 页面目标 | 展示单个角色的身份层、内核层、文化视觉层、叙事素材层、商业文化层 |
| 主要区域 | 角色 Hero 区、五层信息 Tabs、角色一致性摘要、Prompt 关键词、文创转化面板 |
| 关键组件 | 角色身份卡、脸谱主色 swatch、纹样标签、武器卡、人格标签、叙事时间线、关系图谱、正向词/禁止词 chips、证据类型 badge |
| 关键按钮 | Generate Character Summary、Use in Project、Copy Prompt Keywords、Edit Snapshot |
| 数据展示内容 | 姓名、绰号、星位、出身、梁山职务、惯用武器、英歌定位、主色、纹样、核心叙事原点、商业定位 |
| 空状态 | 某一层字段为空时显示“等待补充”，不编造文化设定 |
| loading 状态 | Hero skeleton、Tabs 内容 skeleton、关键词 chips shimmer |
| 错误状态 | 来源 Excel 行解析异常提示，保留查看 raw field 的入口 |

### 4. Script & Storyboard Generator

| 项目 | 内容 |
|---|---|
| 页面目标 | 基于角色生成 30-60 秒人物介绍文案，并拆成 5-8 个分镜 |
| 主要区域 | 左侧生产步骤导航、中间文案编辑器与分镜表、右侧 Agent Inspector |
| 关键组件 | 角色上下文卡、文案编辑器、分镜时间线、镜头卡、旁白字段、时长字段、Agent 输出卡、Critic 检查卡 |
| 关键按钮 | Generate Script、Rewrite Script、Split into Storyboard、Run Critic、Save Version |
| 数据展示内容 | 当前角色、脚本版本、镜头编号、镜头画面、动作、旁白、情绪、时长、角色/场景绑定 |
| 空状态 | 尚未生成文案时，显示角色叙事原点摘要和生成入口 |
| loading 状态 | Agent thinking panel、文案生成进度、分镜拆解进度 |
| 错误状态 | Agent 输出失败提示，允许重试或手动粘贴文案继续 |

### 5. Prompt & Generation Workspace

| 项目 | 内容 |
|---|---|
| 页面目标 | 为每个分镜生成图片 Prompt、视频 Prompt，并提交生图、生视频、TTS 任务 |
| 主要区域 | 分镜网格、Prompt 编辑器、模型选择条、生成结果候选区、右侧角色/场景一致性 Inspector |
| 关键组件 | 竖版 9:16 分镜卡、Prompt editor、negative prompt chips、模型 dropdown、任务进度条、候选图轮播、视频片段预览、成本标签 |
| 关键按钮 | Generate Image Prompt、Generate Video Prompt、Submit Image Task、Submit Video Task、Generate TTS、Accept、Reject |
| 数据展示内容 | 分镜画面、角色主色/脸谱/纹样、场景摘要、正向词、禁止词、模型、任务状态、预估成本、候选素材 |
| 空状态 | 尚无 Prompt 时显示“从角色视觉档案生成 Prompt”的入口 |
| loading 状态 | 每张分镜卡内部显示任务进度、模型状态和预计等待 |
| 错误状态 | 单任务错误卡，展示失败原因、重试、编辑 Prompt、记录拒绝原因 |

### 6. Asset Review / Final Video Library

| 项目 | 内容 |
|---|---|
| 页面目标 | 管理所有图片、视频、音频素材，完成采纳/拒绝/复盘并导出制作方案 |
| 主要区域 | 左侧分镜筛选、素材瀑布/网格、中间预览区、右侧复盘 Inspector、底部成片方案条 |
| 关键组件 | 素材卡片、采纳状态 badge、失败原因 chips、任务来源、Prompt 版本、成本记录、视频方案 timeline、导出摘要 |
| 关键按钮 | Accept Asset、Reject with Reason、Compare Versions、Write Reflection、Export Production Plan |
| 数据展示内容 | 素材缩略图、类型、关联分镜、模型、Prompt 版本、采纳状态、失败原因、成本、生成时间 |
| 空状态 | 尚无素材时显示从 Prompt 工作台开始生成的引导 |
| loading 状态 | 素材卡片 skeleton、视频预览 loading、成本汇总 loading |
| 错误状态 | 素材加载失败、COS 链接失效、任务结果缺失等状态，保留手动上传入口 |

## 4. Design System Requirements

**色彩**

- 深墨黑：用于侧边导航、主标题、关键文字和深色工作台底部。
- 宣纸白：用于主内容背景和卡片底色。
- 朱砂红：用于主行动按钮、角色警示、重点状态和英歌能量感。
- 鎏金：用于星位、文化证据、商业文化定位和高价值标签。
- 青灰：用于分隔、次级背景、表格行、空状态。
- 暗玉绿：用于成功、采纳、文化可信度、已完成阶段。

**字体气质**

- 现代中文内容工具气质，清晰、克制、专业。
- 标题可略带书卷感，但不要变成古风网页游戏。
- 英文/数字/模型名使用紧凑的 mono 或技术感字体，适合 Prompt 与任务数据。

**卡片风格**

- 卡片圆角克制，建议 8px 左右。
- 柔和阴影、细边框、轻微毛玻璃。
- 可轻量使用水墨纹理背景，但不要影响阅读。
- 不要大面积装饰性渐变，不要赛博朋克霓虹。

**图标风格**

- 线性图标为主。
- 少量东方符号用于品牌和状态，如鼓点、英歌槌、脸谱、星位、云纹，但不要过度装饰。
- 工具按钮使用明确图标：生成、重试、采纳、拒绝、复制、导出、上传、播放、暂停。

**布局**

- 左侧导航 + 顶部项目栏 + 主工作区 + 右侧上下文 Inspector。
- 主工作区优先桌面 1440px 宽屏。
- Prompt 工作台和素材审核页允许密度更高，但必须可扫描。
- 角色详情页可更具“角色圣经”信息层次，但仍保持工具属性。

**响应式**

- 优先桌面 Web，不要 mobile-first。
- 1440px 设计为主要画布。
- 低于 1024px 时可折叠右侧 Inspector 和左侧导航。

**组件**

- 表格
- 卡片
- 时间线
- 分镜网格
- 任务进度条
- Prompt 编辑器
- 素材卡片
- 成本标签
- 状态 Badge
- Tabs
- Segmented control
- Inspector panel
- Empty / loading / error states

## 5. Final English Prompt for Google Stitch

```text
Design high-fidelity desktop web app UI mockups for a product named “AI Yingge Animated Drama Production Workbench”.

Product context:
This is not a generic AI short drama SaaS. It is an internal production workbench for creating Yingge intangible cultural heritage IP content, focused on Shuihu / Water Margin character introduction videos. The team uses it to import a Yingge character bible from Excel, select one character, generate a 30-60 second character story script, split it into 5-8 storyboard shots, generate character consistency and scene consistency settings, create image prompts and video prompts, submit image generation tasks using gpt-image-2 / nano banana, submit video generation tasks using Seedance 2.0, generate MiniMax TTS, then review generated assets, accept or reject them, record failure reasons, track costs, and export a production plan.

Create a desktop-first web app UI, optimized for a 1440px wide screen. Do not design mobile-first. The UI should be suitable for later implementation with Next.js, shadcn/ui, Tailwind CSS, and a FastAPI backend.

Visual direction:
Make it feel like a modern professional content production tool with an Eastern intangible heritage identity. Blend Chinese ink painting atmosphere, game CG quality, Black Myth Wukong-like premium texture, and a quiet animated drama production studio feeling. Use a restrained palette: ink black, rice paper white, cinnabar red, muted gold, blue-gray, and dark jade green. Use subtle ink texture and very light glassmorphism, but keep the interface readable and efficient.

Avoid:
- Do not make it look like a generic SaaS dashboard.
- Do not make it cyberpunk.
- Do not make it a traditional ancient palace style UI.
- Do not copy any existing app UI.
- Do not design a marketing landing page.
- Do not overuse decorative dragons, temples, lanterns, or fantasy ornaments.

Global layout:
Use a stable production workspace layout:
- Left sidebar navigation with compact line icons and a subtle Yingge identity mark.
- Top project bar showing current project, selected character, production stage, total cost, and task status.
- Main workspace area for the active page.
- Right context Inspector for character bible fields, scene consistency, Agent notes, prompt source fields, task details, and reflection notes.

Generate 6 high-fidelity pages:

1. Dashboard / Project List
Goal: manage Yingge character video projects.
Core UI: project statistic cards, project card grid, recent generation tasks, search and filters, cost summary, status progress bars.
Each project card should show project title, selected Water Margin character, target platform, current stage, shot count, asset count, cost, and updated time.
Include empty, loading, and error states.
Primary actions: New Yingge Video Project, Import Character Bible, Open Project, Export Plan.

2. Yingge Character Library
Goal: browse the imported Yingge Shuihu character bible.
Core UI: searchable character grid/table, ranking filter, star position filter, color swatches, face pattern tags, Yingge role position tags, positive/negative prompt keyword preview.
Show that there are 45 imported characters from an Excel character bible.
Right Inspector should preview selected character: identity layer, core personality, cultural visual layer, narrative origin, commercial cultural positioning.
Primary actions: Import Excel, Preview Mapping, Create Video from Character, Open Character Bible.
Include empty, loading, and Excel import error states.

3. Character Detail / Character Bible
Goal: present a single character as an IP bible.
Core UI: hero panel with name, nickname, ranking, star position, Liangshan role, weapon, main face color, and evidence badge.
Use five tabs or stacked sections: Identity Layer, Core Layer, Cultural Visual Layer, Narrative Material Layer, Commercial Cultural Layer.
Include visual profile cards: face primary color, symbolic meaning, face patterns, weapon note, Yingge role position, positive prompt keywords, forbidden prompt keywords.
Include narrative timeline, relationship graph preview, and merchandising notes.
Primary actions: Generate Character Summary, Use in Project, Copy Prompt Keywords, Edit Snapshot.
Include clear “unconfirmed / inferred / explicit record” badges.

4. Script & Storyboard Generator
Goal: generate a 30-60 second character introduction script and split it into 5-8 storyboard shots.
Core UI: left production step rail, center script editor, storyboard timeline/table, right Agent Inspector.
The script editor should show role context, target platform, duration, script version, and editable narration.
The storyboard area should show 5-8 shot cards with shot number, duration, visual description, action, narration, emotion, character binding, and scene binding.
Agent Inspector should show DirectorAgent, ScriptAgent, StoryboardAgent, and CriticAgent status, notes, warnings, and source fields.
Primary actions: Generate Script, Rewrite Script, Split into Storyboard, Run Critic, Save Version.
Include empty, loading, and Agent failure states.

5. Prompt & Generation Workspace
Goal: generate image/video prompts and submit generation tasks.
Core UI: storyboard shot grid with vertical 9:16 preview cards, prompt editor panel, model selector bar, generation task status, candidate image/video area, and right consistency Inspector.
Each shot card should show image prompt, negative prompt chips, video prompt, model selection, estimated cost, task progress, generated candidates, accept/reject controls.
Inspector should show character consistency: face color, patterns, weapon, Yingge role position, positive keywords, forbidden keywords; and scene consistency: location, mood, colors, forbidden elements.
Primary actions: Generate Image Prompt, Generate Video Prompt, Submit Image Task, Submit Video Task, Generate TTS, Accept, Reject.
Show providers: gpt-image-2, nano banana, Seedance 2.0, MiniMax TTS.
Include per-task loading and error states.

6. Asset Review / Final Video Library
Goal: review generated images, videos, and audio; accept/reject assets; record failure reasons; export a production plan.
Core UI: left filters by shot/model/status, central asset grid, large preview area, right Reflection Inspector, bottom final production timeline.
Asset cards should show thumbnail, asset type, linked shot number, model, prompt version, cost, generation time, status badge: candidate, accepted, rejected, archived.
Reject flow should show reason chips: character mismatch, face pattern wrong, color wrong, style drift, not Yingge action, bad motion, cultural error, too expensive.
Reflection Inspector should summarize failed generations and suggest prompt improvements.
Primary actions: Accept Asset, Reject with Reason, Compare Versions, Write Reflection, Export Production Plan.
Include empty, loading, broken asset link, and task result missing states.

Design system requirements:
- Use ink black, rice paper white, cinnabar red, muted gold, blue-gray, and dark jade green.
- Use modern Chinese content-tool typography, not fantasy game typography.
- Use soft shadows, thin borders, subtle glass surfaces, and light ink texture.
- Use line icons plus a few restrained Eastern symbols such as drum, Yingge sticks, opera face pattern, star position, cloud pattern.
- Use tables, cards, timelines, storyboard grids, task progress bars, prompt editors, asset cards, cost tags, badges, tabs, segmented controls, and inspector panels.
- Keep information dense but organized.
- Make the UI feel like a serious production workbench for cultural IP assets, not a consumer video app.

Output high-fidelity desktop UI mockups for all 6 pages.
```

## 6. Optional Follow-up Prompts

### 1. 强化东方水墨气质

```text
Refine the UI to strengthen the Eastern ink painting atmosphere while keeping it professional and readable. Add subtle rice paper texture, restrained ink wash edges, muted gold cultural badges, cinnabar red action highlights, and dark jade success states. Do not make it look like an ancient palace website or fantasy game. Keep the desktop production workbench layout and all UI controls clear.
```

### 2. 提高专业生产工作台感

```text
Make the UI feel more like a professional media production workbench. Increase information density, improve table and grid alignment, add clearer task status indicators, cost labels, version badges, shot counts, and workflow progress. Keep the Eastern Yingge cultural identity subtle and premium, but prioritize efficiency, scanning, and repeated daily use.
```

### 3. 优化 Prompt 工作台页面

```text
Focus on the Prompt & Generation Workspace page. Improve the 9:16 storyboard shot cards, prompt editor, negative keyword chips, model selector, task progress, candidate image/video comparison, accept/reject flow, and right-side character/scene consistency Inspector. Make it clear how a user moves from one shot to image prompt, video prompt, generation task, candidate asset, and final accepted asset.
```

### 4. 优化角色详情页

```text
Focus on the Character Detail / Character Bible page. Make the five-layer character bible clearer: Identity Layer, Core Layer, Cultural Visual Layer, Narrative Material Layer, Commercial Cultural Layer. Highlight face primary color, Yingge role position, weapon, face patterns, positive prompt keywords, forbidden prompt keywords, narrative origin, relationship graph, and merchandising positioning. Keep the page elegant, structured, and culturally grounded.
```

### 5. 优化素材审核页

```text
Focus on the Asset Review / Final Video Library page. Improve the asset review workflow with stronger filters, asset comparison, accepted/rejected/candidate status badges, failure reason chips, prompt version traceability, model and cost metadata, and a Reflection Inspector that summarizes why assets failed and how to improve the next prompt. Make the page feel like a serious review room for generated video assets.
```

### 6. 生成 light mode / dark mode 两套方案

```text
Create both light mode and dark mode variants for the full desktop UI. Light mode should use rice paper white, blue-gray, muted gold, cinnabar red, and ink typography. Dark mode should use deep ink black, dark jade, muted gold, low-contrast blue-gray panels, and cinnabar highlights. Both modes must remain readable, professional, and suitable for a production workbench. Do not make the dark mode cyberpunk.
```
