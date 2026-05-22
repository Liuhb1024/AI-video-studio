# CODEX_RULES.md

## 项目名称

AI 英歌漫剧内容生产工作台

## 当前阶段

当前不是正式开发阶段，而是 PRD v1.0 与 MVP 架构设计阶段。

## 项目真实目标

我们要做的不是通用 AI 短剧平台，而是服务于“英歌非遗 IP 内容 + 文创产品引流”的 AI 漫剧生产工作台。

第一阶段目标：
一个月内做出一个内部 Web 工具，支持输入英歌/水浒人物或剧本，自动生成 30-60 秒人物介绍类短视频的脚本、分镜、角色一致性设定、场景一致性设定、图片 Prompt、视频 Prompt，并半自动调用生图/生视频/TTS API 完成素材生产。

## 商业目标

优先级：
1. D：IP 沉淀，通过英歌漫剧积累英歌 IP 内容资产，未来导向文创产品、跨境文化出海和衍生品
2. A：自用，用于生产抖音/视频号/海外平台短视频
3. E：技术学习，沉淀 AI Agent 工程能力
4. C：未来可能承接文旅局、非遗中心、品牌方定制服务

## 当前 MVP 内容定位

第一版只聚焦：
英歌水浒人物介绍短视频。

目标视频：
- 单集 30-60 秒
- 以一个水浒人物为核心
- 输出人物故事、英歌视觉设定、分镜、图片 Prompt、视频 Prompt
- 画风参考：国风水墨 + 游戏 CG + 黑神话悟空质感 + 剑来漫剧氛围
- 需要 TTS
- 生图模型：gpt-image-2、nano banana
- 生视频模型：Seedance 2.0
- TTS：MiniMax
- 文本模型：可多模型配置

## 当前痛点

1. 提示词难写
2. 人物一致性难保持
3. 场景一致性难保持
4. 抽卡麻烦
5. 素材和采纳记录容易混乱

## 参考项目

references/ 目录下有三个只读参考项目：

1. references/Toonflow-app
   - 重点学习 Agent 架构、Skill 系统、Memory、生产 Agent 思路
2. references/huobao-drama
   - 重点学习短剧生产流程、Agent Prompt、图片/视频/TTS 流程
3. references/waoowaoo
   - 重点学习任务队列、模型能力、素材管理、成本统计、工程化

## 严格规则

1. references/ 目录只读，不允许修改。
2. 不允许复制粘贴 references/ 中的大段代码到 yingge-app/。
3. 可以借鉴设计思想，但必须用自己的代码重写。
4. 当前阶段不要写正式业务代码，除非任务明确要求。
5. 每个分析文档必须包含真实文件路径、函数名、表名。
6. 不确定的地方必须写“未确认”，不能编造。
7. 每次任务完成后必须输出：
   - 生成/修改了哪些文件
   - 使用了哪些参考文件
   - 得出了哪些关键结论
   - 下一步建议
8. 不要读取任何 .env、key、token、证书文件。
9. 不要运行任何会修改 references/ 项目的命令。
10. 不要做攻击复现，只做源码级安全分析。

## 重要资料

data/英歌水浒角色基础信息.xlsx 是第一份角色 IP 圣经。
它需要被分析并映射成系统数据模型。

该 Excel 的核心结构包括：
- 身份层
- 内核层
- 文化视觉层
- 叙事素材层
- 商业文化层

它未来应该映射到：
- Character
- ProjectCharacter
- CharacterVisualProfile
- CharacterNarrativeProfile
- CharacterCommercialProfile
- Prompt positive / negative keywords
- YinggeCategoryTemplate