# AI 英歌漫剧生产工作台系统设计 Skill

本文不是某个功能模块的开发说明，而是当前项目的**长期系统设计准则**。主线程后续开发任何模块时，都应先对照本文，避免把系统做成散装 AI 工具集合。

适用范围：

- 项目中心
- 剧本
- 分镜
- 角色中心
- 风格模板库
- 生成任务流
- 关键帧
- 生视频
- 素材库
- 成片归档
- 成本与复盘

核心目标：

> 把“AI 英歌漫剧生产工作台”做成资产驱动、任务可追溯、质量可复盘的内容生产系统，而不是一堆彼此独立的生成按钮。

---

## 1. 项目级核心原则

### 1.1 资产先行

所有生成都必须尽量基于已沉淀资产，而不是只靠自然语言 prompt。

资产包括：

- 剧本版本
- 场次
- 分镜卡
- 角色档案
- 脸谱参考
- 真人妆照四面
- 风格模板
- 角色生成资产
- 场景资产
- 道具资产
- 关键帧
- 视频片段
- prompt 模板
- 生成任务记录

后续任何模块设计时要问：

> 这个功能会沉淀什么资产？后续谁会复用它？

如果没有资产沉淀，只是一次性生成，应谨慎开发。

### 1.2 分镜卡是生产中枢

分镜卡不是普通文本记录，而是连接故事、角色、风格、关键帧和视频的核心生产单元。

分镜卡应逐步承载：

- 剧情目标
- 时间段
- 场景
- 角色
- 道具
- 动作
- 情绪
- 景别
- 角度
- 构图
- 运镜
- 光影
- 台词/旁白
- 音效/音乐方向
- 生图 prompt
- 生视频 prompt
- 绑定参考资产
- 关键帧结果
- 视频结果
- 生成任务
- 成本记录

后续关键帧、生视频、素材归档都应围绕分镜卡展开。

### 1.3 任务驱动，不做散装按钮

任何模型调用都应落为任务。

不要出现：

```text
点按钮 → 调模型 → 页面显示结果 → 没记录
```

应该是：

```text
创建任务 → 记录输入快照 → 组装 prompt → 调模型 → 保存输出 → 写入资产 → 可复盘
```

任务是系统可追溯的骨架。

### 1.4 半自动优先，人工采纳

AI 可以生成草案，但不要直接污染正式资产。

所有 AI 输出默认进入候选区：

- 剧本版本候选
- 分镜草案候选
- 角色生成资产候选
- 关键帧候选
- 视频片段候选

用户确认后再：

- 定稿
- 采纳
- 设为主图
- 标记最佳版本
- 进入下游生产

### 1.5 Prompt 是生产资产

Prompt 不能散写在业务代码里长期存在。短期可代码内配置，但中长期必须模板化、版本化、可测试。

Prompt 应具备：

- 模块归属
- 模型兼容性
- 输入变量
- 输出格式
- 负面约束
- 版本号
- 测试样例
- 成功/失败记录

### 1.6 失败可复盘，任务可重试

AI 生产天然有失败和抽卡。系统必须记录失败，而不是掩盖失败。

每次任务至少记录：

- 使用了什么模型
- 输入了哪些资产
- prompt 是什么
- 参数是什么
- 输出是什么
- 错误是什么
- 成本是多少
- 用户是否采纳

---

## 2. 从开源系统迁移来的项目级思想

### 2.1 LumenX：SOP 流水线

参考项目：https://github.com/alibaba/lumenx

迁移原则：

```text
资产提取 → 风格定调 → 资产生成 → 分镜脚本 → 分镜图 → 分镜视频 → 合成
```

对本项目的长期影响：

- 剧本之后要提取角色、场景、道具。
- 风格模板应成为全局约束，而不是角色私有图。
- 分镜生成关键帧时必须绑定角色、场景、道具资产。
- 视频生成要支持多版本抽卡和最佳版本选择。

### 2.2 Toonflow：阶段与质量门

参考项目：https://github.com/HBAI-Ltd/Toonflow-app

迁移原则：

```text
决策 → 执行 → 监督
```

本项目不一定马上做多 Agent，但要吸收它的阶段思想：

- 剧本定稿前检查结构。
- 分镜生成后检查字段完整和资产引用。
- 关键帧采纳前检查角色一致性。
- 视频片段采纳前检查动作、运镜、画面稳定性。

质量门先人工 checklist，后续再 AI 审核。

### 2.3 LocalMiniDrama：断点补全与重试

参考项目：https://github.com/xuanyustudio/LocalMiniDrama

迁移原则：

- 一键生成不够，必须支持“补全并生成”。
- 已完成的不重复生成。
- 失败任务可重试。
- 生成过程显示步骤和错误日志。

对本项目影响：

- 分镜关键帧可以只补缺失帧。
- 角色四视图可以只补缺失角度。
- 视频片段可以只重试失败镜头。
- 项目级生产链路应能从中断处继续。

### 2.4 huobao-drama：Skill 化提示词

参考项目：https://github.com/chatfire-AI/huobao-drama

迁移原则：

把生产能力拆成 Skill：

- 剧本改写 Skill
- 角色/场景提取 Skill
- 分镜拆解 Skill
- 图片提示词 Skill
- 视频提示词 Skill
- 配音分配 Skill
- 宫格图 Skill

对本项目影响：

- 后续 PromptTemplate 应升级为 SkillTemplate。
- 每个 Skill 有输入、输出、约束、示例、质量要求。
- 模型调用模块只执行 Skill，不临时拼 prompt。

### 2.5 waoowaoo：Prompt 资产分区

参考项目：https://github.com/saturndec/waoowaoo

迁移原则：

Prompt 需要按能力分区，例如：

- character-reference
- screenplay
- storyboard
- image-generation
- video-generation
- model-api-config

对本项目影响：

- 角色参考图转描述、角色设定图、场景稳定锚点、道具抽取都应有独立模板。
- Prompt 版本应和生成任务绑定。

### 2.6 FastMovieAI：平台化能力后置

参考项目：https://github.com/xhadmincn/FastMovieAI

迁移原则：

- WebSocket/SSE 任务进度可学。
- 模型插件化配置可学。
- 用户、支付、积分、多租户暂不学。

对本项目影响：

- 当前 MVP 是内部生产工作台，不要被 SaaS 化能力带偏。
- 先把生产链路做好，再做平台化外围能力。

---

## 3. 系统对象分层

### 3.1 故事层

负责“讲什么”：

- Project
- Script
- ScriptVersion
- Scene

核心要求：

- 剧本要有版本。
- 场次要结构化。
- 剧本是分镜和资产提取的源头。

### 3.2 分镜层

负责“怎么拍”：

- Shot
- ShotVersion
- ShotPrompt
- ShotAssetBinding

核心要求：

- 分镜卡是生产中枢。
- 每个分镜绑定角色、场景、道具、风格。
- 分镜要输出 image_prompt 和 video_prompt。

### 3.3 角色/IP层

负责“谁出现”：

- Character
- CharacterReferenceAsset
- CharacterGeneratedAsset
- AcceptedCharacterAsset

核心要求：

- 脸谱单图化。
- 真人妆照四面。
- AI 生成资产不直接污染参考图库。
- 已采纳资产才进入关键帧生产。

### 3.4 风格层

负责“长什么画风”：

- StyleTemplate
- StyleAnalysisResult

核心要求：

- 风格模板全局共用。
- 风格截图只是来源，最终要沉淀结构化模板。
- 生图和生视频都应复用风格模板。

### 3.5 生成任务层

负责“模型做了什么”：

- GenerateTask
- CostRecord
- ModelConfig
- PromptTemplate / SkillTemplate

核心要求：

- 所有模型调用都落任务。
- 任务记录输入快照、prompt、参数、输出、错误、成本。
- 支持重试、继续、取消。

### 3.6 素材层

负责“文件在哪里”：

- Asset
- AssetVersion
- AssetRelation

核心要求：

- 图片/视频存 COS。
- 数据库存元数据和 URL/object_key。
- 删除默认软删除。
- 所有资产可追溯来源。

### 3.7 成片层

负责“最终交付”：

- FinalCut
- FinalCutVersion
- ReviewNote

核心要求：

- 成片绑定项目、分镜、视频片段、素材。
- 成片有版本和复盘备注。

---

## 4. 标准生产链路

长期目标链路：

```text
项目创建
  ↓
剧本生成/改写
  ↓
场次拆分
  ↓
角色/场景/道具提取
  ↓
角色参考图库补齐
  ↓
全局风格模板选择/识别
  ↓
角色生成资产
  ↓
人工采纳角色资产
  ↓
分镜生成/编辑
  ↓
关键帧生成
  ↓
人工采纳关键帧
  ↓
生视频提示词生成
  ↓
视频片段生成
  ↓
选择最佳版本
  ↓
素材归档
  ↓
成片归档/复盘
```

任何新功能都应能放进这条链路，否则要重新判断是否值得做。

---

## 5. GenerateTask 项目级规范

所有生成任务建议统一字段：

```text
id
task_type
generation_type
project_id
script_id
scene_id
shot_id
character_id
style_template_id
model_provider
model_name
model_version
status
current_step
progress
input_asset_ids
output_asset_ids
prompt_template_id
prompt_version
prompt_text
negative_prompt
params_json
input_snapshot_json
error_code
error_message
retry_of_task_id
cost_json
created_at
updated_at
started_at
finished_at
```

不是所有字段每个任务都必填，但结构要统一。

状态建议：

```text
queued
running
completed
failed
cancelled
```

步骤建议按任务类型细分，但至少有：

```text
assembling_prompt
calling_model
uploading_result
writing_asset
completed
failed
```

---

## 6. Prompt / SkillTemplate 项目级规范

### 6.1 PromptTemplate

用于较简单的模板：

```text
id
name
module
template_type
model_family
variables_json
output_schema_json
content
negative_content
version
status
created_at
updated_at
```

### 6.2 SkillTemplate

用于复杂生产能力：

```text
id
name
description
module
input_contract_json
output_contract_json
system_prompt
user_prompt_template
negative_prompt
rules_markdown
examples_json
quality_checklist_json
model_family
version
status
created_at
updated_at
```

建议先做 PromptTemplate，后续再升级 SkillTemplate。

---

## 7. 分镜卡项目级规范

分镜卡至少应逐步具备：

```text
shot_number
scene_id
time_range
story_goal
description
characters
scene
props
emotion
action
dialogue
narration
shot_size
camera_angle
composition
camera_movement
lighting
duration
image_prompt
video_prompt
video_prompt_segments
sound_effect_prompt
bgm_prompt
reference_asset_ids
keyframe_asset_ids
video_asset_ids
status
```

质量规则：

- 内容忠实剧本。
- 角色出现即绑定资产。
- 场景必须绑定。
- 台词和时长匹配。
- 动作和朝向连续。
- 无台词镜头避免过长。
- 生图 prompt 讲单帧画面。
- 生视频 prompt 讲动作、时间推进和运镜。

---

## 8. 角色资产项目级规范

角色中心应分三层：

### 8.1 参考输入

人工上传，可信度最高：

- 脸谱单图
- 真人全身正面
- 真人半侧身（1）
- 真人半侧身（2）
- 真人背后
- 补充参考图

### 8.2 AI 生成资产

模型生成，先进入候选：

- 三视图
- 四视图
- 风格转换图
- 表情表
- 动作姿态图
- 服饰拆解图
- 武器道具图
- 关键帧测试图

### 8.3 已采纳资产

人工确认，可进入生产：

- 角色标准图
- 可用于关键帧
- 可用于视频参考
- 风格基准图

原则：

> 参考图用来锁身份，风格模板用来锁画风，生成资产用来探索，采纳资产才进入生产。

---

## 9. 英歌题材特别规则

本项目不是通用漫剧系统，必须保留英歌特色。

### 9.1 角色一致性重点

不仅是脸，还包括：

- 脸谱纹样
- 头饰
- 服饰纹样
- 腰带/鞋靴/背部结构
- 武器/道具
- 身段
- 队列位置
- 人物气质

### 9.2 建议后续新增动作资产库

英歌动作是关键资产：

- 踏步
- 挥槌
- 转身
- 亮相
- 对打
- 队列行进
- 鼓点卡拍

视频生成提示词应尽量复用动作资产，而不是每次临时描述。

### 9.3 建议后续新增场景锚点

场景资产应包含可站位锚点：

- 祠堂门口中央
- 鼓阵左侧
- 街巷转角
- 舞台前景右侧
- 队列后方

这样关键帧中角色位置更稳定。

---

## 10. 开发时的检查清单

主线程每开发新模块前，应回答：

1. 这个模块属于哪一层：故事、分镜、角色、风格、生成任务、素材、成片？
2. 它产生什么资产？
3. 它复用什么已有资产？
4. 是否需要 GenerateTask？
5. 是否需要 PromptTemplate / SkillTemplate？
6. 输出是否先进入候选区，而不是直接污染正式资产？
7. 是否支持失败记录和重试？
8. 是否有人工确认节点？
9. 是否能被后续分镜、关键帧或视频复用？
10. 是否保留英歌题材特色？

如果这些问题答不清，先不要写代码。

---

## 11. 对主线程的固定提示词

后续主线程可以在每次新模块开发前阅读这段：

```text
请先阅读并遵守：
/Users/huabi/code/AI-video-studio/docs/research/ai-yingge-studio-system-design-skill.md

本项目不是通用 AI 工具集合，而是 AI 英歌漫剧生产工作台。所有功能都要围绕资产沉淀、分镜卡中枢、GenerateTask 可追溯、Prompt 模板化、人工采纳和英歌题材一致性设计。不要做散装按钮；模型调用必须落任务；AI 输出先进入候选资产区，用户采纳后才进入正式生产链路。
```

