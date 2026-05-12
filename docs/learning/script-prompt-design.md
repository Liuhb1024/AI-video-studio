# AI 英歌漫剧剧本生成设计说明

## 1. 为什么剧本不是普通文学剧本

在这个系统里，剧本不是最终交付物，而是后续资产生产的上游数据源。

它要同时服务四件事：

1. 让故事成立。
2. 让场次能被拆成分镜。
3. 让角色、场景、情绪、动作可以沉淀为资产。
4. 让后续生图、生视频提示词有可靠输入。

所以我们没有让大模型输出一篇散文式剧本，而是要求它输出“时间轴生产剧本”。

简单说：

```text
传统剧本：这一段故事写得是否好看
生产剧本：这一段故事能不能继续拆成镜头、提示词和生成任务
```

这就是为什么当前剧本生成强调：

```text
几秒到几秒发生什么
这一段承担什么剧情 beat
画面重点是什么
镜头语言是什么
后续如何拆分镜
AI 生成风险在哪里
```

## 2. 剧本在系统中的位置

当前系统的生产链路是：

```text
Project
-> Script
-> Scene
-> Shot Card
-> Image Prompt
-> Video Prompt
-> Generate Task
-> Asset
-> Final Cut
```

其中：

```text
Script = 故事线核心
Scene = 分镜生成入口
Shot Card = 生产执行核心
Character / World / Tag = 一致性资产核心
```

剧本是故事资产的根，但不是所有生产的最终单位。真正进入模型生成、素材归档、成本统计的核心单位是分镜卡。

因此，剧本生成 prompt 必须提前为分镜服务。

## 3. 为什么使用“导演组”身份

如果只给模型一个“编剧”身份，它容易输出文学化内容，比如：

```text
少年在夜色中感到命运召唤，祠堂深处似乎有什么东西正在苏醒。
```

这种内容有氛围，但不好直接生产。分镜师还要重新判断景别、机位、动作、转场、画面重点。

所以我们把 system prompt 设计成“AI 英歌漫剧导演组”：

```text
总导演：控制故事节奏、情绪推进、镜头调度。
分镜导演：把剧情拆成可执行镜头。
摄影指导：设计景别、机位、构图、光影、运镜。
剪辑指导：设计转场、剪辑点、节奏密度。
AI 生成导演：规避 AIGC 难点，降低抽卡成本。
民俗顾问：保护英歌文化表达，不低俗化、不猎奇化。
```

这样做的目标不是让 prompt 看起来“很厉害”，而是强迫模型从多个生产角色同时思考。

它必须同时回答：

```text
故事怎么推进
镜头怎么拍
剪辑怎么接
生成模型哪里容易翻车
民俗表达有没有越界
```

## 4. 为什么输出 JSON

剧本生成必须输出合法 JSON，因为后端要解析、校验、落库。

如果让模型自由输出 Markdown 或自然语言，会出现几个问题：

1. 场次结构不稳定。
2. 秒数无法可靠读取。
3. 后续分镜生成无法引用字段。
4. 版本记录和成本复盘难以结构化。
5. 前端无法稳定展示结果。

所以当前 prompt 明确要求：

```text
只输出一个合法 JSON 对象
不输出 Markdown
不输出代码块
不输出解释
```

后端会再次做校验：

```text
是否是合法 JSON
timeline 是否为空
start_second / end_second 是否合理
时间段是否重叠
```

模型输出不能直接信，系统必须二次验证。

## 5. 时间轴剧本字段设计

当前剧本输出核心结构是：

```json
{
  "title": "短剧标题",
  "logline": "一句话梗概",
  "full_script": "完整剧本文本",
  "characters": [],
  "timeline": [],
  "scene_summary": []
}
```

其中最重要的是 `timeline`。

每个时间段包含：

```text
start_second
end_second
beat
story
visual_focus
lens_language
emotion
characters
dialogue
narration
shot_hint
transition
shot_density
recommended_shot_count
keyframe_priority
storyboard_plan
generation_risk
simplify_strategy
```

这些字段分别解决不同问题。

`start_second / end_second`

用于确定节奏和时长，也方便后续自动生成场次和分镜。

`beat`

用于标记剧情功能，例如：

```text
强钩子
进入事件
冲突推进
高能转折
悬念收束
```

它让剧本不是流水账，而是有短视频节奏。

`visual_focus`

用于告诉分镜阶段这一段画面重点是什么。它不是完整提示词，而是画面抓手。

例如：

```text
脸谱影子、双槌、祠堂门缝
```

`lens_language`

用于提前让模型思考专业镜头语言：

```text
景别
机位
构图
运镜
光影
剪辑点
```

`transition`

用于让时间段之间可剪辑，而不是彼此孤立。

英歌题材特别适合：

```text
鼓点切
动作匹配切
遮挡转场
声音桥
光影闪切
反应切
物件切
```

`storyboard_plan`

用于提前拆出可生成镜头思路。

它包含：

```text
shot
purpose
image_prompt_focus
video_prompt_focus
```

这里已经开始为后续 Seedream / Seedance 做准备。

`generation_risk / simplify_strategy`

这是 AI 漫剧生产里非常关键的字段。

模型不只要告诉我们“怎么生成”，还要告诉我们“哪里可能翻车”。

例如：

```text
风险：多角色队列容易粘连
规避：拆成脚步特写、双槌特写、队列剪影
```

## 6. 参数为什么这样入模

剧本生成页面有很多参数，但不是所有参数都应该进入创作 prompt。

当前策略是：

### 必须入模

```text
原始想法
视频时长
目标平台
故事结构
类型风格
情绪基调
英歌强度
文化表达
传统/现代融合
开头方式
结尾方式
对白密度
动作密度
旁白比例
视觉符号
禁忌处理
```

这些参数会直接影响故事结构、节奏和表达方式。

### 不进入创作 prompt

```text
画面比例
```

画面比例会影响生图构图、字幕安全区、人物站位和视频适配，但不应该影响剧情本身。

所以当前系统只保存它：

```text
aspect_ratio_saved_only
```

后续分镜和生图阶段再使用。

### 目标平台如何入模

平台不改变故事本体，只改变节奏。

例如：

```text
抖音：前三秒钩子更强，节奏更密。
视频号：文化表达和情绪递进可以更稳。
B站：设定解释和完整性可以多一点。
```

所以 prompt 里明确写：

```text
目标平台只影响节奏、开头强度、信息密度和结尾钩子，不得改变核心故事设定。
```

## 7. 温度为什么设为 1.0

用户指定模型温度为 `1.0`。

剧本生成需要一定创造力，所以温度不能太低。但为了结构稳定，我们用两个手段约束它：

1. system prompt 强约束输出结构。
2. 后端 Pydantic schema 做二次校验。

也就是说：

```text
temperature = 1.0 负责创意
JSON schema + 后端校验负责稳定
```

## 8. 为什么非流式生成

当前剧本生成使用非流式。

原因：

1. JSON 需要完整返回后才能解析。
2. 流式输出容易出现半截 JSON。
3. 后端保存版本需要完整结构。
4. MVP 阶段先保证稳定落库。

为了避免等待体验差，前端使用可见进度面板：

```text
解析故事灵感
规划时间轴节奏
调用 DMXAPI 模型
校验 JSON 结构
保存剧本版本
拆分场次草案
```

这是体验型进度。后续如果做任务队列或 SSE，可以升级成真实进度。

## 9. 民俗安全为什么放进 system prompt

英歌题材不是普通奇幻素材，它带有真实地域文化和民俗语境。

因此禁忌处理不能只作为 UI 选项，而应该成为系统底线。

当前 system prompt 里明确：

```text
英歌文化表达要庄重、热血、有仪式感。
不得戏谑、丑化、低俗化或廉价恐怖化。
避免地域、族群、民俗刻板印象。
不要编造冒犯性祭祀或禁忌。
```

这样做是为了避免模型把民俗题材写成廉价惊悚或猎奇内容。

## 10. 参考的 prompt 设计原则

这次剧本 prompt 主要吸收了几类公开原则：

1. 指令放前面，输入结构化。
2. 输出必须有明确 schema。
3. 用业务角色约束模型思考路径。
4. 把模糊审美转成可执行字段。
5. 用后端校验模型输出。
6. 对 AIGC 易失败点提前建模。

参考资料：

- [OpenAI Prompt Engineering Best Practices](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api)
- [OpenAI Structured Outputs](https://openai.com/index/introducing-structured-outputs-in-the-api/)
- [Google Gemini Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
- [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Runway Gen-4 Video Prompting Guide](https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide)
- [Runway AI Video Prompting Guide](https://runwayml.com/resources/ai-video-prompting-guide)

## 11. 当前系统落地位置

当前剧本 prompt 文件：

```text
apps/api/app/ai/script_prompt.py
```

当前 prompt 版本：

```text
script_timeline_v2_director_room
```

相关后端服务：

```text
apps/api/app/modules/scripts/service.py
apps/api/app/modules/scripts/schemas.py
apps/api/app/modules/scripts/router.py
```

核心落库结果：

```text
Script：保存剧本版本和完整内容
Scene：保存每段时间轴场次
generation_settings：保存模型、温度、prompt_version、用户参数
```

## 12. 最终设计原则

剧本生成的最终原则是：

```text
先结构，后文采。
先生产可用，再追求表达漂亮。
先保证可拆分镜，再保证可读性。
```

这不是降低剧本质量，而是让剧本真正进入生产链路。

对于 AI 漫剧系统来说，最重要的不是模型写出一段惊艳文字，而是它能稳定产出：

```text
可拆分
可编辑
可生成
可复盘
可资产化
```

