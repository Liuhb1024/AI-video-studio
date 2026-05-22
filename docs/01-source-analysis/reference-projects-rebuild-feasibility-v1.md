# 参考项目改造可行性评估 v1

## 1. 当前自研版本资产清单

当前自研版本已经沉淀的资产不是零散代码，而是一套围绕“英歌非遗 IP + 水浒人物介绍短视频”的产品与工程闭环。

| 资产 | 当前状态 | 代表文件 / 路径 | 即使重做是否保留 |
|---|---|---|---|
| PRD | 已形成 v1.0，明确不是通用短剧平台，而是内部 AI 英歌漫剧内容生产工作台 | `/Users/huabi/code/AI-video-studio/docs/06-prd/PRD-v1.0.md` | 必须保留 |
| 前端原型 | 6 个页面已完成静态原型并通过验收：`/dashboard`、`/characters`、`/characters/wusong`、`/script-studio`、`/generation-workspace`、`/asset-review` | `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/`、`/Users/huabi/code/AI-video-studio/docs/05-tasks/static-prototype-acceptance-report-v1.md` | 必须保留为产品蓝图 |
| 前端组件 | 已拆出布局、角色、剧本、生成、素材、通用组件 | `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/` | 建议保留 |
| 前端 mock 数据 | 已覆盖项目、角色、剧本、分镜、Panel、Prompt、任务、素材、成本、Agent、Skill、Reflection | `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/` | 必须保留为验收样本 |
| 前端 API 初步切换 | `/dashboard`、`/characters` 已有 API client 基础 | `/Users/huabi/code/AI-video-studio/yingge-app/frontend/lib/api/` | 建议保留 |
| 后端目录 | FastAPI 分层结构已落地，包含 api、models、schemas、repositories、services、ai、tasks、storage | `/Users/huabi/code/AI-video-studio/yingge-app/backend/app/` | 建议保留 |
| ORM 模型 | P0 模型已创建，包括 `projects`、`characters`、`scripts`、`shots`、`panels`、`prompt_drafts`、`generation_tasks`、`assets`、`asset_reviews`、`cost_records` 等 | `/Users/huabi/code/AI-video-studio/yingge-app/backend/app/models/` | 必须保留 |
| 数据库迁移 | Alembic 已有两批迁移 | `/Users/huabi/code/AI-video-studio/yingge-app/backend/alembic/versions/51238682fed0_create_project_character_script_shot_.py`、`/Users/huabi/code/AI-video-studio/yingge-app/backend/alembic/versions/4ecfe89d7af3_create_prompt_task_asset_review_cost_.py` | 必须保留 |
| seed mock 数据 | 已有 mock seed 脚本和测试 | `/Users/huabi/code/AI-video-studio/yingge-app/backend/scripts/seed_mock_data.py`、`/Users/huabi/code/AI-video-studio/yingge-app/backend/tests/scripts/test_seed_mock_data.py` | 必须保留 |
| 第一批 GET API | 项目、角色、剧本、镜头、Panel、Prompt、任务、素材、审核、成本、导出均已挂入 v1 router | `/Users/huabi/code/AI-video-studio/yingge-app/backend/app/api/v1/router.py` | 建议保留 |
| 视觉规范 | 已形成 Ink & Cinnabar Production 方向 | `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-static-prototype-plan-v1.md` | 必须保留 |
| 中文文案规范 | 当前 UI 已基本符合中文主导、英文辅助的工作台文案方向 | `/Users/huabi/code/AI-video-studio/docs/05-tasks/static-prototype-acceptance-report-v1.md` | 必须保留 |

当前版本最有价值的不是“代码量”，而是业务贴合度：它已经把 `Character`、`CharacterBible`、`Script`、`Shot`、`Panel`、`PromptDraft`、`GenerationTask`、`Asset`、`AssetReview`、`CostRecord` 这些对象按英歌人物介绍片链路摆正。即使换底座，也不应丢掉 PRD、数据模型、页面蓝图、mock 验收样本和中文视觉文案规范。

## 2. 三个参考项目快速画像

### waoowaoo

- 技术栈：Next.js 15、React 19、Prisma、MySQL、Redis、BullMQ、NextAuth、Remotion、S3/COS、Tailwind CSS v4、AI SDK。见 `/Users/huabi/code/AI-video-studio/references/waoowaoo/package.json`。
- 核心模块：小说解析、角色/场景资产、分镜面板、图像/视频/语音 worker、任务队列、Bull Board、模型能力、价格目录、成本统计、媒体对象。
- 项目结构：单体 Next.js + Prisma schema + worker/runtime。关键文件包括 `/Users/huabi/code/AI-video-studio/references/waoowaoo/prisma/schema.prisma`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/workers/`、`/Users/huabi/code/AI-video-studio/references/waoowaoo/src/lib/run-runtime/`。
- 能否本地启动：README 给出 Docker 和本地开发方式。Docker 方式理论上最顺，开发方式需要复制 `.env.example`、MySQL、Redis、MinIO、`npx prisma db push`、`npm run dev`。本次未实际启动，未确认本机依赖是否完全满足。
- 和 AI 英歌漫剧工作台匹配度：工程化很匹配，业务语义偏“小说推广/AI 影视 Studio”，不是英歌 IP 工作台。
- 可复用模块：任务状态模型 `Task` / `TaskEvent`、运行图 `GraphRun` / `GraphStep`、成本表 `UsageCost`、媒体对象 `MediaObject`、模型能力和价格目录、素材候选与采纳流程。
- 不适合复用的部分：小说推广领域命名 `NovelPromotionProject`、`NovelPromotionPanel`、NextAuth 用户体系、MySQL + Prisma 技术栈、复杂 worker/runtime、Remotion 合成流程。
- License / 商业使用风险：`/Users/huabi/code/AI-video-studio/references/waoowaoo/LICENSE` 是 CC BY-NC-SA 4.0，明确 NonCommercial 和 ShareAlike。商业使用风险高，不适合作为可商用代码底座。
- 改造成本：高。要从 Next.js + Prisma + BullMQ + MySQL 转到当前 FastAPI + PostgreSQL + SQLAlchemy，等于重写大部分后端；如果直接基于它改造，又会把非商业协议和小说推广领域模型带入项目。

### Toonflow-app

- 技术栈：Electron、Express、SQLite、Knex、Socket.io、AI SDK、`@huggingface/transformers`、`better-sqlite3`、`vm2`。见 `/Users/huabi/code/AI-video-studio/references/Toonflow-app/package.json`。
- 核心模块：无限画布工作台、ScriptAgent、ProductionAgent、Decision / Execution / Supervision 三层 Agent、Skill 文件系统、本地 Memory / embedding、供应商配置、章节事件图谱、素材和分镜生产。
- 项目结构：Electron 桌面应用 + Express 服务 + SQLite。关键文件包括 `/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/scriptAgent/index.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/agents/productionAgent/index.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/memory.ts`、`/Users/huabi/code/AI-video-studio/references/Toonflow-app/src/utils/agent/skillsTools.ts`。
- 能否本地启动：README 和 scripts 提供 `yarn dev`、`dev:gui`、`dev:gui-vite`、`build`。本次未实际启动。Electron、SQLite、本地模型和供应商配置会提高环境复杂度。
- 和 AI 英歌漫剧工作台匹配度：Agent 架构高度有参考价值，但产品形态偏桌面无限画布，与当前 Web 内部工具不一致。
- 可复用模块：Agent 分层、Skill 外化、Memory 隔离键、衍生资产、分镜表、监督评审。表名包括 `memories`、`o_agentDeploy`、`o_agentWorkData`、`o_assets`、`o_storyboard`、`o_tasks`。
- 不适合复用的部分：Electron 桌面壳、无限画布 UI、SQLite / Knex 数据结构、可编程 vendor 沙箱、默认账号和桌面分发逻辑。
- License / 商业使用风险：`package.json` 标注 Apache-2.0，但 `/Users/huabi/code/AI-video-studio/references/Toonflow-app/LICENSE` 后附补充协议：向两个及以上独立第三方主体分发/销售/提供产品需 HBAI-Ltd 书面商业授权；五个以内法人主体联合内部使用无需商业授权。内部自用风险较低，未来对外产品化风险中高。
- 改造成本：中高。若作为“主底座”需要接受 Electron + Express + SQLite；若只借鉴 Agent/Skill/Memory，成本低且收益高。

### huobao-drama

- 技术栈：Nuxt 3、Vue 3、TypeScript、Hono、Drizzle ORM、better-sqlite3、Mastra Agents、FFmpeg。见 `/Users/huabi/code/AI-video-studio/references/huobao-drama/README.md`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/package.json`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/frontend/package.json`。
- 核心模块：剧本改写、角色/场景抽取、角色管理、场景管理、分镜拆解、图片生成、视频生成、MiniMax TTS、FFmpeg 单镜头合成、整集拼接、素材库、任务进度。
- 项目结构：`frontend/` Nuxt 前端，`backend/` Hono API，`skills/` Agent 技能。关键文件包括 `/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/db/schema.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/routes/storyboards.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/image-generation.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/video-generation.ts`、`/Users/huabi/code/AI-video-studio/references/huobao-drama/backend/src/services/tts-generation.ts`。
- 能否本地启动：README 给出前后端分离启动方式，要求 Node.js 20+、npm 9+、FFmpeg 4.0+、复制 `configs/config.example.yaml`。本次未实际启动，未确认 FFmpeg 和模型配置完整性。
- 和 AI 英歌漫剧工作台匹配度：短剧流程最匹配，尤其 `storyboards`、`image_generations`、`video_generations`、TTS、素材和合成链路。但它是通用短剧平台，不是英歌 IP 工作台。
- 可复用模块：分镜字段、首尾帧、参考图、多厂商适配、TTS 对白解析、素材表、Agent skill 设计。函数名如 `parseDialogueForTTS`、`syncStoryboardCharacters`、`validateStoryboardBindings`、`generateTTS`、`generateImage`、`generateVideo`。
- 不适合复用的部分：Nuxt/Vue 前端、Hono/Drizzle/SQLite 后端、真实 FFmpeg 合成、商业版导向、直接保存 `aiServiceConfigs.apiKey` 的配置结构。
- License / 商业使用风险：README 标注 CC BY-NC-SA 4.0，非商业与相同方式共享限制明确。商业使用风险高，不适合作为可商用代码底座。
- 改造成本：中高。短剧流程参考价值最大，但技术栈和许可证都不适合直接 fork 改造。

## 3. 作为主底座的评分

评分说明：5 分为最好。`启动难度` 分数越高代表越容易启动；`License 风险` 分数越高代表风险越低。

| 项目 | 启动难度 | 技术栈匹配 | 短剧流程匹配 | Agent 能力 | 任务队列/成本 | UI 可改造性 | 代码质量 | License 风险 | 综合建议 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| waoowaoo | 3 | 2 | 4 | 3 | 5 | 3 | 4 | 1 | 不建议作为主底座；适合学习任务、成本、模型能力、素材候选 |
| Toonflow-app | 2 | 2 | 4 | 5 | 3 | 2 | 3 | 3 | 不建议直接作为 Web 主底座；适合学习 Agent / Skill / Memory |
| huobao-drama | 4 | 2 | 5 | 4 | 3 | 3 | 3 | 1 | 不建议作为主底座；适合学习短剧流程和生成链路 |

如果强行选择一个主底座，`huobao-drama` 的业务流程最接近；但综合许可证、技术栈、当前自研资产和未来商业目标，不建议把任一参考项目作为正式主底座。

## 4. 能复用什么，不能复用什么

### waoowaoo

- 可以直接借鉴的设计：任务生命周期、任务事件、模型能力目录、价格目录、成本记录、素材候选、失败 overlay、按项目聚合成本。
- 可以参考但不复制的模块：`Task`、`TaskEvent`、`GraphRun`、`GraphStep`、`UsageCost`、`MediaObject`、`src/lib/model-capabilities/catalog.ts`、`src/lib/model-pricing/catalog.ts`、`src/lib/billing/cost.ts`。
- 不建议复用的模块：NextAuth、Prisma schema、BullMQ worker 实现、Novel Promotion 领域命名、Remotion 合成链路。
- 需要重新实现的模块：英歌项目管理、英歌角色库、角色圣经、英歌文化一致性检查、Seedance / MiniMax / gpt-image-2 / nano banana 的模型网关、成本统计。

重点模块判断：

| 模块 | 判断 |
|---|---|
| 项目管理 | 可借鉴项目状态、统计字段、成本汇总；不能复用小说推广领域模型 |
| 角色管理 | 可借鉴外观候选和已选图；英歌角色圣经必须重写 |
| 剧本生成 | 可借鉴 story-to-script 任务概念；英歌人物介绍文案必须重写 |
| 分镜 | 可借鉴 Shot / Panel 拆分；字段命名需按当前模型 |
| Prompt | 可参考 prompt canary 和修改流程；不能复制 prompt 文本 |
| 生图 | 可借鉴任务和候选图流程 |
| 生视频 | 可借鉴视频任务状态和能力校验 |
| TTS | 可借鉴 voice_line 任务概念 |
| 素材审核 | 可借鉴候选、采纳、失败状态 |
| 成本统计 | 最值得借鉴 |
| 任务状态 | 最值得借鉴 |
| Agent / Skill / Memory | 不是它的最强项，只参考运行图 |

### Toonflow-app

- 可以直接借鉴的设计：Decision / Execution / Supervision 三层 Agent、Skill 文件化、Memory 隔离键、衍生资产、监督评分。
- 可以参考但不复制的模块：`src/agents/scriptAgent/index.ts`、`src/agents/productionAgent/index.ts`、`src/utils/agent/memory.ts`、`src/utils/agent/skillsTools.ts`、`data/skills/script_agent_decision.md`、`data/skills/production_agent_decision.md`。
- 不建议复用的模块：Electron 壳、无限画布 UI、SQLite 表结构 `o_*`、Socket.io 工作台协议、可编程 vendor 沙箱、`vm2` 执行模型。
- 需要重新实现的模块：Web 版 AgentRun、SkillConfig、ReflectionNote、MemoryContextPanel、英歌动作/文化校验技能。

重点模块判断：

| 模块 | 判断 |
|---|---|
| 项目管理 | 不建议复用 |
| 角色管理 | 可参考衍生资产，不适合直接迁移 |
| 剧本生成 | 可参考 ScriptAgent 分层 |
| 分镜 | 可参考 ProductionAgent 的 storyboard schema |
| Prompt | 可参考 Agent 产出 prompt 的工具边界 |
| 生图 | 可参考衍生资产生成状态 |
| 生视频 | 其 skill 明确把视频生成留给面板操作，这点应保留 |
| TTS | 不是主要参考 |
| 素材审核 | 可参考监督 Agent |
| 成本统计 | 不是主要参考 |
| 任务状态 | 可参考 `o_tasks`，但不够工程化 |
| Agent / Skill / Memory | 最值得借鉴 |

### huobao-drama

- 可以直接借鉴的设计：短剧生产步骤、分镜字段、角色/场景绑定、图片/视频/TTS 生成记录、首尾帧、多参考图、FFmpeg 作为后期能力边界。
- 可以参考但不复制的模块：`backend/src/db/schema.ts`、`backend/src/routes/storyboards.ts`、`backend/src/routes/images.ts`、`backend/src/routes/videos.ts`、`backend/src/services/tts-generation.ts`、`skills/storyboard_breaker/SKILL.md`、`skills/grid_prompt_generator/SKILL.md`。
- 不建议复用的模块：Nuxt UI、Hono + Drizzle + SQLite 后端、Mastra 具体封装、FFmpeg 合成实现、`aiServiceConfigs.apiKey` 配置表结构。
- 需要重新实现的模块：英歌人物介绍片的剧本结构、英歌角色/场景一致性、素材审核与失败原因、成本统计、PostgreSQL 数据模型。

重点模块判断：

| 模块 | 判断 |
|---|---|
| 项目管理 | 可参考 drama / episode 层级，但 MVP 应简化成 project |
| 角色管理 | 可参考角色声音、参考图、voice sample |
| 剧本生成 | 可参考 script_rewriter，但英歌人物介绍需要重写 |
| 分镜 | 最值得借鉴，字段完整 |
| Prompt | 可参考 grid prompt、first_frame、first_last、multi_ref 模式 |
| 生图 | 可参考 `image_generations` 参数结构 |
| 生视频 | 可参考 `video_generations` 参数结构 |
| TTS | 可参考 `parseDialogueForTTS` 和角色音色匹配 |
| 素材审核 | 有素材库，但审核/复盘不如当前自研模型贴合 |
| 成本统计 | 需要重新实现 |
| 任务状态 | 可参考进度字段，但不如 waoowaoo 完整 |
| Agent / Skill / Memory | Skill 有价值，Memory 不突出 |

## 5. 与当前自研版本对比

### 当前自研版本优势

- 业务贴合：从一开始就服务“英歌非遗 IP + 水浒人物介绍短视频”，不是通用小说/短剧平台。
- 页面已高保真：6 个页面已形成“角色库 -> 角色圣经 -> 剧本分镜 -> Prompt -> 生成 -> 审核导出”的演示闭环。
- 数据模型已按英歌链路设计：当前后端已有 `Project`、`Character`、`CharacterBible`、`Script`、`Shot`、`Panel`、`PromptDraft`、`GenerationTask`、`Asset`、`AssetReview`、`CostRecord`。
- 后端分层清楚：FastAPI API、Service、Repository、Model、Schema 已分离，`app/api/v1/router.py` 已挂入第一批 GET endpoints。
- 可控：技术栈是 FastAPI + PostgreSQL + SQLAlchemy + Alembic，适合继续由 AI 辅助迭代；没有被参考项目许可证和领域命名绑架。
- 视觉与中文文案已经贴合：Ink & Cinnabar Production 比参考项目更像“英歌漫剧生产工作台”。

### 当前自研版本劣势

- 真实功能少：仍以 mock、seed、GET API 为主。
- 还没接模型：没有真实 gpt-image-2、nano banana、Seedance 2.0、MiniMax 调用。
- 前端 API 刚开始：目前只有 `/dashboard` 和 `/characters` 初步切 API。
- 任务队列还只是表状态：没有 BullMQ、Celery、RQ 或后台 worker。
- 成本统计和模型能力还未真实落地。
- Agent / Skill / Memory 目前更多是产品表达，还不是执行系统。

### 参考项目改造优势

- 已有现成流程：尤其 huobao-drama 已覆盖剧本、角色、场景、分镜、生图、生视频、TTS、合成。
- 可能已有任务/生成链路：waoowaoo 的 worker、任务、成本最完整。
- Agent 经验更成熟：Toonflow-app 的 Decision / Execution / Supervision 和 Skill / Memory 体系值得学习。
- 心理安全感更强：能看到别人已经跑通过类似问题。

### 参考项目改造风险

- License 风险：waoowaoo 和 huobao-drama 都是 CC BY-NC-SA 4.0；Toonflow-app 虽标 Apache-2.0，但补充协议限制对外提供给两个及以上独立第三方主体。
- 技术栈不匹配：三个项目分别是 Next.js/Prisma/MySQL/BullMQ、Electron/Express/SQLite、Nuxt/Hono/Drizzle/SQLite；都不匹配当前 FastAPI/PostgreSQL 方向。
- 代码质量和长期维护不确定：参考项目均处于快速迭代，直接 fork 会继承大量不符合英歌业务的复杂度。
- 改造成本容易被低估：把“小说短剧平台”改成“英歌 IP 内部生产工作台”，不是换文案，而是重塑数据模型、页面信息架构、模型网关、审核规则和成本归因。
- 业务模型不贴合：参考项目没有当前 Excel 五层角色 IP 圣经、英歌动作/脸谱/文化视觉校验、文创转化字段。
- 后期维护困难：一旦直接基于参考项目改造，后续每次修改都要同时理解参考项目原架构和当前英歌业务。

## 6. 推荐路线

- 是否建议立刻删除当前代码：不建议，明确不应删除。
- 是否建议冻结当前代码：建议短期冻结 `frontend/` 和 `backend/` 的大改动 1-2 天，只做 rebuild spike 评估；不是永久冻结。
- 是否建议新开 rebuild 分支 / rebuild 目录：建议新开 `rebuild-spike` 分支或独立 `rebuild-spikes/` 目录做验证，不能在当前 `frontend/`、`backend/` 上推翻重来。
- 哪个参考项目适合作为主底座：正式项目不建议使用任一参考项目作为主底座；如果只做 spike，优先用 `huobao-drama` 验证“短剧链路速度”，因为它最接近“剧本 -> 分镜 -> Prompt -> 图/视频/TTS”。
- 哪些参考项目只适合作为模块参考：`waoowaoo` 适合任务队列、成本、模型能力、素材管理；`Toonflow-app` 适合 Agent / Skill / Memory；`huobao-drama` 适合短剧流程和生成链路。
- 最小验证路径：保留当前 PRD/数据模型/页面设计，用 1-2 天在独立 spike 中验证 huobao-drama 或 Toonflow 能否快速改成“武松人物介绍片”的最短链路；验证通过也只是吸收模块设计，不直接复制代码。

推荐路线是选 D + 小范围 C 的混合：当前代码继续保留；参考项目作为模块级借鉴；允许另开 rebuild spike 验证“某参考项目当工程底座是否真能更快”，但不承诺迁移。

## 7. 最小验证计划

目标是在 1-2 天内验证“换底座是否真的更快”，不重做全量系统，不接真实模型 API，不复制代码进当前项目。

### Rebuild Spike 1：本地启动与依赖成本

- 范围：分别尝试启动 `references/huobao-drama`、`references/Toonflow-app`、`references/waoowaoo`。
- 验证项：
  - 是否能在本机无真实 API key 情况下进入主界面。
  - 是否必须配置数据库、Redis、MinIO、FFmpeg、Electron、Docker。
  - 是否存在启动脚本缺失、依赖安装失败、数据库初始化失败。
  - 是否会要求读取或填写真实密钥；如需要，只记录阻塞，不读取密钥。
- 产出：
  - 一张启动成本表。
  - 每个项目的“启动成功 / 部分成功 / 失败 / 未确认”结论。

### Rebuild Spike 2：主题替换与武松样例

- 范围：不改当前项目，只在独立 spike 环境或文档中验证参考项目的信息架构能否承载“英歌水浒人物介绍片”。
- 验证项：
  - 能否把项目主题改成“英歌水浒人物介绍片”。
  - 能否放入角色“武松”：姓名、绰号、武器、脸谱色彩、英歌定位、正向词、负向词。
  - 能否表达角色圣经五层：身份层、内核层、文化视觉层、叙事素材层、商业文化层。
  - 原系统字段是否会卡住英歌业务，例如必须走小说章节、episode、无限画布、通用 drama。
- 产出：
  - 字段适配表。
  - 哪些字段能直接承载，哪些必须改模型。

### Rebuild Spike 3：最短生产链路

- 范围：验证“剧本 -> 分镜 -> Prompt -> 任务 -> 素材”的最短链路，不调用真实模型，用 mock 或空任务。
- 验证项：
  - 能否生成或手工录入 30-60 秒武松介绍文案。
  - 能否拆成 5-8 个分镜。
  - 每个分镜能否绑定角色、场景、图片 Prompt、视频 Prompt、TTS 文本。
  - 能否创建任务状态：排队、处理中、失败、完成。
  - 能否挂载候选素材并标记采纳/拒绝。
  - 完成上述链路所需改动是否少于继续当前 FastAPI 路线。
- 产出：
  - 一个“是否比当前自研更快”的判断。
  - 如果更快，说明快在哪里；如果不快，说明被哪些结构拖慢。

1-2 天判定标准：

| 判定项 | 通过标准 |
|---|---|
| 启动 | 至少一个参考项目能在不接真实模型的情况下进入可操作界面 |
| 主题替换 | 能表达“武松 + 英歌人物介绍片”，不是只改标题 |
| 最短链路 | 能保存/展示剧本、分镜、Prompt、任务、素材候选 |
| 速度 | 改造参考项目的工作量明显少于补齐当前后端 API 和 mock 任务 |
| 风险 | License、技术栈和维护成本没有压过速度收益 |

## 8. 最终建议

明确结论：保留当前代码，另开 rebuild 验证；主路线继续自研，参考项目走模块级借鉴的混合路线。

不建议立刻推翻当前自研代码，也不建议完全基于某个参考项目重做。当前自研版本已经在 PRD、页面、数据模型和后端分层上更贴合英歌 IP 目标；三个参考项目最大的价值是分别提供“任务/成本工程化”“Agent/Skill/Memory”“短剧生成链路”的设计参考，而不是成为正式代码底座。

