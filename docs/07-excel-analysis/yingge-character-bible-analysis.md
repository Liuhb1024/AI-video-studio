# 英歌水浒角色基础信息 Excel 分析

## 0. 分析范围

- 输入文件：`/Users/huabi/code/AI-video-studio/data/英歌水浒角色基础信息.xlsx`
- 输出文件：`/Users/huabi/code/AI-video-studio/docs/07-excel-analysis/yingge-character-bible-analysis.md`
- 工作表名：`角色IP圣经`
- 分析方式：只读解析 Excel 元数据、表头结构、合并单元格、字段样本和前 5 条角色数据。
- 未读取内容：未读取任何 `.env`、key、token、证书文件。
- 未修改内容：未修改 Excel 源文件。
- 本文不包含业务代码，仅提供 PRD v1.0、数据模型和导入功能设计建议。

## 1. Excel 基础信息

| 项目 | 结论 |
|---|---|
| 工作簿路径 | `/Users/huabi/code/AI-video-studio/data/英歌水浒角色基础信息.xlsx` |
| 工作表数量 | 1 |
| 工作表名称 | `角色IP圣经` |
| 总行数 | 48 |
| 总列数 | 20 |
| 表头行数 | 3 行，分别为层级、字段组、子字段 |
| 数据起始行 | 第 4 行 |
| 有效数据行数 | 45 行 |
| 空数据行 | 未发现 |
| 是否存在合并单元格 | 是 |
| 是否存在多级表头 | 是 |

### 1.1 合并单元格

Excel 存在合并单元格，主要用于表达五层信息架构和字段组：

| 合并区域 | 含义 |
|---|---|
| `A1:C1` | 第一层 · 身份层 |
| `D1:H1` | 第二层 · 内核层 |
| `I1:P1` | 第三层 · 文化视觉层 |
| `Q1:R1` | 第四层 · 叙事素材层 |
| `S1:T1` | 第五层 · 商业文化层 |
| `J2:M2` | 人物主色系与纹样体系 |
| `O2:P2` | 通用描述词组 |
| `A2:A3`、`B2:B3`、`C2:C3`、`D2:D3` 等 | 单字段跨第 2、3 行显示 |

### 1.2 表头结构

| 列 | 层级 | 字段组 | 字段中文名 |
|---|---|---|---|
| A | 第一层 · 身份层 | 基本信息 | 基本信息 |
| B | 第一层 · 身份层 | 梁山职务 | 梁山职务 |
| C | 第一层 · 身份层 | 惯用武器 | 惯用武器 |
| D | 第二层 · 内核层 | 核心人格标签 | 核心人格标签 |
| E | 第二层 · 内核层 | 角色内在矛盾/冲突 | 角色内在矛盾/冲突 |
| F | 第二层 · 内核层 | 人生关键经历节点 | 人生关键经历节点 |
| G | 第二层 · 内核层 | 观众情绪触发点 | 观众情绪触发点 |
| H | 第二层 · 内核层 | 目标用户画像 | 目标用户画像 |
| I | 第三层 · 文化视觉层 | 英歌舞角色定位 | 英歌舞角色定位 |
| J | 第三层 · 文化视觉层 | 人物主色系与纹样体系 | 英歌脸谱主色 |
| K | 第三层 · 文化视觉层 | 人物主色系与纹样体系 | 颜色象征含义 |
| L | 第三层 · 文化视觉层 | 人物主色系与纹样体系 | 脸谱特征纹样 |
| M | 第三层 · 文化视觉层 | 人物主色系与纹样体系 | 水浒原著色彩线索 |
| N | 第三层 · 文化视觉层 | 视觉设计调性关键词 | 视觉设计调性关键词 |
| O | 第三层 · 文化视觉层 | 通用描述词组 | 正向词 |
| P | 第三层 · 文化视觉层 | 通用描述词组 | 禁止词 |
| Q | 第四层 · 叙事素材层 | 核心叙事原点 | 核心叙事原点 |
| R | 第四层 · 叙事素材层 | 角色关系图谱 | 角色关系图谱 |
| S | 第五层 · 商业文化层 | 产品文化调性定位 | 产品文化调性定位 |
| T | 第五层 · 商业文化层 | 祈福辟邪文化寓意 | 祈福辟邪文化寓意 |

## 2. 字段结构分析

### 2.1 第一层：身份层

| 字段中文名 | 示例值 | 适合映射到哪个系统实体 | 结构化字段 | Prompt 输入 | 商品/文创转化字段 |
|---|---|---|---|---|---|
| 基本信息 | `姓名：宋江`、`绰号：及时雨·呼保义`、`排名：第1位`、`星位：天魁星`、`出身：山东郓城县，押司出身（刀笔小吏）` | `Character`、`ProjectCharacter` | 是，应拆为 `name`、`nickname`、`ranking`、`star_position`、`origin` | 是，尤其是姓名、绰号、星位、出身 | 是，姓名、绰号、星位可用于商品命名 |
| 梁山职务 | `总兵都头领（梁山寨主）` | `Character`、`ProjectCharacter` | 是 | 是 | 是 |
| 惯用武器 | `骨朵（仪仗兵器，以统帅谋略为主，武力非核心）` | `CharacterVisualProfile`、`PromptKeywordSet` | 是，可拆主武器和说明 | 是 | 是，适合转化为手办、英歌槌、挂件元素 |

### 2.2 第二层：内核层

| 字段中文名 | 示例值 | 适合映射到哪个系统实体 | 结构化字段 | Prompt 输入 | 商品/文创转化字段 |
|---|---|---|---|---|---|
| 核心人格标签 | `城府极深·仗义疏财·隐忍圆滑·权谋至上·忠君思想根深蒂固` | `CharacterNarrativeProfile` | 是，应拆成标签数组 | 是 | 是，可影响产品人格标签和包装文案 |
| 角色内在矛盾/冲突 | `他是江湖人人仰望的“及时雨”，却也是梁山最工于心计的政治家。` | `CharacterNarrativeProfile` | 否，长文本为主，可保留结构化摘要 | 是，影响脚本、旁白、视频情绪 | 是，适合品牌故事 |
| 人生关键经历节点 | `①私放晁盖...②怒杀阎婆惜...` | `CharacterNarrativeProfile` | 半结构化，应解析为事件数组 | 是，影响脚本和分镜 | 弱相关，可用于系列卡片背面故事 |
| 观众情绪触发点 | `他做了所有正确的事...最后还是被那条路杀死了。` | `CharacterNarrativeProfile` | 否，建议长文本 | 是，强影响视频旁白钩子 | 是，适合商品故事文案 |
| 目标用户画像 | `职场中层管理者...理想主义者被现实反复打磨后仍在坚守` | `CharacterCommercialProfile` | 半结构化，可拆为用户标签数组 | 是，影响文案语气 | 是，强影响商品人群定位 |

### 2.3 第三层：文化视觉层

| 字段中文名 | 示例值 | 适合映射到哪个系统实体 | 结构化字段 | Prompt 输入 | 商品/文创转化字段 |
|---|---|---|---|---|---|
| 英歌舞角色定位 | `英歌队司鼓者/指挥...【有明确英歌记录】` | `CharacterVisualProfile`、`ProjectCharacter` | 半结构化，应拆 `role_position`、`evidence_type`、`evidence_note` | 是 | 是，影响英歌槌、服饰、动作 |
| 英歌脸谱主色 | `正红【有明确记录：司鼓者“脸谱丹红英秀”】` | `CharacterVisualProfile` | 是，应拆主色、辅助色、依据 | 是，强影响图片 Prompt | 是，强影响商品配色 |
| 颜色象征含义 | `赤胆忠心、正义凛然` | `CharacterVisualProfile`、`CharacterCommercialProfile` | 是，可拆标签数组 | 是 | 是 |
| 脸谱特征纹样 | `及时雨云纹、天罡北斗七星纹、“替天行道”旗纹` | `CharacterVisualProfile` | 是，可拆纹样数组 | 是，强影响图像生成 | 是，强影响文创纹样 |
| 水浒原著色彩线索 | `皂色公服（吏员正装）；战袍以红为主` | `CharacterVisualProfile` | 半结构化 | 是 | 是 |
| 视觉设计调性关键词 | `王者气场·厚重深沉·云中龙影·一人系万命·居中而稳` | `CharacterVisualProfile`、`PromptKeywordSet` | 是，应拆关键词数组 | 是，强影响图像风格 | 是 |
| 正向词 | `墨红战袍、统帅气场、居中主位、天罡星光...` | `PromptKeywordSet` | 是，应拆关键词数组 | 是，核心输入 | 是，可复用为商品卖点词 |
| 禁止词 | `弱小形象、泪目低头、简陋装束、孤身落寞` | `PromptKeywordSet` | 是，应拆关键词数组 | 是，核心负向约束 | 否，但可防止商品视觉跑偏 |

### 2.4 第四层：叙事素材层

| 字段中文名 | 示例值 | 适合映射到哪个系统实体 | 结构化字段 | Prompt 输入 | 商品/文创转化字段 |
|---|---|---|---|---|---|
| 核心叙事原点 | `核心场景：浔阳楼题反诗（原著第三十九回）...` | `CharacterNarrativeProfile` | 半结构化，应拆 `scene_title`、`source_chapter`、`story_text` | 是，强影响脚本、分镜、视频 Prompt | 是，适合商品故事卡 |
| 角色关系图谱 | `→李逵：生死相伴...→吴用：智囊如影随形...` | `CharacterNarrativeProfile` | 是，应解析为关系数组 | 是，影响剧情和群像关系 | 弱相关，可用于系列组合销售 |

### 2.5 第五层：商业文化层

| 字段中文名 | 示例值 | 适合映射到哪个系统实体 | 结构化字段 | Prompt 输入 | 商品/文创转化字段 |
|---|---|---|---|---|---|
| 产品文化调性定位 | `象征统帅之气与正义凛然。命名方向：天罡、统帅、号令、替天等。` | `CharacterCommercialProfile` | 半结构化，应拆象征、命名方向、产品气质、目标人群 | 是，影响广告图和商品图 Prompt | 是，核心字段 |
| 祈福辟邪文化寓意 | `天魁星主统帅之气，凝聚正气、驱散乱局...` | `CharacterCommercialProfile` | 否，长文案为主，可提取标签 | 是，影响文创短视频旁白 | 是，核心字段 |

## 3. 前 5 个角色样本分析

| 姓名 | 水浒身份 | 英歌角色定位 | 主色系 | 脸谱特征 | 核心人格标签 | 核心叙事原点 | 正向 Prompt 关键词 | 禁止 Prompt 关键词 | 商业文化定位 |
|---|---|---|---|---|---|---|---|---|---|
| 宋江 | 总兵都头领（梁山寨主） | 英歌队司鼓者/指挥，居核心位置，以鼓声号令全场，有明确英歌记录 | 正红 | 及时雨云纹、天罡北斗七星纹、“替天行道”旗纹 | 城府极深、仗义疏财、隐忍圆滑、权谋至上、忠君思想根深蒂固 | 浔阳楼题反诗，呈现忠义外壳下的野心与自我怀疑 | 墨红战袍、统帅气场、居中主位、天罡星光、云纹、水墨风格、沉稳眼神、金印、鼓声 | 弱小形象、泪目低头、简陋装束、孤身落寞 | 统帅之气与正义凛然，适合领导者、管理者人群 |
| 卢俊义 | 总兵都头领（副寨主） | 一般不出现于英歌，体型魁伟，气场压场，金白色为推导方案 | 白底+金纹 | 麒麟纹、黄金矛纹、云纹 | 高傲正直、武艺绝伦、不善权谋、忠勇憨厚、天下第一的寂寞 | 燕青忠言劝阻，展现被最信任的人提醒却仍走入陷阱的悲剧 | 高大魁伟、白色武将装、黄金矛、麒麟纹甲、正气凛然、孤傲眼神、水墨工笔、金白双色 | 矮小、卑微、落魄、暗色系 | 天下第一的纯粹武力与高洁气质，适合追求极致的人群 |
| 吴用 | 掌管机密军师 | 英歌队槌手，以智星之色推导，清冷蓝白为主 | 蓝白底+文人纹+紫纹 | 星纹、羽扇纹、铜链纹 | 足智多谋、神机妙算、精于算计、外表忠诚内心孤独、最终殉主 | 智取生辰纲，体现幕后掌控和冷静自信 | 书生装束、鹅毛扇、铜链、冷静深邃眼神、水墨留白风格、蓝白配色、沉思姿态 | 武将铠甲、粗犷形象、暖色系、冲锋姿态 | 谋略之智与深算之能，适合以智谋立身的人群 |
| 公孙胜 | 掌管机密军师（法术） | 英歌队旗手，头部太极图案、白胡子，有普宁南山英歌队记录 | 头部太极图案+白须，视觉可延展为天青色+金色 | 太极纹、云纹、雷纹、龙鳞纹 | 淡泊名利、道法高深、知进退、不喜纷争、道家隐士 | 功成归隐，梁山中少见的完整自我选择 | 青色道袍、松纹古剑、太极纹路、云雾缭绕、飘逸发冠、道符、紫电金光、入云之姿、仙气水墨、红须 | 武将铠甲、肌肉外露、暴力冲锋姿态、红色主色调 | 道法自然与功成身退，适合追求内心自由和精神层次的人群 |
| 关胜 | 马军五虎将之首 | 英歌队八头槌之一，红脸红须、戴头盔，正统武将气象，有明确英歌记录 | 正红+红须 | 青龙纹、将星纹、麟甲纹 | 沉稳威严、忠义刚烈、有先祖关羽之风、军纪严明、正统武将 | 被俘归顺，正统武将在义气面前折服 | 红脸红须、青龙偃月刀、将军铠甲、威严立姿、水墨工笔、金红配色、正统武将气场 | 轻浮表情、草莽装束、蓬乱形象、蓝色或黑色主色 | 忠义之将与正统气魄，适合追求正统气场与忠义精神的人群 |

## 4. 数据模型映射建议

以下是实体字段草案。建议后续数据库表名采用小写复数形式，例如 `characters`、`project_characters`、`character_visual_profiles`、`character_narrative_profiles`、`character_commercial_profiles`、`prompt_keyword_sets`。当前项目数据库表名未确认。

### 4.1 Character

通用角色母表，沉淀跨项目复用的水浒角色身份。

| 字段名 | 类型 | 来源 Excel 字段 | 是否必填 | 说明 |
|---|---|---|---|---|
| `id` | `uuid` | 系统生成 | 是 | 主键 |
| `name` | `string` | 基本信息：姓名 | 是 | 如宋江 |
| `nickname` | `string` | 基本信息：绰号 | 否 | 如及时雨·呼保义 |
| `ranking` | `integer` | 基本信息：排名 | 否 | 从“第1位”解析为 1 |
| `star_position` | `string` | 基本信息：星位 | 否 | 如天魁星 |
| `origin` | `text` | 基本信息：出身 | 否 | 出身、职业、籍贯等 |
| `liangshan_role` | `string` | 梁山职务 | 否 | 如总兵都头领 |
| `primary_weapon` | `string` | 惯用武器 | 否 | 主武器名称 |
| `weapon_note` | `text` | 惯用武器 | 否 | 武器补充说明 |
| `source_work` | `string` | 固定值 | 是 | 建议固定为 `水浒传` |
| `created_at` | `datetime` | 系统生成 | 是 | 创建时间 |
| `updated_at` | `datetime` | 系统生成 | 是 | 更新时间 |

### 4.2 ProjectCharacter

项目内角色快照，用于锁定某个项目的角色设定版本。

| 字段名 | 类型 | 来源 Excel 字段 | 是否必填 | 说明 |
|---|---|---|---|---|
| `id` | `uuid` | 系统生成 | 是 | 主键 |
| `project_id` | `uuid` | 系统生成 | 是 | 所属项目 |
| `character_id` | `uuid` | `Character.id` | 是 | 通用角色引用 |
| `snapshot_name` | `string` | 基本信息：姓名 | 是 | 快照内显示名 |
| `snapshot_nickname` | `string` | 基本信息：绰号 | 否 | 快照内绰号 |
| `yingge_role_position` | `string` | 英歌舞角色定位 | 否 | 项目内英歌定位 |
| `character_consistency_summary` | `text` | 身份层、内核层、视觉层汇总 | 否 | 给 Agent 使用的角色一致性摘要 |
| `source_excel_path` | `string` | 文件路径 | 是 | `/Users/huabi/code/AI-video-studio/data/英歌水浒角色基础信息.xlsx` |
| `source_sheet_name` | `string` | 工作表名称 | 是 | `角色IP圣经` |
| `source_row_number` | `integer` | Excel 行号 | 是 | 数据行号，从 4 开始 |
| `version` | `integer` | 系统生成 | 是 | 快照版本 |
| `created_at` | `datetime` | 系统生成 | 是 | 创建时间 |
| `updated_at` | `datetime` | 系统生成 | 是 | 更新时间 |

### 4.3 CharacterVisualProfile

角色视觉档案，服务图片 Prompt、视频 Prompt 和角色一致性。

| 字段名 | 类型 | 来源 Excel 字段 | 是否必填 | 说明 |
|---|---|---|---|---|
| `id` | `uuid` | 系统生成 | 是 | 主键 |
| `character_id` | `uuid` | `Character.id` | 是 | 角色引用 |
| `yingge_role_position` | `text` | 英歌舞角色定位 | 否 | 英歌队位置、动作、文化依据 |
| `evidence_type` | `enum` | 英歌舞角色定位、英歌脸谱主色 | 否 | `explicit_record`、`inferred`、`unconfirmed` |
| `face_primary_color` | `string` | 英歌脸谱主色 | 否 | 如正红、白底+金纹 |
| `face_secondary_colors` | `string[]` | 英歌脸谱主色 | 否 | 辅助色数组 |
| `color_symbolism` | `string[]` | 颜色象征含义 | 否 | 如赤胆忠心、正义凛然 |
| `face_patterns` | `string[]` | 脸谱特征纹样 | 否 | 纹样数组 |
| `source_color_clues` | `text` | 水浒原著色彩线索 | 否 | 原著服饰、兵器色彩线索 |
| `visual_tone_keywords` | `string[]` | 视觉设计调性关键词 | 否 | 视觉调性关键词数组 |
| `weapon_visual_note` | `text` | 惯用武器 | 否 | 武器外观和用途说明 |
| `created_at` | `datetime` | 系统生成 | 是 | 创建时间 |
| `updated_at` | `datetime` | 系统生成 | 是 | 更新时间 |

### 4.4 CharacterNarrativeProfile

角色叙事档案，服务脚本、分镜、视频旁白和角色弧光。

| 字段名 | 类型 | 来源 Excel 字段 | 是否必填 | 说明 |
|---|---|---|---|---|
| `id` | `uuid` | 系统生成 | 是 | 主键 |
| `character_id` | `uuid` | `Character.id` | 是 | 角色引用 |
| `personality_tags` | `string[]` | 核心人格标签 | 否 | 按 `·` 拆分 |
| `inner_conflict` | `text` | 角色内在矛盾/冲突 | 否 | 角色核心矛盾 |
| `life_event_nodes` | `json` | 人生关键经历节点 | 否 | 按编号解析为事件数组 |
| `audience_emotion_trigger` | `text` | 观众情绪触发点 | 否 | 情绪钩子 |
| `target_audience_profile` | `text` | 目标用户画像 | 否 | 用户画像长文本 |
| `core_scene_title` | `string` | 核心叙事原点 | 否 | 如浔阳楼题反诗 |
| `core_scene_source` | `string` | 核心叙事原点 | 否 | 如原著第三十九回 |
| `core_scene_text` | `text` | 核心叙事原点 | 否 | 核心场景说明 |
| `relationship_graph` | `json` | 角色关系图谱 | 否 | 关系节点数组 |
| `created_at` | `datetime` | 系统生成 | 是 | 创建时间 |
| `updated_at` | `datetime` | 系统生成 | 是 | 更新时间 |

### 4.5 CharacterCommercialProfile

角色文创转化档案，服务商品定位、命名、卖点和文化寓意。

| 字段名 | 类型 | 来源 Excel 字段 | 是否必填 | 说明 |
|---|---|---|---|---|
| `id` | `uuid` | 系统生成 | 是 | 主键 |
| `character_id` | `uuid` | `Character.id` | 是 | 角色引用 |
| `target_user_profile` | `text` | 目标用户画像 | 否 | 商品目标人群 |
| `commercial_positioning` | `text` | 产品文化调性定位 | 否 | 完整商业定位 |
| `symbolic_meaning` | `text` | 产品文化调性定位 | 否 | 象征意义，可由文本提取 |
| `naming_directions` | `string[]` | 产品文化调性定位 | 否 | 如天罡、统帅、号令 |
| `product_tone_tags` | `string[]` | 产品文化调性定位 | 否 | 厚重、有分量、主位感强 |
| `blessing_meaning` | `text` | 祈福辟邪文化寓意 | 否 | 祈福、辟邪、护佑文案 |
| `merchandising_elements` | `string[]` | 惯用武器、脸谱特征纹样、主色 | 否 | 可转化为商品造型的元素 |
| `created_at` | `datetime` | 系统生成 | 是 | 创建时间 |
| `updated_at` | `datetime` | 系统生成 | 是 | 更新时间 |

### 4.6 PromptKeywordSet

正向词和禁止词集合，服务图片 Prompt、视频 Prompt、角色一致性和批量生成。

| 字段名 | 类型 | 来源 Excel 字段 | 是否必填 | 说明 |
|---|---|---|---|---|
| `id` | `uuid` | 系统生成 | 是 | 主键 |
| `owner_type` | `enum` | 系统生成 | 是 | 建议支持 `character`、`scene`、`project_character` |
| `owner_id` | `uuid` | `Character.id` 或 `ProjectCharacter.id` | 是 | 关键词所属对象 |
| `positive_keywords` | `string[]` | 正向词 | 否 | 按顿号、逗号拆分 |
| `negative_keywords` | `string[]` | 禁止词 | 否 | 按顿号、逗号拆分 |
| `visual_tone_keywords` | `string[]` | 视觉设计调性关键词 | 否 | 风格和气质词 |
| `personality_keywords` | `string[]` | 核心人格标签 | 否 | 人格标签可参与提示词 |
| `commercial_keywords` | `string[]` | 产品文化调性定位 | 否 | 商品图、广告图可用 |
| `model_scope` | `enum` | 系统生成 | 否 | `image`、`video`、`tts`、`all` |
| `language` | `enum` | 系统生成 | 是 | 建议默认 `zh-CN` |
| `created_at` | `datetime` | 系统生成 | 是 | 创建时间 |
| `updated_at` | `datetime` | 系统生成 | 是 | 更新时间 |

## 5. 未来 Excel 导入策略

建议导入模块采用明确的函数边界。函数名为建议草案，当前项目中尚未实现，状态为未确认。

### 5.1 多级表头识别

建议函数：`detectHeaderRows(workbookPath, sheetName)`、`normalizeMergedHeaders(sheet)`、`buildHeaderPathMap(sheet)`。

识别策略：

1. 读取工作表前 3 至 5 行，统计每行非空单元格数量和合并区域。
2. 若第 1 行存在横向大范围合并，且合并文本包含“第一层”“第二层”等层级标记，则判定为层级行。
3. 若第 2 行存在字段组，且部分字段跨第 2、3 行合并，则判定为字段组行。
4. 若第 3 行包含 `英歌脸谱主色`、`正向词`、`禁止词` 等子字段，则判定为子字段行。
5. 对合并单元格做值回填，形成完整 header path：`层级 / 字段组 / 字段中文名`。
6. 数据起始行应取表头行后一行，本 Excel 为第 4 行。

本文件的检测结果：

- `header_rows = [1, 2, 3]`
- `data_start_row = 4`
- `field_count = 20`
- `layer_count = 5`

### 5.2 解析复合字段

建议函数：`parseBasicInfoCell(cellText)`。

`基本信息` 单元格包含多行键值对：

```text
姓名：宋江
绰号：及时雨·呼保义
排名：第1位
星位：天魁星
出身：山东郓城县，押司出身（刀笔小吏）
```

解析策略：

| 原始键 | 目标字段 | 处理方式 |
|---|---|---|
| 姓名 | `Character.name` | 去除前后空格 |
| 绰号 | `Character.nickname` | 保留 `·`，可另拆别名数组 |
| 排名 | `Character.ranking` | 从 `第1位` 提取数字 1 |
| 星位 | `Character.star_position` | 原样保存 |
| 出身 | `Character.origin` | 原样保存，后续可 NLP 提取籍贯、职业、身份 |

异常处理：

- 若缺少中文冒号 `：`，保留原文到 `raw_basic_info`，并标记 `parse_status = partial`。
- 若排名无法提取数字，保存原文到 `ranking_raw`。
- 若姓名为空，该行不生成 `Character`，写入导入错误报告。

### 5.3 空值处理

建议函数：`normalizeEmptyValue(value)`、`validateRequiredFields(row)`。

处理规则：

1. `null`、空字符串、全空白文本统一为 `null`。
2. 必填字段缺失时，该行进入 `failed_rows`，不写入正式表。
3. 非必填字段缺失时允许导入，但在角色完整度评分中扣分。
4. 长文本字段为空不应自动补写，避免编造设定。
5. 若字段包含“未确认”或“推导”，应保留原文，并同步写入 `evidence_type`。

建议必填：

- `Character.name`
- `ProjectCharacter.project_id`
- `ProjectCharacter.character_id`
- `ProjectCharacter.source_excel_path`
- `ProjectCharacter.source_sheet_name`
- `ProjectCharacter.source_row_number`

### 5.4 正向词/禁止词处理

建议函数：`parseKeywordList(text)`、`buildPromptKeywordSet(characterId, row)`。

解析策略：

1. 优先按中文顿号 `、` 拆分。
2. 兼容英文逗号 `,`、中文逗号 `，`、换行符。
3. 去除空白、去重，保留原始顺序。
4. `视觉设计调性关键词` 常用 `·` 分隔，应按 `·` 拆分。
5. 禁止词应作为模型负向约束，不要混入正向词。
6. 对视频 Prompt，可将“姿态”“动作”“场景”类词从正向词中二次归类。

### 5.5 生成 Character 数据

建议函数：`upsertCharacter(parsedBasicInfo, row)`。

生成策略：

1. 以 `name + source_work` 作为第一层去重键。
2. 若存在同名角色，比较 `nickname`、`ranking`、`star_position`，一致则更新来源快照，不新建。
3. `梁山职务`、`惯用武器` 可进入 `Character`，但长说明部分建议拆入视觉档案。
4. 保留 `source_excel_path`、`source_sheet_name`、`source_row_number` 以便追溯。

### 5.6 生成 PromptKeywordSet 数据

建议函数：`upsertPromptKeywordSet(ownerType, ownerId, row)`。

生成策略：

1. 以 `owner_type + owner_id + model_scope + language` 去重。
2. `正向词` 写入 `positive_keywords`。
3. `禁止词` 写入 `negative_keywords`。
4. `视觉设计调性关键词` 写入 `visual_tone_keywords`。
5. `核心人格标签` 可写入 `personality_keywords`。
6. `产品文化调性定位` 可抽取命名方向、产品气质，写入 `commercial_keywords`。
7. 支持人工编辑版本，不应每次 Excel 导入都覆盖人工调整。建议增加 `source_hash` 和 `manual_override`。

## 6. 对 PRD v1.0 的启发

### 6.1 必须有的页面

| 页面 | 必要性 | 原因 |
|---|---|---|
| 角色库页面 | 必须有 | Excel 本质是角色 IP 圣经，需要可浏览、检索、筛选 |
| 角色详情页 | 必须有 | 单个角色包含身份、内核、视觉、叙事、商业五层信息 |
| 项目角色快照页 | 必须有 | 同一角色在不同短视频项目中可能有不同视觉取向和 Prompt 版本 |
| Prompt 关键词编辑页 | 必须有 | 正向词、禁止词是图片和视频生成的关键控制面 |
| 视觉档案页 | 必须有 | 主色、脸谱、纹样、武器、英歌定位直接决定角色一致性 |
| 叙事档案页 | 必须有 | 核心叙事原点和关系图谱决定人物介绍短视频脚本 |
| 文创转化页 | 必须有 | 项目目标包含 IP 沉淀、文创产品引流、跨境文化出海 |
| Excel 导入预览页 | 必须有 | 多级表头、复合字段和推导依据需要导入前确认 |

### 6.2 必须有的字段

| 类型 | 必须字段 |
|---|---|
| 身份字段 | 姓名、绰号、排名、星位、出身、梁山职务、惯用武器 |
| 内核字段 | 核心人格标签、角色内在矛盾/冲突、人生关键经历节点、观众情绪触发点 |
| 视觉字段 | 英歌舞角色定位、英歌脸谱主色、颜色象征含义、脸谱特征纹样、水浒原著色彩线索、视觉设计调性关键词 |
| Prompt 字段 | 正向词、禁止词 |
| 叙事字段 | 核心叙事原点、角色关系图谱 |
| 商业字段 | 目标用户画像、产品文化调性定位、祈福辟邪文化寓意 |
| 溯源字段 | 来源 Excel 路径、工作表名、行号、导入时间、字段解析状态 |

### 6.3 必须读取这些信息的 Agent

| Agent | 必须读取的信息 |
|---|---|
| `CharacterBibleAgent` | 全部五层信息，用于角色设定汇总和一致性维护 |
| `ScriptAgent` | 身份层、内核层、核心叙事原点、角色关系图谱、观众情绪触发点 |
| `StoryboardAgent` | 核心叙事原点、人生关键经历节点、英歌角色定位、视觉调性关键词 |
| `ImagePromptAgent` | 文化视觉层、正向词、禁止词、惯用武器、核心人格标签 |
| `VideoPromptAgent` | 英歌舞角色定位、核心叙事原点、人生关键经历节点、视觉调性关键词 |
| `ConsistencyAgent` | `Character`、`ProjectCharacter`、`CharacterVisualProfile`、`PromptKeywordSet` |
| `MerchandisingAgent` | 商业文化层、脸谱主色、纹样、武器、目标用户画像 |
| `ReviewAgent` | 来源依据、推导标记、禁止词、角色一致性摘要 |

### 6.4 影响图片 Prompt 的信息

- 姓名、绰号、星位：决定角色身份符号。
- 惯用武器：决定手持物、动作和造型。
- 英歌舞角色定位：决定司鼓者、旗手、槌手、头槌等英歌位置。
- 英歌脸谱主色：决定脸谱和服装主色。
- 颜色象征含义：决定视觉情绪。
- 脸谱特征纹样：决定脸谱、衣甲、背景纹样。
- 水浒原著色彩线索：减少视觉跑偏。
- 视觉设计调性关键词：决定风格、构图和质感。
- 正向词、禁止词：直接进入图片 Prompt 与 negative prompt。

### 6.5 影响视频 Prompt 的信息

- 核心叙事原点：决定主场景和镜头叙事。
- 人生关键经历节点：决定 30-60 秒视频的事件选取。
- 观众情绪触发点：决定旁白钩子和情绪峰值。
- 英歌舞角色定位：决定动作方式，如司鼓、舞旗、持槌、冲阵。
- 角色关系图谱：决定是否引入其他角色或关系张力。
- 视觉设计调性关键词：决定镜头风格、氛围、运动方式。
- 禁止词：约束角色气质和镜头误差。

### 6.6 影响文创转化的信息

- 产品文化调性定位：决定商品命名、包装气质、目标人群。
- 祈福辟邪文化寓意：决定祈福文案、吊牌文案、详情页卖点。
- 英歌脸谱主色：决定 SKU 配色。
- 脸谱特征纹样：决定图案资产。
- 惯用武器：决定手办、摆件、英歌槌、钥匙扣等造型。
- 目标用户画像：决定商品口吻和渠道投放。
- 颜色象征含义：决定文化解释和礼赠场景。

## 7. 关键结论

1. 这份 Excel 已经不是普通角色表，而是“角色 IP 圣经”的雏形，天然分为身份、内核、文化视觉、叙事素材、商业文化五层。
2. 表头是明确的三行多级表头，导入功能必须支持合并单元格回填和 header path 识别。
3. `基本信息` 是复合字段，需要拆成 `name`、`nickname`、`ranking`、`star_position`、`origin`。
4. `正向词` 和 `禁止词` 应独立成为 `PromptKeywordSet`，不能只作为角色备注保存。
5. `英歌舞角色定位` 和 `英歌脸谱主色` 中包含“明确记录/推导依据”，应保留证据类型，避免把推导内容当作史实。
6. 文创转化不是附属字段，而是 PRD v1.0 的核心业务闭环，应有独立 `CharacterCommercialProfile`。
7. 当前 Excel 可支撑第一阶段 MVP 的角色库、角色详情、脚本生成、分镜生成、图片 Prompt、视频 Prompt、文创定位等核心能力。

## 8. 下一步建议

1. 在 PRD v1.0 中将“角色库”和“角色详情页”提升为 MVP 核心页面。
2. 先定义 `Character`、`ProjectCharacter`、`CharacterVisualProfile`、`CharacterNarrativeProfile`、`CharacterCommercialProfile`、`PromptKeywordSet` 六类实体。
3. Excel 导入功能先做只读预览和字段映射确认，再做正式入库。
4. 为每个角色生成一段 `character_consistency_summary`，供图片、视频、分镜、审核 Agent 共同读取。
5. 对“有明确英歌记录”和“推导依据”做字段化，以便 UI 上显示可信度。

