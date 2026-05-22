# 前端 UI 文案中文化规范 v1

本文档定义 `/Users/huabi/code/AI-video-studio/yingge-app/frontend/` 的前端 UI 文案中文化规则，用于约束 Phase 3 Dashboard + Character Library 及后续页面实现。它不包含业务代码，不修改 `references/`，不读取 `.env`、key、token、证书文件。

## 0. 输入与适用范围

### 0.1 输入文件

- `/Users/huabi/code/AI-video-studio/CODEX_RULES.md`
- `/Users/huabi/code/AI-video-studio/docs/06-prd/PRD-v1.0.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/ui-visual-spec-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-static-prototype-plan-v1.md`
- `/Users/huabi/code/AI-video-studio/docs/02-architecture/frontend-plan-source-reference-patch.md`
- `/Users/huabi/code/AI-video-studio/docs/changes/phase-2-appshell-plan.md`

### 0.2 适用前端文件

- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/layout/AppSidebar.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/layout/TopStatusBar.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/layout/RightInspector.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/layout/PageHeader.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/layout/AppShell.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/common/StatusBadge.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/common/CostBadge.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/common/TaskQueueMini.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/common/CostSummaryMini.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/common/ModelCapabilityBadge.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/common/ProviderHealthBadge.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/common/AgentRunMini.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/dashboard/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/characters/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/characters/[id]/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/script-studio/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/generation-workspace/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/asset-review/page.tsx`

### 0.3 相关组件 / 函数名

后续改造时重点涉及组件函数名：`AppSidebar`、`TopStatusBar`、`RightInspector`、`PageHeader`、`AppShell`、`StatusBadge`、`CostBadge`、`TaskQueueMini`、`CostSummaryMini`、`ModelCapabilityBadge`、`ProviderHealthBadge`、`AgentRunMini`、`ProjectCard`、`CharacterCard`、`CharacterDetailInspector`。

### 0.4 相关实体 / 表名

本文案规范涉及的前端数据实体来自 PRD、UI 模块规格和 Phase 2 计划：`Project`、`Character`、`ProjectCharacter`、`CharacterVisualProfile`、`CharacterNarrativeProfile`、`CharacterCommercialProfile`、`PromptKeywordSet`、`Script`、`Shot`、`Panel`、`PromptDraft`、`GenerateTask`、`Asset`、`CostRecord`、`AgentRun`、`ModelConfig`。

参考项目中曾被源码分析引用的表名包括：`Task`、`TaskEvent`、`UsageCost`、`MediaObject`、`NovelPromotionPanel`、`storyboards`、`imageGenerations`、`videoGenerations`、`assets`、`videoMerges`。本文只继承信息架构结论，不复制参考项目代码。

## 1. 总原则

产品主语言为中文。这个工具的真实定位是“AI 英歌漫剧内容生产工作台”，当前核心用户是内部团队，不是面向海外用户的英文 SaaS。因此 UI 文案必须让中文用户一眼理解当前页面、任务状态、素材状态和下一步操作。

英文只用于以下场景：

- 模型名：`gpt-image-2`、`nano banana`、`Seedance 2.0`、`MiniMax TTS`。
- API 名、Provider 名和工程概念：`Provider`、`API`、`TTS`、`Prompt`。
- Agent 名：`ScriptAgent`、`StoryboardAgent`、`PromptAgent`、`CriticAgent`、`ProductionAgent`。
- 技术辅助副标题、小字标签、badge 或字段名补充。

页面标题、导航、按钮、状态、字段名、卡片标题、提示语默认使用中文。英文可以作为小字副标题、badge、技术标签出现，形成“中文主叙事 + 英文技术标签”的高级工作台质感。

推荐结构：

```text
中文主标题
English technical subtitle

中文字段名：中文值
模型：Seedance 2.0
Agent：ScriptAgent
```

不推荐结构：

```text
Dashboard
Running Tasks
Monthly Cost
Provider Health
```

## 2. 全局导航中文化

| 当前英文 | 中文主文案 | 可保留英文小字 | 说明 |
|---|---|---|---|
| Dashboard | 项目总览 | Dashboard | 作为首页和项目生产控制台入口。 |
| Character Bible | 角色圣经 | Character Bible | “角色圣经”是产品核心概念，英文可作小字帮助设计感。 |
| Script Studio | 剧本分镜 | Script Studio | 强调从文案到分镜的生产动作。 |
| Generation Workspace | 生成工作台 | Generation Workspace | 强调 Prompt、生图、生视频、TTS 的生产区。 |
| Asset Review | 素材审核 | Asset Review | 强调候选素材采纳、拒绝和复盘。 |
| Task Queue | 任务队列 | Task Queue | 保留为预留入口，Phase 2/3 可标记“即将开放”。 |
| Model Config | 模型配置 | Model Config | 不直接展示 key 或密钥，只作为配置入口占位。 |
| Asset Library | 素材库 | Asset Library | 与“素材审核”区分，素材库偏沉淀资产。 |
| Agent Runs | Agent 运行 | Agent Runs | Agent 名保留英文，“运行”说明状态轨迹。 |

导航主区域应使用中文。英文可以放在导航项下方 10-12px 小字、tooltip 或 `aria-label` 中，但不要抢占主导航文字。

底部 workspace / version / budget mini info 建议中文化：

| 当前文案 | 建议文案 |
|---|---|
| Workspace v0.2 static | 静态原型 v0.2 |
| mock providers online | Mock 服务正常 |
| ¥128.40 month | 本月 ¥128.40 |

## 3. 页面标题中文化

| 路由 | 中文标题 | 英文辅助标题 | 页面说明 |
|---|---|---|---|
| `/dashboard` | 项目总览 | Dashboard | 查看英歌水浒人物介绍短片的项目进度、任务队列、模型状态、成本和最近 Agent 运行。 |
| `/characters` | 英歌角色库 | Yingge Character Bible | 浏览从角色 Excel 导入的英歌水浒角色，查看字段完整度、外观、参考素材和角色一致性状态。 |
| `/characters/[id]` | 角色圣经详情 | Character Bible Detail | 查看单个角色的身份、内核、文化视觉、叙事素材和商业文化档案，并追踪字段来源与视觉一致性。 |
| `/script-studio` | 剧本分镜工作台 | Script & Storyboard Studio | 基于角色生成或导入 30-60 秒人物介绍文案，并拆分为 5-8 个分镜。 |
| `/generation-workspace` | 提示词与生成工作台 | Prompt & Generation Workspace | 为分镜生成图片 Prompt、视频 Prompt、TTS，并管理生图、生视频和音频生成任务。 |
| `/asset-review` | 素材审核与成片库 | Asset Review & Final Library | 审核图片、视频、音频候选素材，记录采纳、拒绝、失败原因和导出就绪状态。 |

页面标题渲染建议：

```text
项目总览
Dashboard

查看英歌水浒人物介绍短片的项目进度、任务队列、模型状态、成本和最近 Agent 运行。
```

不要只显示英文标题，也不要把中文标题退化成小字说明。

## 4. 全局状态文案中文化

| 当前英文 | 中文文案 | 使用场景 |
|---|---|---|
| Model Health | 模型状态 | 顶部栏、模型状态卡、项目卡。 |
| Provider Health | 服务商状态 | 顶部栏、模型配置入口、生成工作台。 |
| Running Tasks | 运行中任务 | 顶部栏、任务队列摘要。 |
| Monthly Cost | 本月成本 | 顶部栏、成本面板。 |
| Export Ready | 可导出 | 顶部栏、素材审核页。 |
| Healthy | 正常 | Provider / 模型状态。 |
| Warning | 预警 | 模型配置、成本、任务风险。 |
| Error | 异常 | 任务、模型、素材预览错误。 |
| Processing | 处理中 | 任务执行中、Agent 运行中。 |
| Success | 成功 | 任务成功、检查通过。 |
| Failed | 失败 | 任务失败、生成失败。 |
| Pending | 等待中 | 等待用户确认或依赖输入。 |
| Queued | 排队中 | 任务已入队但未执行。 |
| Completed | 已完成 | 任务完成、流程完成。 |
| Rejected | 已拒绝 | 候选素材被拒绝。 |
| Accepted | 已采纳 | 候选素材进入成片方案。 |
| Candidate | 候选 | 生成结果待审核。 |

补充建议：

| 英文技术短语 | 中文主文案 |
|---|---|
| Export readiness | 导出就绪度 |
| Budget used | 预算消耗 |
| Model configured | 模型已配置 |
| Needs review | 待复核 |
| In review | 复核中 |
| Draft | 草稿 |
| Archived | 已归档 |
| Canceled | 已取消 |
| Retry | 重试 |

## 5. Dashboard 文案规范

Dashboard 中文主标题使用“项目总览”，英文辅助标题为 `Dashboard`。页面气质是“生产控制台概览”，不是普通后台首页。

### 5.1 指标卡

| 指标含义 | 中文文案 | 英文/技术辅助 |
|---|---|---|
| 项目数量 | 当前项目 | Projects |
| 运行中任务 | 运行中任务 | Running Tasks |
| 排队任务 | 排队中任务 | Queued |
| 失败任务 | 失败任务 | Failed |
| 已采纳素材 | 已采纳素材 | Accepted Assets |
| 候选素材 | 候选素材 | Candidates |
| 本月成本 | 本月成本 | Monthly Cost |
| 今日成本 | 今日成本 | Today Cost |
| 预算消耗 | 预算消耗 | Budget Used |
| 导出就绪度 | 导出就绪度 | Export Ready |
| 最近 Agent 运行 | 最近 Agent 运行 | Agent Runs |

### 5.2 项目卡片字段

| 字段 | 中文文案 |
|---|---|
| title | 项目名称 |
| targetPlatform | 目标平台 |
| targetDurationSec | 目标时长 |
| currentStage | 当前阶段 |
| characterCount | 关联角色 |
| sceneCount | 关联场景 |
| shotCount | 分镜数 |
| panelCount | 生成面板 |
| acceptedAssetCount | 已采纳素材 |
| failedTaskCount | 失败任务 |
| totalCostCny | 项目成本 |
| updatedAt | 最近更新 |
| modelConfigStatus | 模型配置 |

项目卡片操作按钮：

- 进入项目
- 复制项目
- 导出方案
- 归档项目
- 查看任务
- 查看成本

### 5.3 任务队列

| 英文 | 中文 |
|---|---|
| Task Queue | 任务队列 |
| Running | 运行中 |
| Queued | 排队中 |
| Failed | 失败 |
| Completed | 已完成 |
| Last failure | 最近失败 |
| Retry | 重试 |
| Open task | 查看任务 |

任务类型建议：

- 剧本生成
- 分镜拆解
- 图片生成
- 视频生成
- TTS 生成
- 字幕生成
- 素材审核
- Agent 复盘

可保留技术标签：`ScriptAgent`、`PromptAgent`、`gpt-image-2`、`Seedance 2.0`、`MiniMax TTS`。

### 5.4 模型状态

| 模块 | 中文文案 |
|---|---|
| text model | 文本模型 |
| image model | 生图模型 |
| video model | 生视频模型 |
| tts model | TTS 模型 |
| model health | 模型状态 |
| provider health | 服务商状态 |
| configured | 已配置 |
| not configured | 未配置 |
| degraded | 服务波动 |

模型名不翻译：`gpt-image-2`、`nano banana`、`Seedance 2.0`、`MiniMax TTS`。

### 5.5 成本面板

| 英文 | 中文 |
|---|---|
| Cost Summary | 成本摘要 |
| Today Cost | 今日成本 |
| Monthly Cost | 本月成本 |
| Estimated Next Task | 下一任务预估 |
| Project Cost | 项目成本 |
| Image Cost | 生图成本 |
| Video Cost | 生视频成本 |
| TTS Cost | TTS 成本 |
| Text Cost | 文本成本 |
| Budget Alert | 预算提醒 |

金额文案示例：

- 今日 ¥12.80
- 本月 ¥128.40
- 下一任务预估 ¥3.20
- 项目累计 ¥86.50

### 5.6 Agent 运行面板

| 英文 | 中文 |
|---|---|
| Agent Runs | Agent 运行 |
| ScriptAgent completed | ScriptAgent 已完成 |
| StoryboardAgent reviewing | StoryboardAgent 复核中 |
| ProductionAgent idle | ProductionAgent 空闲 |
| CriticAgent warning | CriticAgent 预警 |
| Memory context | 记忆上下文 |
| Skill | Skill |
| Supervision | 监督评审 |

Agent 名保留英文，运行状态中文化。

### 5.7 操作按钮

- 新建项目
- 导入角色 Excel
- 进入生成工作台
- 查看任务队列
- 查看成本
- 查看 Agent 运行
- 导出制作方案
- 刷新状态

按钮不使用泛泛的“管理”“维护”“查看详情”作为主操作，应尽量描述生产动作。

## 6. Character Library 文案规范

Character Library 中文主标题使用“英歌角色库”，英文辅助标题可用 `Yingge Character Bible`。

### 6.1 筛选项

- 搜索角色
- 按姓名 / 绰号搜索
- 排名
- 星位
- 英歌定位
- 主色系
- 武器
- 人格标签
- 字段完整度
- 外观数量
- 参考素材
- 声音状态
- 来源状态
- 明确记录
- 推导字段
- 未确认字段

筛选按钮：

- 重置筛选
- 应用筛选
- 只看缺失字段
- 只看已确认

### 6.2 角色卡字段

| 字段 | 中文文案 |
|---|---|
| name | 姓名 |
| nickname | 绰号 |
| ranking | 排名 |
| starPosition | 星位 |
| origin | 出身 |
| liangshanRole | 梁山职司 |
| yinggeRolePosition | 英歌定位 |
| primaryWeapon | 主要武器 |
| facePrimaryColor | 脸谱主色 |
| personalityTags | 人格标签 |
| fieldCompleteness | 字段完整度 |
| sourceRowNumber | Excel 行号 |
| evidenceType | 证据类型 |
| appearanceCount | 外观数量 |
| referenceAssetCount | 参考素材 |
| consistencyStatus | 一致性状态 |
| voiceStyle | 声音风格 |

### 6.3 五层角色圣经标题

| 层级 | 中文标题 | 英文辅助 |
|---|---|---|
| 身份层 | 身份层 | Identity |
| 内核层 | 内核层 | Core |
| 文化视觉层 | 文化视觉层 | Cultural Visual |
| 叙事素材层 | 叙事素材层 | Narrative |
| 商业文化层 | 商业文化层 | Commercial Culture |

五层标题不要改成普通的“基础信息 / 详情 / 备注”，这会削弱“角色 IP 圣经”的产品心智。

### 6.4 Excel 来源

建议字段：

- 来源文件
- 工作表
- Excel 行号
- 来源字段
- 证据类型
- 明确记录
- 推导依据
- 未确认
- 导入时间

示例：

```text
来源文件：data/英歌水浒角色基础信息.xlsx
工作表：角色基础信息
Excel 行号：12
证据类型：明确记录
```

### 6.5 字段完整度

- 字段完整度
- 已确认字段
- 缺失字段
- 推导字段
- 未确认字段
- 完整度 86%
- 需要复核
- 可用于生成

### 6.6 外观数量与参考素材

- 外观数量
- 主外观
- 备选外观
- 定妆图
- 参考素材
- 角色参考图
- 场景参考图
- 已采纳素材
- 素材来源
- 素材引用
- Asset lineage 可写作“素材来源链路 / Asset Lineage”

### 6.7 提示词字段

| 英文 | 中文主文案 |
|---|---|
| Positive Prompt | 正向提示词 |
| Negative Prompt | 禁止提示词 |
| Prompt Keywords | 提示词关键词 |
| Prompt Source | 提示词来源 |
| Copy Prompt | 复制提示词 |

`Prompt` 可以保留英文，也可以写作“提示词”。推荐页面大标题用“提示词”，小 badge 或字段补充用 `Prompt`。

### 6.8 创建短片按钮

推荐按钮文案：

- 创建人物短片
- 用此角色创建项目
- 生成角色介绍短片
- 加入当前项目

不推荐：

- 新增
- 操作
- 管理
- 提交

## 7. 组件级文案规范

### 7.1 AppSidebar

主导航使用中文：

- 项目总览
- 角色圣经
- 剧本分镜
- 生成工作台
- 素材审核

预留入口：

- 任务队列
- 模型配置
- 素材库
- Agent 运行

状态：

- 即将开放
- 静态原型 v0.2
- Mock 服务正常
- 本月 ¥128.40

英文小字可以保留：`Dashboard`、`Character Bible`、`Script Studio`、`Generation Workspace`、`Asset Review`。

### 7.2 TopStatusBar

建议文案：

- 当前项目
- 英歌水浒人物介绍短片
- 当前角色：武松
- 模型状态
- 服务商状态
- 任务队列
- 运行中
- 排队中
- 失败
- 成本摘要
- 今日成本
- 本月成本
- 下一任务预估
- 可导出
- 导出就绪度

技术标签可保留：`Image`、`Video`、`TTS`、`OpenAI`、`Seedance`、`MiniMax`。

### 7.3 RightInspector

Inspector 类型中文标题：

| type | 中文标题 | 英文辅助 |
|---|---|---|
| default | 检查面板 | Inspector |
| task | 任务检查 | Task Inspector |
| agent | Agent 运行 | Agent Inspector |
| cost | 成本检查 | Cost Inspector |
| consistency | 一致性检查 | Consistency Inspector |
| asset | 素材复盘 | Asset Inspector |

默认空状态：

```text
当前页面暂未注入检查内容。后续会在这里展示任务、成本、Agent、一致性或素材复盘信息。
```

### 7.4 PageHeader

使用结构：

```text
中文标题
English Technical Subtitle
中文页面说明
```

按钮区使用中文动作，例如：

- 新建项目
- 导入 Excel
- 创建短片
- 导出方案
- 查看任务

### 7.5 StatusBadge

| 状态枚举 | 中文文案 |
|---|---|
| success | 成功 / 正常 / 已采纳 / 已完成 |
| warning | 预警 / 待复核 / 预算提醒 |
| error | 异常 / 失败 / 已拒绝 |
| processing | 处理中 / 运行中 / 排队中 |
| muted | 空闲 / 未配置 / 未确认 |

具体使用时优先写业务语义，不要只写抽象状态。例如“字段需复核”优于“预警”。

### 7.6 CostBadge

推荐文案：

- 今日 ¥12.80
- 本月 ¥128.40
- 预估 ¥3.20
- 项目累计 ¥86.50
- 单次生成 ¥0.48

避免：

- `¥128.40 month`
- `Estimated ¥3.20` 独立出现

### 7.7 TaskQueueMini

推荐文案：

- 任务队列
- 运行中 3
- 排队中 5
- 失败 1
- 已完成 18

可保留小字：`Task Queue`。

### 7.8 CostSummaryMini

推荐文案：

- 成本摘要
- 今日 ¥12.80
- 本月 ¥128.40
- 下一任务预估 ¥3.20

可保留小字：`Cost Summary`。

### 7.9 ModelCapabilityBadge

模型能力中文化：

| 英文 | 中文 |
|---|---|
| Image | 生图 |
| Video | 生视频 |
| TTS | TTS |
| First-frame | 首帧 |
| First-last-frame | 首尾帧 |
| Reference image | 参考图 |
| Multi-reference | 多参考图 |
| Audio | 音频 |
| Subtitle | 字幕 |

TTS、Prompt 等已成为常用技术词，可保留英文。

### 7.10 ProviderHealthBadge

推荐结构：

```text
OpenAI 正常
Seedance 预警
MiniMax 正常
```

也可写成：

```text
服务商 Provider：OpenAI 正常
```

不要把 `Provider` 强行翻译成不自然的“供应者”。统一用“服务商 Provider”。

### 7.11 AgentRunMini

推荐文案：

- Agent 运行
- ScriptAgent 已完成
- StoryboardAgent 复核中
- PromptAgent 处理中
- CriticAgent 发现预警
- ProductionAgent 空闲

Agent 名保留英文，状态中文化。

### 7.12 ProjectCard

推荐字段：

- 项目名称
- 当前阶段
- 目标平台
- 目标时长
- 关联角色
- 分镜数
- 已采纳素材
- 失败任务
- 项目成本
- 最近更新
- 模型配置

推荐按钮：

- 进入项目
- 查看任务
- 导出方案
- 复制项目
- 归档项目

### 7.13 CharacterCard

推荐字段：

- 姓名
- 绰号
- 排名
- 星位
- 英歌定位
- 脸谱主色
- 主要武器
- 字段完整度
- 外观数量
- 参考素材
- Excel 行号
- 一致性状态

推荐按钮：

- 查看角色圣经
- 创建人物短片
- 加入项目
- 复制提示词

### 7.14 CharacterDetailInspector

推荐分区：

- 字段来源
- 视觉一致性
- 提示词关键词
- 素材来源链路
- 缺失字段
- 需要复核
- 可用于生成

## 8. 中英混排规则

1. 中文标题优先。页面、导航、卡片、按钮、状态和用户操作必须先让中文读者看懂。
2. 英文作为辅助小字或 badge。英文辅助适合放在 eyebrow、副标题、tag、tooltip 中。
3. 模型名不翻译：`gpt-image-2`、`nano banana`、`Seedance 2.0`、`MiniMax TTS`。
4. Agent 名可以保留英文：`ScriptAgent`、`StoryboardAgent`、`PromptAgent`、`CriticAgent`、`ProductionAgent`。
5. `Prompt` 可以保留英文，也可写作“提示词”。面向用户的标题建议用“提示词”，技术字段可写 `Prompt`。
6. `Provider` 写作“服务商 Provider”。只写“服务商”也可以，只写 `Provider` 不推荐。
7. `Task` 写作“任务”。
8. `Cost` 写作“成本”。
9. `Character Bible` 在页面标题可写作“角色圣经 / Character Bible”。
10. `Asset` 在用户界面写作“素材”，技术补充可写 `Asset`。
11. `Shot` 写作“分镜”或“镜头”，技术模型讨论可写“分镜 Shot”。
12. `Panel` 写作“生成面板 Panel”，避免直接翻译成“面板”导致语义不清。
13. 数字、金额、模型版本、任务 ID 可使用英文/数字原样展示。
14. 中文与英文之间建议保留空格，例如“使用 Seedance 2.0 生成候选视频”。

## 9. 不要做什么

- 不要整页英文。
- 不要机械翻译模型名，例如不要把 `Seedance 2.0` 翻成“种子舞蹈 2.0”。
- 不要把专业技术词全部翻成奇怪中文，例如不要把 `Provider` 翻成“供应者”，不要把 `Prompt` 硬翻成“提示输入串”。
- 不要使用低端后台文案，例如“管理中心”“信息列表”“数据维护”“基础资料维护”“新增数据”。
- 不要做营销口号式文案，例如“开启你的 AI 创作新时代”“一键生成爆款视频”。
- 不要使用泛泛按钮，例如“操作”“提交”“确认一下”，要写清楚生产动作。
- 不要把“角色圣经”改成普通“角色详情”，除非是在二级解释中。
- 不要把“素材审核”写成“资源管理”，它的核心是采纳、拒绝、复盘和导出就绪。
- 不要把“生成工作台”写成“AI 工具箱”，它必须承载 Prompt、生图、生视频、TTS 和任务状态。

## 10. Phase 3 需要改的现有英文文案

Phase 3 开始前，建议优先修改 Phase 2 AppShell 中已有英文文案：

| 文件 | 当前英文 / 不理想文案 | 建议改为 |
|---|---|---|
| `components/layout/AppSidebar.tsx` | `Dashboard` | `项目总览`，小字 `Dashboard` |
| `components/layout/AppSidebar.tsx` | `Character Bible` | `角色圣经`，小字 `Character Bible` |
| `components/layout/AppSidebar.tsx` | `Script Studio` | `剧本分镜`，小字 `Script Studio` |
| `components/layout/AppSidebar.tsx` | `Generation Workspace` | `生成工作台`，小字 `Generation Workspace` |
| `components/layout/AppSidebar.tsx` | `Asset Review` | `素材审核`，小字 `Asset Review` |
| `components/layout/AppSidebar.tsx` | `Task Queue` | `任务队列` |
| `components/layout/AppSidebar.tsx` | `Model Config` | `模型配置` |
| `components/layout/AppSidebar.tsx` | `Asset Library` | `素材库` |
| `components/layout/AppSidebar.tsx` | `Agent Runs` | `Agent 运行` |
| `components/layout/AppSidebar.tsx` | `soon` | `即将开放` |
| `components/layout/AppSidebar.tsx` | `Workspace v0.2 static` | `静态原型 v0.2` |
| `components/layout/AppSidebar.tsx` | `mock providers online` | `Mock 服务正常` |
| `components/layout/TopStatusBar.tsx` | `Model Health` | `模型状态` |
| `components/layout/TopStatusBar.tsx` | `Provider Health` | `服务商状态` |
| `components/layout/TopStatusBar.tsx` | `Task Queue` | `任务队列` |
| `components/layout/TopStatusBar.tsx` | `Cost Summary` | `成本摘要` |
| `components/layout/TopStatusBar.tsx` | `Export Ready` | `可导出` |
| `components/layout/TopStatusBar.tsx` | `Monthly Cost` | `本月成本` |
| `components/common/TaskQueueMini.tsx` | `running`、`queued`、`failed` | `运行中`、`排队中`、`失败` |
| `components/common/CostSummaryMini.tsx` | `today`、`month`、`next est.` | `今日`、`本月`、`下一任务预估` |
| `components/common/AgentRunMini.tsx` | `completed`、`reviewing`、`idle` | `已完成`、`复核中`、`空闲` |
| `components/layout/RightInspector.tsx` | `Task Inspector` | `任务检查`，小字 `Task Inspector` |
| `components/layout/RightInspector.tsx` | `Agent Inspector` | `Agent 运行`，小字 `Agent Inspector` |
| `components/layout/RightInspector.tsx` | `Cost Inspector` | `成本检查`，小字 `Cost Inspector` |
| `components/layout/RightInspector.tsx` | `Consistency Inspector` | `一致性检查`，小字 `Consistency Inspector` |
| `components/layout/RightInspector.tsx` | `Asset Inspector` | `素材复盘`，小字 `Asset Inspector` |
| `app/dashboard/page.tsx` | `Dashboard` | `项目总览`，英文辅助 `Dashboard` |
| `app/characters/page.tsx` | `Character Bible` | `英歌角色库`，英文辅助 `Yingge Character Bible` |
| `app/characters/[id]/page.tsx` | `Character Detail` | `角色圣经详情`，英文辅助 `Character Bible Detail` |
| `app/script-studio/page.tsx` | `Script Studio` | `剧本分镜工作台`，英文辅助 `Script & Storyboard Studio` |
| `app/generation-workspace/page.tsx` | `Generation Workspace` | `提示词与生成工作台`，英文辅助 `Prompt & Generation Workspace` |
| `app/asset-review/page.tsx` | `Asset Review` | `素材审核与成片库`，英文辅助 `Asset Review & Final Library` |

## 11. 关键结论

1. 前端 UI 文案必须以中文为主，英文只作为技术标签和辅助副标题。
2. Phase 3 开始前应先中文化 Phase 2 AppShell 的导航、顶部状态栏、右侧 Inspector 和 6 个页面标题。
3. Dashboard 要用“项目总览”建立生产控制台感，不要做普通英文 Dashboard。
4. Character Library 要用“英歌角色库 / 角色圣经”建立 IP 资产心智，不要退化成普通列表。
5. 模型名、Agent 名、Prompt、Provider 等技术词可以保留英文，但状态、动作、字段、按钮必须中文化。
