# 后端目录结构与代码分层规范 v1

本文档用于在正式初始化后端项目之前，定义 `/Users/huabi/code/AI-video-studio/yingge-app/backend/` 的目录结构、代码分层、命名规范和 AI 模型调用边界。

当前阶段只做架构设计，不写后端业务代码，不初始化后端项目，不连接真实模型 API，不读取 `.env`、key、token、证书文件。

## 1. 设计原则

1. 像 Java 项目一样分层清晰。
   - `app/api/` 类似 Controller。
   - `app/services/` 类似 Service。
   - `app/repositories/` 类似 DAO / Repository。
   - `app/models/` 类似 Entity。
   - `app/schemas/` 类似 DTO / VO。

2. API 层、Service 层、Repository 层、Model 层、Schema 层必须分离。
   - Endpoint 只负责 HTTP 请求和响应。
   - Service 负责业务流程编排。
   - Repository 只负责数据库查询。
   - Model 只负责 SQLAlchemy ORM 映射。
   - Schema 只负责 Pydantic 请求和响应结构。

3. AI 模型调用统一收口。
   - 所有模型调用必须进入 `app/ai/`。
   - 业务代码只能通过 `app/ai/ai_gateway.py` 发起模型调用。
   - 不允许在 endpoint、service、repository、model 中散落 provider client、API key、模型价格和模型能力判断。

4. 文件职责单一。
   - 一个文件只服务一个明确领域对象或一个明确基础设施职责。
   - 不创建 `misc.py`、`common_service.py`、`helper.py` 这类长期变成垃圾桶的文件。
   - 跨模块复用逻辑优先沉到 `app/core/`、`app/utils/` 或清晰命名的 service 中。

5. 目录命名稳定，便于 Codex / AI 阅读。
   - 目录名使用复数领域层：`models`、`schemas`、`services`、`repositories`。
   - 文件名使用小写下划线：`generation_task_service.py`。
   - 类名使用业务名：`GenerationTaskService`、`GenerationTaskRepository`、`GenerationTaskRead`。

6. 第一版不做过度工程化。
   - 使用 FastAPI、PostgreSQL、SQLAlchemy 2.x、Alembic、Pydantic v2、Python 3.11+。
   - 第一版不接真实模型 API，只保留接口和 mock client。
   - 第一版不接真实任务队列，先用 `GenerationTask` 表模拟任务状态。
   - 第一版不接真实对象存储，先保存 URL 或 local path。

## 2. 推荐目录结构

```text
yingge-app/backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py
│   │       ├── projects.py
│   │       ├── characters.py
│   │       ├── scripts.py
│   │       ├── shots.py
│   │       ├── panels.py
│   │       ├── prompts.py
│   │       ├── generation_tasks.py
│   │       ├── assets.py
│   │       ├── reviews.py
│   │       ├── costs.py
│   │       └── exports.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── constants.py
│   │   ├── exceptions.py
│   │   ├── logging.py
│   │   └── security.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── session.py
│   │   └── init_db.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── project.py
│   │   ├── character.py
│   │   ├── character_bible.py
│   │   ├── script.py
│   │   ├── shot.py
│   │   ├── panel.py
│   │   ├── prompt.py
│   │   ├── generation_task.py
│   │   ├── asset.py
│   │   ├── review.py
│   │   ├── cost.py
│   │   ├── export_plan.py
│   │   ├── agent.py
│   │   └── skill.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py
│   │   ├── project.py
│   │   ├── character.py
│   │   ├── script.py
│   │   ├── shot.py
│   │   ├── panel.py
│   │   ├── prompt.py
│   │   ├── generation_task.py
│   │   ├── asset.py
│   │   ├── review.py
│   │   ├── cost.py
│   │   └── export_plan.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── project_repository.py
│   │   ├── character_repository.py
│   │   ├── script_repository.py
│   │   ├── shot_repository.py
│   │   ├── prompt_repository.py
│   │   ├── generation_task_repository.py
│   │   ├── asset_repository.py
│   │   ├── review_repository.py
│   │   └── cost_repository.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── project_service.py
│   │   ├── character_service.py
│   │   ├── character_import_service.py
│   │   ├── script_service.py
│   │   ├── storyboard_service.py
│   │   ├── prompt_service.py
│   │   ├── generation_task_service.py
│   │   ├── asset_service.py
│   │   ├── review_service.py
│   │   ├── cost_service.py
│   │   └── export_plan_service.py
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── ai_gateway.py
│   │   ├── model_registry.py
│   │   ├── model_capabilities.py
│   │   ├── model_pricing.py
│   │   ├── clients/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── openai_client.py
│   │   │   ├── seedance_client.py
│   │   │   ├── minimax_client.py
│   │   │   └── nano_banana_client.py
│   │   └── prompt_templates/
│   │       ├── script_character_intro.md
│   │       ├── storyboard_split.md
│   │       ├── image_prompt.md
│   │       ├── video_prompt.md
│   │       └── critic_review.md
│   ├── tasks/
│   │   ├── __init__.py
│   │   ├── task_runner.py
│   │   ├── mock_task_runner.py
│   │   └── task_status.py
│   ├── storage/
│   │   ├── __init__.py
│   │   ├── storage_service.py
│   │   ├── local_storage.py
│   │   └── url_resolver.py
│   └── utils/
│       ├── __init__.py
│       ├── datetime.py
│       ├── pagination.py
│       └── ids.py
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── tests/
│   ├── conftest.py
│   ├── api/
│   ├── services/
│   ├── repositories/
│   └── ai/
├── scripts/
│   ├── import_character_excel.py
│   └── seed_mock_data.py
├── pyproject.toml
├── alembic.ini
├── .env.example
└── README.md
```

## 3. 每个目录职责说明

### app/main.py

FastAPI 应用入口，负责创建 app、注册中间件、注册 `app/api/v1/router.py`、注册异常处理器和健康检查。

`main.py` 不写业务逻辑，不直接连接模型 API，不直接写数据库查询。

### app/api/

类似 Java Controller。

负责：

- 定义 HTTP 路由。
- 接收 path、query、body 参数。
- 使用 Pydantic schema 校验请求。
- 调用 service。
- 返回 response schema。
- 处理分页、过滤、排序等 API 表层参数。

禁止：

- 写复杂业务逻辑。
- 直接调用 AI client。
- 直接写复杂 SQL。
- 直接操作 SQLAlchemy model 做查询。
- 直接读取 `.env`。

建议：

- `app/api/deps.py` 只放依赖注入，例如数据库 session、当前用户占位、service 构造。
- `app/api/v1/router.py` 统一 include 各业务 router。
- 每个 endpoint 文件对应一个业务资源，例如 `projects.py`、`characters.py`、`generation_tasks.py`。

### app/schemas/

类似 DTO / VO。

负责 Pydantic v2 request / response schema，隔离 API 输入输出和 ORM model。

命名建议：

- `ProjectCreate`：创建请求。
- `ProjectUpdate`：更新请求。
- `ProjectRead`：详情响应。
- `ProjectListItem`：列表项响应。
- `ProjectListResponse`：分页列表响应。
- `ProjectStatus`：必要时定义枚举。

规则：

- schema 可以引用其他 schema，但不要引用 repository 或 service。
- schema 不写数据库查询。
- schema 不写模型调用。
- 前端 mock 数据中的 `Project`、`Character`、`GenerationTask`、`Asset` 等字段，应在后端 schema 中逐步映射为稳定 API 合同。

### app/services/

类似 Java Service。

负责业务流程编排，是后端业务的主组织层。

负责：

- 项目创建、角色选择、脚本生成、分镜拆解、Prompt 生成、任务创建、素材审核、成本记录、导出方案等业务流程。
- 调用 repository 读写数据库。
- 调用 `ai_gateway` 发起 AI 生成或 mock 生成。
- 调用 `generation_task_service` 创建和更新任务状态。
- 调用 `cost_service` 估算和记录成本。
- 调用 `asset_service` 保存生成结果。

禁止：

- 直接写复杂 SQL。
- 直接读取 `.env`。
- 直接实例化 provider client。
- 直接散落模型价格计算。

说明：

- 第一版可以让 service 同步调用 `mock_task_runner`，用 `GenerationTask` 表模拟 `queued -> processing -> completed/failed`。
- 后续接 Celery / Redis / Dramatiq 时，service 的对外方法名和业务语义应保持稳定。

### app/repositories/

类似 DAO / Repository。

负责数据库查询和持久化。

负责：

- 封装 SQLAlchemy 2.x 查询。
- 提供按 id 查询、分页列表、创建、更新、软删除等数据访问方法。
- 管理领域对象之间的常用查询，例如按 project 查询 shots、按 panel 查询 assets。

禁止：

- 写业务流程。
- 调用 service。
- 调用 AI。
- 计算模型成本。
- 读取配置和环境变量。

建议：

- Repository 方法名表达数据访问意图，例如 `list_by_project_id`、`get_with_assets`、`create_many_panels`。
- 复杂查询先写清楚方法名和返回对象，避免 endpoint 层拼 SQL。

### app/models/

类似 Entity。

负责 SQLAlchemy ORM 模型和表结构映射。

负责：

- 定义表名、字段、索引、外键、关系。
- 定义必要 enum 字段。
- 只保留极轻量的表达型属性。

禁止：

- 写业务流程。
- 调用 repository、service、AI。
- 读取配置。
- 在 model 方法中产生外部副作用。

第一版核心模型建议：

- `Project`：生产项目。
- `Character`：英歌水浒角色基础信息。
- `CharacterBible`：角色五层圣经扩展档案。
- `Script`：文案和脚本版本。
- `Shot`：叙事镜头。
- `Panel`：生成绑定单元。
- `Prompt`：图片 Prompt、视频 Prompt、negative prompt、版本和来源字段。
- `GenerationTask`：生图、生视频、TTS、文本生成等任务状态。
- `Asset`：图片、视频、音频、字幕、角色参考图、场景参考图。
- `Review`：素材采纳/拒绝、失败原因、一致性检查结果。
- `Cost`：估算成本和实际成本。
- `ExportPlan`：视频制作方案导出结构。
- `Agent`、`Skill`：第一版只做配置和展示占位，不做复杂 Agent 框架。

### app/ai/

统一管理所有模型调用。

业务代码只能通过 `ai_gateway.py` 调用 AI，不允许绕过 gateway 直接调用 `clients/`。

职责：

- 统一 provider client 接口。
- 管理模型注册表、模型能力、模型定价。
- 管理 prompt templates。
- 提供 mock 结果，支持第一版离线开发。

第一版不接真实 API，只实现接口、mock client 和稳定返回结构。

### app/tasks/

管理任务状态、任务 runner、mock task runner。

职责：

- 定义任务状态流转规则。
- 封装第一版 mock runner。
- 为后续真实队列预留边界。

第一版不接 Celery / Redis / BullMQ，不启动独立 worker。

建议状态：

- `draft`
- `queued`
- `processing`
- `completed`
- `failed`
- `canceled`
- `needs_review`

### app/storage/

管理文件存储抽象。

第一版可以只保存：

- 外部 URL。
- 本地相对路径。
- mock asset path。
- 文件元信息，例如 mime type、duration、width、height、size。

职责：

- 统一生成存储 key 或 local path。
- 统一解析可访问 URL。
- 为后续对象存储保留接口。

禁止：

- 在 service、repository 或 AI client 中到处拼接文件路径。
- 在第一版引入复杂对象存储。

### app/core/

管理配置、日志、异常、安全、常量。

建议：

- `config.py`：Pydantic Settings，集中读取环境变量。
- `logging.py`：日志格式。
- `exceptions.py`：业务异常和统一错误响应。
- `security.py`：第一版仅保留简单占位，不做复杂登录权限。
- `constants.py`：全局稳定常量。

规则：

- 只有 `core/config.py` 可以读取环境变量。
- 其他模块通过注入或 settings 对象使用配置。
- 不允许在业务代码散落 API key 名称和值。

### app/db/

管理数据库 session、Base、初始化。

职责：

- `base.py` 定义 SQLAlchemy Declarative Base，并导入所有 models 供 Alembic 识别。
- `session.py` 定义 engine、sessionmaker、FastAPI db dependency。
- `init_db.py` 只放开发期初始化或 seed 入口。

禁止：

- 在 `db/` 写业务查询。
- 在 `db/` 调 AI。

### app/utils/

通用工具。

适合放：

- 时间格式化。
- ID 生成。
- 分页辅助。
- 纯函数转换。

不适合放：

- 项目业务流程。
- 数据库查询。
- AI 调用。
- 模型价格计算。

### alembic/

数据库迁移目录。

规则：

- 每次模型结构变化必须生成 migration。
- migration 文件只表达数据库结构变化。
- 不在 migration 中调用业务 service 或 AI。

### tests/

测试目录。

建议分层：

- `tests/api/`：接口测试。
- `tests/services/`：业务流程测试。
- `tests/repositories/`：数据访问测试。
- `tests/ai/`：AI gateway 和 mock client 测试。

第一版重点测试：

- endpoint 是否只调用 service。
- service 是否正确创建 `GenerationTask`。
- `ai_gateway` 是否返回稳定 mock 结构。
- cost 估算是否集中在 `model_pricing.py` / `cost_service.py`。

### scripts/

开发和运维脚本。

第一版建议：

- `import_character_excel.py`：导入 `data/英歌水浒角色基础信息.xlsx` 到角色库。
- `seed_mock_data.py`：写入与前端 mock 接近的开发数据。

脚本可以调用 service，但不应绕过领域规则直接写一堆散乱 SQL。

## 4. AI 模型调用层设计

### 4.1 app/ai/ 目录

```text
app/ai/
├── __init__.py
├── ai_gateway.py
├── clients/
│   ├── __init__.py
│   ├── base.py
│   ├── openai_client.py
│   ├── seedance_client.py
│   ├── minimax_client.py
│   └── nano_banana_client.py
├── model_registry.py
├── model_capabilities.py
├── model_pricing.py
└── prompt_templates/
    ├── script_character_intro.md
    ├── storyboard_split.md
    ├── image_prompt.md
    ├── video_prompt.md
    └── critic_review.md
```

### 4.2 文件职责

`ai_gateway.py`

- 业务层唯一可调用的 AI 入口。
- 根据任务类型、模型配置和能力选择 provider client。
- 统一返回结构，例如 `AiGenerationResult`。
- 第一版返回 mock 结果，不发真实网络请求。
- 可以被 `script_service.py`、`storyboard_service.py`、`prompt_service.py`、`generation_task_service.py` 调用。

`clients/base.py`

- 定义统一 provider client 接口。
- 建议接口覆盖文本生成、生图、生视频、TTS。
- 返回值必须是内部统一结构，不把 provider 原始响应直接暴露给 service。

`clients/openai_client.py`

- 未来承接 OpenAI 文本和 `gpt-image-2` 相关调用。
- 第一版只实现 mock 方法或占位接口。

`clients/seedance_client.py`

- 未来承接 Seedance 2.0 生视频。
- 第一版只返回 mock video asset metadata。

`clients/minimax_client.py`

- 未来承接 MiniMax TTS。
- 第一版只返回 mock audio asset metadata。

`clients/nano_banana_client.py`

- 未来承接 nano banana 生图。
- 第一版只返回 mock image asset metadata。

`model_registry.py`

- 管模型注册配置。
- 维护 provider、model name、display name、任务类型、是否启用。
- 不保存真实 API key。

`model_capabilities.py`

- 管模型能力。
- 例如：
  - 文本生成。
  - 图片生成。
  - 参考图生图。
  - 多候选。
  - 图生视频。
  - 首帧生视频。
  - 首尾帧生视频。
  - TTS。
  - 支持时长、比例、分辨率。

`model_pricing.py`

- 管成本估算。
- 按 provider、model、任务类型、数量、时长、字符数等计算估算成本。
- 第一版可以使用 mock 定价。
- 不允许在 service、endpoint、client 中散落价格计算。

`prompt_templates/`

- 管提示词模板。
- 每个模板只负责一个明确任务。
- 模板文件可以带变量占位，但不直接调用模型。
- 第一版模板可先作为文档占位，不要求完善 Prompt 工程。

### 4.3 统一调用链

```text
API Endpoint
→ Service
→ GenerationTask
→ ai_gateway
→ provider client
→ Asset / Task / CostRecord
```

展开说明：

1. `app/api/v1/prompts.py` 接收“为某个 panel 生成图片 Prompt”的请求。
2. `prompt_service.py` 校验项目、角色、shot、panel 上下文。
3. `generation_task_service.py` 创建 `GenerationTask`，状态为 `queued`。
4. `prompt_service.py` 或 `generation_task_service.py` 调用 `ai_gateway.py`。
5. `ai_gateway.py` 选择 mock provider client。
6. provider client 返回统一 mock 结果。
7. `asset_service.py` 保存生成结果为 `Asset`。
8. `cost_service.py` 根据 `model_pricing.py` 记录 `CostRecord`。
9. `generation_task_service.py` 更新任务为 `completed` 或 `failed`。

### 4.4 AI 层边界

允许：

- Service 调用 `ai_gateway`。
- `ai_gateway` 调用 provider client。
- `ai_gateway` 查询 `model_registry`、`model_capabilities`、`model_pricing`。
- Service 根据 AI 返回结果创建任务、素材、成本记录。

禁止：

- Endpoint 直接调用 provider client。
- Repository 调用 `ai_gateway`。
- AI client 直接操作数据库。
- AI client 直接创建 `Asset`、`GenerationTask`、`CostRecord`。
- 模型 API key 出现在 service、repository、endpoint、model 中。

## 5. 业务模块和文件命名建议

### 5.1 API endpoints

建议文件：

- `projects.py`：项目列表、创建项目、更新项目、项目概览。
- `characters.py`：角色库、角色详情、角色导入预览、项目角色快照。
- `scripts.py`：脚本文案生成、脚本版本、脚本确认。
- `shots.py`：分镜列表、分镜创建、分镜排序、分镜确认。
- `panels.py`：Panel 列表、Panel 生成单元、首尾帧关系。
- `prompts.py`：图片 Prompt、视频 Prompt、negative prompt、Prompt 版本。
- `generation_tasks.py`：任务创建、任务列表、任务状态、重试、取消。
- `assets.py`：素材列表、素材详情、素材候选、素材绑定。
- `reviews.py`：采纳、拒绝、失败原因、一致性检查结果。
- `costs.py`：项目成本、任务成本、模型成本拆分。
- `exports.py`：视频制作方案导出结构。

### 5.2 services

建议文件：

- `project_service.py`：项目生命周期和项目统计。
- `character_service.py`：角色库查询、角色详情、角色快照。
- `character_import_service.py`：Excel 角色圣经导入和字段映射。
- `script_service.py`：脚本文案生成、编辑、版本。
- `storyboard_service.py`：脚本拆分 Shot、Shot 拆 Panel。
- `prompt_service.py`：图片 Prompt、视频 Prompt、negative prompt 生成与版本。
- `generation_task_service.py`：任务创建、状态流转、重试、取消。
- `asset_service.py`：素材保存、绑定、候选管理。
- `review_service.py`：采纳/拒绝、失败原因、质检记录。
- `cost_service.py`：成本估算、实际成本记录、汇总。
- `export_plan_service.py`：视频制作方案汇总导出。

### 5.3 repositories

建议文件：

- `project_repository.py`
- `character_repository.py`
- `script_repository.py`
- `shot_repository.py`
- `prompt_repository.py`
- `generation_task_repository.py`
- `asset_repository.py`
- `review_repository.py`
- `cost_repository.py`

说明：

- `panel` 可以先放在 `shot_repository.py` 中管理，也可以后续独立为 `panel_repository.py`。如果 Panel 查询复杂度上升，应独立出来。
- Repository 文件应保持数据访问职责，不写生成流程。

### 5.4 models

建议文件：

- `project.py`
- `character.py`
- `character_bible.py`
- `script.py`
- `shot.py`
- `panel.py`
- `prompt.py`
- `generation_task.py`
- `asset.py`
- `review.py`
- `cost.py`
- `export_plan.py`
- `agent.py`
- `skill.py`

### 5.5 schemas

建议文件：

- `project.py`
- `character.py`
- `script.py`
- `shot.py`
- `panel.py`
- `prompt.py`
- `generation_task.py`
- `asset.py`
- `review.py`
- `cost.py`
- `export_plan.py`
- `common.py`

每个 schema 文件内优先按以下顺序组织：

1. enum / literal 类型。
2. base schema。
3. create schema。
4. update schema。
5. read schema。
6. list item schema。
7. list response schema。

## 6. 分层调用规则

### 6.1 明确禁止

- endpoint 直接查数据库。
- endpoint 直接调用 AI client。
- endpoint 直接读取 `.env`。
- repository 调用 service。
- repository 调用 AI。
- repository 计算模型价格。
- model 写业务逻辑。
- model 调用外部服务。
- AI client 直接操作数据库。
- AI client 创建或更新 `GenerationTask`、`Asset`、`CostRecord`。
- Service 直接读 `.env`。
- 到处散落模型 API key。
- 到处散落模型价格计算。
- 到处散落 provider/model 能力判断。
- 在 `utils/` 堆业务流程。
- 从 `references/` 复制代码到后端项目。

### 6.2 推荐调用

```text
endpoint -> service -> repository
endpoint -> service -> ai_gateway -> provider client
service -> generation_task_service -> repository
service -> cost_service -> repository
service -> asset_service -> repository
service -> review_service -> repository
```

### 6.3 典型业务调用示例

生成图片候选：

```text
POST /api/v1/generation-tasks
→ generation_tasks.py
→ generation_task_service.create_image_task()
→ prompt_repository.get_prompt()
→ generation_task_repository.create()
→ ai_gateway.generate_image()
→ openai_client 或 nano_banana_client mock
→ asset_service.create_candidate_asset()
→ cost_service.record_estimated_and_actual_cost()
→ generation_task_repository.mark_completed()
```

采纳素材：

```text
POST /api/v1/reviews/{asset_id}/accept
→ reviews.py
→ review_service.accept_asset()
→ asset_repository.get()
→ asset_repository.mark_accepted()
→ review_repository.create_accept_record()
→ shot_repository.bind_asset_to_panel()
```

导出制作方案：

```text
GET /api/v1/exports/{project_id}/production-plan
→ exports.py
→ export_plan_service.build_project_plan()
→ project_repository.get()
→ shot_repository.list_by_project_id()
→ prompt_repository.list_by_project_id()
→ asset_repository.list_accepted_by_project_id()
→ cost_repository.summary_by_project_id()
```

## 7. 第一版后端不做什么

第一版后端目标是把数据模型、API 合同、任务状态和 mock 生成链路跑通，不追求完整生产基础设施。

明确不做：

- 不接真实模型 API。
- 不做真实视频生成。
- 不做真实任务队列。
- 不做真实对象存储。
- 不做复杂登录权限。
- 不做支付。
- 不做复杂 Agent 框架。
- 不做多租户。
- 不做完整剪辑器。
- 不做发布平台对接。
- 不做真实 FFmpeg 合成。
- 不做复杂 Memory / RAG / 向量数据库。

第一版只做：

- PostgreSQL 表结构。
- FastAPI API 骨架。
- SQLAlchemy 2.x model 和 repository。
- Pydantic v2 schema。
- `GenerationTask` 表模拟任务状态。
- `app/ai/` mock client。
- `Asset` 保存 mock URL 或 local path。
- `CostRecord` 保存 mock 估算和实际成本。

## 8. 适合 Codex 的开发规则

后续 Codex 在本项目写后端代码时，必须遵守以下规则：

1. 新功能先看本文档。
   - 文件路径：`/Users/huabi/code/AI-video-studio/docs/02-architecture/backend-directory-structure-v1.md`。
   - 不确定分层时，优先按本文档处理。

2. 每次任务先写计划。
   - 计划文件放在 `docs/changes/xxx-plan.md`。
   - 计划必须说明涉及哪些层：API、schema、service、repository、model、ai、tasks、storage。
   - 小修可以简短，但不能无计划大改。

3. 新 API 的顺序。
   - 先建或更新 schema。
   - 再建 service 方法。
   - 再建 repository 方法。
   - 再接 endpoint。
   - 最后补测试。

4. 所有 AI 调用只能进 `app/ai/`。
   - endpoint 不碰 AI client。
   - repository 不碰 AI client。
   - service 只能调用 `ai_gateway`。

5. 所有数据库查询只能进 repositories。
   - endpoint 不直接查数据库。
   - service 不写复杂 SQL。
   - repository 方法名要表达业务查询意图。

6. 不允许一次性大改多个层。
   - 一次任务只围绕一个业务能力闭环。
   - 如果必须跨层修改，按 schema -> model -> repository -> service -> endpoint -> tests 的顺序推进。

7. 不允许复制 references/ 代码。
   - `references/` 只读。
   - 可以借鉴 `Task`、`ModelCapabilities`、`UsageCost`、`Asset`、`Agent/Skill` 等设计思想。
   - 必须用本项目自己的命名、领域模型和代码实现。

8. 不读取敏感文件。
   - 不读取 `.env`、key、token、证书文件。
   - 只可以读取 `.env.example`。

9. 业务命名要贴合当前产品。
   - 使用 `Project`、`Character`、`Script`、`Shot`、`Panel`、`Prompt`、`GenerationTask`、`Asset`、`Review`、`Cost`、`ExportPlan`。
   - 不把参考项目里的 `NovelPromotionProject`、`GraphRun` 等名称照搬到正式领域模型。

10. 保持第一版克制。
    - 不提前引入真实队列。
    - 不提前引入对象存储。
    - 不提前引入复杂 Agent 编排。
    - 先保证 MVP 后端像 Java 项目一样清楚、可读、可维护。

## 9. 后续任务建议

### 9.1 下一步

下一步应该设计：

```text
docs/02-architecture/backend-data-model-and-api-design-v1.md
```

该文档应明确：

- PostgreSQL 表设计。
- SQLAlchemy model 字段。
- API 路由清单。
- request / response schema。
- `Character` 与 Excel 角色圣经字段映射。
- `Shot` 与 `Panel` 的边界。
- `Prompt`、`GenerationTask`、`Asset`、`Review`、`CostRecord` 的关系。
- 前端 mock 数据如何映射到正式 API。

### 9.2 再下一步

再下一步才初始化 backend 项目：

```text
yingge-app/backend/
```

初始化时只创建骨架、依赖、空目录、基础配置和健康检查，不接真实模型 API。

### 9.3 后续每个后端 Phase 如何使用本目录规范

Phase Backend 1：数据模型与 API 设计

- 以本文档目录结构为边界。
- 先完成 `backend-data-model-and-api-design-v1.md`。
- 不写正式后端代码。

Phase Backend 2：后端项目初始化

- 创建 `yingge-app/backend/`。
- 创建 FastAPI、SQLAlchemy、Alembic、Pydantic 基础骨架。
- 建立 `app/api/`、`app/services/`、`app/repositories/`、`app/models/`、`app/schemas/` 等目录。
- 只做 health check 和基础配置。

Phase Backend 3：核心数据模型落地

- 实现 `Project`、`Character`、`CharacterBible`、`Script`、`Shot`、`Panel`。
- 建 Alembic migration。
- 建 repository 和基础 API。

Phase Backend 4：生产链路落地

- 实现 `Prompt`、`GenerationTask`、`Asset`、`Review`、`Cost`。
- 使用 `GenerationTask` 表模拟任务状态。
- 接前端 `/generation-workspace` 和 `/asset-review` 需要的接口。

Phase Backend 5：AI mock gateway

- 实现 `app/ai/ai_gateway.py` 和 mock clients。
- 支持脚本、分镜、Prompt、生图、生视频、TTS 的 mock 返回。
- 成本估算从 `model_pricing.py` 和 `cost_service.py` 统一产生。

Phase Backend 6：Excel 角色导入

- 实现 `character_import_service.py`。
- 导入 `data/英歌水浒角色基础信息.xlsx`。
- 映射到 `Character`、`CharacterBible` 和 Prompt 关键词结构。

Phase Backend 7：前后端联调

- 用正式 API 替换 `yingge-app/frontend/data/mock/`。
- 保持前端六个页面的数据结构稳定。
- 不在联调时破坏本文档分层边界。

## 10. 本文参考输入

本文设计参考了以下本项目文档和 mock 数据目录：

- `/Users/huabi/code/AI-video-studio/CODEX_RULES.md`
- `/Users/huabi/code/AI-video-studio/docs/06-prd/PRD-v1.0.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-module-spec-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-static-prototype-plan-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-plan-source-reference-patch.md`
- `/Users/huabi/code/AI-video-studio/docs/01-source-analysis/reference-projects-frontend-workflow-audit.md`
- `/Users/huabi/code/AI-video-studio/docs/05-tasks/static-prototype-acceptance-report-v1.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/`

本文未修改 `/Users/huabi/code/AI-video-studio/references/`，未读取 `.env`、key、token、证书文件，未连接真实 API。
