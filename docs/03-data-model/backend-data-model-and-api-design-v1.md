# 后端 V1 数据模型与 API 草案

本文档为 `/Users/huabi/code/AI-video-studio/yingge-app/backend/` 后续 FastAPI + PostgreSQL + SQLAlchemy 2.x + Alembic 实现做准备。

当前阶段只做数据模型与 API 设计，不初始化 backend，不写代码，不生成数据库迁移，不接真实模型 API，不读取 `.env`、key、token、证书文件，不修改 `/Users/huabi/code/AI-video-studio/references/`。

## 1. 设计目标

后端 V1 要支撑的核心闭环：

```text
角色库
→ 角色圣经
→ 项目
→ 剧本
→ Shot
→ Panel
→ Prompt
→ 生成任务
→ 图片 / 视频 / 音频 / 字幕素材
→ 审核采纳 / 拒绝
→ Reflection
→ 成本
→ 导出制作方案
```

第一阶段只做：

- 数据模型。
- CRUD API。
- mock 数据到真实数据的迁移准备。
- 任务状态记录。
- 素材审核记录。
- Prompt 版本记录。
- 成本记录。
- 模型 Provider / ModelConfig 的展示型配置。
- AgentRun / SkillConfig 的轻量运行痕迹，不做真实 Agent。

第一阶段暂不做：

- 真实模型调用。
- 真实任务队列。
- 真实文件上传。
- 真实视频播放。
- 真实 FFmpeg 合成。
- 真实登录权限系统。
- 真实对象存储。
- 真实支付、充值、账单系统。
- 多租户。

核心设计取向：

- `Shot` 与 `Panel` 分开：`Shot` 负责叙事镜头，`Panel` 负责生成绑定单元。
- `GenerationTask` 与 `Asset` 分开：任务是过程，素材是结果。
- `Asset` 使用统一主表 + 类型扩展表：统一列表与审核，同时保留图片、视频、音频、字幕的专属字段。
- `PromptDraft` 必须版本化：保留每次生成和失败复盘的上下文。
- `CostRecord` 独立成表：后续才能按项目、任务、模型、素材聚合成本。

## 2. 核心领域模型

### 2.1 User

| 项目 | 内容 |
|---|---|
| 用途 | 最小用户模型，V1 用于项目 owner、操作人、审稿人占位。第一阶段不做真实登录。 |
| 核心字段 | `id`、`display_name`、`email`、`role`、`is_active`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`boolean`、`timestamp` |
| 关联关系 | `User 1 - N Project`；`User 1 - N AssetReview`；`User 1 - N CostRecord` |
| 是否 V1 必须 | P1。表建议预留，但 API 第一批可不暴露。 |
| 对应前端页面 | `AppShell` 用户入口，当前静态原型未真实使用。 |
| 来源参考 | PRD 内部团队用户；`CODEX_RULES.md` 说明团队当前自用；前端暂未有真实用户 mock。 |

### 2.2 Project

| 项目 | 内容 |
|---|---|
| 用途 | 英歌人物介绍短片项目，是脚本、镜头、任务、素材、成本和导出方案的聚合根。 |
| 核心字段 | `id`、`owner_user_id`、`title`、`description`、`status`、`current_stage`、`target_platform`、`target_duration_sec`、`aspect_ratio`、`art_style`、`workflow_mode`、`primary_character_id`、`readiness_percent`、`stats_snapshot`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`text`、`enum`、`integer`、`jsonb`、`timestamp` |
| 关联关系 | `Project N - 1 Character` 主角色；`Project 1 - N Script/Scene/Shot/Panel/GenerationTask/Asset/CostRecord/ExportPlan/AgentRun` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/dashboard`、`/script-studio`、`/generation-workspace`、`/asset-review` |
| 来源参考 | `yingge-app/frontend/data/mock/projects.ts`；PRD 项目列表页；参考审计中 `waoowaoo` 的 `Project`、`UsageCost` 思路。 |

### 2.3 Character

| 项目 | 内容 |
|---|---|
| 用途 | 英歌水浒角色基础信息，承载角色库列表、搜索和项目主角选择。 |
| 核心字段 | `id`、`name`、`nickname`、`ranking`、`star`、`liangshan_role`、`weapon`、`yingge_role`、`face_primary_color`、`face_pattern`、`personality_tags`、`positive_prompt_keywords`、`forbidden_prompt_keywords`、`field_completeness`、`excel_source_row`、`profile_confirmed`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`integer`、`text`、`jsonb`、`boolean`、`timestamp` |
| 关联关系 | `Character 1 - 1 CharacterBible`；`Character 1 - N CharacterAppearance`；`Character 1 - N Project`；`Character 1 - N Asset` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/characters`、`/characters/{id}`、`/script-studio`、`/generation-workspace` |
| 来源参考 | `characters.ts`、`characterDetail.ts`；`CODEX_RULES.md` 中 Excel 五层结构；PRD 角色库。 |

### 2.4 CharacterAppearance

| 项目 | 内容 |
|---|---|
| 用途 | 角色外观、参考图、多外观候选，支持“主外观 / 候选 / 需复核 / 错误示例”。 |
| 核心字段 | `id`、`character_id`、`title`、`appearance_index`、`status`、`description`、`palette`、`source_asset_id`、`image_urls`、`selected_image_url`、`consistency_status`、`change_reason`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`integer`、`text`、`jsonb`、`enum`、`timestamp` |
| 关联关系 | `CharacterAppearance N - 1 Character`；可选 `source_asset_id -> assets.id` |
| 是否 V1 必须 | P1。角色详情页面已有展示，后端可在 P0 角色 API 中先以内嵌 json 返回。 |
| 对应前端页面 | `/characters`、`/characters/{id}`、`/generation-workspace` |
| 来源参考 | `characterDetail.ts` 的 `appearances`；前端补丁中 `CharacterAppearance`；参考审计中 `waoowaoo.CharacterAppearance`。 |

### 2.5 CharacterBible

| 项目 | 内容 |
|---|---|
| 用途 | 保存角色圣经五层结构：身份层、内核层、文化视觉层、叙事素材层、商业文化层。 |
| 核心字段 | `id`、`character_id`、`identity_layer`、`inner_core_layer`、`cultural_visual_layer`、`narrative_material_layer`、`commercial_culture_layer`、`field_sources`、`consistency_checklist`、`version`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`jsonb`、`varchar`、`timestamp` |
| 关联关系 | `CharacterBible 1 - 1 Character` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/characters/{id}`、`/generation-workspace` 右侧一致性面板 |
| 来源参考 | `characterDetail.ts` 五层字段；`CODEX_RULES.md` Excel 五层结构；PRD 角色圣经。 |

### 2.6 Scene

| 项目 | 内容 |
|---|---|
| 用途 | 场景设定，沉淀梁山水泊、景阳冈、青石街酒楼、英歌鼓阵等场景一致性。 |
| 核心字段 | `id`、`project_id`、`name`、`summary`、`location`、`time_of_day`、`atmosphere`、`visual_style`、`prompt_fragment`、`reference_asset_ids`、`consistency_status`、`source_type`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`text`、`jsonb`、`enum`、`timestamp` |
| 关联关系 | `Scene N - 1 Project`；`Scene 1 - N Shot`；`Scene` 可引用 scene-ref `Asset` |
| 是否 V1 必须 | P2。P0 可先在 `Shot.scene_text` 中保存文字。 |
| 对应前端页面 | `/script-studio`、`/generation-workspace` |
| 来源参考 | `shots.ts` 的 `scene`；PRD 场景一致性；UI 模块 `Scene Consistency Module`。 |

### 2.7 Script

| 项目 | 内容 |
|---|---|
| 用途 | 项目剧本文案和版本，支撑 30-60 秒人物介绍短视频旁白。 |
| 核心字段 | `id`、`project_id`、`character_id`、`title`、`status`、`platform`、`duration_sec`、`aspect_ratio`、`tone`、`version`、`hook`、`ending`、`narration_lines`、`keywords`、`agent_notes`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`enum`、`integer`、`text`、`jsonb`、`timestamp` |
| 关联关系 | `Script N - 1 Project`；`Script 1 - N Shot`；`Script` 可关联 `AgentRun` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/script-studio` |
| 来源参考 | `scripts.ts`；PRD 流程 A/B；参考审计中 ScriptAgent。 |

### 2.8 Shot

| 项目 | 内容 |
|---|---|
| 用途 | 叙事镜头，描述旁白片段、画面、动作、情绪、镜头语言和时长。 |
| 核心字段 | `id`、`project_id`、`script_id`、`scene_id`、`shot_no`、`title`、`status`、`duration_sec`、`time_start_sec`、`time_end_sec`、`narration_segment`、`visual_description`、`action`、`emotion`、`camera_movement`、`scene_text`、`bound_character_ids`、`consistency_status`、`prompt_status`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`integer`、`varchar`、`text`、`jsonb`、`enum`、`timestamp` |
| 关联关系 | `Shot N - 1 Script`；`Shot 1 - N Panel`；`Shot 1 - N PromptDraft`；`Shot 1 - N Asset` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/script-studio`、`/generation-workspace`、`/asset-review` |
| 来源参考 | `shots.ts`；前端补丁 Shot/Panel 拆分规则；参考审计中 `NovelPromotionShot`、`storyboards`。 |

### 2.9 Panel

| 项目 | 内容 |
|---|---|
| 用途 | 分镜面板 / 生成绑定单元，一个 Shot 可拆成多个 Panel，每个 Panel 绑定 Prompt、任务、候选图、候选视频。 |
| 核心字段 | `id`、`project_id`、`shot_id`、`panel_no`、`status`、`image_description`、`video_description`、`camera`、`motion`、`prompt_status`、`keyframe_status`、`video_status`、`linked_to_next_panel`、`first_frame_asset_id`、`last_frame_asset_id`、`accepted_image_asset_id`、`accepted_video_asset_id`、`accepted_audio_asset_id`、`accepted_subtitle_asset_id`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`integer`、`text`、`boolean`、`enum`、`timestamp` |
| 关联关系 | `Panel N - 1 Shot`；`Panel 1 - N PromptDraft/GenerationTask/Asset` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/script-studio`、`/generation-workspace`、`/asset-review` |
| 来源参考 | `panels.ts`；前端 `PanelMiniCard`、`VideoGenerationPanel`；参考审计中 `NovelPromotionPanel`。 |

### 2.10 PromptDraft

| 项目 | 内容 |
|---|---|
| 用途 | Prompt 版本记录，保存图片 Prompt、视频 Prompt、negative prompt、TTS 文本和质量检查。 |
| 核心字段 | `id`、`project_id`、`shot_id`、`panel_id`、`asset_id`、`task_id`、`prompt_type`、`status`、`version`、`content`、`negative_prompt`、`positive_keywords`、`negative_keywords`、`source_fields`、`quality_checklist`、`validation_warnings`、`model_config_id`、`created_by_agent_run_id`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`enum`、`varchar`、`text`、`jsonb`、`timestamp` |
| 关联关系 | `PromptDraft N - 1 Shot/Panel`；可选关联 `Asset`、`GenerationTask`、`ModelConfig`、`AgentRun` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/generation-workspace`、`/asset-review` |
| 来源参考 | `prompts.ts`；PRD Prompt 生产链路；参考审计中 Prompt stage。 |

### 2.11 ModelProvider

| 项目 | 内容 |
|---|---|
| 用途 | 模型服务商，如 OpenAI、Seedance、MiniMax、Nano Banana、Internal。 |
| 核心字段 | `id`、`name`、`display_name`、`status`、`base_url_label`、`capabilities`、`health_message`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`enum`、`jsonb`、`timestamp` |
| 关联关系 | `ModelProvider 1 - N ModelConfig`；`ModelProvider 1 - N GenerationTask/CostRecord` |
| 是否 V1 必须 | P1。P0 可先用字符串字段，P1 正规化。 |
| 对应前端页面 | Dashboard 模型健康、Generation Workspace 模型选择 |
| 来源参考 | `models.ts`；后端目录规范 `model_registry.py`；参考审计中 model capabilities。 |

### 2.12 ModelConfig

| 项目 | 内容 |
|---|---|
| 用途 | 模型配置和能力展示，不保存真实 API key。 |
| 核心字段 | `id`、`provider_id`、`model_name`、`display_name`、`capability`、`capabilities`、`supported_modes`、`default_params`、`pricing_mode`、`estimated_unit_cost_cny`、`configured`、`health_status`、`priority`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`enum`、`jsonb`、`numeric`、`boolean`、`integer`、`timestamp` |
| 关联关系 | `ModelConfig N - 1 ModelProvider`；`ModelConfig 1 - N GenerationTask/PromptDraft/CostRecord` |
| 是否 V1 必须 | P1 |
| 对应前端页面 | `/dashboard`、`/generation-workspace` |
| 来源参考 | `models.ts`；前端补丁 `ModelConfig`；后端目录规范 `model_capabilities.py`、`model_pricing.py`。 |

### 2.13 GenerationTask

| 项目 | 内容 |
|---|---|
| 用途 | 生成任务状态表，记录脚本、分镜、Prompt、生图、生视频、TTS、字幕、Agent、导出的过程状态。V1 不接真实队列。 |
| 核心字段 | `id`、`project_id`、`shot_id`、`panel_id`、`prompt_draft_id`、`model_config_id`、`type`、`status`、`mode`、`target_type`、`target_id`、`progress`、`attempt`、`max_attempts`、`dedupe_key`、`external_id`、`payload`、`result`、`error_code`、`error_message`、`estimated_cost_cny`、`actual_cost_cny`、`queued_at`、`started_at`、`finished_at`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`enum`、`varchar`、`integer`、`numeric`、`jsonb`、`timestamp` |
| 关联关系 | `GenerationTask N - 1 Project/PromptDraft/ModelConfig`；`GenerationTask 1 - N Asset/CostRecord/ReflectionNote` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/dashboard`、`/generation-workspace`、`/asset-review` |
| 来源参考 | `generationTasks.ts`、`tasks.ts`；后端目录规范；参考审计中 `Task`、`TaskEvent`。 |

### 2.14 Asset

| 项目 | 内容 |
|---|---|
| 用途 | 统一素材表，管理图片、视频、音频、字幕、角色参考图、场景参考图。 |
| 核心字段 | `id`、`project_id`、`character_id`、`shot_id`、`panel_id`、`prompt_draft_id`、`generation_task_id`、`model_config_id`、`type`、`status`、`title`、`description`、`uri`、`thumbnail_uri`、`mime_type`、`storage_key`、`source_type`、`prompt_version`、`consistency_score`、`metadata`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`enum`、`varchar`、`text`、`integer`、`jsonb`、`timestamp` |
| 关联关系 | `Asset N - 1 Project/Shot/Panel/PromptDraft/GenerationTask`；`Asset 1 - 0..1 ImageAsset/VideoAsset/AudioAsset/SubtitleAsset`；`Asset 1 - N AssetReview/CostRecord` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/generation-workspace`、`/asset-review`、角色参考图 |
| 来源参考 | `assets.ts`、`imageAssets.ts`、`videoAssets.ts`、`audioAssets.ts`、`subtitleAssets.ts`；参考审计中 `MediaObject`。 |

### 2.15 ImageAsset

| 项目 | 内容 |
|---|---|
| 用途 | 图片素材扩展字段。 |
| 核心字段 | `asset_id`、`width`、`height`、`aspect_ratio`、`thumbnail_label`、`reference_asset_ids`、`seed`、`image_params` |
| 字段类型建议 | `uuid`、`integer`、`varchar`、`jsonb` |
| 关联关系 | `ImageAsset 1 - 1 Asset` |
| 是否 V1 必须 | P0。字段可轻量，但表建议建立。 |
| 对应前端页面 | `/generation-workspace`、`/asset-review` |
| 来源参考 | `imageAssets.ts`。 |

### 2.16 VideoAsset

| 项目 | 内容 |
|---|---|
| 用途 | 视频素材扩展字段。 |
| 核心字段 | `asset_id`、`duration_sec`、`fps`、`resolution`、`aspect_ratio`、`mode`、`motion_strength`、`first_frame_asset_id`、`last_frame_asset_id`、`video_params` |
| 字段类型建议 | `uuid`、`integer`、`numeric`、`varchar`、`jsonb` |
| 关联关系 | `VideoAsset 1 - 1 Asset`；可引用首帧/尾帧图片 `Asset` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/generation-workspace`、`/asset-review` |
| 来源参考 | `videoAssets.ts`；前端 `VideoGenerationPanel`。 |

### 2.17 AudioAsset

| 项目 | 内容 |
|---|---|
| 用途 | 音频 / TTS 素材扩展字段。 |
| 核心字段 | `asset_id`、`duration_sec`、`speaker`、`voice_id`、`voice_style`、`line_text`、`audio_params` |
| 字段类型建议 | `uuid`、`integer`、`varchar`、`text`、`jsonb` |
| 关联关系 | `AudioAsset 1 - 1 Asset`；可被 `SubtitleAsset.audio_asset_id` 引用 |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/generation-workspace`、`/asset-review` |
| 来源参考 | `audioAssets.ts`；PRD MiniMax TTS。 |

### 2.18 SubtitleAsset

| 项目 | 内容 |
|---|---|
| 用途 | 字幕素材扩展字段，保存字幕文本、SRT 内容或时间对齐状态。 |
| 核心字段 | `asset_id`、`audio_asset_id`、`language`、`content`、`srt_content`、`timing_status`、`start_sec`、`end_sec`、`subtitle_params` |
| 字段类型建议 | `uuid`、`varchar`、`text`、`numeric`、`jsonb` |
| 关联关系 | `SubtitleAsset 1 - 1 Asset`；可选 `audio_asset_id -> assets.id` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/asset-review`、导出制作方案 |
| 来源参考 | `subtitleAssets.ts`；PRD 导出字幕和 TTS 文案。 |

### 2.19 AssetReview

| 项目 | 内容 |
|---|---|
| 用途 | 素材审核记录，记录采纳、拒绝、候选、失败原因和人工备注。 |
| 核心字段 | `id`、`asset_id`、`project_id`、`shot_id`、`panel_id`、`review_status`、`reviewer_user_id`、`failure_reason_codes`、`failure_reason_text`、`consistency_score`、`quality_score`、`comment`、`reviewed_at`、`created_at` |
| 字段类型建议 | `uuid`、`enum`、`jsonb`、`text`、`integer`、`timestamp` |
| 关联关系 | `AssetReview N - 1 Asset/Project/Shot/Panel/User`；可通过 code 关联 `FailureReason` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/asset-review`、`/generation-workspace` |
| 来源参考 | `assetReview.ts`、`failureReasons.ts`；PRD 素材采纳/拒绝。 |

### 2.20 FailureReason

| 项目 | 内容 |
|---|---|
| 用途 | 失败原因字典，统一角色不一致、脸谱错误、动作错误、模型错误等枚举。 |
| 核心字段 | `id`、`code`、`label`、`description`、`severity`、`category`、`default_prompt_patch`、`is_active`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`text`、`enum`、`boolean`、`timestamp` |
| 关联关系 | `AssetReview.failure_reason_codes` 保存 code；`ReflectionNote` 可引用 code |
| 是否 V1 必须 | P1。P0 可先固定枚举，P1 做字典表。 |
| 对应前端页面 | `/generation-workspace`、`/asset-review` |
| 来源参考 | `failureReasons.ts`、`prompts.ts` 的 `promptFailurePatch`。 |

### 2.21 ReflectionNote

| 项目 | 内容 |
|---|---|
| 用途 | 失败复盘和改进建议，可关联角色、脚本、镜头、Panel、Prompt、任务、素材。 |
| 核心字段 | `id`、`project_id`、`target_type`、`target_id`、`source_type`、`source_id`、`severity`、`category`、`message`、`suggestion`、`suggested_prompt_patch`、`suggested_negative_keywords`、`agent_score`、`applied_status`、`created_by_agent_run_id`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`enum`、`varchar`、`text`、`jsonb`、`integer`、`timestamp` |
| 关联关系 | 多态关联目标；可选关联 `AgentRun` |
| 是否 V1 必须 | P1。Asset Review 页面已有展示，Backend P0 可先用静态 response。 |
| 对应前端页面 | `/asset-review`、`/script-studio`、`/generation-workspace` |
| 来源参考 | `reflections.ts`；PRD ReflectionAgent；参考审计中 Supervision Agent。 |

### 2.22 CostRecord

| 项目 | 内容 |
|---|---|
| 用途 | 成本记录，保存 mock/manual 估算和实际成本，支持按项目、任务、模型、素材汇总。 |
| 核心字段 | `id`、`project_id`、`task_id`、`asset_id`、`model_provider_id`、`model_config_id`、`record_type`、`api_type`、`provider_name`、`model_name`、`action`、`quantity`、`unit`、`estimated_cost_cny`、`actual_cost_cny`、`currency`、`metadata`、`created_at` |
| 字段类型建议 | `uuid`、`enum`、`varchar`、`numeric`、`jsonb`、`timestamp` |
| 关联关系 | `CostRecord N - 1 Project/GenerationTask/Asset/ModelConfig` |
| 是否 V1 必须 | P0 |
| 对应前端页面 | `/dashboard`、`/generation-workspace`、`/asset-review` |
| 来源参考 | `costs.ts`；参考审计中 `UsageCost`、`billing/cost.ts`。 |

### 2.23 ExportPlan

| 项目 | 内容 |
|---|---|
| 用途 | 导出制作方案，聚合脚本、分镜、Prompt、采纳素材、失败记录、成本，不生成真实文件。 |
| 核心字段 | `id`、`project_id`、`title`、`status`、`version`、`total_duration_sec`、`readiness_percent`、`shot_count`、`export_items`、`timeline_snapshot`、`accepted_asset_ids`、`prompt_ids`、`cost_summary`、`failure_summary`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`enum`、`integer`、`jsonb`、`timestamp` |
| 关联关系 | `ExportPlan N - 1 Project`；通过 jsonb 保存导出快照和引用 id |
| 是否 V1 必须 | P1 |
| 对应前端页面 | `/asset-review` |
| 来源参考 | `productionPlan.ts`；PRD 导出制作方案。 |

### 2.24 AgentRun

| 项目 | 内容 |
|---|---|
| 用途 | Agent 运行记录，V1 只保存 mock / 手动运行痕迹，不做真实 Agent 框架。 |
| 核心字段 | `id`、`project_id`、`agent_name`、`agent_type`、`phase`、`step_key`、`status`、`input_summary`、`output_summary`、`tool_calls`、`score`、`issues`、`memory_refs`、`started_at`、`finished_at`、`created_at` |
| 字段类型建议 | `uuid`、`varchar`、`enum`、`text`、`jsonb`、`integer`、`timestamp` |
| 关联关系 | `AgentRun N - 1 Project`；`PromptDraft`、`ReflectionNote` 可引用 `AgentRun` |
| 是否 V1 必须 | P1 |
| 对应前端页面 | `/dashboard`、`/script-studio`、`/asset-review` |
| 来源参考 | `agents.ts`；参考审计中 Toonflow `runDecisionAI`、`createSubAgent`、`Memory`、`Skill` 思路。 |

### 2.25 SkillConfig

| 项目 | 内容 |
|---|---|
| 用途 | Skill 展示型配置，记录人物介绍文案、5-8 镜拆分、角色一致性检查等能力标签。 |
| 核心字段 | `id`、`name`、`skill_type`、`agent_name`、`status`、`description`、`version`、`path_label`、`last_used_at`、`created_at`、`updated_at` |
| 字段类型建议 | `uuid`、`varchar`、`enum`、`text`、`timestamp` |
| 关联关系 | V1 可不建强关联；后续 `AgentRun` 可记录使用的 skill ids |
| 是否 V1 必须 | P1 |
| 对应前端页面 | `/script-studio`、`/asset-review` |
| 来源参考 | `skills.ts`；参考审计中 `skillsTools.ts`、`read_skill_file`，但 V1 不读取真实 Skill 文件。 |

## 3. 关键关系设计

### Project 和 Character 的关系

V1 建议：

- `projects.primary_character_id -> characters.id` 保存项目主角。
- 后续如支持多角色互动，可新增 `project_characters` 关联表。V1 暂不必须。
- `Shot.bound_character_ids jsonb` 保存镜头涉及角色 id 列表，先避免过早设计复杂多对多。

原因：

- 当前 MVP 聚焦单个水浒人物介绍短视频。
- 前端 `projects.ts` 只有 `characterId` 和 `characterName`。
- PRD 第一版流程是选择一个角色创建人物介绍项目。

### Character 和 CharacterAppearance 的关系

- `characters.id -> character_appearances.character_id` 是一对多。
- `character_appearances.source_asset_id` 可指向某张已采纳角色参考图。
- `characters` 可保留 `appearance_count`、`reference_asset_count` 的统计快照，但真实统计应从 appearance / asset 聚合。

### CharacterBible 如何存五层结构

V1 建议 `character_bibles` 使用 jsonb 保存五层结构：

- `identity_layer`
- `inner_core_layer`
- `cultural_visual_layer`
- `narrative_material_layer`
- `commercial_culture_layer`

同时保存：

- `field_sources jsonb`：Excel 文件、sheet、行号、证据类型。
- `consistency_checklist jsonb`：脸谱主色、武器、服饰、禁止词等检查项。

取舍：

- Excel 字段可能会继续变化，jsonb 更适合第一版快速映射。
- 稳定字段如 `name`、`weapon`、`face_primary_color` 放在 `characters`，便于列表筛选。

### Script 和 Shot 的关系

- `scripts.id -> shots.script_id` 是一对多。
- 一个项目可有多个 Script 版本，但 V1 前端先显示当前版本。
- `scripts.version` 记录 `v2.1` 这类人工版本；后续可用 `created_at` 排序取最新。

### Shot 和 Panel 的关系

- `shots.id -> panels.shot_id` 是一对多。
- `Shot` 保存叙事镜头信息：旁白、画面、动作、情绪、镜头语言、场景。
- `Panel` 保存生成绑定信息：图片描述、视频描述、相机、运动、关键帧、首尾帧、采纳素材。

### PromptDraft 如何关联 Shot / Panel / Asset / Task

- `PromptDraft.shot_id` 必须保存。
- `PromptDraft.panel_id` 推荐保存，图片/视频/TTS 生成通常绑定到 panel。
- `PromptDraft.asset_id` 可选，表示某个素材生成后反向记录使用的 prompt。
- `PromptDraft.task_id` 可选，表示该 prompt 对应的生成任务。
- Prompt 版本使用 `(panel_id, prompt_type, version)` 唯一约束，避免同一个 panel 的同类 prompt 版本混乱。

### GenerationTask 如何关联 PromptDraft / ModelConfig / Asset

- `generation_tasks.prompt_draft_id` 指向发起任务时使用的 prompt。
- `generation_tasks.model_config_id` 指向模型配置。
- `assets.generation_task_id` 指向产出该素材的任务。
- `cost_records.task_id` 记录该任务的估算/实际成本。

V1 任务状态由 API 手动更新或 mock runner 更新，不进入真实队列。

### Asset 如何统一管理图片、视频、音频、字幕

- `assets` 保存通用字段：项目、shot、panel、prompt、task、类型、状态、URL、标题、模型、评分、血缘。
- `image_assets`、`video_assets`、`audio_assets`、`subtitle_assets` 保存类型专属字段。
- 前端 `/asset-review` 可以先查 `assets` 列表，再按类型展开扩展表字段。

### ImageAsset / VideoAsset / AudioAsset / SubtitleAsset 是否作为扩展表

建议 V1 就作为扩展表：

- 图片需要宽高、比例、参考图。
- 视频需要时长、fps、分辨率、首尾帧、运动强度。
- 音频需要音色、台词、时长。
- 字幕需要文本、SRT、对齐状态。

若全部塞进 `assets.metadata`，短期快，但后续查询和类型校验会变差。

### AssetReview 如何记录采纳 / 拒绝 / 失败原因

- `assets.status` 保存当前状态：`candidate / accepted / rejected / archived`。
- `asset_reviews` 保存每次审核动作。
- `asset_reviews.failure_reason_codes jsonb` 保存多个失败原因 code。
- `asset_reviews.comment` 保存人工备注。
- 采纳素材时，同时更新 `panels.accepted_*_asset_id`。

### ReflectionNote 如何关联 Task / Asset / Prompt / Shot

V1 使用多态字段：

- `target_type`：`character / script / shot / panel / prompt / task / asset / project`
- `target_id`：目标 id
- `source_type`：`critic_agent / generation_task / manual_review / asset_review`
- `source_id`：来源 id

这样可以覆盖前端 `reflections.ts` 当前的 `targetType / targetId`，也能支持后续任务和素材复盘。

### CostRecord 如何关联 Task / Project / Provider / Model

- `project_id` 必填。
- `task_id` 可选但推荐生成类成本必填。
- `asset_id` 可选，任务产出素材后补上。
- `model_provider_id`、`model_config_id` 可选；P0 可先保存 `provider_name`、`model_name` 字符串。
- `record_type` 区分 `estimated / actual / manual_adjustment`。

### ExportPlan 如何聚合最终成片素材

V1 不生成真实文件，只生成可展示和可导出的结构化快照：

- `timeline_snapshot`：按 shot 顺序列出图片、视频、音频、字幕状态。
- `accepted_asset_ids`：采纳素材 id 列表。
- `prompt_ids`：使用的 prompt 版本。
- `cost_summary`：成本汇总。
- `failure_summary`：失败原因和复盘摘要。

## 4. 数据库表草案

说明：

- 所有表建议包含 `created_at timestamp`、`updated_at timestamp`，审计类表可只保留 `created_at`。
- 删除策略 V1 建议软删除字段 `deleted_at` 暂不默认加入，避免范围膨胀；后续如需要归档再补。
- `enum` 可用 PostgreSQL enum，也可在 SQLAlchemy 层用字符串枚举。V1 设计先按 enum 表述。

### users

| 项目 | 内容 |
|---|---|
| table name | `users` |
| columns | `id uuid pk`、`display_name varchar(100)`、`email varchar(255)`、`role varchar(50)`、`is_active boolean`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_users_email` |
| foreign keys | 无 |
| unique constraints | `email` unique |
| notes | V1 不做真实登录，可 seed 一个 internal user。 |

### projects

| 项目 | 内容 |
|---|---|
| table name | `projects` |
| columns | `id uuid pk`、`owner_user_id uuid null`、`primary_character_id uuid null`、`title varchar(200)`、`description text`、`status project_status`、`current_stage varchar(50)`、`target_platform varchar(50)`、`target_duration_sec integer`、`aspect_ratio varchar(20)`、`art_style varchar(200)`、`workflow_mode varchar(80)`、`readiness_percent integer`、`stats_snapshot jsonb`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_projects_status`、`idx_projects_primary_character_id`、`idx_projects_updated_at` |
| foreign keys | `owner_user_id -> users.id`、`primary_character_id -> characters.id` |
| unique constraints | 无 |
| notes | `stats_snapshot` 可缓存前端卡片需要的 shotCount、panelCount、acceptedVideoCount、failedTaskCount。 |

### characters

| 项目 | 内容 |
|---|---|
| table name | `characters` |
| columns | `id uuid pk`、`slug varchar(80)`、`name varchar(80)`、`nickname varchar(80)`、`ranking integer`、`star varchar(80)`、`liangshan_role varchar(120)`、`weapon varchar(120)`、`yingge_role varchar(120)`、`face_primary_color varchar(20)`、`face_pattern text`、`personality_tags jsonb`、`positive_prompt_keywords jsonb`、`forbidden_prompt_keywords jsonb`、`field_completeness integer`、`excel_source_row integer`、`profile_confirmed boolean`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_characters_name`、`idx_characters_ranking`、`idx_characters_yingge_role` |
| foreign keys | 无 |
| unique constraints | `slug` unique |
| notes | `slug` 可兼容前端 `/characters/wusong`。 |

### character_appearances

| 项目 | 内容 |
|---|---|
| table name | `character_appearances` |
| columns | `id uuid pk`、`character_id uuid`、`source_asset_id uuid null`、`appearance_index integer`、`title varchar(160)`、`status varchar(50)`、`description text`、`palette jsonb`、`image_urls jsonb`、`selected_image_url text`、`consistency_status varchar(50)`、`change_reason text`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_character_appearances_character_id`、`idx_character_appearances_status` |
| foreign keys | `character_id -> characters.id`、`source_asset_id -> assets.id` |
| unique constraints | `(character_id, appearance_index)` |
| notes | `source_asset_id` 因 `assets` 后定义，实际迁移顺序可用 Alembic 处理。 |

### character_bibles

| 项目 | 内容 |
|---|---|
| table name | `character_bibles` |
| columns | `id uuid pk`、`character_id uuid`、`identity_layer jsonb`、`inner_core_layer jsonb`、`cultural_visual_layer jsonb`、`narrative_material_layer jsonb`、`commercial_culture_layer jsonb`、`field_sources jsonb`、`consistency_checklist jsonb`、`version varchar(40)`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_character_bibles_character_id` |
| foreign keys | `character_id -> characters.id` |
| unique constraints | `character_id` unique |
| notes | 五层结构先用 jsonb，后续稳定后再拆细表。 |

### scenes

| 项目 | 内容 |
|---|---|
| table name | `scenes` |
| columns | `id uuid pk`、`project_id uuid`、`name varchar(160)`、`summary text`、`location varchar(160)`、`time_of_day varchar(80)`、`atmosphere varchar(160)`、`visual_style text`、`prompt_fragment text`、`reference_asset_ids jsonb`、`consistency_status varchar(50)`、`source_type varchar(50)`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_scenes_project_id`、`idx_scenes_name` |
| foreign keys | `project_id -> projects.id` |
| unique constraints | `(project_id, name)` 可选 |
| notes | P2 表，P0 可不实现。 |

### scripts

| 项目 | 内容 |
|---|---|
| table name | `scripts` |
| columns | `id uuid pk`、`project_id uuid`、`character_id uuid null`、`title varchar(200)`、`status script_status`、`platform varchar(100)`、`duration_sec integer`、`aspect_ratio varchar(20)`、`tone varchar(120)`、`version varchar(40)`、`hook text`、`ending text`、`narration_lines jsonb`、`keywords jsonb`、`agent_notes jsonb`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_scripts_project_id`、`idx_scripts_status`、`idx_scripts_updated_at` |
| foreign keys | `project_id -> projects.id`、`character_id -> characters.id` |
| unique constraints | `(project_id, version)` |
| notes | V1 每个项目可多版本，但 API 默认返回最新。 |

### shots

| 项目 | 内容 |
|---|---|
| table name | `shots` |
| columns | `id uuid pk`、`project_id uuid`、`script_id uuid`、`scene_id uuid null`、`shot_no integer`、`title varchar(160)`、`status shot_status`、`duration_sec integer`、`time_start_sec numeric(8,2)`、`time_end_sec numeric(8,2)`、`narration_segment text`、`visual_description text`、`action text`、`emotion varchar(120)`、`camera_movement varchar(160)`、`scene_text varchar(160)`、`bound_character_ids jsonb`、`consistency_status varchar(50)`、`prompt_status prompt_status`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_shots_project_id`、`idx_shots_script_id`、`idx_shots_scene_id`、`idx_shots_no` |
| foreign keys | `project_id -> projects.id`、`script_id -> scripts.id`、`scene_id -> scenes.id` |
| unique constraints | `(script_id, shot_no)` |
| notes | `scene_text` 兼容 P0 未实现 `scenes` 的情况。 |

### panels

| 项目 | 内容 |
|---|---|
| table name | `panels` |
| columns | `id uuid pk`、`project_id uuid`、`shot_id uuid`、`panel_no integer`、`status panel_status`、`image_description text`、`video_description text`、`camera varchar(160)`、`motion varchar(160)`、`prompt_status prompt_status`、`keyframe_status varchar(50)`、`video_status varchar(50)`、`linked_to_next_panel boolean`、`first_frame_asset_id uuid null`、`last_frame_asset_id uuid null`、`accepted_image_asset_id uuid null`、`accepted_video_asset_id uuid null`、`accepted_audio_asset_id uuid null`、`accepted_subtitle_asset_id uuid null`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_panels_project_id`、`idx_panels_shot_id`、`idx_panels_status` |
| foreign keys | `project_id -> projects.id`、`shot_id -> shots.id`、accepted/first/last asset fields -> `assets.id` |
| unique constraints | `(shot_id, panel_no)` |
| notes | Asset 外键可能形成循环，迁移时可后加 FK 或先允许 nullable。 |

### prompt_drafts

| 项目 | 内容 |
|---|---|
| table name | `prompt_drafts` |
| columns | `id uuid pk`、`project_id uuid`、`shot_id uuid null`、`panel_id uuid null`、`asset_id uuid null`、`task_id uuid null`、`model_config_id uuid null`、`created_by_agent_run_id uuid null`、`prompt_type prompt_type`、`status prompt_status`、`version varchar(40)`、`content text`、`negative_prompt text`、`positive_keywords jsonb`、`negative_keywords jsonb`、`source_fields jsonb`、`quality_checklist jsonb`、`validation_warnings jsonb`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_prompt_drafts_project_id`、`idx_prompt_drafts_shot_id`、`idx_prompt_drafts_panel_id`、`idx_prompt_drafts_type` |
| foreign keys | `project_id -> projects.id`、`shot_id -> shots.id`、`panel_id -> panels.id`、`asset_id -> assets.id`、`task_id -> generation_tasks.id`、`model_config_id -> model_configs.id`、`created_by_agent_run_id -> agent_runs.id` |
| unique constraints | `(panel_id, prompt_type, version)` where `panel_id is not null` |
| notes | 支持 image/video/negative/tts/script/storyboard/critic。 |

### model_providers

| 项目 | 内容 |
|---|---|
| table name | `model_providers` |
| columns | `id uuid pk`、`name varchar(80)`、`display_name varchar(120)`、`status provider_status`、`base_url_label varchar(160)`、`capabilities jsonb`、`health_message text`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_model_providers_status` |
| foreign keys | 无 |
| unique constraints | `name` unique |
| notes | 不保存真实 key。 |

### model_configs

| 项目 | 内容 |
|---|---|
| table name | `model_configs` |
| columns | `id uuid pk`、`provider_id uuid`、`model_name varchar(120)`、`display_name varchar(160)`、`capability model_capability`、`capabilities jsonb`、`supported_modes jsonb`、`default_params jsonb`、`pricing_mode varchar(80)`、`estimated_unit_cost_cny numeric(12,4)`、`configured boolean`、`health_status provider_status`、`priority integer`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_model_configs_provider_id`、`idx_model_configs_capability`、`idx_model_configs_health_status` |
| foreign keys | `provider_id -> model_providers.id` |
| unique constraints | `(provider_id, model_name, capability)` |
| notes | `configured` 仅表示当前环境是否可用，不泄露任何 key。 |

### generation_tasks

| 项目 | 内容 |
|---|---|
| table name | `generation_tasks` |
| columns | `id uuid pk`、`project_id uuid`、`shot_id uuid null`、`panel_id uuid null`、`prompt_draft_id uuid null`、`model_config_id uuid null`、`type generation_task_type`、`status generation_task_status`、`mode varchar(80)`、`target_type varchar(50)`、`target_id uuid null`、`progress integer`、`attempt integer`、`max_attempts integer`、`dedupe_key varchar(200)`、`external_id varchar(200)`、`payload jsonb`、`result jsonb`、`error_code varchar(100)`、`error_message text`、`estimated_cost_cny numeric(12,4)`、`actual_cost_cny numeric(12,4)`、`queued_at timestamp`、`started_at timestamp`、`finished_at timestamp`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_generation_tasks_project_id`、`idx_generation_tasks_status`、`idx_generation_tasks_type`、`idx_generation_tasks_panel_id`、`idx_generation_tasks_prompt_draft_id` |
| foreign keys | `project_id -> projects.id`、`shot_id -> shots.id`、`panel_id -> panels.id`、`prompt_draft_id -> prompt_drafts.id`、`model_config_id -> model_configs.id` |
| unique constraints | `dedupe_key` unique 可选 |
| notes | V1 作为状态表，不接真实队列。 |

### assets

| 项目 | 内容 |
|---|---|
| table name | `assets` |
| columns | `id uuid pk`、`project_id uuid`、`character_id uuid null`、`shot_id uuid null`、`panel_id uuid null`、`prompt_draft_id uuid null`、`generation_task_id uuid null`、`model_config_id uuid null`、`type asset_type`、`status asset_status`、`title varchar(200)`、`description text`、`uri text`、`thumbnail_uri text`、`mime_type varchar(120)`、`storage_key varchar(300)`、`source_type varchar(80)`、`prompt_version varchar(40)`、`consistency_score integer`、`metadata jsonb`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_assets_project_id`、`idx_assets_type_status`、`idx_assets_shot_id`、`idx_assets_panel_id`、`idx_assets_generation_task_id`、`idx_assets_character_id` |
| foreign keys | `project_id -> projects.id`、`character_id -> characters.id`、`shot_id -> shots.id`、`panel_id -> panels.id`、`prompt_draft_id -> prompt_drafts.id`、`generation_task_id -> generation_tasks.id`、`model_config_id -> model_configs.id` |
| unique constraints | 无 |
| notes | `uri` V1 可保存 mock path / 外部 URL，不做真实上传。 |

### image_assets

| 项目 | 内容 |
|---|---|
| table name | `image_assets` |
| columns | `asset_id uuid pk`、`width integer`、`height integer`、`aspect_ratio varchar(20)`、`thumbnail_label varchar(160)`、`reference_asset_ids jsonb`、`seed varchar(80)`、`image_params jsonb` |
| indexes | `idx_image_assets_aspect_ratio` |
| foreign keys | `asset_id -> assets.id` |
| unique constraints | `asset_id` primary key |
| notes | 图片扩展表。 |

### video_assets

| 项目 | 内容 |
|---|---|
| table name | `video_assets` |
| columns | `asset_id uuid pk`、`duration_sec numeric(8,2)`、`fps integer`、`resolution varchar(40)`、`aspect_ratio varchar(20)`、`mode varchar(80)`、`motion_strength numeric(4,2)`、`first_frame_asset_id uuid null`、`last_frame_asset_id uuid null`、`video_params jsonb` |
| indexes | `idx_video_assets_mode`、`idx_video_assets_resolution` |
| foreign keys | `asset_id -> assets.id`、`first_frame_asset_id -> assets.id`、`last_frame_asset_id -> assets.id` |
| unique constraints | `asset_id` primary key |
| notes | 支持图生视频、首帧、首尾帧。 |

### audio_assets

| 项目 | 内容 |
|---|---|
| table name | `audio_assets` |
| columns | `asset_id uuid pk`、`duration_sec numeric(8,2)`、`speaker varchar(120)`、`voice_id varchar(120)`、`voice_style varchar(160)`、`line_text text`、`audio_params jsonb` |
| indexes | `idx_audio_assets_voice_id` |
| foreign keys | `asset_id -> assets.id` |
| unique constraints | `asset_id` primary key |
| notes | MiniMax TTS 先保存 mock metadata。 |

### subtitle_assets

| 项目 | 内容 |
|---|---|
| table name | `subtitle_assets` |
| columns | `asset_id uuid pk`、`audio_asset_id uuid null`、`language varchar(20)`、`content text`、`srt_content text`、`timing_status varchar(50)`、`start_sec numeric(8,2)`、`end_sec numeric(8,2)`、`subtitle_params jsonb` |
| indexes | `idx_subtitle_assets_audio_asset_id`、`idx_subtitle_assets_language` |
| foreign keys | `asset_id -> assets.id`、`audio_asset_id -> assets.id` |
| unique constraints | `asset_id` primary key |
| notes | V1 不生成真实 SRT 文件，可保存文本内容。 |

### asset_reviews

| 项目 | 内容 |
|---|---|
| table name | `asset_reviews` |
| columns | `id uuid pk`、`asset_id uuid`、`project_id uuid`、`shot_id uuid null`、`panel_id uuid null`、`review_status review_status`、`reviewer_user_id uuid null`、`failure_reason_codes jsonb`、`failure_reason_text text`、`consistency_score integer`、`quality_score integer`、`comment text`、`reviewed_at timestamp`、`created_at timestamp` |
| indexes | `idx_asset_reviews_asset_id`、`idx_asset_reviews_project_id`、`idx_asset_reviews_status` |
| foreign keys | `asset_id -> assets.id`、`project_id -> projects.id`、`shot_id -> shots.id`、`panel_id -> panels.id`、`reviewer_user_id -> users.id` |
| unique constraints | 无 |
| notes | 每次审核都追加记录，`assets.status` 保存当前状态。 |

### failure_reasons

| 项目 | 内容 |
|---|---|
| table name | `failure_reasons` |
| columns | `id uuid pk`、`code failure_reason_code`、`label varchar(120)`、`description text`、`severity varchar(50)`、`category varchar(80)`、`default_prompt_patch text`、`is_active boolean`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_failure_reasons_code`、`idx_failure_reasons_category` |
| foreign keys | 无 |
| unique constraints | `code` unique |
| notes | P1 字典表，P0 可用 enum + seed。 |

### reflection_notes

| 项目 | 内容 |
|---|---|
| table name | `reflection_notes` |
| columns | `id uuid pk`、`project_id uuid null`、`target_type varchar(50)`、`target_id uuid`、`source_type varchar(50)`、`source_id uuid null`、`severity varchar(50)`、`category varchar(80)`、`message text`、`suggestion text`、`suggested_prompt_patch text`、`suggested_negative_keywords jsonb`、`agent_score integer`、`applied_status varchar(50)`、`created_by_agent_run_id uuid null`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_reflection_notes_project_id`、`idx_reflection_notes_target`、`idx_reflection_notes_severity` |
| foreign keys | `project_id -> projects.id`、`created_by_agent_run_id -> agent_runs.id` |
| unique constraints | 无 |
| notes | 多态目标不做 FK，靠 service 校验。 |

### cost_records

| 项目 | 内容 |
|---|---|
| table name | `cost_records` |
| columns | `id uuid pk`、`project_id uuid`、`task_id uuid null`、`asset_id uuid null`、`model_provider_id uuid null`、`model_config_id uuid null`、`record_type cost_record_type`、`api_type varchar(50)`、`provider_name varchar(120)`、`model_name varchar(160)`、`action varchar(120)`、`quantity numeric(12,4)`、`unit varchar(40)`、`estimated_cost_cny numeric(12,4)`、`actual_cost_cny numeric(12,4)`、`currency varchar(10)`、`metadata jsonb`、`created_at timestamp` |
| indexes | `idx_cost_records_project_id`、`idx_cost_records_task_id`、`idx_cost_records_asset_id`、`idx_cost_records_api_type`、`idx_cost_records_created_at` |
| foreign keys | `project_id -> projects.id`、`task_id -> generation_tasks.id`、`asset_id -> assets.id`、`model_provider_id -> model_providers.id`、`model_config_id -> model_configs.id` |
| unique constraints | 无 |
| notes | V1 支持 mock/manual 成本。 |

### export_plans

| 项目 | 内容 |
|---|---|
| table name | `export_plans` |
| columns | `id uuid pk`、`project_id uuid`、`title varchar(200)`、`status varchar(50)`、`version varchar(40)`、`total_duration_sec integer`、`readiness_percent integer`、`shot_count integer`、`export_items jsonb`、`timeline_snapshot jsonb`、`accepted_asset_ids jsonb`、`prompt_ids jsonb`、`cost_summary jsonb`、`failure_summary jsonb`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_export_plans_project_id`、`idx_export_plans_status` |
| foreign keys | `project_id -> projects.id` |
| unique constraints | `(project_id, version)` |
| notes | V1 不生成真实文件，只存结构化方案。 |

### agent_runs

| 项目 | 内容 |
|---|---|
| table name | `agent_runs` |
| columns | `id uuid pk`、`project_id uuid null`、`agent_name varchar(120)`、`agent_type varchar(80)`、`phase varchar(80)`、`step_key varchar(120)`、`status agent_run_status`、`input_summary text`、`output_summary text`、`tool_calls jsonb`、`score integer`、`issues jsonb`、`memory_refs jsonb`、`started_at timestamp`、`finished_at timestamp`、`created_at timestamp` |
| indexes | `idx_agent_runs_project_id`、`idx_agent_runs_status`、`idx_agent_runs_agent_name` |
| foreign keys | `project_id -> projects.id` |
| unique constraints | 无 |
| notes | V1 只展示运行痕迹，不执行真实 Agent。 |

### skill_configs

| 项目 | 内容 |
|---|---|
| table name | `skill_configs` |
| columns | `id uuid pk`、`name varchar(160)`、`skill_type varchar(80)`、`agent_name varchar(120)`、`status varchar(50)`、`description text`、`version varchar(40)`、`path_label varchar(240)`、`last_used_at timestamp`、`created_at timestamp`、`updated_at timestamp` |
| indexes | `idx_skill_configs_agent_name`、`idx_skill_configs_status` |
| foreign keys | 无 |
| unique constraints | `(name, agent_name)` |
| notes | 不读取真实 Skill 文件，只保存展示配置。 |

## 5. Enum 设计

| enum | values |
|---|---|
| `project_status` | `draft`、`scripting`、`storyboarding`、`generating`、`reviewing`、`completed`、`needs_review`、`archived` |
| `script_status` | `draft`、`saved`、`generating`、`confirmed`、`needs_review` |
| `shot_status` | `draft`、`generated`、`confirmed`、`needs_review`、`completed` |
| `panel_status` | `draft`、`prompt_ready`、`generating`、`candidate_ready`、`accepted`、`needs_retry`、`completed` |
| `prompt_type` | `script`、`storyboard`、`image`、`video`、`negative`、`tts`、`subtitle`、`critic` |
| `prompt_status` | `draft`、`generated`、`edited`、`validated`、`needs_review`、`failed` |
| `generation_task_type` | `script_agent`、`storyboard_agent`、`prompt_generation`、`image_generation`、`video_generation`、`tts_generation`、`subtitle_generation`、`critic_review`、`asset_review`、`export_plan` |
| `generation_task_status` | `draft`、`queued`、`processing`、`completed`、`failed`、`canceled`、`needs_review` |
| `asset_type` | `image`、`video`、`audio`、`subtitle`、`character_ref`、`scene_ref`、`document` |
| `asset_status` | `candidate`、`accepted`、`rejected`、`archived`、`failed` |
| `review_status` | `candidate`、`accepted`、`rejected`、`needs_review`、`archived` |
| `provider_status` | `healthy`、`warning`、`error`、`idle`、`disabled` |
| `model_capability` | `text`、`image`、`video`、`tts`、`subtitle`、`critic`、`embedding` |
| `failure_reason_code` | `character_inconsistent`、`face_pattern_wrong`、`color_wrong`、`scene_mismatch`、`style_drift`、`yingge_motion_wrong`、`motion_too_strong`、`motion_too_weak`、`bad_anatomy`、`duration_mismatch`、`model_error` |
| `agent_run_status` | `idle`、`queued`、`processing`、`reviewing`、`completed`、`warning`、`failed` |
| `cost_record_type` | `estimated`、`actual`、`manual_adjustment`、`refund` |

## 6. API 草案

通用约定：

- Base path 建议：`/api`。后端目录中可放在 `app/api/v1/`，实际路由是否带 `/v1` 在 Backend Phase 2 决定；本文按用户指定写 `/api/...`。
- 列表 API 支持 `page`、`page_size`、`sort`，响应包含 `items`、`total`、`page`、`page_size`。
- V1 鉴权未启用，`user_id` 可由默认 internal user 或请求体占位。

### 6.1 Health APIs

#### GET /api/health

| 项目 | 内容 |
|---|---|
| 用途 | 服务健康检查。 |
| request 参数 | 无 |
| response 草案 | `{ "status": "ok", "service": "yingge-backend", "version": "v1", "time": "2026-05-21T..." }` |
| 对应前端页面 | 无，开发联调用。 |
| V1 是否必须 | 是 |

### 6.2 Project APIs

#### GET /api/projects

| 项目 | 内容 |
|---|---|
| 用途 | 项目列表，支撑 Dashboard。 |
| request 参数 | query：`status`、`keyword`、`character_id`、`page`、`page_size` |
| response 草案 | `ProjectListResponse { items: ProjectListItem[], total, page, page_size }`，列表项包含 `id/title/status/current_stage/primary_character/shot_count/panel_count/accepted_asset_count/failed_task_count/running_task_count/total_cost_cny/readiness_percent/updated_at` |
| 对应前端页面 | `/dashboard` |
| V1 是否必须 | 是 |

#### POST /api/projects

| 项目 | 内容 |
|---|---|
| 用途 | 创建英歌短片项目。 |
| request 参数 | body：`title`、`primary_character_id`、`target_platform`、`target_duration_sec`、`aspect_ratio`、`art_style` |
| response 草案 | `ProjectRead` |
| 对应前端页面 | `/dashboard` |
| V1 是否必须 | 是 |

#### GET /api/projects/{project_id}

| 项目 | 内容 |
|---|---|
| 用途 | 项目详情和生产概览。 |
| request 参数 | path：`project_id` |
| response 草案 | `ProjectDetail`，包含主角色、当前 script、统计、最近任务、成本摘要 |
| 对应前端页面 | `/script-studio`、`/generation-workspace`、`/asset-review` |
| V1 是否必须 | 是 |

#### PATCH /api/projects/{project_id}

| 项目 | 内容 |
|---|---|
| 用途 | 更新项目标题、状态、平台、时长、画风等。 |
| request 参数 | path：`project_id`；body：`ProjectUpdate` |
| response 草案 | `ProjectRead` |
| 对应前端页面 | `/dashboard`、后续项目设置 |
| V1 是否必须 | 是 |

### 6.3 Character APIs

#### GET /api/characters

| 项目 | 内容 |
|---|---|
| 用途 | 角色库列表。 |
| request 参数 | query：`keyword`、`yingge_role`、`face_primary_color`、`min_completeness`、`page`、`page_size` |
| response 草案 | `CharacterListResponse`，包含 `appearance_count`、`reference_asset_count`、`field_completeness` |
| 对应前端页面 | `/characters` |
| V1 是否必须 | 是 |

#### POST /api/characters/import

| 项目 | 内容 |
|---|---|
| 用途 | 导入 Excel 角色圣经。V1 可先做 mock import / seed import，不做真实上传。 |
| request 参数 | body：`source_path_label`、`mode: preview/import` |
| response 草案 | `{ "status": "previewed/imported", "created_count": 45, "updated_count": 0, "warnings": [] }` |
| 对应前端页面 | `/characters` |
| V1 是否必须 | 是，但第一批可只返回 mock preview。 |

#### GET /api/characters/{character_id}

| 项目 | 内容 |
|---|---|
| 用途 | 角色详情基础信息。 |
| request 参数 | path：`character_id`，可支持 uuid 或 slug，具体未确认。 |
| response 草案 | `CharacterRead`，包含关键词、外观摘要、来源行。 |
| 对应前端页面 | `/characters/{id}` |
| V1 是否必须 | 是 |

#### PATCH /api/characters/{character_id}

| 项目 | 内容 |
|---|---|
| 用途 | 更新角色基础字段、关键词、确认状态。 |
| request 参数 | path：`character_id`；body：`CharacterUpdate` |
| response 草案 | `CharacterRead` |
| 对应前端页面 | `/characters/{id}` |
| V1 是否必须 | 是 |

#### GET /api/characters/{character_id}/bible

| 项目 | 内容 |
|---|---|
| 用途 | 获取角色圣经五层结构。 |
| request 参数 | path：`character_id` |
| response 草案 | `CharacterBibleRead`，包含五层 json、field sources、consistency checklist。 |
| 对应前端页面 | `/characters/{id}`、`/generation-workspace` |
| V1 是否必须 | 是 |

#### GET /api/characters/{character_id}/appearances

| 项目 | 内容 |
|---|---|
| 用途 | 获取角色外观和参考图。 |
| request 参数 | path：`character_id` |
| response 草案 | `{ "items": CharacterAppearanceRead[] }` |
| 对应前端页面 | `/characters/{id}` |
| V1 是否必须 | P1；若第一批赶进度，可先由角色详情内嵌返回。 |

### 6.4 Script / Shot / Panel APIs

#### GET /api/projects/{project_id}/script

| 项目 | 内容 |
|---|---|
| 用途 | 获取项目当前脚本。 |
| request 参数 | path：`project_id`；query：`version` 可选 |
| response 草案 | `ScriptRead` |
| 对应前端页面 | `/script-studio` |
| V1 是否必须 | 是 |

#### POST /api/projects/{project_id}/script

| 项目 | 内容 |
|---|---|
| 用途 | 创建脚本版本。V1 可从请求体保存人工或 mock 生成文案。 |
| request 参数 | path：`project_id`；body：`title`、`character_id`、`platform`、`duration_sec`、`tone`、`narration_lines`、`hook`、`ending`、`keywords` |
| response 草案 | `ScriptRead` |
| 对应前端页面 | `/script-studio` |
| V1 是否必须 | 是 |

#### PATCH /api/scripts/{script_id}

| 项目 | 内容 |
|---|---|
| 用途 | 更新脚本文案、状态、版本。 |
| request 参数 | path：`script_id`；body：`ScriptUpdate` |
| response 草案 | `ScriptRead` |
| 对应前端页面 | `/script-studio` |
| V1 是否必须 | 是 |

#### GET /api/scripts/{script_id}/shots

| 项目 | 内容 |
|---|---|
| 用途 | 获取脚本下镜头列表。 |
| request 参数 | path：`script_id` |
| response 草案 | `{ "items": ShotRead[] }` |
| 对应前端页面 | `/script-studio`、`/generation-workspace` |
| V1 是否必须 | 是 |

#### POST /api/scripts/{script_id}/shots

| 项目 | 内容 |
|---|---|
| 用途 | 批量或单个创建 Shot。 |
| request 参数 | path：`script_id`；body：`ShotCreate` 或 `{ "items": ShotCreate[] }` |
| response 草案 | `{ "items": ShotRead[] }` |
| 对应前端页面 | `/script-studio` |
| V1 是否必须 | 是 |

#### GET /api/shots/{shot_id}/panels

| 项目 | 内容 |
|---|---|
| 用途 | 获取 Shot 下 Panel 列表。 |
| request 参数 | path：`shot_id` |
| response 草案 | `{ "items": PanelRead[] }` |
| 对应前端页面 | `/script-studio`、`/generation-workspace`、`/asset-review` |
| V1 是否必须 | 是 |

#### POST /api/shots/{shot_id}/panels

| 项目 | 内容 |
|---|---|
| 用途 | 创建 Panel。 |
| request 参数 | path：`shot_id`；body：`PanelCreate` 或 `{ "items": PanelCreate[] }` |
| response 草案 | `{ "items": PanelRead[] }` |
| 对应前端页面 | `/script-studio` |
| V1 是否必须 | 是 |

### 6.5 Prompt APIs

#### GET /api/shots/{shot_id}/prompts

| 项目 | 内容 |
|---|---|
| 用途 | 获取 Shot 级 Prompt，例如整体镜头 Prompt 或 critic prompt。 |
| request 参数 | path：`shot_id`；query：`type` 可选 |
| response 草案 | `{ "items": PromptDraftRead[] }` |
| 对应前端页面 | `/generation-workspace` |
| V1 是否必须 | 是 |

#### GET /api/panels/{panel_id}/prompts

| 项目 | 内容 |
|---|---|
| 用途 | 获取 Panel 图片/视频/negative/TTS Prompt。 |
| request 参数 | path：`panel_id`；query：`type` 可选 |
| response 草案 | `{ "items": PromptDraftRead[] }` |
| 对应前端页面 | `/generation-workspace` |
| V1 是否必须 | 是 |

#### POST /api/prompts

| 项目 | 内容 |
|---|---|
| 用途 | 新建 PromptDraft。V1 保存人工或 mock 生成结果，不调用真实模型。 |
| request 参数 | body：`project_id`、`shot_id`、`panel_id`、`prompt_type`、`content`、`negative_prompt`、`positive_keywords`、`negative_keywords`、`source_fields`、`version` |
| response 草案 | `PromptDraftRead` |
| 对应前端页面 | `/generation-workspace` |
| V1 是否必须 | 是 |

#### PATCH /api/prompts/{prompt_id}

| 项目 | 内容 |
|---|---|
| 用途 | 更新 Prompt 内容、状态、质量检查。 |
| request 参数 | path：`prompt_id`；body：`PromptDraftUpdate` |
| response 草案 | `PromptDraftRead` |
| 对应前端页面 | `/generation-workspace` |
| V1 是否必须 | 是 |

### 6.6 Generation Task APIs

#### GET /api/projects/{project_id}/tasks

| 项目 | 内容 |
|---|---|
| 用途 | 获取项目任务队列。 |
| request 参数 | path：`project_id`；query：`status`、`type`、`shot_id`、`panel_id` |
| response 草案 | `{ "items": GenerationTaskRead[] }` |
| 对应前端页面 | `/dashboard`、`/generation-workspace` |
| V1 是否必须 | 是 |

#### POST /api/generation-tasks

| 项目 | 内容 |
|---|---|
| 用途 | 创建生成任务。V1 写入任务状态，并可同步生成 mock Asset / CostRecord。 |
| request 参数 | body：`project_id`、`shot_id`、`panel_id`、`prompt_draft_id`、`model_config_id`、`type`、`mode`、`payload` |
| response 草案 | `GenerationTaskRead`，可包含 `created_assets` |
| 对应前端页面 | `/generation-workspace` |
| V1 是否必须 | 是 |

#### GET /api/generation-tasks/{task_id}

| 项目 | 内容 |
|---|---|
| 用途 | 获取任务详情。 |
| request 参数 | path：`task_id` |
| response 草案 | `GenerationTaskDetail`，包含 prompt、assets、costs、error |
| 对应前端页面 | `/generation-workspace`、`/asset-review` |
| V1 是否必须 | 是 |

#### PATCH /api/generation-tasks/{task_id}

| 项目 | 内容 |
|---|---|
| 用途 | 更新任务状态、进度、错误、结果。 |
| request 参数 | path：`task_id`；body：`status`、`progress`、`error_code`、`error_message`、`result` |
| response 草案 | `GenerationTaskRead` |
| 对应前端页面 | `/generation-workspace` |
| V1 是否必须 | 是 |

### 6.7 Asset APIs

#### GET /api/projects/{project_id}/assets

| 项目 | 内容 |
|---|---|
| 用途 | 获取项目素材列表。 |
| request 参数 | path：`project_id`；query：`type`、`status`、`shot_id`、`panel_id` |
| response 草案 | `{ "items": AssetRead[] }`，按 type 带扩展字段 |
| 对应前端页面 | `/asset-review`、`/generation-workspace` |
| V1 是否必须 | 是 |

#### GET /api/shots/{shot_id}/assets

| 项目 | 内容 |
|---|---|
| 用途 | 获取某个 Shot 的素材。 |
| request 参数 | path：`shot_id`；query：`type`、`status` |
| response 草案 | `{ "items": AssetRead[] }` |
| 对应前端页面 | `/generation-workspace`、`/asset-review` |
| V1 是否必须 | 是 |

#### GET /api/assets/{asset_id}

| 项目 | 内容 |
|---|---|
| 用途 | 获取素材详情和血缘。 |
| request 参数 | path：`asset_id` |
| response 草案 | `AssetDetail`，包含 prompt、task、cost、reviews、type extension |
| 对应前端页面 | `/asset-review` |
| V1 是否必须 | 是 |

#### PATCH /api/assets/{asset_id}

| 项目 | 内容 |
|---|---|
| 用途 | 更新素材标题、状态、描述、元数据。 |
| request 参数 | path：`asset_id`；body：`AssetUpdate` |
| response 草案 | `AssetRead` |
| 对应前端页面 | `/asset-review` |
| V1 是否必须 | 是 |

#### POST /api/assets/{asset_id}/review

| 项目 | 内容 |
|---|---|
| 用途 | 对素材采纳 / 拒绝 / 候选复核。 |
| request 参数 | path：`asset_id`；body：`review_status`、`failure_reason_codes`、`comment`、`consistency_score`、`quality_score` |
| response 草案 | `AssetReviewRead`，同时返回更新后的 `AssetRead` |
| 对应前端页面 | `/asset-review`、`/generation-workspace` |
| V1 是否必须 | 是 |

### 6.8 Review / Reflection APIs

#### GET /api/projects/{project_id}/review-summary

| 项目 | 内容 |
|---|---|
| 用途 | 获取素材审核汇总。 |
| request 参数 | path：`project_id` |
| response 草案 | `{ accepted_count, candidate_count, rejected_count, readiness, rejection_stats, model_failure_modes }` |
| 对应前端页面 | `/asset-review` |
| V1 是否必须 | 是 |

#### GET /api/assets/{asset_id}/reflections

| 项目 | 内容 |
|---|---|
| 用途 | 获取某素材相关复盘建议。 |
| request 参数 | path：`asset_id` |
| response 草案 | `{ "items": ReflectionNoteRead[] }` |
| 对应前端页面 | `/asset-review` |
| V1 是否必须 | P1 |

#### POST /api/reflections

| 项目 | 内容 |
|---|---|
| 用途 | 创建人工或 mock Agent 复盘建议。 |
| request 参数 | body：`project_id`、`target_type`、`target_id`、`severity`、`message`、`suggestion`、`suggested_prompt_patch` |
| response 草案 | `ReflectionNoteRead` |
| 对应前端页面 | `/asset-review`、`/generation-workspace` |
| V1 是否必须 | P1 |

### 6.9 Cost APIs

#### GET /api/projects/{project_id}/costs

| 项目 | 内容 |
|---|---|
| 用途 | 获取项目成本记录和模型拆分。 |
| request 参数 | path：`project_id`；query：`api_type`、`from`、`to` |
| response 草案 | `{ "items": CostRecordRead[], "summary": CostSummary }` |
| 对应前端页面 | `/dashboard`、`/generation-workspace`、`/asset-review` |
| V1 是否必须 | 是 |

#### GET /api/costs/summary

| 项目 | 内容 |
|---|---|
| 用途 | 全局成本摘要。 |
| request 参数 | query：`range=today/month` |
| response 草案 | `{ today, month, next_estimated, budget_used_percent, breakdown_by_api_type }` |
| 对应前端页面 | `/dashboard`、`TopStatusBar` |
| V1 是否必须 | 是 |

### 6.10 Export APIs

#### GET /api/projects/{project_id}/export-plan

| 项目 | 内容 |
|---|---|
| 用途 | 获取项目最新导出制作方案。 |
| request 参数 | path：`project_id` |
| response 草案 | `ExportPlanRead` |
| 对应前端页面 | `/asset-review` |
| V1 是否必须 | P1 |

#### POST /api/projects/{project_id}/export-plan

| 项目 | 内容 |
|---|---|
| 用途 | 生成或保存结构化制作方案，不生成真实文件。 |
| request 参数 | path：`project_id`；body：`version`、`export_items` 可选 |
| response 草案 | `ExportPlanRead` |
| 对应前端页面 | `/asset-review` |
| V1 是否必须 | P1 |

### 6.11 Model APIs

#### GET /api/model-providers

| 项目 | 内容 |
|---|---|
| 用途 | 获取 Provider 健康状态。 |
| request 参数 | 无或 `status` |
| response 草案 | `{ "items": ModelProviderRead[] }` |
| 对应前端页面 | `/dashboard`、`/generation-workspace` |
| V1 是否必须 | P1 |

#### GET /api/model-configs

| 项目 | 内容 |
|---|---|
| 用途 | 获取模型配置、能力、模式、价格提示。 |
| request 参数 | query：`capability`、`provider_id`、`configured` |
| response 草案 | `{ "items": ModelConfigRead[] }` |
| 对应前端页面 | `/generation-workspace` |
| V1 是否必须 | P1 |

## 7. 前端 mock 到后端字段映射

### 7.1 映射总表

| mock 文件 | 当前 mock 字段 | 后端字段 | 是否需要调整前端 mock | 后端 V1 是否保留 |
|---|---|---|---|---|
| `projects.ts` | `id/title/characterId/characterName/yinggeRole/stage/shotCount/panelCount/acceptedImageCount/acceptedVideoCount/failedTaskCount/runningTaskCount/totalCost/updatedAt/readiness/tags` | `projects.id/title/primary_character_id/current_stage/stats_snapshot/readiness_percent/updated_at`，统计从 `shots/panels/assets/tasks/cost_records` 聚合 | 建议把 `stage` 改为英文 enum 或增加 `status/currentStage` 双字段；`totalCost` 改 `totalCostCny` | 保留，作为 Dashboard API 输出 |
| `characters.ts` | `id/name/nickname/ranking/star/liangshanRole/weapon/yinggeRole/facePrimaryColor/facePattern/personalityTags/positivePromptKeywords/forbiddenPromptKeywords/appearanceCount/referenceAssetCount/fieldCompleteness/excelSourceRow/visualProfile/narrativeProfile/commercialProfile` | `characters` 基础字段；`character_bibles` 五层 json；appearance/reference 由 `character_appearances/assets` 聚合 | 建议 `id` 后端使用 uuid，另加 `slug=wusong` | 保留 |
| `characterDetail.ts` | `identityLayer/innerCoreLayer/culturalVisualLayer/narrativeMaterialLayer/commercialCultureLayer/fieldSources/consistencyChecklist/appearances/referenceImages` | `character_bibles.*_layer`、`field_sources`、`consistency_checklist`；`character_appearances`；`assets(type=character_ref)` | 建议 appearances 增加 `sourceAssetId`；referenceImages 迁入 Asset | 保留 |
| `scripts.ts` | `id/projectId/characterId/title/platform/duration/aspectRatio/tone/version/status/narration/hook/ending/keywords/agentNotes` | `scripts.project_id/character_id/title/platform/duration_sec/aspect_ratio/tone/version/status/narration_lines/hook/ending/keywords/agent_notes` | `duration` 建议改为秒数字段，保留展示格式由前端计算 | 保留 |
| `shots.ts` | `id/scriptId/shotNo/title/duration/narrationSegment/visualDescription/action/emotion/cameraMovement/scene/boundCharacterId/consistencyStatus/promptStatus/panelCount` | `shots.script_id/shot_no/title/duration_sec/narration_segment/visual_description/action/emotion/camera_movement/scene_text/bound_character_ids/consistency_status/prompt_status` | `duration` 改秒；`boundCharacterId` 改数组 | 保留 |
| `panels.ts` | `id/shotId/panelNo/imageDescription/camera/motion/promptStatus/keyframeStatus/videoStatus` | `panels.shot_id/panel_no/image_description/camera/motion/prompt_status/keyframe_status/video_status` | 建议增加 `videoDescription/linkedToNextPanel/acceptedAssetIds` | 保留 |
| `prompts.ts` | `id/shotId/panelId/type/version/content/positiveKeywords/negativeKeywords/sourceFields/qualityChecklist/updatedAt` | `prompt_drafts.shot_id/panel_id/prompt_type/version/content/positive_keywords/negative_keywords/source_fields/quality_checklist/updated_at` | 建议增加 `status/modelConfigId/validationWarnings` | 保留 |
| `generationTasks.ts` | `id/type/provider/model/mode/status/shotId/panelId/promptId/progress/estimatedCost/actualCost/startedAt/finishedAt/failureReason/retryCount` | `generation_tasks.type/status/mode/shot_id/panel_id/prompt_draft_id/progress/estimated_cost_cny/actual_cost_cny/error_message/attempt`；provider/model 由 `model_config` 或字符串冗余 | 建议合并 `tasks.ts` 和 `generationTasks.ts` 的差异 | 保留 |
| `tasks.ts` | `id/type/provider/model/status/projectId/shotId/panelId/cost/startedAt/finishedAt/failureReason/title` | `generation_tasks` + `cost_records`，`title` 可放 `payload.title` 或 response 组装 | 建议统一到 `generationTasks.ts` 结构 | 保留为 Dashboard 任务列表输出 |
| `imageAssets.ts` | `id/shotId/panelId/promptId/model/status/thumbnail/cost/consistencyScore/failureReasons/createdAt` | `assets` + `image_assets` + `asset_reviews` + `cost_records` | 建议增加 `projectId/taskId/uri/width/height` | 保留 |
| `videoAssets.ts` | `id/shotId/panelId/promptId/model/mode/status/duration/aspectRatio/resolution/thumbnail/cost/motionStrength/consistencyScore/failureReasons/createdAt` | `assets` + `video_assets` + `asset_reviews` + `cost_records` | `duration` 改秒；增加 `taskId/firstFrameAssetId/lastFrameAssetId` | 保留 |
| `audioAssets.ts` | `id/shotId/text/voice/model/status/duration/cost` | `assets` + `audio_assets` + `cost_records` | 建议增加 `projectId/panelId/taskId/voiceId` | 保留 |
| `subtitleAssets.ts` | `id/shotId/text/status/timingStatus` | `assets` + `subtitle_assets` | 建议增加 `audioAssetId/panelId/language/srtContent` | 保留 |
| `assets.ts` | `id/type/title/projectId/characterId/status/model/promptVersion/cost` | `assets.type/title/project_id/character_id/status/prompt_version` + `model_config/cost_records` | 建议统一 type：`character-ref` -> `character_ref` | 保留 |
| `assetReview.ts` | `assetReviewSummary/reviewAssetGroups` | 聚合 API：`review-summary` + 按 shot 分组的 assets | 不需要入库原样字段，后端聚合返回 | 保留为 response shape |
| `failureReasons.ts` | `code/label/description/severity` | `failure_reasons` 或 enum seed | `severity=processing` 建议改 `info/warning/error` 或保留为 UI severity | 保留 |
| `costs.ts` | `id/label/apiType/model/amount/percent`、`costSummary` | `cost_records` 聚合输出 | `amount` 明确为 CNY | 保留 |
| `agents.ts` | `agentName/status/lastRunAt/relatedProject/summary` | `agent_runs.agent_name/status/started_at/finished_at/output_summary` | 建议增加 `projectId/agentType/phase` | P1 保留 |
| `skills.ts` | `id/name/type/agent/status/description` | `skill_configs` | `type` 改 `skill_type`；`status` 映射英文 enum | P1 保留 |
| `reflections.ts` | `id/targetType/targetId/severity/source/message/suggestion` | `reflection_notes.target_type/target_id/severity/source_type/message/suggestion` | 建议增加 `projectId/sourceId/suggestedPromptPatch` | P1 保留 |
| `models.ts` | `provider/modelName/capabilities/health/costHint/supportedModes` | `model_providers` + `model_configs` | 建议拆 provider 和 model config | P1 保留 |
| `productionPlan.ts` | `productionTimeline`、`productionPlan` | `export_plans.timeline_snapshot/export_items/readiness_percent` | `duration/timeRange` 可前端展示，后端保存秒 | P1 保留 |

### 7.2 映射原则

- 前端中文状态值保留用于展示，但后端 enum 使用英文稳定值。
- 前端 `id` 当前是语义字符串，后端主键建议 uuid；为兼容路由，角色可增加 `slug`。
- `cost`、`totalCost`、`amount` 后端统一为 `*_cost_cny` 或 `actual_cost_cny`。
- `duration` 后端统一保存秒数，前端显示 `00:05` 或 `45 秒`。
- `failureReasons` 后端统一保存 failure reason code，不保存中文 label 到业务表。

## 8. V1 实现优先级

### P0

- `Project`
- `Character`
- `CharacterBible`
- `Script`
- `Shot`
- `Panel`
- `PromptDraft`
- `GenerationTask`
- `Asset`
- `ImageAsset`
- `VideoAsset`
- `AudioAsset`
- `SubtitleAsset`
- `AssetReview`
- `CostRecord`

P0 目标：

- 让六个前端页面能从真实 API 读取数据。
- 支撑 mock 数据 seed 到 PostgreSQL。
- 支撑任务状态、素材审核、成本记录和 Prompt 版本。

### P1

- `CharacterAppearance`
- `ReflectionNote`
- `ExportPlan`
- `ModelProvider`
- `ModelConfig`
- `FailureReason`
- `AgentRun`
- `SkillConfig`

P1 目标：

- 提升展示完整度。
- 支撑模型能力、失败原因字典、Agent 痕迹和导出方案。

### P2

- `Scene`
- 真实模型调用。
- 真实队列。
- 真实文件存储。
- 真实权限系统。
- 多角色项目关联表 `project_characters`。
- 复杂 Agent / Memory / RAG。

P2 目标：

- 当 V1 CRUD 和 mock 闭环跑通后，再增强生产级基础设施。

## 9. 风险与设计取舍

### Asset 是否做统一表 + 类型扩展

建议做。

原因：

- 前端素材审核页需要统一筛选图片、视频、音频、字幕。
- 图片、视频、音频、字幕字段差异明显。
- 统一主表方便做审核、成本、血缘、列表；扩展表方便做类型字段和后续查询。

风险：

- SQLAlchemy 关系稍复杂。
- 创建素材时要同时写 `assets` 和对应扩展表。

V1 处理：

- 由 `asset_service.py` 统一创建，不让 endpoint 直接写两张表。

### CharacterBible 是否 jsonb 存五层结构

建议 V1 用 jsonb。

原因：

- Excel 字段结构仍可能变化。
- 五层内容偏文档型、展示型。
- 角色库列表需要筛选的少数字段已放入 `characters`。

风险：

- jsonb 内字段难做强类型查询。

V1 处理：

- 列表筛选字段单独冗余到 `characters`。
- 五层详情用 jsonb 保持灵活。

### PromptDraft 是否版本化

必须版本化。

原因：

- 抽卡失败后要知道哪一版 Prompt 造成了结果。
- Asset、Task、Reflection 都需要追溯 Prompt。
- 前端已有 `version` 和 `promptFailurePatch`。

V1 处理：

- 唯一约束 `(panel_id, prompt_type, version)`。
- 每次重大编辑创建新版本，轻微状态更新 PATCH 当前版本。

### GenerationTask 是否先作为状态表，不接真实队列

建议先只做状态表。

原因：

- PRD 第一阶段强调克制。
- 后端目录规范明确 V1 不接 Celery / Redis。
- 当前前端只需要 queued / processing / completed / failed 的可视化状态。

风险：

- 无法真实异步生成。

V1 处理：

- `mock_task_runner.py` 后续可以同步更新状态。
- API 支持手动 PATCH 状态，方便联调。

### CostRecord 是否先 mock/manual

建议先 mock/manual。

原因：

- 第一版不接真实模型 API，实际计费无法确认。
- 前端只需要成本展示和预算感知。

V1 处理：

- `CostRecord.record_type` 区分 `estimated`、`actual`、`manual_adjustment`。
- 价格规则集中在后续 `app/ai/model_pricing.py` 和 `cost_service.py`。

### ExportPlan 是否先聚合引用，不生成真实文件

建议先聚合引用。

原因：

- PRD 一个月 MVP 最终交付物是制作方案和素材清单，不是完整剪辑器。
- 不做真实 FFmpeg 和真实下载。

V1 处理：

- `export_plans` 保存 timeline、accepted assets、prompts、cost summary。
- 前端展示“导出就绪”，后续再加文件生成。

### 为什么第一阶段不做登录

- 当前用户是内部三人团队，自用优先。
- 真实权限系统会增加 user/session/token/role 中间件复杂度。
- V1 可以通过最小 `users` 表预留 owner/reviewer。

### 为什么第一阶段不接真实模型 API

- 避免密钥、安全、计费、网络、失败重试在架构未稳定前放大复杂度。
- 当前任务目标是数据模型与 API 草案。
- 后端目录规范明确所有 AI 调用必须先收口到 `app/ai/ai_gateway.py`，第一版只 mock。

### 为什么先设计 API 再初始化后端

- 前端静态原型已经完成，API 应服务现有页面和 mock 数据。
- 先确认模型关系和接口边界，避免初始化后返工目录和表结构。
- 有利于后续 Codex 分层实现：schema -> model -> repository -> service -> endpoint。

## 10. 与后端目录结构规范的对应关系

必须遵守 `/Users/huabi/code/AI-video-studio/docs/02-architecture/backend-directory-structure-v1.md`。

### app/models/

建议文件映射：

- `user.py`：`User`
- `project.py`：`Project`
- `character.py`：`Character`、`CharacterAppearance`
- `character_bible.py`：`CharacterBible`
- `scene.py`：`Scene`
- `script.py`：`Script`
- `shot.py`：`Shot`
- `panel.py`：`Panel`
- `prompt.py`：`PromptDraft`
- `generation_task.py`：`GenerationTask`
- `asset.py`：`Asset`、`ImageAsset`、`VideoAsset`、`AudioAsset`、`SubtitleAsset`
- `review.py`：`AssetReview`、`FailureReason`、`ReflectionNote`
- `cost.py`：`CostRecord`
- `export_plan.py`：`ExportPlan`
- `agent.py`：`AgentRun`
- `skill.py`：`SkillConfig`
- `model_config.py`：`ModelProvider`、`ModelConfig`，或并入后续 `ai` 相关 model 文件，未确认。

### app/schemas/

建议文件映射：

- `project.py`：Project create/update/read/list。
- `character.py`：Character、CharacterAppearance、CharacterBible schema。
- `script.py`：Script schema。
- `shot.py`：Shot schema。
- `panel.py`：Panel schema。
- `prompt.py`：PromptDraft schema。
- `generation_task.py`：GenerationTask schema。
- `asset.py`：Asset 与类型扩展 schema。
- `review.py`：AssetReview、FailureReason、ReflectionNote schema。
- `cost.py`：CostRecord、CostSummary schema。
- `export_plan.py`：ExportPlan schema。
- `common.py`：分页、错误、通用枚举。

### app/repositories/

建议文件映射：

- `project_repository.py`：Project 查询和统计。
- `character_repository.py`：Character、CharacterBible、CharacterAppearance。
- `script_repository.py`：Script。
- `shot_repository.py`：Shot、Panel 的基础查询；若 Panel 复杂则新增 `panel_repository.py`。
- `prompt_repository.py`：PromptDraft。
- `generation_task_repository.py`：GenerationTask。
- `asset_repository.py`：Asset 和类型扩展表。
- `review_repository.py`：AssetReview、FailureReason、ReflectionNote。
- `cost_repository.py`：CostRecord 汇总。
- `export_plan_repository.py`：ExportPlan，可 P1 新增。
- `model_config_repository.py`：ModelProvider、ModelConfig，可 P1 新增。

### app/services/

建议文件映射：

- `project_service.py`：Project CRUD、Dashboard 聚合。
- `character_service.py`：角色库、角色详情、外观、圣经读取。
- `character_import_service.py`：Excel 导入到 Character / CharacterBible。
- `script_service.py`：Script CRUD。
- `storyboard_service.py`：Shot / Panel 创建和排序。
- `prompt_service.py`：PromptDraft 版本管理。
- `generation_task_service.py`：任务创建、状态流转、mock 结果。
- `asset_service.py`：统一素材创建、状态更新、扩展表写入、血缘详情。
- `review_service.py`：采纳 / 拒绝 / 失败原因 / review summary。
- `cost_service.py`：成本记录和汇总。
- `export_plan_service.py`：导出制作方案聚合。
- `model_service.py`：Provider / ModelConfig 展示，可 P1。

### app/api/v1/endpoints/

目录规范文档中为 `app/api/v1/*.py`。如果 Backend Phase 2 建 endpoint 子目录，也应保持同名资源文件：

- `projects.py`
- `characters.py`
- `scripts.py`
- `shots.py`
- `panels.py`
- `prompts.py`
- `generation_tasks.py`
- `assets.py`
- `reviews.py`
- `costs.py`
- `exports.py`
- `models.py`
- `health.py`

### app/ai/

与本文模型相关：

- `ai_gateway.py`：未来创建 mock AI 结果，不直接写 DB。
- `model_registry.py`：可从 `model_configs` seed 或静态配置生成展示。
- `model_capabilities.py`：对应 `model_capability` 和 `ModelConfig.capabilities`。
- `model_pricing.py`：对应 `CostRecord` 的估算来源。

### app/tasks/

与本文模型相关：

- `task_status.py`：定义 `generation_task_status` 流转。
- `mock_task_runner.py`：V1 可根据 `GenerationTask.type` 创建 mock Asset 和 CostRecord。
- `task_runner.py`：后续真实队列前的统一接口。

## 11. 后续 Backend Phase 2 建议

### 推荐 Backend Phase 2 任务目标

Backend Phase 2 应只初始化 FastAPI 项目骨架，不实现完整业务：

- 创建 `yingge-app/backend/`。
- 建立目录规范中的分层目录。
- 配置 FastAPI、SQLAlchemy 2.x、Alembic、Pydantic v2、pytest。
- 实现 `GET /api/health`。
- 建立基础 settings、db session、Base。
- 不连接真实模型 API。
- 不实现真实登录。
- 不创建复杂业务表迁移，除非 Phase 2 明确扩大范围。

### 初始化 FastAPI 项目时要创建哪些文件

建议第一批文件：

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
│   │       └── health.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── exceptions.py
│   │   └── logging.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── common.py
│   ├── repositories/
│   │   └── __init__.py
│   ├── services/
│   │   └── __init__.py
│   ├── ai/
│   │   └── __init__.py
│   └── tasks/
│       └── __init__.py
├── tests/
│   └── test_health.py
├── pyproject.toml
├── alembic.ini
├── .env.example
└── README.md
```

### 第一批不要实现哪些复杂能力

- 不要实现真实模型 client。
- 不要实现 Celery / Redis / worker。
- 不要实现对象存储上传。
- 不要实现 FFmpeg。
- 不要实现 OAuth / JWT / RBAC。
- 不要实现复杂 Agent 编排。
- 不要一次性实现所有表和 API。

### 第一批应该先实现哪些 API

建议顺序：

1. `GET /api/health`
2. `GET /api/projects`
3. `GET /api/characters`
4. `GET /api/characters/{character_id}`
5. `GET /api/characters/{character_id}/bible`
6. `GET /api/projects/{project_id}/script`
7. `GET /api/scripts/{script_id}/shots`
8. `GET /api/shots/{shot_id}/panels`
9. `GET /api/panels/{panel_id}/prompts`
10. `GET /api/projects/{project_id}/assets`
11. `GET /api/projects/{project_id}/tasks`
12. `GET /api/projects/{project_id}/costs`

第一批可以先只读 API + seed mock 数据，确认前端联调形状，再加写入 API。

### 后端与前端联调顺序

1. Dashboard：
   - `GET /api/projects`
   - `GET /api/projects/{project_id}/tasks`
   - `GET /api/costs/summary`
   - `GET /api/model-providers`

2. Characters：
   - `GET /api/characters`
   - `GET /api/characters/{character_id}`
   - `GET /api/characters/{character_id}/bible`
   - `GET /api/characters/{character_id}/appearances`

3. Script Studio：
   - `GET /api/projects/{project_id}/script`
   - `GET /api/scripts/{script_id}/shots`
   - `GET /api/shots/{shot_id}/panels`

4. Generation Workspace：
   - `GET /api/panels/{panel_id}/prompts`
   - `POST /api/prompts`
   - `POST /api/generation-tasks`
   - `GET /api/generation-tasks/{task_id}`
   - `GET /api/shots/{shot_id}/assets`

5. Asset Review：
   - `GET /api/projects/{project_id}/assets`
   - `POST /api/assets/{asset_id}/review`
   - `GET /api/projects/{project_id}/review-summary`
   - `GET /api/projects/{project_id}/export-plan`

## 12. 本文参考输入

本文参考了以下本项目文件：

- `/Users/huabi/code/AI-video-studio/CODEX_RULES.md`
- `/Users/huabi/code/AI-video-studio/docs/06-prd/PRD-v1.0.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-module-spec-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-static-prototype-plan-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-plan-source-reference-patch.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/backend-directory-structure-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/01-source-analysis/reference-projects-frontend-workflow-audit.md`
- `/Users/huabi/code/AI-video-studio/docs/05-tasks/static-prototype-acceptance-report-v1.md`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/data/mock/`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/`

参考项目只通过既有审计文档中的结论使用，未在本任务中修改 `/Users/huabi/code/AI-video-studio/references/`，未复制参考项目代码。

未确认事项：

- 后端路由最终是否带 `/api/v1` 前缀，当前按用户要求写 `/api`。
- 角色 URL path 使用 uuid 还是 slug，当前建议二者兼容。
- 真实 Excel 导入字段与本文 CharacterBible jsonb 的最终一一映射，需在 Backend Phase 6 结合 `/Users/huabi/code/AI-video-studio/data/英歌水浒角色基础信息.xlsx` 和分析文档进一步确认。
