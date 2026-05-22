# 围绕 PRD v1.0 的参考项目分析

本文服务于 `docs/06-prd/PRD-v1.0.md`，目标是从三个参考项目中提炼可借鉴的产品、Agent、数据模型与工程实现思路，用于“AI 英歌漫剧内容生产工作台”一个月 MVP 的设计决策。

分析范围：

- PRD：`/Users/huabi/code/AI-video-studio/docs/06-prd/PRD-v1.0.md`
- Excel 分析：`/Users/huabi/code/AI-video-studio/docs/07-excel-analysis/yingge-character-bible-analysis.md`
- Toonflow：`/Users/huabi/code/AI-video-studio/references/Toonflow-app`
- Huobao：`/Users/huabi/code/AI-video-studio/references/huobao-drama`
- waoowaoo：`/Users/huabi/code/AI-video-studio/references/waoowaoo`

重要前提：

- 本文只做架构和产品分析，不修改参考项目，不复制大段代码。
- 英歌水浒角色 Excel 的五层字段结构是本产品的核心差异，三个参考项目都没有完全对应实现。
- 一个月 MVP 应优先选择“可落地的轻量流程”，不要直接照搬大型任务系统或复杂 Agent 编排。

## 0. 参考项目总体判断

| 参考项目 | 最适合借鉴的方向 | 关键文件路径 | 对 PRD v1.0 的价值 |
|---|---|---|---|
| Toonflow-app | Agent 编排、Skill/Memory、分镜生产 Agent、视频 Prompt 模板、模型供应商抽象 | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/index.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/index.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/memory.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/modelPrompt/video/seedance2Multi-parameterMode.md` | 适合借鉴“轻量 Director + 子任务 Agent + Prompt 模板”的思路，但不建议照搬动态 vendor/VM 能力 |
| huobao-drama | 短剧生产链路、剧本改写、角色/场景抽取、分镜拆解、图片/视频/TTS 任务服务 | `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/index.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/tools/storyboard-tools.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/image-generation.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/video-generation.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/tts-generation.ts` | 最贴近“一条短剧内容从文案到分镜到素材”的 MVP 主流程 |
| waoowaoo | 工程化任务队列、素材候选、成本记录、模型能力配置、资产中心 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/types.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/queues.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/billing/cost.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/generator-api.ts` | 适合借鉴任务状态、成本统计、模型能力注册，不建议 MVP 一开始完整复制其复杂度 |

## 1. 按 PRD 模块找参考实现

| PRD 模块 | Toonflow 可借鉴点 | Huobao 可借鉴点 | waoowaoo 可借鉴点 | 推荐借鉴来源 | 需要自研的部分 |
|---|---|---|---|---|---|
| 项目管理 | `o_project` 表和项目路由可参考。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/lib/initDB.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/routes/project/getProject.ts` | `dramas`、`episodes` 把剧集项目和单集内容分开。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts` | `Project` + `NovelPromotionProject` 区分通用项目和内容生产配置。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/api/projects/route.ts` | waoowaoo | 英歌项目的默认画风、平台、单集时长、预算和模型选择，需要按 PRD 自定义 |
| 角色库 | `o_assets` 可用 `type` 区分角色素材，`o_scriptAssets` 连接剧本资产。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/types/database.d.ts` | `characters` 表包含 `name`、`role`、`description`、`appearance`、`personality`、`voice_style`。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts` | `GlobalCharacter`、`NovelPromotionCharacter`、`CharacterAppearance` 支持全局角色和项目角色快照。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | waoowaoo + Huobao | 英歌水浒角色库必须承接 Excel 的身份层、内核层、文化视觉层、叙事素材层、商业文化层 |
| 角色一致性档案 | `productionAgent` 的衍生资产和分镜上下文会读取角色资产。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/tools.ts` | `characters.appearance/personality/reference_images` 可支撑基础一致性。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts` | `CharacterAppearance` 保存多版本外观、选中图、历史图。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | waoowaoo | 脸谱特征、主色系、武器/道具、英歌角色定位、正向/禁止 Prompt 词需自研 |
| 场景一致性档案 | `o_assets` 可承载场景资产。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/types/database.d.ts` | `scenes` 表和 `validateStoryboardBindings` 可保证分镜绑定合法场景。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/tools/storyboard-tools.ts` | `NovelPromotionLocation`、`LocationImage` 支持地点、多候选图、选中图。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | Huobao + waoowaoo | 英歌场景模板，如祠堂、广场、巡游街巷、潮汕村落、戏台等，需要自建 |
| 剧本生成/导入 | `scriptAgent` 用决策 Agent 调度故事骨架、改编策略、剧本子 Agent。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/index.ts` | `script_rewriter` skill 和 `episodes.script_content` 最贴近短剧文案。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/script_rewriter/SKILL.md`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/index.ts` | 有从小说到脚本的任务类型，如 `STORY_TO_SCRIPT_RUN`、`SCREENPLAY_CONVERT`。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/types.ts` | Huobao | 英歌人物介绍 30-60 秒结构、开头钩子、非遗知识准确性、平台口播节奏需自研 |
| 分镜拆解 | `productionAgent` 有 storyboard table/panel 子 Agent。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/index.ts` | `storyboard_breaker` skill 和 `createStoryboardTools` 非常贴近。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/storyboard_breaker/SKILL.md`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/tools/storyboard-tools.ts` | `NovelPromotionPanel`、`NovelPromotionStoryboard` 支持镜头级字段和图/视频历史。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | Huobao | 5-8 个分镜的英歌人物介绍模板、镜头节奏、旁白与动作对齐需自研 |
| 图片 Prompt 生成 | 有风格、角色、场景 Prompt 相关模型 Prompt。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/modelPrompt` | `grid_prompt_generator` 读取角色、场景、镜头生成图片 Prompt。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/tools/grid-prompt-tools.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/grid_prompt_generator/SKILL.md` | `handlePanelImageTask` 会把角色外观、地点选中图、镜头上下文组成生图上下文。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/workers/handlers/panel-image-task-handler.ts` | Huobao + waoowaoo | 国风水墨 + 游戏 CG + 黑神话悟空质感 + 剑来漫剧氛围的稳定模板需自研 |
| 视频 Prompt 生成 | Seedance 视频 Prompt 模板最有价值。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/modelPrompt/video/seedance2Multi-parameterMode.md`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/modelPrompt/video/universalMulti-parameterMode.md` | `storyboards.video_prompt` 字段和视频生成服务可参考。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts` | `NovelPromotionPanel.videoPrompt`、`firstLastFramePrompt` 可参考。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | Toonflow | 英歌动作、鼓点、队形、脸谱、镜头运动的 Seedance 专用表达需自研 |
| 生图任务 | `o_image`、`o_tasks` 和 vendor image request/poll 可参考。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/vendor/grsai.ts` | `generateImage`、`processImageGeneration`、`pollImageTask` 是轻量 MVP 参考。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/image-generation.ts` | BullMQ 任务、候选图、任务事件更完整。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/queues.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/workers/handlers/panel-image-task-handler.ts` | Huobao，状态借鉴 waoowaoo | gpt-image-2、nano banana 的统一任务封装、抽卡批次、成本记录需自研 |
| 生视频任务 | Seedance/Volcengine vendor 能力可参考。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/vendor/volcengine.ts` | `generateVideo`、`processVideoGeneration`、`pollVideoTask` 贴近 MVP。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/video-generation.ts` | `VIDEO_PANEL` 任务和提交锁避免重复提交。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/novel-promotion/stages/video-stage-runtime/immediate-video-submission.ts` | Huobao + Toonflow | Seedance 2.0 参数、首尾帧模式、失败重试和预算限制需自研 |
| TTS 任务 | vendor 中存在 TTS request/poll 思路。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/vendor/grsai.ts` | MiniMax TTS 服务最直接。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/tts-generation.ts` | 有 VoiceLine/VoiceDesign 任务类型和声音资产。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/workers/handlers/voice-design.ts` | Huobao | MiniMax 音色管理、旁白/角色声线模板、字幕对齐需自研 |
| 素材采纳/拒绝/复盘 | `o_videoTrack.selectVideoId`、`promptErrorReason` 等字段可参考。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/types/database.d.ts` | `assets.is_favorite`、图片/视频生成记录可做基础管理。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts` | `candidateImages`、`previousImageUrl`、任务事件、素材中心更贴近抽卡。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | waoowaoo | 拒绝原因分类、ReflectionAgent 复盘、英歌文化错误标签需自研 |
| 成本记录 | 未发现完整成本体系，主要可从任务模型记录模型字段。路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/types/database.d.ts` | 未发现明确成本记录，只能参考 AI 配置。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/ai.ts` | `UsageCost`、余额、冻结、定价目录最完整。路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/billing/cost.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/billing/service.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | waoowaoo | MVP 只需简化为 CostRecord，不做充值、冻结、复杂计费 |
| Excel 角色导入 | 未发现多级表头 Excel 导入实现 | 未发现多级表头 Excel 导入实现 | 未发现多级表头 Excel 导入实现 | 自研 | 必须按 Excel 分析文档实现多级表头、合并单元格、复合字段、PromptKeywordSet 导入 |

## 2. Agent 设计对比

### 2.1 三个项目的 Agent/Worker/Prompt 特征

| 项目 | Agent/Worker/Prompt 设计 | 关键路径 | 可借鉴点 | 不适合直接照搬的点 |
|---|---|---|---|---|
| Toonflow-app | 决策 Agent 读取 Skill 和 Memory，再调用多个子 Agent；`scriptAgent` 和 `productionAgent` 分工明确 | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/index.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/index.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/memory.ts` | DirectorAgent 编排、ScriptAgent 拆子任务、Prompt/Storyboard 子 Agent、Memory 工具 | 子 Agent 体系偏完整，MVP 不宜一开始做复杂全自动自主 Agent |
| huobao-drama | 使用固定 Agent 类型和 Skill 文件，Agent 通过工具读取/保存剧本、角色、场景、分镜、Prompt | `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/index.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/skills.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/storyboard_breaker/SKILL.md` | MVP 友好，流程清晰，短剧领域贴近；适合先做“可控 Agent 工具链” | 缺少英歌文化校验、素材拒绝复盘和长期记忆 |
| waoowaoo | 更偏 Worker/任务图，不是轻 Agent；通过任务类型、队列、GraphRun/GraphStep 管理复杂生成链路 | `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/types.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/queues.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | GenerateTask、TaskEvent、候选素材、成本、模型能力，非常适合工程底座 | 对一个月 MVP 过重，GraphRun/余额冻结/复杂队列可后置 |

### 2.2 我们的 6 个 Agent 借鉴建议

| 我们的 Agent | 推荐借鉴项目 | 参考文件 | 借鉴方式 |
|---|---|---|---|
| DirectorAgent | Toonflow-app | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/index.ts` | 借鉴 `runDecisionAI` + 子任务工具的编排思路，但 MVP 中只做“给出下一步建议、调用 Script/Storyboard/Prompt”的轻量流程规划 |
| ScriptAgent | Huobao-drama + Toonflow-app | `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/script_rewriter/SKILL.md`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/index.ts` | Huobao 提供短剧文案改写方式；Toonflow 提供故事骨架、改编策略、剧本子 Agent 的拆分思路 |
| StoryboardAgent | Huobao-drama | `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/storyboard_breaker/SKILL.md`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/tools/storyboard-tools.ts` | 借鉴分镜字段结构、分镜保存、角色/场景绑定校验；改造成 5-8 镜头人物介绍模板 |
| PromptAgent | Huobao-drama + Toonflow-app | `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/tools/grid-prompt-tools.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/modelPrompt/video/seedance2Multi-parameterMode.md` | 图片 Prompt 借鉴 Huobao 的角色/场景/镜头网格；视频 Prompt 借鉴 Toonflow 的 Seedance 模板 |
| CriticAgent | Toonflow-app + Huobao-drama | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/skills/production_agent_supervision.md`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/tools/storyboard-tools.ts` | 借鉴 supervision Agent 和绑定校验；自研英歌文化准确性、角色一致性、禁止词检查 |
| ReflectionAgent | Toonflow-app + waoowaoo | `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/memory.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/types.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | 借鉴 Memory 和 TaskEvent；自研“拒绝原因 -> 失败案例 -> 下次 Prompt 修正”的轻量闭环 |

结论：PRD v1.0 不应实现复杂自主 Agent。第一版应实现“可审计的轻量 Agent”：每个 Agent 有明确输入、输出和可保存记录，用户能随时采纳、拒绝、重试。

## 3. 数据模型借鉴

| 我们的实体 | Toonflow 对应 | Huobao 对应 | waoowaoo 对应 | 最终建议 |
|---|---|---|---|---|
| User | `o_user`，路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/types/database.d.ts` | 未确认完整用户体系 | `User`，路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma` | 采用简化 `User`，MVP 可先支持单用户或本地用户 |
| Project | `o_project` | `dramas` | `Project` + `NovelPromotionProject` | 借鉴 waoowaoo 的“通用项目 + 领域配置”思路，但 MVP 可先合并为一个 Project |
| Character | `o_assets(type=role)` | `characters` | `GlobalCharacter`、`NovelPromotionCharacter` | 自研 Character 母表，来源以英歌水浒 Excel 为准 |
| ProjectCharacter | `o_scriptAssets` 可类比项目内资产绑定 | `episode_characters` | `NovelPromotionCharacter.sourceGlobalCharacterId` | 自研项目角色快照，保留从 Character 复制来的版本化字段 |
| CharacterVisualProfile | `o_assets.prompt`、角色资产字段 | `characters.appearance`、`reference_images` | `CharacterAppearance`、`GlobalCharacterAppearance` | 借鉴 waoowaoo 的多外观/选中图，字段按 Excel 文化视觉层设计 |
| CharacterNarrativeProfile | `o_novel`、`o_script` 可间接参考 | `characters.description/personality` | `NovelPromotionCharacter.profileData/introduction` | 自研叙事档案，承接核心叙事原点、人生事件、人格标签 |
| CharacterCommercialProfile | 未发现直接对应 | 未发现直接对应 | 未发现直接对应 | 完全自研，服务文创产品、跨境文化出海、商业定位 |
| SceneAsset | `o_assets(type=scene)` | `scenes`、`assets` | `MediaObject`、`LocationImage` | 借鉴 Huobao 场景结构和 waoowaoo 素材对象，建立英歌场景资产 |
| ProjectScene | `o_assets(type=scene)` | `scenes` | `NovelPromotionLocation` | 建议采用项目级场景快照，避免项目间互相污染 |
| Script | `o_script` | `episodes.script_content` | `NovelPromotionEpisode.novelText`、`NovelPromotionClip.screenplay` | 自研 Script，支持 AI 生成和用户粘贴导入 |
| ScriptScene | `scriptPlan`、`storyboardTable` 可类比 | `storyboards` 按场景聚合 | `NovelPromotionClip` | MVP 可弱化为 Script 下的段落/镜头组，后续再独立 |
| Shot | `o_storyboard` | `storyboards` | `NovelPromotionPanel`、`NovelPromotionShot` | 主要借鉴 Huobao 的分镜字段，补充 waoowaoo 的候选图/视频历史 |
| PromptDraft | `o_prompt`、`o_modelPrompt`、`o_storyboard.prompt` | `storyboards.image_prompt/video_prompt` | `NovelPromotionPanel.imagePrompt/videoPrompt/firstLastFramePrompt` | 自研 PromptDraft，区分图片、视频、TTS、正向词、禁止词 |
| GenerateTask | `o_tasks`、`o_image`、`o_video` | `image_generations`、`video_generations` | `Task`、`TaskEvent` | MVP 采用简化版 waoowaoo Task 状态：queued、processing、completed、failed、canceled |
| Asset | `o_assets`、`o_image`、`o_video` | `assets` | `MediaObject`、Asset Hub 相关表 | 自研统一 Asset，记录来源任务、关联角色/场景/镜头、采纳状态 |
| AgentMemory | `memories` | 未发现明确 memory 表 | `GraphRun/GraphEvent` 可类比运行记录 | 借鉴 Toonflow Memory，但 MVP 只保存可解释的失败经验和用户偏好 |
| AgentSkill | `o_skillList`、`data/skills/*` | `agent_configs`、`skills/*/SKILL.md` | 未确认完整 skill 表 | 借鉴 Huobao 的本地 Skill 文件 + 配置表方式 |
| CostRecord | 未发现完整对应 | 未发现明确成本记录 | `UsageCost`、`BalanceTransaction` | 借鉴 waoowaoo，但 MVP 只做成本流水，不做余额冻结和充值 |

## 4. 工程化借鉴

### 4.1 任务队列

waoowaoo 的任务系统最完整：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/types.ts` 定义 `TASK_STATUS`、`TASK_TYPE`、`TASK_EVENT_TYPE`，`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/queues.ts` 用 BullMQ 分为 image、video、voice、text 队列，`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/service.ts` 处理 dedupe、孤儿任务和状态流转。

Huobao 更适合 MVP：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/image-generation.ts` 和 `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/video-generation.ts` 采用“创建记录 -> 异步处理 -> 轮询 -> 更新状态”的简单模式。

建议：PRD v1.0 先做数据库任务记录 + 简单轮询，保留状态字段和 retry 字段；v0.2 再引入 BullMQ。

### 4.2 生图任务状态

Huobao 的 `image_generations` 更贴近第一版：创建时 `status=processing`，完成后写入 `image_url/local_path`，失败后写入 `error_msg`。参考路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/image-generation.ts`。

waoowaoo 的候选图机制更适合“抽卡”：`NovelPromotionPanel.candidateImages`、`imageHistory`、`previousImageUrl` 支持多候选、采纳和回退。参考路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma`。

建议：MVP 中 GenerateTask 记录任务状态，Asset 记录候选结果，Shot 或 PromptDraft 记录当前采纳的 assetId。

### 4.3 生视频任务状态

Huobao 的视频任务服务最直接，包含 `generateVideo`、`processVideoGeneration`、`pollVideoTask` 和完成写回。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/video-generation.ts`。

Toonflow 的 Seedance/Volcengine 供应商适配值得看：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/vendor/volcengine.ts`。它对 Seedance 类模型的请求和轮询有参考意义。

waoowaoo 的防重复提交锁可后置参考：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/novel-promotion/stages/video-stage-runtime/immediate-video-submission.ts`。

建议：MVP 必须支持 failed 状态和手动重试，不要让重复点击提交多次扣费。

### 4.4 素材保存

Huobao 适合本地保存：生成后下载到本地静态目录并更新业务表。参考路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/image-generation.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/video-generation.ts`。

waoowaoo 适合资产中心化：`MediaObject`、`GlobalCharacter`、`GlobalLocation`、Asset Hub API 和 UI。参考路径：`/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/api/asset-hub`。

建议：MVP 用本地文件 + Asset 元数据；后续再升级为对象存储和全局资产中心。

### 4.5 成本记录

waoowaoo 的成本体系最成熟：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/billing/cost.ts` 通过定价目录计算文本、图片、视频、语音成本，`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/billing/service.ts` 负责执行和记录，`/Users/huabi/code/AI-video-studio/references/waoowaoo/standards/pricing` 存放价格目录。

建议：MVP 不做余额、冻结、充值，只做 `CostRecord`：记录项目、任务、模型、输入量、输出量、预估成本、实际成本、币种、时间。

### 4.6 模型配置

Huobao 的 `ai_service_configs` 简单直接，适合 MVP 参考。路径：`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/ai.ts`。

waoowaoo 的能力目录更强：`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/model-config-contract.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/generator-api.ts`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/standards/capabilities/image-video.catalog.json`。

Toonflow 的 vendor 文件支持多供应商，但动态 vendor 执行不适合 MVP 直接采用。参考路径：`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/vendor.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/vm.ts`。

建议：第一版把模型配置固定为 PRD 指定范围：文本多模型、gpt-image-2、nano banana、Seedance 2.0、MiniMax TTS。API Key 只放服务端环境变量或加密存储，不进入前端，不进入日志。

## 5. 许可证与风险

### 5.1 许可证判断

| 项目 | 许可证/限制 | 判断 |
|---|---|---|
| Toonflow-app | `package.json` 标明 Apache-2.0；`README.md` 同时包含补充商业授权说明，提到作为产品分发给两个及以上独立第三方需书面商业授权 | 可以较深入借鉴思想和架构；若未来作为 ToB 产品分发，不能直接复制代码或移除版权，需要进一步确认授权 |
| huobao-drama | `README.md` 显示 CC BY-NC-SA 4.0；该协议通常限制商业用途并要求相同方式共享 | 只建议借鉴流程、字段和产品思想，不复制代码；本项目有商业化目标，尤其要避免代码层面复用 |
| waoowaoo | `package.json` 为 `private: true`，未确认公开许可证 | 只能作为内部参考，借鉴任务队列、成本、素材中心等思想，不复制实现代码 |

### 5.2 只能借鉴思想，不能复制代码的部分

- Huobao 的 Agent、服务和数据库实现：因为 `CC BY-NC-SA 4.0` 与本项目未来商业化方向冲突。
- waoowaoo 的所有具体实现：未确认许可证，且项目标记为 private。
- Toonflow 的商业受限部分：虽然有 Apache-2.0，但 README 有补充商业限制，未来对外分发前必须确认授权。

### 5.3 可以更深度参考的部分

- Toonflow 的 Agent 拆分、Skill/Memory 概念、视频 Prompt 模板结构，可以作为架构参考，但应重新实现。
- Huobao 的短剧生产流程可以作为 MVP 流程参考，尤其是剧本 -> 角色/场景 -> 分镜 -> 图片/视频/TTS。
- waoowaoo 的任务状态、成本记录、素材候选和模型能力目录可以作为后续工程化蓝图，MVP 只抽取最小字段。

### 5.4 安全问题需要避开

- 不要把 API Key 明文存数据库或返回前端。Huobao 的 `ai_service_configs.api_key` 思路要改成服务端环境变量或加密存储。
- 不要复制 Toonflow 的动态 vendor 执行方案。`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/vm.ts` 和 `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/vendor.ts` 涉及动态代码执行，MVP 风险过高。
- 不要在日志里打印 Prompt 中的私密素材 URL、Key、Token 或完整请求头。
- 生成任务必须有失败态、重试次数和错误原因，避免无限轮询、重复扣费、重复提交。
- Excel 导入必须只读取指定 Excel 文件，不读取 `.env`、key、token、证书类文件。

## 6. 面向 PRD v1.0 的最终建议

### 6.1 一个月 MVP 应该借鉴的最小组合

| 能力 | 首选参考 | 落地方式 |
|---|---|---|
| 项目和角色库 | waoowaoo + Huobao | 用简化 Project、Character、ProjectCharacter，不做复杂资产中心 |
| 剧本和分镜 | Huobao | 先实现固定 Agent + Skill + 工具函数式流程 |
| 图片 Prompt | Huobao + waoowaoo | 图片 Prompt 读取角色视觉档案、场景档案、镜头字段 |
| 视频 Prompt | Toonflow | Seedance 2.0 模板独立维护，不与图片 Prompt 混用 |
| 生图/生视频/TTS | Huobao | 先做轻量任务记录和轮询，支持失败重试 |
| 抽卡/采纳/拒绝 | waoowaoo | Asset 保存候选结果，用户标记 accepted/rejected |
| 成本 | waoowaoo | 只做 CostRecord 流水，不做余额系统 |
| Agent Memory | Toonflow | 只保存拒绝原因、失败案例和用户偏好 |
| Excel 导入 | 自研 | 严格按 Excel 分析文档实现多级表头和五层结构 |

### 6.2 最应该自研的产品差异

本产品不能做成通用短剧平台。真正的差异在以下五点：

1. 英歌水浒角色 IP 圣经：来自 Excel 的五层结构是产品核心资产。
2. 角色一致性：脸谱、主色、武器、人格、叙事原点、禁止词必须进入 Prompt。
3. 英歌文化准确性：CriticAgent 必须检查英歌动作、潮汕语境、非遗表达是否偏离。
4. 文创转化：CharacterCommercialProfile 必须能服务周边、跨境文化出海和后续商品设计。
5. 抽卡复盘：用户拒绝素材后，系统要沉淀失败原因，而不是只重新生成。

### 6.3 v1.0 PRD 后续可补充的设计点

- 为 `GenerateTask` 明确状态机：queued、processing、completed、failed、canceled。
- 为 `Asset` 明确采纳状态：candidate、accepted、rejected、archived。
- 为 `PromptDraft` 增加 `positiveKeywords`、`negativeKeywords`、`sourceFields`，方便追溯 Prompt 来自哪些角色字段。
- 为 `CostRecord` 增加 `estimatedCost` 和 `actualCost`，先满足 4000 元预算控制。
- 为 `ReflectionAgent` 增加标准拒绝原因：人物不像、脸谱错误、颜色错误、风格偏离、动作不英歌、镜头不可用、视频不连贯、文化不准确、平台不适配。

## 7. 参考文件索引

Toonflow-app：

- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/package.json`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/README.md`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/lib/initDB.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/types/database.d.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/index.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/index.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/tools.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/memory.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/skillsTools.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/vendor.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/vm.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/modelPrompt/video/seedance2Multi-parameterMode.md`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/vendor/grsai.ts`
- `/Users/huabi/code/AI-video-studio/references/Toonflow-app/data/vendor/volcengine.ts`

Huobao-drama：

- `/Users/huabi/code/AI-video-studio/references/huobao-drama/README.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/index.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/index.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/skills.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/tools/storyboard-tools.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/agents/tools/grid-prompt-tools.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/image-generation.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/video-generation.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/tts-generation.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/ai.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/adapters/registry.ts`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/script_rewriter/SKILL.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/extractor/SKILL.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/storyboard_breaker/SKILL.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/grid_prompt_generator/SKILL.md`
- `/Users/huabi/code/AI-video-studio/references/huobao-drama/skills/voice_assigner/SKILL.md`

waoowaoo：

- `/Users/huabi/code/AI-video-studio/references/waoowaoo/package.json`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/types.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/queues.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/service.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/task/submitter.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/workers/handlers/panel-image-task-handler.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/workers/handlers/voice-design.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/novel-promotion/stages/video-stage-runtime/immediate-video-submission.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/generator-api.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/model-config-contract.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/model-gateway/router.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/billing/cost.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/billing/service.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/model-pricing/catalog.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/standards/capabilities/image-video.catalog.json`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/standards/pricing`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/api/projects/route.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/api/projects/[projectId]/costs/route.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/api/projects/[projectId]/assets/route.ts`
- `/Users/huabi/code/AI-video-studio/references/waoowaoo/src/app/api/asset-hub`
