# AI 英歌漫剧生图提示词研究报告

面向：AI 英歌漫剧生产工作台

目标：提升角色生图、风格转换、关键帧生成质量，降低抽卡次数。

## 资料来源

| 类型 | 来源 | 价值 |
|---|---|---|
| OpenAI 官方 | https://developers.openai.com/api/docs/guides/image-generation | 确认 `gpt-image-2` 可用 Image API / Responses API，支持生成、编辑、多轮图像生成、尺寸质量控制 |
| OpenAI Cookbook | https://developers.openai.com/cookbook/examples/multimodal/image-gen-1.5-prompting_guide | 官方提示词结构参考：场景、主体、细节、约束、多图引用、风格迁移、角色一致性 |
| OpenAI 安全卡 | https://deploymentsafety.openai.com/chatgpt-images-2-0/chatgpt-images-2-0.pdf | Images 2.0 强化世界知识、指令遵循、复杂细节、密集文本，但需要安全和输入输出审核 |
| GPT Image 2 社区资料 | https://fal.ai/learn/tools/prompting-gpt-image-2 | 高价值结构：Scene / Subject / Important details / Use case / Constraints |
| GPT Image 2 开源库 | https://github.com/freestylefly/awesome-gpt-image-2 | Prompt-as-Code 思路：任务类型、结构约束、风格材质分层，适合本项目模板化 |
| GPT Image 2 示例库 | https://youmind.com/gpt-image-2-prompts?id=13836 | 复杂 UI、中文文字、商业图、信息图、直播截图类提示词参考 |
| Seedream | https://www.seedream50.net/prompt-guide | 多参考图、批量生成、角色和风格一致性、提示词不要过长 |
| Seedream 技术报告 | https://arxiv.org/abs/2509.20427 | Seedream 4.0/4.5 强于多模态图像生成、编辑、多图参考、4K 输出、上下文推理 |
| Seedance | https://arxiv.org/abs/2604.14148 | 支持文本、图片、音频、视频多模态参考，适合后续关键帧转视频 |
| Seedance 提示词 | https://seedance2video.io/zh/blog/seedance2-prompt-guide | 视频提示词要锁主体、镜头、动作、节奏、输出和约束 |
| AI 漫画一致性 | https://www.comicsai.org/en/blog/character-consistency-ai-comics-guide | 角色 bible、参考图、固定风格、种子/身份锚点 |
| Storyboard 提示词 | https://storyboardhero.ai/prompting | 分镜提示词要具体、简洁、有顺序，避免堆词 |

## 核心结论

- 生图 prompt 不能写成“好看、震撼、电影感”。
- 要写成可执行结构：主体身份 + 参考图角色 + 服饰道具 + 场景 + 构图 + 光影 + 风格 + 质量约束 + 禁止项。
- 风格模板不是描述当前截图，而是抽象为“可迁移规则”。
- 角色一致性不能只锁脸，还要锁：脸谱、头饰、服饰纹样、武器、体态、队列位置、动作身段。
- AI 输出必须进入候选资产区，人工采纳后才能进入关键帧链路。

## gpt-image-2 高质量提示词结构

```text
Scene:
{地点、时间、空间、背景层次}

Subject:
{角色身份、年龄/体态、脸谱、头饰、服饰、武器、姿态}

Important details:
{纹样、材质、光影、镜头、构图、色彩、动作瞬间、表情}

Style reference:
{全局风格模板字段：线条、色彩、光影、人物渲染、背景处理}

Use case:
{角色设定图 / 四视图 / 风格转换 / 关键帧 / 分镜图}

Constraints:
{必须保留、禁止漂移、禁止新增、禁止水印、禁止文字乱码、禁止畸形}
```

## 风格识别 PromptTemplate

```text
你是 AI 英歌漫剧视觉总监、gpt-image-2 提示词工程师、Seedream/Seedance 多模态创作顾问。

你的任务不是描述这张截图里发生了什么，而是从截图中提取“可复用、可迁移、可落库”的视觉风格规则，用于后续角色生图、真人妆照风格转换、关键帧生成和生视频提示词。

你必须从以下维度分析：
1. 线条与边缘：线条粗细、轮廓硬度、描边方式、细节密度。
2. 色彩系统：主色、辅色、饱和度、冷暖关系、对比方式。
3. 光影系统：主光方向、阴影硬度、边缘光、环境光、戏剧化程度。
4. 构图系统：景别、视角、透视、主体位置、留白、背景层级。
5. 人物渲染：脸部处理、皮肤/面部质感、服饰褶皱、动作夸张度。
6. 背景处理：空间深度、建筑/道具复杂度、虚实关系。
7. 材质质感：纸感、胶片感、颗粒、笔触、赛璐璐、厚涂、3D、写实等。
8. 英歌迁移规则：该风格如何迁移到脸谱、头饰、潮绣服饰、双槌、鼓阵、祠堂、巷口、队列、动作身段。

输出必须是严格 JSON，不要 Markdown，不要解释。
禁止使用空泛词，如“好看”“高级”“氛围感拉满”“大片感”。
每个字段必须能直接进入生图或生视频 prompt。
```

推荐 JSON 字段：

```json
{
  "style_category": "string",
  "visual_summary": "string",
  "line_style": "string",
  "color_palette": "string",
  "lighting_style": "string",
  "composition_style": "string",
  "character_rendering": "string",
  "background_rendering": "string",
  "texture_keywords": "string",
  "yingge_adaptation": "string",
  "image_prompt_template": "string",
  "video_prompt_template": "string",
  "negative_prompt": "string"
}
```

## 英歌题材词汇库

角色身份：

```text
英歌少年、梁山好汉原型、潮汕英歌舞者、前棚英歌队员、中棚英歌队员、领舞头槌、二槌、鼓手、旗手、舞蛇者、队列核心人物
```

脸谱：

```text
戏面脸谱、红面红须、黑面黑须、白底脸谱、红黑彩绘、金色线描、粗眉、眼窝勾勒、鼻梁纹样、脸颊对称纹、忠义脸谱、勇武脸谱、辟邪感脸谱
```

头饰：

```text
将军盔、英雄冠、绣花头巾、戏曲盔头、彩球头饰、红缨、金边帽饰、银色额饰、潮绣头饰
```

服饰：

```text
潮绣服饰、戏曲武生服、黑底红金纹样、缎面短袍、绣花肩披、腰带、绑腿、护腕、云纹、龙纹、虎纹、蛇纹、金线刺绣、红黑金配色、宽袖、束腰、裤腿纹样
```

武器 / 道具：

```text
英歌槌、双槌、短木棒、鼓槌、手鼓、队旗、号令旗、蛇形道具、彩带鼓槌、木槌交击、槌花、槌影
```

动作身段：

```text
南拳大站马、跨步、沉肩、挥槌、交击、转身、跃步、踏步、弓步、开合阵、冲阵、回身亮相、鼓点卡位、双槌上扬、双槌交叉、侧身挥槌
```

队列 / 场景：

```text
鼓阵、巡游队列、祠堂门口、潮汕老巷、青石巷口、红灯笼、宗祠牌匾、庙会街巷、夜巡火光、村落广场、舞台烟雾、观众围观、锣鼓队
```

气质：

```text
民俗仪式感、中华战舞、阳刚血性、忠义、威武、热烈、驱邪、集体冲锋、鼓点压迫感、潮汕民俗、非遗传承、英雄会师
```

色彩：

```text
黑红金、陶土红、朱砂红、铜金、青绿色边缘光、暖火光、夜色蓝黑、庙会暖黄、绣线金色高光
```

## 可落地开发建议

1. `StyleTemplate` 增加：
   - `yingge_adaptation`
   - `prompt_keywords_positive`
   - `prompt_keywords_negative`
   - `style_strength_suggestion`
   - `best_for_generation_types`
2. 风格识别失败不要 fallback：
   - `GenerateTask.status = failed`
   - `StyleTemplate.analysis_status = failed`
   - 不回填 mock
   - 前端显示错误 + 允许重试
3. `PromptTemplate` 建议拆成：
   - `style_template_analysis`
   - `character_four_view`
   - `character_style_transfer`
   - `shot_keyframe`
   - `keyframe_to_video`
4. 每次生图任务必须保存：
   - 角色资产快照
   - 参考图列表
   - 风格模板快照
   - 最终 prompt
   - negative prompt
   - 模型名
   - 温度
   - 尺寸比例
   - 输出资产
   - 人工采纳状态
5. 生图工作台显示最终 Prompt 拆解：
   - 角色锚点
   - 脸谱锚点
   - 服饰锚点
   - 风格锚点
   - 镜头/构图
   - 用户补充
   - 负面约束
6. 做一个抽卡复盘字段：
   - 脸谱漂移
   - 服饰丢失
   - 武器错误
   - 风格不一致
   - 构图错误
   - 人物变形
   - 背景抢主体
