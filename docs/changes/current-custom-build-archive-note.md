# 当前自研版本归档说明

## 1. 当前版本完成情况

当前自研版本已经完成一轮从产品设计到工程骨架的 MVP 准备工作：

- 前端静态原型，覆盖 `/dashboard`、`/characters`、`/characters/wusong`、`/script-studio`、`/generation-workspace`、`/asset-review`。
- 后端 FastAPI 骨架，已按 API、Service、Repository、Model、Schema 分层。
- PostgreSQL / SQLAlchemy / Alembic 基础结构。
- ORM 模型，覆盖项目、角色、角色圣经、剧本、Shot、Panel、Prompt、生成任务、素材、审核、成本、导出方案等核心对象。
- Seed mock 数据，用于支撑当前页面和第一批 API 验证。
- 第一批 GET API，覆盖项目、角色、剧本、镜头、Panel、Prompt、任务、素材、审核、成本和导出。
- Dashboard / Character Library 已初步完成前后端 API 联调。

## 2. 当前版本保留价值

后续即使进入 rebuild，也仍应参考当前版本沉淀的内容：

- PRD：明确产品不是通用 AI 短剧平台，而是 AI 英歌漫剧内容生产工作台。
- UI 页面结构：已形成角色库、角色圣经、剧本分镜、Prompt 生成、素材审核、导出方案的闭环。
- 视觉规范：Ink & Cinnabar Production 方向更贴合英歌非遗和国风漫剧气质。
- 中文文案规范：当前页面已形成中文主导、英文技术词辅助的工作台表达。
- 数据模型：`Project`、`Character`、`CharacterBible`、`Script`、`Shot`、`Panel`、`PromptDraft`、`GenerationTask`、`Asset`、`AssetReview`、`CostRecord` 等对象仍是后续重做的重要参考。
- API 设计：第一批 GET API 已体现前后端契约方向。
- seed 数据：可继续作为演示、验收和回归样本。
- 业务链路：角色 IP 圣经 -> 剧本 -> 分镜 -> Prompt -> 生成任务 -> 素材采纳/拒绝 -> 成本与导出。

## 3. 暂停原因

用户决定暂停当前自研路线，转向基于参考项目改造，以提高开发速度和安全感。当前暂停不是因为现有方向失效，而是为了在正式继续投入前，验证参考项目是否能作为更快的工程底座。

## 4. 后续重做原则

- 当前代码作为归档保留。
- 不直接删除当前代码。
- 新建 rebuild 分支进行验证和重做。
- `references/` 下项目只作为参考，不直接污染当前 main。
- 后续重做仍以当前 PRD 和验收报告作为标准。
