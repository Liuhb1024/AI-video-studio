# 开源 AI 短漫剧系统调研迁移说明（给主线程）

本文用于把 6 个开源项目的优秀设计点迁移到当前“AI 英歌漫剧生产工作台”。主线程可按本文继续产品与开发，不需要重新调研。

## 1. 调研项目

| 项目 | 地址 | 核心定位 | 最值得迁移的点 |
|---|---|---|---|
| LumenX | https://github.com/alibaba/lumenx | AI 短漫剧一站式生产平台 | SOP 流水线、资产先行、分镜与视频抽卡 |
| Toonflow-app | https://github.com/HBAI-Ltd/Toonflow-app | AI 漫画/分镜生产 Agent 系统 | 决策层/执行层/监督层、阶段质量门 |
| LocalMiniDrama | https://github.com/xuanyustudio/LocalMiniDrama | 本地短剧助手 | 补全式流水线、失败重试、全能分镜模式 |
| huobao-drama | https://github.com/chatfire-AI/huobao-drama | Agent + Skill 短剧生成系统 | Skill 文件化、分镜字段规范、宫格提示词 |
| waoowaoo | https://github.com/saturndec/waoowaoo | AI 短剧/小说推广生产系统 | Prompt 资产分区、角色/场景/道具抽取规则 |
| FastMovieAI | https://github.com/xhadmincn/FastMovieAI | 商用化短剧平台 | 插件化、WebSocket 任务推送、模型配置后台 |

## 2. 对我们当前系统的总体结论

当前系统的方向是对的：先做角色资产、参考图库、风格模板库、生成资产区，再做生成任务流。6 个项目共同说明一件事：

> AI 漫剧系统不能做成“散装生图按钮”，必须做成“资产驱动 + 任务可追溯 + 人工质量门”的生产流水线。

因此下一步 `角色生图任务流 MVP` 建议升级为：

1. 任务可追溯：每次生成都落 `GenerateTask`。
2. 步骤可见：任务不只有 `queued/completed`，还要有 `step`。
3. 可失败重试：任务失败保留输入快照和 prompt，可重试。
4. 输出不污染：生成结果进入 `角色生成资产区`，不直接进入参考图库。
5. 人工采纳：用户满意后再标记为可用于关键帧。

## 3. 下一模块建议：角色生图任务流 MVP

### 3.1 必须支持的任务类型

第一版建议只支持两类：

1. `角色四视图生成`
   - 输入：脸谱单图、真人妆照四面、角色档案、全局风格模板、用户补充 prompt。
   - 输出：角色四视图或标准设定图。
   - 用途：形成角色视觉标准。

2. `真人妆照风格转换`
   - 输入：一张真人妆照、全局风格模板、用户补充 prompt。
   - 输出：该真人参考图的漫剧风格重绘图。
   - 用途：为关键帧生成提供风格化角色参考。

暂不建议第一版做表情表、动作姿态、服饰拆解、武器道具。这些等任务流跑通后加。

### 3.2 GenerateTask 建议字段

```text
id
task_type                 # character_image_generation
generation_type           # four_view / style_transfer
project_id
character_id
model_provider
model_name
model_version
status                    # queued / running / completed / failed / cancelled
current_step              # assembling_prompt / calling_model / uploading_result / writing_asset / completed / failed
progress                  # 0-100
input_asset_ids           # 使用的脸谱、真人妆照等
style_template_id
prompt_template_id
prompt_version
prompt_text
negative_prompt
params_json
input_snapshot_json       # 发起任务时的角色字段、参考图 URL、风格字段快照
output_asset_ids
error_code
error_message
retry_of_task_id
cost_json
created_at
updated_at
started_at
finished_at
```

### 3.3 任务步骤建议

```text
queued
  ↓
assembling_prompt
  ↓
calling_model
  ↓
uploading_result
  ↓
writing_asset
  ↓
completed
```

失败时进入：

```text
failed
```

重试时复制旧任务输入快照，创建新任务，`retry_of_task_id` 指向旧任务。

### 3.4 前端交互建议

角色详情页的生图工作台不要只放一个按钮，建议做成：

1. 选择生成模式：四视图 / 风格转换。
2. 选择模型。
3. 选择输入参考图。
4. 选择全局风格模板。
5. 显示自动组装 prompt，可手动微调。
6. 点击“发起生成”。
7. 右侧或底部显示任务进度。
8. 完成后结果进入生成资产区。

### 3.5 Mock 策略

模型调用先 mock，但任务流必须模拟真实链路：

1. 组装 prompt。
2. 写入任务为 running。
3. 模拟 calling_model。
4. 生成一条 mock output asset 或先不生成图，仅完成任务。
5. 任务 completed。

推荐第一版 mock 生成 asset 记录时，使用占位图 URL 或复用输入图作为结果，便于验证“结果进入生成资产区”。

## 4. Prompt / Skill 模板化建议

借鉴 waoowaoo、huobao-drama、Toonflow，不建议把 prompt 写死在后端函数里。建议后续新增 `PromptTemplate` 或 `SkillTemplate`：

```text
id
name
module                   # script / storyboard / character_image / style_analysis / keyframe / video
template_type            # system / user / negative / output_schema
model_family             # gemini / seedream / gpt-image / general
variables_json           # 输入变量定义
output_schema_json
content
version
status
created_at
updated_at
```

优先模板：

1. 角色四视图生成模板。
2. 真人妆照风格转换模板。
3. 风格截图识别模板。
4. 关键帧生成模板。
5. 生视频提示词模板。

## 5. 质量门建议

借鉴 Toonflow 的监督层，但 MVP 不做复杂多 Agent。先做轻量质量门：

1. 分镜生成后检查字段完整。
2. 角色生成资产采纳前检查：
   - 是否包含目标角色。
   - 是否明显偏离脸谱/服饰。
   - 是否风格一致。
   - 是否有明显畸变。
3. 关键帧入库前检查：
   - 是否符合分镜描述。
   - 是否角色一致。
   - 是否能作为视频首帧。

质量门第一版可以只做人工 checklist，后面再接 AI 检查。

## 6. 对主线程的下一步执行建议

请主线程按以下顺序开发：

1. 角色生图任务流 MVP。
2. 前端生图工作台接任务创建与进度显示。
3. 生成资产区接任务输出。
4. 任务重试与失败记录。
5. 角色生成资产采纳机制。
6. 风格模板 AI 识别。
7. PromptTemplate / SkillTemplate 管理。

开发原则：

- 每个模块完成后让用户 check。
- 模型调用先 mock，不阻塞结构建设。
- 所有任务输入必须保存快照，避免参考图或角色字段后续变化导致复盘困难。
- 所有 AI 输出先进入生成资产区，人工采纳后才进入关键帧可用资产。

