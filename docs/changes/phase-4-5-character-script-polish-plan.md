# Phase 4.5 Character Detail + Script Studio 视觉与布局打磨计划

## 当前页面问题总结

- 工作目录：`/Users/huabi/code/AI-video-studio/yingge-app/frontend`
- 当前项目仍为 Next.js App Router + TypeScript + Tailwind CSS 静态原型。
- Phase 4 已完成 `/characters/[id]` 与 `/script-studio`，且此前 `npm run lint`、`npm run build` 已通过。
- `/characters/wusong` 基本符合“角色圣经”方向，但左侧角色封面信息略长，中间五层 tab 高度不完全统一，主内容层级还能更集中。
- `/script-studio` 的主要问题来自布局压缩：页面同时保留左侧 `ProductionStepRail`、中间 `ScriptEditor + ScriptAnalysisPanel` 双列、右侧 `RightInspector`，在 1440px 桌面宽度下 `ScriptEditor` 被压窄，导致剧本标题、按钮和正文出现竖排/拥挤风险。
- `StoryboardTimeline` 的 `ShotCard` 信息同权重展示，旁白、画面描述、动作、情绪、镜头、Panel 状态同时挤在卡片内，生产链路清楚但阅读层级不够。
- `AgentInspector` 信息完整，但右侧决策辅助面板略长，`Reflection notes` 和 `MemoryContextPanel` 需要更紧凑。

## 将要修改的文件

- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/script-studio/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/ScriptEditor.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/ScriptAnalysisPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/StoryboardTimeline.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/ShotCard.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/PanelMiniCard.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/ProductionStepRail.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/AgentInspector.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/MemoryContextPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/script/SkillBadge.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/characters/[id]/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/characters/CharacterHeroPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/characters/CharacterBibleTabs.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/characters/VisualProfilePanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/characters/ConsistencyChecklist.tsx`

## Script Studio 布局修复策略

- 保持页面三栏心智：左侧制作流程、中间生产区、右侧 Agent Inspector。
- 让中间生产区以 `ScriptEditor` 为主，不再把 `ScriptAnalysisPanel` 固定放在 240px 右列挤压编辑器。
- 将 `ScriptAnalysisPanel` 调整为横向/紧凑生产分析条，放在 `ScriptEditor` 下方或同一主列内，承担节奏、字数、镜头建议等辅助信息。
- `ScriptEditor` 内部头部允许按钮换行，标题和正文禁止被按钮、状态 badge 挤压。
- 剧本文案使用正常横向中文段落排版，正文行保留编号和时间码，但不压缩主文本列。
- `StoryboardTimeline` 独占整行，`ShotCard` 继续两列展示，但内部字段降噪，避免每个字段同等视觉权重。

## Character Detail 层级优化策略

- 左侧 `CharacterHeroPanel` 保留角色封面感，但减少封面高度和重复字段，避免左栏过长。
- 中间主内容区略微增强宽度，突出“文化视觉层”。
- 五层角色圣经 tab 统一高度，中文标题为主，英文只作为技术辅助小字。
- 右侧 Inspector 保留一致性检查、字段来源和动作按钮，减少和中间内容重复的视觉压力。

## ShotCard / PanelMiniCard 优化策略

- `ShotCard` 层级调整为：镜头编号/标题/时长与状态、旁白片段、画面描述、动作/镜头语言/场景/绑定角色、Panel 摘要。
- 旁白和画面描述不再并排挤压，改为纵向主内容块，保证中文段落可读。
- 动作、情绪、镜头语言、场景等字段以紧凑元数据形式展示。
- `PanelMiniCard` 只展示 Panel 编号、画面关键词、camera / motion、Prompt / keyframe / video 状态，不塞长文本。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端、不接数据库、不接真实模型 API。
- 不做真实 Agent、真实剧本生成、真实分镜生成。
- 不复制 Stitch `code.html`。
- 不重构全局 AppShell 架构，不做移动端适配。
- 不实现正式编辑器、保存、自动分镜、导出或进入提示词工作台的真实逻辑。

## 验收标准

- 已创建本计划文档。
- `/script-studio` 在 1440px 桌面宽度下不再出现主标题、剧本文案、旁白正文竖排或严重挤压。
- `ScriptEditor` 获得主内容宽度，按钮可换行，正文正常横向排版。
- `ScriptAnalysisPanel` 成为辅助分析区，不再压缩剧本编辑器。
- `StoryboardTimeline` 使用 2 列 `ShotCard`，卡片内部信息层级更清晰。
- `PanelMiniCard` 仅展示短摘要和状态，不展示长文本。
- `/characters/wusong` 保持角色圣经气质，左侧不被过多字段拉长，五层 tab 高度统一。
- 用户可见文案继续中文为主，`ScriptAgent`、`StoryboardAgent`、`CriticAgent`、`Prompt`、`Skill`、`Memory` 等英文仅作技术辅助。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器检查 `/characters/wusong` 与 `/script-studio` 可访问，无明显遮挡、文字竖排或主内容被压缩问题。
