# Phase 4 Character Detail + Script Studio 静态页面计划

## 当前 frontend 状态检查

- 工作目录：`/Users/huabi/code/AI-video-studio/yingge-app/frontend`
- 当前项目为 Next.js App Router + TypeScript + Tailwind CSS。
- Phase 1 已完成 frontend 初始化。
- Phase 2 已完成 AppShell、左侧导航、轻量 TopStatusBar、RightInspector、多种基础组件。
- Phase 3 已完成 `/dashboard` 与 `/characters` 静态页面。
- Phase 3.5 已完成 Dashboard 与 Character Library 视觉打磨。
- Phase 3.6 已将 TopStatusBar 轻量化，任务、模型、成本信息下沉到 Dashboard / RightInspector。
- `npm run lint` 与 `npm run build` 当前已通过。
- shadcn/ui 因本机证书问题暂不处理，本阶段继续使用 Tailwind CSS + 自定义轻量组件。
- 本阶段只做静态页面和 mock 数据，不接后端、不接数据库、不接真实模型 API、不做真实 Agent。

## 将要创建/修改的文件

计划新增 mock 数据：

- `yingge-app/frontend/data/mock/characterDetail.ts`
- `yingge-app/frontend/data/mock/scripts.ts`
- `yingge-app/frontend/data/mock/shots.ts`
- `yingge-app/frontend/data/mock/panels.ts`
- `yingge-app/frontend/data/mock/skills.ts`
- `yingge-app/frontend/data/mock/reflections.ts`

计划新增 Character Detail 组件：

- `yingge-app/frontend/components/characters/CharacterHeroPanel.tsx`
- `yingge-app/frontend/components/characters/CharacterReferenceGallery.tsx`
- `yingge-app/frontend/components/characters/CharacterBibleTabs.tsx`
- `yingge-app/frontend/components/characters/VisualProfilePanel.tsx`
- `yingge-app/frontend/components/characters/ConsistencyChecklist.tsx`
- `yingge-app/frontend/components/characters/CharacterActionPanel.tsx`

计划新增 Script Studio 组件：

- `yingge-app/frontend/components/script/ProductionStepRail.tsx`
- `yingge-app/frontend/components/script/ScriptEditor.tsx`
- `yingge-app/frontend/components/script/StoryboardTimeline.tsx`
- `yingge-app/frontend/components/script/ShotCard.tsx`
- `yingge-app/frontend/components/script/PanelMiniCard.tsx`
- `yingge-app/frontend/components/script/AgentInspector.tsx`
- `yingge-app/frontend/components/script/SkillBadge.tsx`
- `yingge-app/frontend/components/script/MemoryContextPanel.tsx`
- `yingge-app/frontend/components/script/ScriptAnalysisPanel.tsx`

计划修改页面：

- `yingge-app/frontend/app/characters/[id]/page.tsx`
- `yingge-app/frontend/app/script-studio/page.tsx`

如有必要轻量复用或增强：

- `FieldSourceBadge`
- `PromptKeywordChips`
- `FieldCompletenessBadge`
- `CharacterAppearanceSummary`
- `AgentRunMini`
- `SectionCard`
- `StatusBadge`

## Character Detail 组件设计

`/characters/[id]` 使用三栏结构：

- 左侧：`CharacterHeroPanel` + `CharacterReferenceGallery` + `CharacterActionPanel`
- 中央：`CharacterBibleTabs`，默认展示“文化视觉层”，内部使用 `VisualProfilePanel`
- 右侧：`RightInspector type=consistency`，展示 `ConsistencyChecklist`、字段来源、常见错误示例和关键操作

核心表达：

- 这是“文化 IP 角色圣经系统”，不是游戏角色装备页。
- 左侧承担角色身份与视觉封面。
- 中央承担五层角色圣经字段结构。
- 右侧承担一致性、来源、错误样例和进入生产动作。
- 正向提示词使用暗玉绿 / 青灰 badge；禁止提示词使用低饱和朱砂 badge。

## Script Studio 组件设计

`/script-studio` 使用生产工作台结构：

- 左侧：`ProductionStepRail`，展示选择角色、生成剧本、拆分分镜、确认镜头、进入提示词工作台。
- 中央上方：`ScriptEditor` + `ScriptAnalysisPanel`，展示剧本元信息、旁白正文、hook、ending、关键词、保存/重生成操作。
- 中央下方：`StoryboardTimeline`，展示 5-8 个 `ShotCard`，每个 ShotCard 包含若干 `PanelMiniCard`，明确 Shot 与 Panel 的拆分。
- 右侧：`RightInspector type=agent`，注入 `AgentInspector`，展示 ScriptAgent / StoryboardAgent / CriticAgent、SkillBadge、MemoryContextPanel、Reflection notes。

核心表达：

- 页面应像“剧本到分镜的生产工作台”，不是普通文档编辑器。
- 必须体现“角色圣经字段 -> 剧本文案 -> Shot -> Panel -> 后续 Prompt/生成”的链路。
- Agent / Skill / Memory 只作为静态上下文和运行轨迹占位，不做真实调用。

## mock 数据补充设计

新增数据文件会覆盖：

- `characterDetail.ts`：武松角色圣经详情、五层字段、外观、参考图、字段来源、一致性清单。
- `scripts.ts`：武松人物介绍短片剧本，包含平台、时长、画幅、语气、版本、旁白正文、hook、ending、关键词、Agent notes。
- `shots.ts`：6 个叙事镜头，包含镜头编号、时长、旁白片段、画面描述、动作、情绪、镜头语言、场景、一致性状态、Prompt 状态、Panel 数量。
- `panels.ts`：每个 Shot 的生成绑定面板，包含图像描述、镜头、运动、Prompt 状态、关键帧状态、视频状态。
- `skills.ts`：ScriptAgent、StoryboardAgent、CriticAgent、ProductionAgent 使用的静态 SkillBadge。
- `reflections.ts`：一致性风险、Prompt 建议、分镜节奏建议、素材生成建议。

## 如何吸收三个开源项目源码参考

- 吸收 `Toonflow-app`：在 `AgentInspector` 中体现 ScriptAgent / StoryboardAgent / CriticAgent 分层、SkillBadge、MemoryContextPanel、Agent 运行轨迹和监督评审建议，但不调用真实 Agent。
- 吸收 `huobao-drama`：在 `ScriptEditor`、`ProductionStepRail`、`StoryboardTimeline` 中体现短剧生产链路：剧本、分镜、角色、场景、TTS、视频后续衔接，保留 5-8 镜头结构。
- 吸收 `waoowaoo`：在 `ShotCard`、`PanelMiniCard` 中体现 Shot / Panel 拆分、Prompt 状态、关键帧状态、视频状态、后续 GenerationTask / Cost / Asset 衔接，但不接真实任务队列。

## 如何执行中文化规范

- 页面标题、字段名、按钮、状态、提示语以中文为主。
- 英文只作为技术辅助，例如 `Identity Layer`、`Prompt`、`ScriptAgent`、`Memory`、`Skill`、`Provider`、模型名。
- 不使用整页英文主标题，不把模型名、Agent 名机械翻译。
- 避免“管理中心 / 信息列表 / 数据维护”等低端后台文案，使用“角色圣经”“剧本分镜”“一致性检查”“字段来源”等业务化中文。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端、不接数据库、不接真实模型 API。
- 不做真实登录、真实 Agent、真实剧本生成、真实分镜生成。
- 不复制 Stitch `code.html` 到正式代码。
- 不实现真实编辑器、真实筛选、真实保存版本、真实导出 PDF。
- 不处理 shadcn/ui 证书问题。
- 不做移动端适配。

## 验收标准

- 已创建本计划文档。
- `data/mock/` 下新增 `characterDetail.ts`、`scripts.ts`、`shots.ts`、`panels.ts`、`skills.ts`、`reflections.ts`。
- `/characters/[id]` 已实现角色圣经详情静态页面，可通过 `/characters/wusong` 访问。
- `/script-studio` 已实现剧本分镜工作台静态页面。
- Character Detail 展示角色视觉封面、参考图、五层角色圣经、文化视觉层字段、一致性检查、字段来源和常见错误示例。
- Script Studio 展示流程栏、剧本编辑器、脚本分析、Storyboard 时间线、ShotCard、PanelMiniCard、AgentInspector、SkillBadge、MemoryContextPanel。
- 用户可见文案中文为主，英文仅作技术辅助。
- 不接真实 API，不复制参考代码。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器检查 `/characters/wusong` 与 `/script-studio` 页面可访问、无明显顶部遮挡或文字竖排。
