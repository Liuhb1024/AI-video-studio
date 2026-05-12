# AI 英歌漫剧分镜中心设计说明

## 1. 为什么分镜中心是系统核心

在 AI 漫剧生产里，分镜不是一个“中间展示页”，而是决定生图质量、视频质量、生成成本和返工次数的核心控制层。

剧本解决：

```text
故事讲什么
```

分镜解决：

```text
每一镜怎么被看见
每一镜怎么生成
每一镜怎么剪接
每一镜怎么避免翻车
```

所以分镜卡不能只是传统影视分镜表，也不能只是普通后台数据表。

它应该是：

```text
Shot Card = 一张可生成、可检查、可返工、可入剪辑的镜头生产单元
```

## 2. 我们参考了哪些资料

这次分镜设计参考了三类资料。

第一类是专业影视和动画分镜资料：

- [Celtx Shot Lists](https://support.celtx.com/hc/en-us/articles/218530327-Shot-Lists)
- [StudioBinder Film Shot List Template](https://www.studiobinder.com/templates/shot-list/film-shot-list-template/)
- [Boords Shot List Template Guide](https://boords.com/shot-list-template)
- [BBC Academy Five Essential Shots](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf)
- [BBC Academy Crossing the Line - Eyeline](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/crossing_the_line_eyeline_ts.pdf)
- [Yale Film Terminology Glossary](https://teachers.yale.edu/curriculum/units/2006/1/9/6)
- [Toon Boom Storyboard Pro Camera Movements](https://docs.toonboom.com/help/storyboard-pro-22/storyboard/camera/about-camera-move.html)

第二类是 AI 生图和生视频提示词资料：

- [ByteDance Seedance 2.0](https://seed.bytedance.com/en/seedance2_0)
- [ByteDance Seedream 5.0 Lite](https://seed.bytedance.com/en/seedream5_0_lite)
- [ByteDance Seedream 4.0](https://seed.bytedance.com/en/blog/seedream-4-0-officially-released-beyond-drawing-into-imagination)
- [Runway Gen-4 Video Prompting Guide](https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide)
- [Runway Academy Prompting Guide](https://academy.runwayml.com/guides/prompting-guide)
- [Kling Image-to-Video Guide](https://kling.ai/quickstart/image-to-video-guide)
- [Google DeepMind Veo Prompt Guide](https://deepmind.google/models/veo/prompt-guide/)
- [OpenAI Sora Video Generation Guide](https://platform.openai.com/docs/guides/video-generation/)
- [OpenAI Sora 2 Prompting Guide](https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide)

第三类是 Claude Code / Cursor / Cline 等 agent 工具交互设计：

- [Learn Claude Code](https://pengr.github.io/learn-claude-code/)
- [Learn Claude Code - Agent Loop](https://github.com/pengr/learn-claude-code/blob/main/docs/01-agent-loop.md)
- [Learn Claude Code - Commands](https://github.com/pengr/learn-claude-code/blob/main/docs/07-commands.md)
- [Learn Claude Code - Context Compaction](https://github.com/pengr/learn-claude-code/blob/main/docs/04-compaction.md)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code Memory](https://code.claude.com/docs/en/memory)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Cursor Planning](https://docs.cursor.com/agent/planning)
- [Cursor Rules](https://docs.cursor.com/context/rules-for-ai)
- [Cursor Checkpoints](https://docs.cursor.com/en/agent/chat/checkpoints)
- [Cline Checkpoints](https://cline-efdc8260.mintlify.app/features/checkpoints)

## 3. 专业分镜给我们的启发

传统 shot list 通常记录：

```text
场景
镜号
镜头描述
景别
机位
运镜
镜头时长
角色
道具
声音
镜头顺序
备注
```

这些字段的目的不是“好看”，而是让拍摄团队执行。

AI 漫剧同理。Shot Card 也必须让后续模型执行。

专业资料给我们的核心启发：

1. 镜头必须有编号和顺序。
2. 景别、机位、构图、运镜要结构化。
3. 轴线、视线、运动方向会影响连续性。
4. 转场和剪辑点要提前设计。
5. 声音不是后期附属，它会影响节奏和剪辑。
6. 镜头时长会影响节奏，也会影响生成难度。

这意味着分镜卡不能只写：

```text
少年走进祠堂，看见脸谱发光。
```

它应该写成：

```text
镜头目的：建立神秘事件。
景别：中近景。
机位：低机位。
构图：前景红绸遮挡，少年位于右三分线。
运镜：固定机位缓慢推近。
光影：祠堂暖光从门缝透出，脸部保持半明半暗。
剪辑点：鼓点落下时切到脸谱特写。
```

## 4. AI 生图资料给我们的启发

Seedream / 即梦生图手册的核心规则可以归纳为：

```text
主体 + 动作/细节 + 环境 + 风格 + 构图 + 光影 + 画质
```

生图最怕：

1. 主体不清楚。
2. 风格堆太多。
3. 参考图职责不明确。
4. 角色、服装、道具描述每次都变。
5. 只写“高级感”“好看”，没有具体画面。

所以分镜卡必须提前准备生图所需字段：

```text
主体
场景
姿态或瞬间动作
构图
景别
光影
色彩
材质细节
风格
画质
参考图用途
负面约束
```

尤其是参考图，需要明确职责。

错误写法：

```text
参考这张图生成。
```

正确写法：

```text
参考图 1：只用于保持角色脸型、发型、年龄感。
参考图 2：只用于参考红黑服饰和双槌材质。
参考图 3：只用于参考祠堂光影，不参考人物。
```

这会显著降低角色漂移和风格混乱。

## 5. AI 生视频资料给我们的启发

Runway、Kling、Veo、Sora、Seedance 的文档虽然模型不同，但核心原则很像：

```text
一个镜头一个核心主体
一个镜头一个主要动作
短视频镜头优先 3-6 秒
复杂动作拆镜
图生视频时，文本重点写运动，不要重复图片已有信息
```

视频提示词的核心不是画面描述，而是运动描述。

推荐结构是：

```text
主体动作
环境运动
镜头运动
景别/构图
节奏
音频/鼓点
连续性约束
```

例如：

```text
主体：英歌少年侧背影。
动作：沿潮汕老街向祠堂门口缓慢前行。
镜头：稳定跟拍，轻微手持感。
环境：红灯笼在风中轻晃，地面积水反射鼓点震动。
节奏：脚步与远处鼓点同步。
约束：保持角色服装、双槌位置、脸部自然，画面稳定无水印。
```

比下面这种更稳：

```text
少年进入祠堂，与神秘力量展开激烈对抗，画面震撼。
```

## 6. 为什么分镜卡要有“生成风险”

AI 视频常见翻车点包括：

```text
多角色粘连
手部变形
武器穿模
服装漂移
背景漂移
动作过载
镜头乱切
人物五官变化
方向关系混乱
```

如果这些问题等到生成失败后再复盘，就会浪费很多模型调用成本。

所以分镜卡必须提前记录：

```text
generation_risk
simplify_strategy
readiness
quality_checks
```

例如：

```text
生成风险：多人英歌队列同步动作容易粘连。
规避策略：拆为脚步特写、双槌特写、队列剪影三个镜头。
就绪度：需补角色参考图。
质检项：脸部一致、服装一致、双槌存在、背景锚点一致。
```

这就是 AI 漫剧分镜和传统影视分镜的最大差异。

## 7. Claude Code 设计给我们的启发

我们参考 Claude Code / Cursor / Cline，不是为了把分镜中心做成代码编辑器，而是学习它们处理复杂 AI 工作流的方式。

核心启发有 7 个。

### 1. 任务是可追踪生产流

Claude Code 不是点击按钮后消失，而是持续展示：

```text
读取上下文
思考计划
执行工具
检查结果
继续下一步
```

分镜中心也应该展示：

```text
读取剧本版本
解析场次
抽取角色和场景
生成分镜卡草案
生成提示词草案
检查生成风险
等待用户确认
```

### 2. Plan / Todo 思维

分镜生成不应该是一颗按钮。

更像：

```text
生成本集分镜计划
确认镜头密度
生成镜头卡草案
人工挑选和编辑
进入提示词生成
进入生成任务
```

这能让用户知道 AI 在做什么，也能中途干预。

### 3. 上下文显式化

Claude Code 会用 `CLAUDE.md`、rules、memory、skills 来管理上下文。

分镜中心也应该让用户看到本轮 AI 使用了什么：

```text
剧本版本
角色设定
参考图
世界观设定
禁忌词
视觉风格
历史镜头
```

否则用户会不知道 AI 为什么这样拆镜头。

### 4. 可编辑产物优先

Claude Code 的输出会落成文件、diff、计划、任务。

分镜中心的输出也应该落成对象：

```text
场景卡
分镜卡
提示词卡
生成任务
素材版本
质检记录
```

不要只展示一段 AI 文本。

### 5. 检查点和回滚

Cursor / Cline 有 checkpoint。

分镜中心后续也应该支持：

```text
恢复到生成分镜前
恢复某个场次的镜头版本
只回滚提示词，不删除已生成素材
保留资产，但撤销任务计划
```

这会降低用户试错成本。

### 6. 命令面板

Claude Code 有 `/commands`。

分镜中心可以有创作命令：

```text
/拆分当前场景
/补齐镜头语言
/生成三版构图
/检查角色一致性
/降低生成成本
/按抖音节奏重排
/导出剪辑脚本
```

新手用按钮，熟练用户用命令。

### 7. 状态和日志业务化

不需要展示底层技术日志，但要展示业务状态：

```text
读取第 3 场剧本
引用角色：英歌少年、脸谱影
发现 2 个高风险镜头
本轮预计生成成本 0 元
```

这比一个 loading 圈更有安全感。

## 8. 分镜中心页面设计

建议分镜页做成三栏导演工作台：

```text
左栏：剧本场次时间轴
中栏：分镜卡序列
右栏：镜头详情 Inspector
```

顶部状态栏：

```text
项目中心 > 项目文件夹 > 分镜
剧本版本选择
镜头总数
已锁定镜头
待补参考镜头
生成就绪镜头
启动分镜生产流
```

左栏展示：

```text
剧本版本
场次列表
00:00-00:05 强钩子
00:05-00:12 进入事件
角色上下文
参考素材上下文
```

中栏展示 Shot Card：

```text
S01 00:00-00:04
鼓点切 / 特写 / 低机位缓推
主体：英歌少年
风险：手部双槌易变形
就绪：需角色参考图
```

右栏展示详情：

```text
剧情目的
镜头描述
角色
景别
机位
构图
运镜
光影
转场
生图提示词
生视频提示词
生成风险
规避策略
参考素材
质检项
```

## 9. Shot Card 推荐字段

MVP 字段建议：

```text
project_id
script_id
scene_id
shot_no
order_index
status
story_beat
description
characters
setting
emotion
action
expression
props
shot_size
camera_angle
composition
camera_movement
lighting
transition_in
transition_out
edit_point
duration_seconds
image_prompt
video_prompt
negative_prompt
reference_asset_ids
continuity_constraints
generation_risk
simplify_strategy
readiness
metadata
```

其中 `metadata` 可以暂时承载后续增强字段，避免 MVP 阶段建太多表。

后续增强字段：

```text
axis_side
screen_direction
eyeline_target
wardrobe_state
makeup_state
sound_effects
music_cue
locked_fields
quality_checks
review_flags
prompt_version
model_target
generation_mode
```

## 10. 推荐状态模型

Shot Card 状态不建议只用 `draft/done`。

更适合 AI 漫剧生产的是：

```text
待拆解
草案
待确认
提示词就绪
生成中
待挑选
已采纳
需返工
已锁定
已入剪辑
```

MVP 可以先简化为：

```text
draft
ready
generating
generated
approved
needs_revision
locked
```

## 11. 分镜生成 prompt 应该怎么设计

分镜 prompt 的身份应该是：

```text
你是 AI 漫剧分镜导演 + 生图提示词导演 + 生视频提示词导演。
你的任务不是复述剧情，而是把剧本场次拆成可稳定生成的镜头卡。
每个镜头必须可生图、可生视频、可检查、可剪辑。
```

硬规则：

```text
一个镜头只放一个核心主体。
一个镜头只放一个主要动作。
默认 3-6 秒一镜。
复杂动作必须拆镜。
多角色互动优先用反打、特写、剪影、道具镜头。
图生视频提示词重点写运动，不重复图片已有信息。
所有参考素材必须写清参考职责。
每张卡必须有生成风险和规避策略。
```

输出结构：

```json
{
  "shots": [
    {
      "shot_no": "S01",
      "scene_id": "...",
      "story_beat": "...",
      "description": "...",
      "characters": [],
      "visual": {},
      "image_prompt_plan": {},
      "video_prompt_plan": {},
      "references": [],
      "risk": {},
      "readiness": "ready"
    }
  ]
}
```

## 12. 为什么不是普通表格

表格适合管理订单、成本、素材列表。

但分镜是创作执行对象，它需要同时看：

```text
顺序
节奏
画面
风险
提示词
参考素材
生成状态
```

普通表格会把这些信息压扁。

所以分镜中心更适合：

```text
时间轴
卡片序列
右侧 Inspector
任务流状态
命令面板
```

这也是我们从 Claude Code / Cursor 设计里学到的东西：AI 工作流不应该藏在一个按钮后面，而应该变成可见、可编辑、可追踪的生产过程。

## 13. 最终设计原则

分镜中心的最终原则是：

```text
先稳定生成，再追求复杂镜头。
先单镜可控，再多镜连续。
先让用户能编辑，再让 AI 自动化。
先把风险暴露出来，再进入模型调用。
```

对这个系统来说，好的分镜不是“电影术语很多”，而是：

```text
能保持角色一致
能保持场景一致
能指导生图
能指导生视频
能降低失败率
能进入剪辑线
能回溯成本和版本
```

这就是为什么我们要把分镜卡设计成“AI 生成执行卡”。

