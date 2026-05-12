# 角色中心生图提示词优化

状态：done
负责人线程：功能开发线程（第三次接手）
创建时间：2026-05-08
最后更新：2026-05-09

## 1. 为什么现在做

角色中心已经支持参考图、风格模板、GenerateTask 队列、nano banana 2 和 GPT Image 2。接下来进入关键帧生成前，需要先把角色生图提示词体系梳理清楚并优化，否则后续关键帧会继承现有提示词的噪声和结构问题。

本任务先聚焦角色中心中的生图提示词，不进入关键帧、生视频或成本统计。

## 2. 当前已知提示词来源

初步扫描后，角色中心生图相关提示词主要来自三层：

### 2.1 角色基础提示词生成

文件：

- `apps/api/app/modules/characters/prompting.py`
- `apps/api/app/modules/characters/service.py`
- `apps/api/app/modules/characters/importer.py`

角色创建或导入时会调用 `build_character_prompts(payload)`，生成：

- `image_consistency_prompt`
- `video_consistency_prompt`
- `three_view_prompt`
- `negative_prompt`

输入字段包括：

- `name`
- `alias`
- `rank`
- `star`
- `yingge_role`
- `facepaint_main_color`
- `facepaint_patterns`
- `weapons`
- `weapon`
- `visual_tone_keywords`
- `positive_prompt_terms`
- `negative_prompt_terms`
- `negative_keywords`

### 2.2 前端角色生图抽屉

文件：

- `apps/web/src/features/characters/character-detail-screen.tsx`

前端根据生成目标选择基础 prompt：

- `style_transfer` 使用 `image_consistency_prompt`
- `four_view` 使用 `three_view_prompt`

前端还提供：

- 用户补充 Prompt 编辑区
- 负面提示词编辑区
- 风格模板选择
- 最终组装 Prompt 预览

### 2.3 GenerateTask 后端组装

文件：

- `apps/api/app/modules/generation/service.py`

创建角色生图任务时会调用 `_assemble_prompt(...)`，把以下内容组装成最终 `task.prompt_text` / `input_prompt`：

- 角色基础信息
- 生成目标
- 模型参数
- 参考图摘要
- 风格模板
- 用户补充 Prompt
- 负面约束

## 3. 本次目标

- 梳理角色中心生图提示词从创建、导入、前端编辑、后端组装到模型调用的完整链路。
- 明确每一类提示词的职责边界，避免重复、冲突和空泛表达。
- 使用用户提供的自定义 skill 辅助优化提示词内容和结构。
- 优化 `image_consistency_prompt`、`three_view_prompt`、`negative_prompt` 和 GenerateTask 最终组装逻辑。
- 保证 nano banana 2 和 GPT Image 2 都能使用优化后的 prompt。
- 补齐相关测试。
- 更新本任务档案的开发记录、完成记录和遗留问题。

## 4. 本次范围

- 角色创建时的默认生图提示词生成逻辑。
- 角色导入时的默认生图提示词生成逻辑。
- 角色详情页生图抽屉中的 prompt 初始值和预览逻辑。
- GenerateTask 中角色生图最终 prompt 组装逻辑。
- 相关后端测试和必要的前端 typecheck/lint。
- 必要时新增一份提示词说明文档或在本任务档案中记录梳理结果。

## 5. 明确不做

- 不做关键帧生成。
- 不做生视频生成。
- 不做真实模型端到端调用，除非用户在线程中明确要求。
- 不做模型 provider 改造。
- 不做成本统计。
- 不做角色字段大规模重构。
- 不做 PromptTemplate 管理后台。
- 不做数据库迁移，除非功能线程确认现有字段无法承载优化结果并得到用户同意。

## 6. 设计方向

建议把角色生图 prompt 拆成清晰层级：

1. **角色身份层**：姓名、别名、英歌身份、水浒星宿/排行。
2. **视觉锚点层**：脸谱主色、脸谱纹样、头饰、服饰结构、武器/道具、体态。
3. **一致性约束层**：参考图优先级、脸谱/服饰/武器不可漂移、不要换人物。
4. **任务目标层**：
   - `style_transfer`：真人妆照风格转换，强调保留参考图人物结构和妆造，并转为指定漫剧风格。
   - `four_view`：角色四视图/设定图，强调正面、半侧、侧/背面结构一致。
5. **风格模板层**：由全局风格模板提供，不应在角色基础 prompt 中写死太多风格词。
6. **负面约束层**：脸谱错乱、服饰错乱、武器变形、手指/肢体错误、水印、文字乱码、低清晰度、京剧脸谱误替换等。

## 7. 需要回答的问题

功能线程需要先回答并记录：

- 当前生图提示词到底从哪些字段来？
- 哪些 prompt 是角色创建时生成的，哪些是前端运行时选择的，哪些是任务创建时组装的？
- 当前有没有重复表达或互相冲突？
- `style_transfer` 和 `four_view` 是否应该使用不同结构的 prompt？
- nano banana 2 和 GPT Image 2 是否需要 provider-specific 的措辞差异？
- 用户提供的自定义 skill 应该作用在哪一层：基础 prompt、组装 prompt、负面 prompt，还是全部？

## 8. 涉及模块

后端：

- `apps/api/app/modules/characters/prompting.py`
- `apps/api/app/modules/characters/service.py`
- `apps/api/app/modules/characters/importer.py`
- `apps/api/app/modules/generation/service.py`
- `apps/api/tests/test_characters_api.py`
- `apps/api/tests/test_generation_api.py`

前端：

- `apps/web/src/features/characters/character-detail-screen.tsx`
- `apps/web/src/features/characters/characters-screen.tsx`
- `apps/web/src/features/characters/types.ts`

文档：

- `docs/features/2026-05-08-character-image-prompts-optimization.md`
- 可选：新增 `docs/learning/character-image-prompt-system.md`

## 9. 验收标准

- 功能线程清楚记录角色中心生图提示词完整来源链路。
- `image_consistency_prompt` 和 `three_view_prompt` 的职责明显区分。
- `negative_prompt` 更完整覆盖角色生图常见失败。
- GenerateTask 最终组装 prompt 结构更清晰，可读性更强。
- 前端抽屉中的初始 prompt 和最终预览与后端组装逻辑一致。
- 现有角色创建/导入流程仍可生成提示词。
- 现有角色生图任务仍可创建，并记录优化后的 `prompt_text`。
- 后端相关测试通过。
- 前端 `npm run typecheck` 和 `npm run lint` 通过。
- 任务档案写回开发记录、完成记录和遗留问题。

## 10. 建议测试

后端：

```bash
cd apps/api
.venv/bin/python -m pytest tests/test_characters_api.py -q
.venv/bin/python -m pytest tests/test_generation_api.py -q
.venv/bin/python -m pytest -q
```

前端：

```bash
cd apps/web
npm run typecheck
npm run lint
```

## 11. 用户操作说明

用户计划在线程中提供或使用自定义 skill 来辅助提示词优化。功能线程应等待用户在新线程中说明该 skill 的使用方式，并把 skill 作用范围记录到开发记录里。

如果用户在新线程中给出新的提示词规范、范例或评判标准，应优先采用用户提供的规范。

## 12. 开发记录

### 2026-05-08 线程重启说明

原功能开发线程进程已丢失。本任务尚未最终完成，不能按 `done` 归档。

当前已完成大量探索和部分实现，包括：

- 角色中心生图提示词来源链路梳理。
- 四视图 Prompt Draft 接口和固定版式探索。
- 参考图服装色彩保真约束。
- Seedream 5.0 Lite 接入尝试。
- 最终送模 Prompt 配色保真契约。
- 四视图优秀范例式母版。
- 真人妆照风格转换 Prompt 母版。
- 新增 `character_lookdev` 角色形象定稿任务。

但用户确认“角色中心生图提示词优化这一块目前还没做好”，下一线程应从本文档现有进度继续，与用户继续讨论具体优化方向，不要把当前 `DONE_WITH_CONCERNS` 当作最终完成状态。

### 2026-05-09 第二次线程重启说明

第二个接手线程也已丢失。本任务仍保持 `in_progress`。

第二个线程只完成了读取和复述，没有改文件。它留下一个需要优先核查的代码风险：

- `apps/api/app/modules/generation/service.py` 中 `_assemble_prompt()` 的非 confirmed 四视图通用分支可能构造了变量但没有正确返回。
- 该线程观察到原本的 `return "\n".join(...)` 可能误落到了 `_style_transfer_style_lines()` 的不可达代码区域。
- 新线程接手后应先核查 `_assemble_prompt()` 的控制流和测试覆盖，再根据用户提供的 skill / 范例 / 出图反馈继续优化 prompt。

### 2026-05-08 第一阶段：提示词来源链路梳理

本阶段只做来源梳理和问题记录，暂不大改提示词；等待用户在本功能线程中提供或说明自定义 skill 的使用方式。

#### 12.1 完整链路

1. **角色创建入口**
   - 前端：`apps/web/src/features/characters/characters-screen.tsx`
     - 手动创建时提交 `name`、`alias`、`weapons`、`facepaint_main_color`、`yingge_role`、`bio`、`positive_prompt_terms`、`negative_prompt_terms`。
     - “AI 辅助草稿”当前是本地模板预填，不调用模型；会预填 `bio`、`yingge_role`、`positive_prompt_terms`、`negative_prompt_terms`。
   - 后端：`apps/api/app/modules/characters/service.py`
     - `CharacterService.create()` 调用 `_ensure_prompts(payload)`。
     - `_ensure_prompts()` 调用 `build_character_prompts(payload)`，但如果 payload 已带 `image_consistency_prompt` / `video_consistency_prompt` / `three_view_prompt` / `negative_prompt`，会保留已有值。

2. **角色导入入口**
   - 后端：`apps/api/app/modules/characters/importer.py`
     - `import_yingge_bible()` 从 Excel 的“角色IP圣经”工作表读取字段。
     - `_row_to_payload()` 将表格列映射到 `CharacterCreate`：
       - 第 1 列拆 `name`、`alias`、`rank`、`star`、`origin`，并写入 `bio`。
       - 第 3 列写入 `weapons` 和 `weapon`。
       - 第 9-16 列写入 `yingge_role`、`facepaint_main_color`、`color_symbolism`、`facepaint_patterns`、`source_color_clues`、`visual_tone_keywords`、`positive_prompt_terms`、`negative_prompt_terms`。
       - 第 15/16 列同时复制到 `visual_keywords` / `negative_keywords`。
     - 导入时同样调用 `build_character_prompts(payload)`，只补齐空的 prompt 字段；但更新已有 `yingge_bible` 角色时会用导入 payload 覆盖角色字段和导入生成的 prompt。

3. **角色基础提示词生成**
   - 后端：`apps/api/app/modules/characters/prompting.py`
   - 输入字段：
     - 身份：`name`、`alias`、`rank`、`star`
     - 视觉：`yingge_role`、`facepaint_main_color`、`facepaint_patterns`、`weapons` / `weapon`、`visual_tone_keywords`、`positive_prompt_terms`
     - 负面：`negative_prompt_terms`，否则 `negative_keywords`，否则内置默认负面词
   - 输出字段：
     - `image_consistency_prompt`：角色身份 + 视觉上下文 + 英歌水浒 IP / 一致性 / 仪式感 / 设定稿级别。
     - `video_consistency_prompt`：关键帧生视频一致性提示，本任务不优化。
     - `three_view_prompt`：当前文本写“三视图：正面、侧面、背面”。
     - `negative_prompt`：`避免：{negative}` + 京剧脸谱、普通武侠服、多余人物、水印等固定约束。

4. **前端角色详情与生图抽屉**
   - 前端：`apps/web/src/features/characters/character-detail-screen.tsx`
   - 目标和基础 prompt 映射：
     - `style_transfer` 使用 `image_consistency_prompt`
     - `four_view` 使用 `three_view_prompt`
   - 页面加载时当前先设置 `three_view_prompt || image_consistency_prompt`，随后 `useEffect` 会按当前生成目标重设 prompt。
   - 用户可编辑：
     - `prompt`：界面文案是“用户补充 Prompt”，但默认内容实际是基础 prompt。
     - `negativePrompt`：默认 `character.negative_prompt || character.negative_keywords || ""`。
     - 参考图、模型、比例/清晰度、风格模板。
   - 参考图推荐：
     - `style_transfer`：最多 1 张脸谱 + 1 张真人图。
     - `four_view`：脸谱 + 正面/半侧/半侧/背后真人图。
   - 前端预览 `buildAssembledPromptPreview()` 当前只展示任务、参考图数量、风格模板、用户补充和输出要求；未展示后端实际会加入的角色外观/服饰/武器/脸谱字段、任务规则和负面约束。

5. **GenerateTask 创建与后端组装**
   - 后端：`apps/api/app/modules/generation/service.py`
   - `create_character_image_task()` 读取角色、参考图、风格模板，生成：
     - `input_snapshot_json`：角色字段、参考图摘要、风格模板识别结果。
     - `assembled_prompt`：`_assemble_prompt(payload, character, style_template)`。
   - `_assemble_prompt()` 当前结构：
     - `任务`
     - `角色`
     - `外观设定`（`character.appearance`）
     - `服饰设定`（`character.costume`）
     - `武器/道具`
     - `脸谱主色`
     - `脸谱纹样`
     - `风格模板`（由 `_assemble_style_prompt()` 展开）
     - `用户补充`（来自前端 `prompt_text`，常常是角色基础 prompt）
     - 任务规则：
       - `style_transfer`：真人妆照重绘、保持参考图结构、不要改变身份/现代服装/背景抢主体。
       - `four_view`：基于脸谱和真人四面妆照生成四视图候选设定图，保持同一角色/服饰/脸谱/武器/身形比例。
     - `负面约束`：优先 `payload.negative_prompt`，否则风格模板负面词，否则角色负面 prompt / negative_keywords / 内置默认。
     - `输出要求`：候选资产，不覆盖人工参考图库。
   - `_build_queued_character_image_task()` 将 `assembled_prompt` 同时写入 `GenerateTask.prompt_text` 和 `GenerateTask.input_prompt`。

6. **模型调用**
   - 后端：`apps/api/app/modules/generation/service.py`
   - `execute_character_image_task()` 根据 `model_provider` 分流：
     - `dmx-gemini`：调用 `_execute_dmx_gemini_character_image_task()`，最多读取前 14 张输入图，调用 `DMXGeminiImageProvider.generate_images(prompt=task.prompt_text, images=..., aspect_ratio=..., image_size=...)`。界面称 Nano Banana 2。
     - `dmx-gpt-image`：调用 `_execute_dmx_gpt_image_character_image_task()`，读取全部输入图，调用 `DMXGPTImageProvider.generate_images(prompt=task.prompt_text, images=..., aspect_ratio=..., image_size=..., output_format=..., quality=..., output_count=1)`。界面称 GPT Image 2。
     - 其他 provider：走 mock，不真实调用模型。
   - 当前两个真实 provider 使用同一份 `task.prompt_text`，没有 provider-specific prompt 分支。

#### 12.2 每类提示词来源、用途和当前问题

| 类别 | 来源 | 用途 | 当前问题 |
| --- | --- | --- | --- |
| 角色身份层 | `name`、`alias`、`rank`、`star` | 标定角色是谁 | 只在基础 prompt 中完整出现；GenerateTask 组装只写 `character.name`，别名/星位/排行丢失。 |
| 视觉锚点层 | `yingge_role`、脸谱主色、脸谱纹样、武器、视觉调性、正向词 | 固定脸谱、服饰、武器、气质 | `appearance` / `costume` 在导入和创建中通常未设置，GenerateTask 却优先展示这两个字段为“未设置”；更有效的 `image_consistency_prompt` 被放在“用户补充”。 |
| `image_consistency_prompt` | `build_character_prompts()` 生成或用户传入 | `style_transfer` 默认 prompt，角色生图一致性底座 | 和后端 `style_transfer` 规则重复表达“一致性/脸谱/服饰/武器”；风格词“庄重、热血、仪式感、设定稿级别”可能与风格模板重复或冲突。 |
| `three_view_prompt` | `build_character_prompts()` 生成或用户传入 | `four_view` 默认 prompt | 文本写“三视图：正面、侧面、背面”，但产品目标和后端规则是“四视图/正面、半侧、侧/背面”；名称和目标不一致。 |
| `negative_prompt` | `negative_prompt_terms` / `negative_keywords` / 内置默认 + 固定句 | 前端负面提示词默认值，后端负面约束来源之一 | 与风格模板负面词互斥式 fallback；如果前端传了角色负面 prompt，风格模板负面词不会进入最终负面约束。覆盖项还不够结构化。 |
| 风格模板 prompt | `StyleTemplate` 的识别字段和 `image_prompt_template`、`negative_prompt` | 控制画风、线条、色彩、光影、英歌迁移规则 | `_assemble_style_prompt()` 把很多“未识别”也写进 prompt，可能增加噪声；风格负面词只在 payload 未传负面词时使用。 |
| 前端用户补充 prompt | 抽屉 textarea；默认由基础 prompt 填充 | 传给后端 `payload.prompt_text`，后端作为“用户补充”插入 | 名称叫“用户补充”，实际承载基础 prompt；用户一编辑就可能覆盖基础底座，缺少“基础 prompt + 追加 prompt”的边界。 |
| 后端任务规则 | `_assemble_prompt()` 内置 | 区分 `style_transfer` 和 `four_view` | 已区分目标，但和基础 prompt 存在重复；四视图规则比基础 prompt 更接近产品目标。 |
| 参考图摘要 | `input_snapshot_json.input_assets` | 追溯输入，不直接进入 prompt | prompt 只写“必须保持参考图”，未把参考图类型/优先级写清；前端预览写参考图数量，但后端 prompt 不写数量和类型。 |
| 模型参数 | 前端 `aspect_ratio`、`image_size`、GPT `output_format` / `quality` | provider 调用参数 | 不进入 prompt；目前合理。 |

#### 12.3 当前重复、冲突与缺口

- **目标命名冲突**：基础字段名和 prompt 是 `three_view_prompt`，文案写“三视图”；前端/后端任务类型是 `four_view`，并要求四面真人图。
- **职责边界混乱**：前端“用户补充 Prompt”默认填入基础 prompt，后端再把它包进“用户补充”，导致基础 prompt 和真正用户追加内容不可区分。
- **最终预览不等于最终 prompt**：前端预览缺少后端实际插入的角色字段、任务规则和负面约束，用户看到的不是最终送模文本。
- **负面词合并不足**：`payload.negative_prompt`、风格模板负面词、角色负面词是 fallback 关系，不是合并关系；常见会只保留角色负面词，丢失风格模板负面词。
- **有效视觉字段未充分进入后端结构层**：GenerateTask 结构层展示 `appearance` / `costume`，但创建/导入链路主要填的是 `yingge_role`、脸谱、武器、视觉调性、正向词。
- **风格模板噪声**：未识别字段会以“未识别”形式进入 prompt。
- **provider 差异未处理**：Nano Banana 2 和 GPT Image 2 当前共用同一 prompt。暂未发现代码层必须分叉，但是否需要措辞差异应等待用户 skill/规范决定。

#### 12.4 第一阶段建议，待用户 skill 确认后执行

- 将基础 prompt 分为“角色事实/视觉锚点”和“任务目标”，避免 `image_consistency_prompt` 写死过多风格词。
- 将 `style_transfer` 与 `four_view` 使用不同结构：
  - `style_transfer` 强调参考真人妆照、保留身份/脸谱/服饰/体态，转为风格模板。
  - `four_view` 强调多视角设定图、同一角色结构一致、背景干净、视角标签/排列要求。
- 后端组装时合并角色负面词、风格模板负面词、用户负面词，并去重。
- 前端预览复用或对齐后端组装规则，避免“看见的 prompt”和 `task.prompt_text` 不一致。
- 考虑把抽屉中的 `prompt` 拆成只读基础 prompt + 用户追加 prompt，或至少改文案和组装逻辑，减少误解。
- provider-specific 提示词先不做，除非用户 skill 明确要求；可以先保持统一结构，必要时只在 provider 调用前做轻量 adapter。

#### 12.5 等待用户提供的信息

- 自定义 skill 的名称/触发方式/使用步骤。
- skill 应作用于哪些层级：基础 prompt、任务组装 prompt、负面 prompt、前端预览，还是全部。
- 是否有目标输出范例、禁用词、语言偏好（中文/英文/双语）或模型偏好的 prompt 风格。

### 2026-05-08 第二阶段：固定四视图 Prompt Draft 工作流

用户确认：

- 自定义 `ai-comic-prompt-engineer` skill 仅做参考，不作为强制开发规范。
- prompt 语言先使用中文。
- 四视图版式固定一种，不做版式切换器：
  - `16:9画幅`
  - 左侧上半身特写
  - 右侧并列全身正面、侧面、背面视图
  - 同一人物、服装、妆造、道具、光影统一
  - 纯白极简影棚背景

本次落地最小版本：

1. 新增四视图 Prompt Draft 接口：
   - `POST /api/v1/generation/character-image-prompt-drafts`
   - 仅支持 `generation_type=four_view`
   - 输入角色、参考图、风格模板、当前 prompt/negative prompt、模型参数
   - 返回 `prompt_text`、`negative_prompt`、`checklist` 和 `raw_response`
2. 后端 mock 模式使用固定四视图模板本地生成中文 prompt：
   - 合并角色身份、别名、排行、星宿、英歌身份、脸谱、武器、视觉调性
   - 合并风格模板摘要、线条、色彩、光影、人物渲染、英歌迁移和质感字段
   - 合并角色负面词、风格模板负面词、用户负面词和默认四视图负面词
3. 后端真实模型模式：
   - 当 `model_provider` 不是 mock 且环境配置 `AI_PROVIDER=dmx` / `DMX_API_KEY` 时，调用 `DMXAIProvider.generate_text`
   - 使用中文 System Prompt 固定输出格式：`正向提示词：...` / `负面提示词：...`
   - 解析返回并生成 checklist
4. GenerateTask 生图任务新增 `params_json.prompt_mode` 约定：
   - `prompt_mode=confirmed` 且 `prompt_text` 非空时，后端直接使用用户确认后的最终 prompt，不再二次包装
   - 前端四视图发起生图时传 `prompt_mode=confirmed`
   - 风格转换仍保持现有后端组装逻辑，传 `prompt_mode=assembled`
5. 前端角色生图抽屉：
   - 四视图目标下 textarea 文案改为“四视图最终 Prompt”
   - 新增“生成/优化 Prompt”按钮
   - 按钮调用 prompt draft 接口并回填正向/负面提示词
   - 四视图预览明确显示“已确认四视图最终 Prompt，发起生图时后端不再二次包装”

参考规范来源：

- 用户提供的优秀四视图 prompt 范例。
- 用户提供的 `/Users/huabi/code/ai-prompt/SKILL.md` 中的维度穷举、格式约束、正负向分离和结构化解析思路。

### 2026-05-08 第三阶段：参考图服装色彩保真修正

用户真实试跑后反馈：生成图没有还原上传参考图中人物原有服装色彩。

根因判断：

- 四视图 Prompt Draft 只强调“同一服装/妆造/道具/光影”，没有明确写出“服装固有色、局部配色、纹样颜色和材质明暗以参考图为最高优先级”。
- 风格模板的 `color_palette` 会进入 prompt，可能被模型理解成需要重配服装颜色。
- 风格转换任务同样只写“保持潮绣服饰层次”，没有明确限制风格模板不得改写参考图服装颜色。

已修正：

- 四视图 draft 模板新增硬约束：
  - 服装固有色、局部配色、纹样颜色、材质明暗和新旧程度必须以参考图为最高优先级。
  - 风格模板只迁移线条、渲染、光影和整体质感，不得改写参考图中的服装颜色。
- 四视图 prompt 生成 system prompt 新增同样约束，约束真实文本模型生成 draft。
- 风格转换 GenerateTask 组装规则新增同样约束。
- 四视图负面词新增：服装颜色漂移、参考图服装被改色。
- 测试补充断言，确保四视图 draft 和风格转换真实模型调用 prompt 都包含服装色彩保真约束。

### 2026-05-08 第四阶段：颜色锁定强化与 Seedream 5.0 Lite 接入

用户继续试跑后反馈：服装颜色仍被生成成黑白色调；并要求接入 `doubao-seedream-5.0-lite` 多图融合。

参考文档：

- DMXAPI `doubao-seedream-5.0-lite` 多图融合文档：`https://doc.dmxapi.cn/doubao-seedream-5.0-lite-Multi-image-fusion.html`
- 文档要点：
  - 请求地址：`https://www.dmxapi.cn/v1/responses`
  - 模型名称：`doubao-seedream-5.0-lite`
  - 输入字段：`input`、`size`、`image`
  - 最多 14 张参考图
  - `size` 支持 `2K` / `3K`
  - 支持 `output_format=png|jpeg`
  - 支持 `response_format=url|b64_json`
  - 返回示例中图片位于 `output[].image_url.url`

已修正：

- 四视图 prompt 从“保留参考图颜色”强化为“服装颜色锁定”段：
  - 先观察参考图中的上衣、下装、腰带、绑带、头饰、鞋履、武器/道具。
  - 逐项读取并保留服装固有色、局部配色、纹样颜色、材质明暗和新旧程度。
  - 明确不要把脸谱主色、黑白脸谱、风格模板色板、整体色彩分级当作服装颜色。
  - 明确不要把彩色服装生成黑白色调。
- 风格转换 prompt 同步增加上述防漂移约束。
- 负面词补充：
  - `彩色服装变黑白`
  - `脸谱主色污染服装`
- 新增 DMX Seedream provider：
  - 文件：`apps/api/app/ai/dmx_seedream.py`
  - 请求 DMX `/v1/responses`
  - 将输入图片转为 `data:image/<mime>;base64,...`
  - 输出下载 `output[].image_url.url`
  - `image_size=4K` 在 5.0 lite 下映射为 `3K`，其他默认 `2K`
- 后端 GenerateTask 新增 provider 分支：
  - `model_provider=dmx-seedream`
  - current_step：`calling_seedream_5_lite`
  - raw_response provider：`dmx-seedream`
- 前端模型列表启用 Seedream：
  - `Seedream 5.0 Lite`
  - `provider=dmx-seedream`
  - `enabled=true`
- 配置新增：
  - `DMX_SEEDREAM_IMAGE_BASE_URL`
  - `DMX_SEEDREAM_IMAGE_MODEL`

### 2026-05-08 第五阶段：最终送模 Prompt 配色保真契约

用户继续试跑后反馈：服装、道具仍没有完整还原参考图所有配色。

根因判断：

- 四视图前端使用 `prompt_mode=confirmed`，后端此前会把用户确认的四视图 prompt 原样写入 `GenerateTask.input_prompt`。
- 这会绕过 `_assemble_prompt()` 内针对风格模板、脸谱主色和服装颜色漂移的后端保护规则。
- 由于当前链路尚未做参考图 VLM 逐项识别，最终 prompt 没有明确告诉图片模型“第几张参考图负责哪类服装/道具配色”，多图融合模型容易被四视图范例、脸谱黑白色或风格模板色板重新配色。

已修正：

- confirmed prompt 不再裸送模型。
- 后端创建 `GenerateTask` 时，如果任务带有参考图，会在最终 `prompt_text/input_prompt` 末尾追加“参考图配色保真契约”：
  - 按输入顺序标注第 1、2、3... 张参考图及其 `reference_type` 中文含义。
  - 要求逐项保留服装、头饰、腰饰、绑带、鞋履、武器/道具的固有色、局部配色、纹样颜色、材质明暗和新旧程度。
  - 明确颜色优先级：真人/实拍参考图中的服装和道具颜色 > 角色文字档案 > 风格模板色板 > 通用审美色调。
  - 明确脸谱主色只用于脸谱区域，不得扩散到衣服、腰带、鞋履、武器或道具。
  - 明确禁止把彩色参考服装统一改成黑白、灰阶、银黑或低饱和单色。
  - 四视图额外强调同一套参考图服装和道具配色在左侧特写、正面、侧面、背面之间保持一致。
- 前端预览文案同步调整，不再写“后端不再二次包装”，改为提示后端会追加参考图配色保真契约。

### 2026-05-08 第六阶段：四视图 Prompt 改为优秀范例式母版

用户明确要求严格复刻优秀四视图提示词的结构。此前系统生成的四视图 Prompt 仍偏“说明书式拼接”，虽然包含颜色保护规则，但自然生图表达不够强，模型执行效果差。

已修正：

- 四视图 mock / 本地固定 Prompt 改为 4 段自然中文母版：
  1. 版式、四视图排版、统一性、核心侧逆光、轮廓光/发丝光、低强度伦勃朗补光、纯白极简影棚背景。
  2. `超写实人像`、角色身份、气质、外观、脸谱，并用 `身穿...` 详细承载服装颜色、材质、纹样和配色优先级。
  3. 头饰、武器/道具、姿态，以及左侧特写、右侧正面、侧面、背面的展示重点。
  4. 极致细节、皮肤、妆面、发丝、服装纹理、材质、焦内锐利、电影级质感、专业影棚摄影、景深自然。
- 去掉四视图 Prompt 主体中的 `角色身份：`、`服装颜色锁定：`、`风格规则：` 等字段标签式写法。
- 风格模板不再作为大段字段拼接到 Prompt 中；只提取视觉摘要、线条、光影、人物渲染、质感，压缩为一句“整体风格参考”，避免干扰角色服装/道具配色。
- 四视图 draft 的真实文本模型 system/user prompt 同步调整：
  - 要求严格输出 4 段自然生图 Prompt。
  - 第一段必须以用户优秀范例的版式句开头。
  - 人物段必须包含 `超写实人像` 和 `身穿`。
  - 动作段必须包含 `左侧特写`、`右侧正面`、`侧面`、`背面`。
  - 画质段必须包含 `极致细节`、`服装纹理清晰`、`电影级质感`、`专业影棚摄影`。

### 2026-05-08 第七阶段：真人妆照风格转换 Prompt 母版

用户确认真人妆照风格转换的目标工作流：

1. 本地上传一张想要的风格图片。
2. VLM 解析风格图中的线条、色彩、光影、材质、背景等风格元素。
3. 选择一张真人妆照参考图。
4. 真人参考图结合风格 JSON / 生图 Prompt 生成目标图。

阶段判断：

- 当前先不新增“上传风格图 -> 立即解析 -> 本次直接使用”的 UI 与接口。
- 先复用现有风格模板库，验证“风格 JSON + 真人参考图”的最终 Prompt 质量。
- 核心规则：真人参考图决定画什么，风格模板只决定怎么画。

已修正：

- `style_transfer` 不再走通用说明书式 `_assemble_prompt()` 拼接。
- 新增真人妆照风格转换专属 Prompt 母版：
  1. 任务段：基于真人妆照进行风格转换，保持同一人物、同一脸谱、同一服装、同一道具、同一体态比例。
  2. 主体保真段：五官、脸型、发型、头饰、脸谱、服装固有色、局部配色、纹样颜色、腰饰、鞋履、武器/道具位置和持握方式来自真人参考图。
  3. 风格迁移段：风格模板只作用于画风、线条、色彩氛围、光影组织、渲染颗粒、材质表现和背景处理。
  4. 输出质量段：单人主体清晰、脸谱边界准确、皮肤和妆面细腻、服装纹理清晰、道具边缘锐利、电影级质感。
- 负面约束补充：
  - 身份改变
  - 脸谱错位
  - 服装改色
  - 道具改色
  - 参考图彩色服装变黑白
  - 风格模板色板污染服装
  - 背景抢主体

### 2026-05-08 第八阶段：新增角色形象定稿任务

用户反馈真人妆照风格转换仍不满意，并提出“换成风格模板库中的人物风格形象，再把采纳图用于四视图”的方向。

任务拆分：

- `style_transfer`：保真人，换画风。
- `character_lookdev`：风格角色化 / 角色形象定稿，生成可采纳为四视图主参考的标准形象图。
- `four_view`：用已满意的主视觉 / 标准形象图扩展为四视图。

已实现 MVP：

- 后端新增 `generation_type=character_lookdev`。
- 前端角色生图工作台新增任务卡：`角色形象定稿`。
- 生成仍复用现有图片模型分支：
  - `dmx-gemini`
  - `dmx-gpt-image`
  - `dmx-seedream`
  - `mock`
- 新增 `character_lookdev` 专属 Prompt 母版：
  - 生成一张单人角色标准形象图，用于后续四视图和关键帧一致性参考。
  - 风格模板人物图决定脸部审美、画风、渲染质感、光影、构图气质和高级感。
  - 角色事实参考图决定英歌脸谱、服装结构、服装颜色、头饰、武器道具、体态比例和角色身份。
  - 最终图不是普通真人风格转换，也不是照搬风格模板人物身份。
  - 人工采纳后可作为四视图主参考。
- 生成资产标题新增：
  - `形象定稿候选`

未做：

- 暂未新增单独“换脸”接口。
- 暂未新增“上传风格图后立即 VLM 解析并用于本次任务”的 UI。
- 暂未自动把采纳后的形象定稿图设为四视图主参考；当前仍作为候选生成资产进入人工采纳流程。

### 2026-05-08 第九阶段：角色生图工作流收敛为两段

用户重新确认：角色生图中心不需要保留三条相互混淆的主流程，当前应收敛为两段：

1. `角色定稿`：选择角色模板，勾选系统参考图，补充 prompt，生成角色定稿候选图。
2. `四视图生成`：沿用当前稳定四视图 Prompt Draft / confirmed prompt 链路，手动勾选已纳入参考图库的角色定稿图和其他参考图。

本阶段决策：

- `style_transfer` 不再作为角色生图工作台主入口展示。
- 现有 `character_lookdev` 作为 `角色定稿` 的实现底座继续使用，避免新增一套重复 generation type。
- 角色定稿候选图生成成功后，用户可手动点击“纳入参考图”；系统复制为新的参考图库资产，不自动勾选四视图输入，不自动设为主参考。
- 风格模板库明确分为：
  - `角色模板`
  - `场景模板`
- 角色生图工作台只展示和允许绑定 `角色模板`；显式标记为 `场景模板` 的模板会被后端拒绝用于角色生图。

已实现：

- 后端：
  - `StyleTemplateService.list()` / `GET /style-templates/` 支持 `style_category` 过滤。
  - 风格识别时，如果模板已人工分类为 `角色模板` 或 `场景模板`，AI 分析结果不再覆盖该分类。
  - `GenerateTaskService` 新增角色生图模板校验，显式拒绝 `场景模板`。
  - 修复 `_assemble_prompt()` 中非 confirmed 四视图 assembled 分支返回空字符串的问题。
  - 新增 `POST /characters/{character_id}/generated-assets/{asset_id}/promote-to-reference`，把生成候选图复制为参考图库资产：
    - `asset_origin=promoted`
    - `reference_type=character_final_reference`
    - 保留原生成资产，不自动勾选，不自动设为主参考。
- 前端：
  - 角色生图工作台目标收敛为 `角色定稿` 和 `角色四视图生成`。
  - 模板库新建面板默认分类为 `角色模板`，并提供 `角色模板 / 场景模板` 选择。
  - 模板库列表新增类型筛选：全部类型、角色模板、场景模板。
  - 角色生图抽屉的模板选择器只显示非场景模板，并调整文案为角色模板。
  - 参考图选择区新增 `角色定稿参考` 分组。
  - `character_lookdev` 生成资产卡新增“纳入参考图”按钮，成功后进入参考图库，四视图中由用户手动勾选。

验证结果：

- `cd apps/api && .venv/bin/python -m pytest tests/test_style_templates_api.py tests/test_characters_api.py::test_character_generated_asset_can_be_promoted_to_manual_reference tests/test_generation_api.py::test_character_image_task_rejects_scene_style_template tests/test_generation_api.py::test_non_confirmed_four_view_task_assembles_prompt_text -q`
  - 通过：`13 passed`
- `cd apps/web && npm run typecheck`
  - 通过
- `cd apps/web && npm run lint`
  - 通过
- `cd apps/api && .venv/bin/python -m pytest tests/test_characters_api.py tests/test_generation_api.py -q`
  - 通过：`22 passed`
- 轻量服务检查：
  - `GET http://localhost:3000/style-templates`：`200`
  - `GET http://localhost:3000/characters`：`200`
  - `GET http://localhost:8000/api/v1/style-templates/?style_category=角色模板`：`200`

未运行：

- 未运行真实图片模型端到端调用。
- 未运行全量 `apps/api` pytest。
- 未做数据库迁移；本阶段复用现有 `style_category` 字段承载 `角色模板 / 场景模板`。

## 13. 完成记录

状态：DONE_WITH_CONCERNS

### 2026-05-08 第十阶段：角色定稿 Prompt Draft 接入

本阶段根据用户确认的简化工作流继续收口：

- 角色中心主流程仍保持两段：
  - `角色定稿`
  - `四视图生成`
- 四视图链路保持稳定，不重新设计。
- 重点补齐 `角色定稿` 的 Prompt Draft 能力，让它不再和旧的真人妆照风格转换混在一起。

新增/调整内容：

- 后端：
  - `character-image-prompt-drafts` 支持 `generation_type=character_lookdev`。
  - `character_lookdev` draft 使用独立四段式 Prompt 母版：
    - 单人角色定稿主视觉目标，不是四视图、不是场景图、不是关键帧。
    - 明确参考图职责：脸谱参考只锁脸谱；真人/角色事实参考锁服装、颜色、头饰、道具、体态；角色模板只提供脸部审美、画风、渲染、光影和构图气质。
    - 明确角色身份、脸谱、服装、武器/道具和用户补充要求。
    - 明确半身或 3/4 身、背景简洁、角色概念设计完成度，并适合后续纳入参考图库。
  - `character_lookdev` draft 合并角色负面词、模板负面词、用户负面词和默认失败项。
  - 新增 `character_lookdev` checklist：`single_character`、`reference_roles`、`template_boundary`、`manual_reference_ready`、`negative_controls`。
  - 参考图保真契约新增 `character_final_reference` 中文标签：`角色定稿参考`。
- 前端：
  - 角色定稿目标也显示 `生成/优化定稿 Prompt` 按钮。
  - 角色定稿 prompt 编辑区改为 `角色定稿最终 Prompt`。
  - 角色定稿创建任务时使用 `prompt_mode=confirmed`，与四视图一致，后端只追加参考图保真契约。
  - 角色定稿预览改为 `最终送模 Prompt`，说明生成结果满意后可手动纳入参考图库再用于四视图。
- 测试：
  - 新增角色定稿 draft 行为测试，覆盖参考图职责、模板边界、用户补充、负面词合并和 checklist。
  - 新增角色定稿 confirmed prompt 追加参考图保真契约测试。

验证结果：

- `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py::test_character_lookdev_prompt_draft_uses_reference_roles_and_merges_constraints tests/test_generation_api.py::test_character_lookdev_confirmed_prompt_appends_reference_contract -q`
  - 先按 TDD 看到失败：`2 failed`
  - 实现后通过：`2 passed`
- `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py tests/test_characters_api.py tests/test_style_templates_api.py -q`
  - 通过：`34 passed`
- `cd apps/web && npm run typecheck`
  - 通过
- `cd apps/web && npm run lint`
  - 通过
- 轻量服务检查：
  - `GET http://127.0.0.1:8000/api/v1/characters/`：`200`
  - `GET http://127.0.0.1:3000/`：`307`，Next.js 根路径重定向正常
- 浏览器检查：
  - `http://localhost:3000/characters` 可打开，控制台仅有 React DevTools 开发提示。
  - `http://127.0.0.1:3000/characters` 会因前端默认 API 地址 `localhost:8000` 触发现有 CORS origin 差异；使用 `localhost:3000` 正常。

本阶段修改文件：

- `apps/api/app/modules/generation/service.py`
- `apps/api/tests/test_generation_api.py`
- `apps/web/src/features/generation/types.ts`
- `apps/web/src/features/characters/character-detail-screen.tsx`
- `docs/features/2026-05-08-character-image-prompts-optimization.md`

本阶段遗留：

- 未运行真实 DMX 文本模型生成角色定稿 Prompt。
- 未运行真实图片模型端到端角色定稿出图。
- 角色定稿 Prompt 母版已按当前研究和用户工作流收口，但最终质量仍需要用真实参考图出图继续微调。
- 当前只做“生成 Prompt 后再生图”的按钮链路，没有新增 PromptTemplate 管理后台。

### 2026-05-08 第十一阶段：角色定稿参考移除入口

用户反馈：从角色定稿候选手动纳入参考图库后，也需要能在生图工作台中直接移除，否则四视图参考池会积累不再需要的定稿图。

调整内容：

- 生图工作台 `角色定稿参考` 分组新增 `移除` 按钮。
- 点击移除后复用现有参考图软删除接口，将该参考移入回收站，COS 文件保留。
- 移除时同步取消当前抽屉里的勾选，避免已经删除的参考图继续留在本次任务输入中。
- 外层 `参考图库 -> 回收站` 仍可恢复该参考图。

验证结果：

- `cd apps/web && npm run typecheck`
  - 通过
- `cd apps/web && npm run lint`
  - 通过
- `cd apps/api && .venv/bin/python -m pytest tests/test_characters_api.py::test_character_generated_asset_can_be_promoted_to_manual_reference -q`
  - 通过：`1 passed`

本阶段修改文件：

- `apps/web/src/features/characters/character-detail-screen.tsx`
- `docs/features/2026-05-08-character-image-prompts-optimization.md`

### 2026-05-08 第十二阶段：生成任务 queued 卡住排查与队列恢复

用户反馈：角色生图工作台中任务一直停在 `queued / 0%`。

排查结论：

- 前端不是根因；任务状态来自后端 `GenerateTask`。
- 时迁角色下有 1 条真实 nano banana 2 任务停在 `running / calling_nano_banana_2 / 62%`，后续多次点击生成创建了多条 `queued / 0%` 任务。
- 当前队列是单 worker 串行执行；前一条真实模型调用不返回，后面的 queued 会一直等待。
- 旧逻辑在后端重启或热重载后没有恢复数据库里已有的 `queued` 任务，也没有把失去后台线程的 `running` 任务标为失败，导致界面看起来一直卡住。

修复内容：

- 后端启动时初始化生成队列。
- 队列初始化时恢复数据库中 `queued` / `pending` 的角色生图任务，重新放入内存队列。
- 队列初始化时将数据库中遗留的 `running` 角色生图任务标记为失败：
  - `status=failed`
  - `current_step=generation_failed`
  - `error_code=GENERATION_TASK_ORPHANED`
  - 失败说明提示“服务重启或热重载后失去后台执行进程，可使用重试创建新任务”。
- 已重启后端，使当前时迁页面中卡住的任务转为失败态，不再继续显示 queued 卡住。

验证结果：

- `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py::test_generation_queue_recovers_orphaned_queued_tasks_after_restart tests/test_generation_api.py::test_generation_queue_marks_stale_running_tasks_failed_on_recovery tests/test_generation_api.py::test_generation_queue_marks_fresh_running_tasks_failed_after_process_restart -q`
  - 先按 TDD 看到失败
  - 修复后通过：`3 passed`
- `cd apps/web && npm run typecheck`
  - 通过
- `cd apps/web && npm run lint`
  - 通过
- 本地时迁任务状态复查：
  - 多条卡住任务已变为 `failed / generation_failed / GENERATION_TASK_ORPHANED`。

本阶段修改文件：

- `apps/api/app/main.py`
- `apps/api/app/modules/generation/queue.py`
- `apps/api/tests/test_generation_api.py`
- `docs/features/2026-05-08-character-image-prompts-optimization.md`

本阶段遗留：

- nano banana 2 真实图片接口仍可能在 `calling_nano_banana_2` 阶段长时间无响应；本次只修复队列恢复和孤儿任务状态，不代表真实模型网关已稳定。
- 后续建议给前端增加“模型调用中，可能耗时数分钟”的更明确提示，以及给 running 任务提供用户可见的取消/标失败入口。

### 2026-05-08 第十三阶段：任务队列实时查看与强制终止

用户建议：做一个 UI 让用户实时看到任务队列情况，并可强制截断卡住任务。

实现内容：

- 后端：
  - 新增 `POST /api/v1/generation/character-image-tasks/{task_id}/cancel`。
  - 仅允许取消 `queued`、`pending`、`running` 的角色生图任务。
  - 取消后写入：
    - `status=cancelled`
    - `current_step=cancelled`
    - `error_code=USER_CANCELLED`
    - `error_message=用户手动终止任务。`
  - 队列 worker 执行前会跳过已取消任务。
  - 真实图片模型调用返回后会再次检查任务是否已取消；如果用户已取消，不保存候选资产。
  - 修复队列恢复与新任务入队的重复入队问题：请求创建新任务时不触发持久化队列恢复，避免同一 task_id 以无 storage 的恢复项抢先进队列。
- 前端：
  - API client 新增 `cancelCharacterImageTask()`。
  - 生图工作台打开时，每 3 秒刷新任务列表和生成资产，形成轻量实时队列视图。
  - `最近任务` 卡片对 `queued` / `pending` / `running` 显示 `强制终止`。
  - 当前任务小卡也显示 `强制终止`。
  - `cancelled` 状态作为终态处理，可继续重试，但不会被当作成功。
  - 顶部进度条支持 `正在终止生成任务` / `最近任务已终止` 状态。

验证结果：

- `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py::test_character_image_task_can_be_cancelled_while_queued tests/test_generation_api.py::test_character_image_task_can_be_cancelled_while_running tests/test_generation_api.py::test_completed_character_image_task_cannot_be_cancelled tests/test_generation_api.py::test_cancelled_real_task_does_not_save_outputs_after_provider_returns tests/test_generation_api.py::test_generation_queue_recovers_orphaned_queued_tasks_after_restart -q`
  - 先按 TDD 看到缺接口失败
  - 修复后通过：`5 passed`
- `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py tests/test_characters_api.py -q`
  - 通过：`31 passed`
- `cd apps/web && npm run typecheck`
  - 通过
- `cd apps/web && npm run lint`
  - 通过

本阶段修改文件：

- `apps/api/app/modules/generation/router.py`
- `apps/api/app/modules/generation/service.py`
- `apps/api/app/modules/generation/queue.py`
- `apps/api/tests/test_generation_api.py`
- `apps/web/src/lib/api/generation.ts`
- `apps/web/src/features/characters/character-detail-screen.tsx`
- `docs/features/2026-05-08-character-image-prompts-optimization.md`

本阶段遗留：

- 当前“强制终止”是可靠的任务状态截断，不是底层 HTTP 请求硬 kill；如果真实模型请求已经发出，需要等 provider 返回或超时，但返回后不会保存输出。
- 后续可考虑新增全局任务中心页面，跨角色查看所有 GenerateTask；本阶段只做角色生图工作台内的轻量实时队列。

2026-05-08 本线程最新完成摘要：

- 已根据用户重新确认，将角色生图中心主流程收敛为两段：
  - `角色定稿`
  - `四视图生成`
- 已保留现有稳定四视图链路，并让四视图可手动勾选从角色定稿候选纳入的参考图。
- 已将风格模板库分类收敛为 `角色模板 / 场景模板`，角色生图只使用角色模板。
- 已新增生成候选图“纳入参考图”后端接口和前端按钮；纳入后不自动勾选、不自动设主参考。
- 已修复非 confirmed 四视图 assembled prompt 返回空字符串的问题。

本轮修改文件：

- `apps/api/app/modules/style_templates/service.py`
- `apps/api/app/modules/style_templates/router.py`
- `apps/api/app/modules/generation/service.py`
- `apps/api/app/modules/characters/service.py`
- `apps/api/app/modules/characters/router.py`
- `apps/api/tests/test_style_templates_api.py`
- `apps/api/tests/test_generation_api.py`
- `apps/api/tests/test_characters_api.py`
- `apps/web/src/lib/api/style-templates.ts`
- `apps/web/src/lib/api/characters.ts`
- `apps/web/src/features/style-templates/style-templates-screen.tsx`
- `apps/web/src/features/characters/character-detail-screen.tsx`
- `docs/features/2026-05-08-character-image-prompts-optimization.md`

本轮验证：

- `cd apps/api && .venv/bin/python -m pytest tests/test_style_templates_api.py tests/test_characters_api.py::test_character_generated_asset_can_be_promoted_to_manual_reference tests/test_generation_api.py::test_character_image_task_rejects_scene_style_template tests/test_generation_api.py::test_non_confirmed_four_view_task_assembles_prompt_text -q`
  - 通过：`13 passed`
- `cd apps/web && npm run typecheck`
  - 通过
- `cd apps/web && npm run lint`
  - 通过

本轮遗留：

- 未运行真实模型端到端角色定稿 / 四视图冒烟。
- 未运行全量 `apps/api` pytest。
- 当前复用 `style_category` 承载模板二分，后续如果要保留更细粒度风格标签，建议再新增独立字段或模板标签系统。

完成内容：

- 已完成角色中心生图提示词来源链路梳理，见 `12.1`。
- 已使用用户提供的四视图范例和 `ai-comic-prompt-engineer` skill 作为参考规范。
- 已优化四视图 prompt draft 层：
  - 新增固定 16:9 四视图中文 prompt 生成。
  - 新增正向/负向提示词分离。
  - 新增 prompt checklist。
  - 新增负面词合并去重。
- 已优化 GenerateTask 组装层：
  - 四视图可通过 `prompt_mode=confirmed` 使用用户确认后的最终 prompt，但后端会追加参考图配色保真契约，避免最终送模时丢失颜色保护规则。
  - 风格转换暂不改，仍使用现有角色 + 风格模板 + 用户补充的后端组装。
  - 风格转换已补充参考图服装色彩保真约束，避免风格模板改写服装固有色。
- 已优化前端抽屉：
  - 四视图新增“生成/优化 Prompt”按钮。
  - 四视图 prompt textarea 变为最终 prompt 编辑区。
  - 四视图预览与后端 confirmed prompt 模式对齐。

修改文件：

- `apps/api/app/modules/generation/schemas.py`
- `apps/api/app/modules/generation/router.py`
- `apps/api/app/modules/generation/service.py`
- `apps/api/app/ai/dmx_seedream.py`
- `apps/api/app/core/config.py`
- `apps/api/tests/test_dmx_seedream_provider.py`
- `apps/api/tests/test_generation_api.py`
- `apps/web/src/features/characters/character-detail-screen.tsx`
- `.env.example`
- `apps/api/tests/test_dmx_seedream_provider.py`
- `apps/api/tests/test_generation_api.py`
- `apps/web/src/features/generation/types.ts`
- `apps/web/src/lib/api/generation.ts`
- `apps/web/src/features/characters/character-detail-screen.tsx`
- `docs/features/2026-05-08-character-image-prompts-optimization.md`

验证结果：

- `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py -q`
  - 通过：`10 passed`
- `cd apps/api && .venv/bin/python -m pytest tests/test_characters_api.py -q`
  - 通过：`6 passed`
- `cd apps/web && npm run typecheck`
  - 通过
- `cd apps/web && npm run lint`
  - 通过
- 用户反馈服装色彩保真后追加验证：
  - `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py::test_character_four_view_prompt_draft_uses_fixed_layout_and_merges_constraints tests/test_generation_api.py::test_character_style_transfer_uses_dmx_gemini_and_saves_generated_asset -q`
    - 通过：`2 passed`
  - `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py -q && .venv/bin/python -m pytest tests/test_characters_api.py -q`
    - 通过：`10 passed`，`6 passed`
  - `cd apps/web && npm run typecheck && npm run lint`
    - 通过
- Seedream 接入与颜色锁定强化后追加验证：
  - `cd apps/api && .venv/bin/python -m pytest tests/test_dmx_seedream_provider.py tests/test_generation_api.py::test_character_four_view_prompt_draft_uses_fixed_layout_and_merges_constraints tests/test_generation_api.py::test_character_style_transfer_uses_dmx_gemini_and_saves_generated_asset tests/test_generation_api.py::test_character_four_view_uses_dmx_seedream_and_saves_generated_asset -q`
    - 通过：`5 passed`

未运行：

- 未运行真实 Nano Banana 2 / GPT Image 2 端到端调用。
- 未运行真实 DMX 文本模型生成四视图 prompt。
- 未运行全量 `apps/api` pytest。

是否建议真实冒烟：

- 建议先做一次真实 DMX 文本模型的四视图 prompt draft 冒烟，确认返回格式可被稳定解析。
- 然后再选 1 个角色 + 1 个已识别风格模板 + 参考图，做一次真实图片模型四视图生图冒烟。
- 暂不建议进入关键帧生成，等四视图 prompt 和候选资产人工检查通过后再进入。

## 14. 遗留问题

- 真实 DMX 文本模型返回可能不严格遵守 `正向提示词/负面提示词` 格式；当前有解析兜底，但需要真实调用验证。
- 四视图 mock prompt 是固定模板，不代表最终真实模型一定最优；需要用实际输出继续微调词序和负面词。
- 服装色彩保真已补 prompt 约束，但真实图片模型仍可能受风格模板 `color_palette` 和参考图质量影响；需要继续用真实出图验证。
- Seedream 5.0 Lite 已接入代码链路，但尚未进行真实 DMX 端到端调用；需要用真实参考图确认 `/v1/responses` 返回结构和出图质量。
- 风格转换链路本次未改，仍依赖现有风格模板 JSON 和后端组装；后续可继续把“风格 JSON + 真人妆照 + 角色一致性”整理成更明确的 prompt draft 流程。
- `three_view_prompt` 字段名仍与四视图目标不一致；本次没有做字段迁移或大规模重构。
- 真实 provider-specific prompt 差异暂未处理。

## 15. 下一步建议

- 用户已在 2026-05-09 确认真实测试通过，本任务可按已完成收口。
- 后续如有新的实际出图反馈，再以小修方式继续调整 `four_view` / `character_lookdev` prompt。
- 若输出质量稳定，回到指挥官线程更新 `docs/current-development-map.md`。

## 16. 2026-05-09 第三次接手记录

本线程按用户要求只做接手核查和任务档案写回，未改业务代码。

已读取：

- `docs/features/2026-05-08-character-image-prompts-optimization.md`
- `apps/api/app/modules/generation/service.py`
- `apps/api/app/modules/characters/prompting.py`
- `apps/api/tests/test_generation_api.py`
- `apps/web/src/features/characters/character-detail-screen.tsx`

当前已做：

- 角色中心生图工作台已从三条流程收敛为两条主流程：`character_lookdev`（角色定稿）和 `four_view`（角色四视图生成）。
- `style_transfer` 后端能力和测试仍保留，但不再作为角色生图工作台主入口。
- 四视图 Prompt Draft 已采用固定 16:9 四视图母版，并通过 `prompt_mode=confirmed` 送入最终生成；后端会追加参考图配色保真契约。
- 角色定稿已新增 Prompt Draft、最终送模 prompt、候选图手动纳入参考图库能力。
- 显式 `场景模板` 已被后端拒绝用于角色生图；前端角色生图模板选择器只展示非场景模板。
- `apps/api/app/modules/generation/service.py` 中 `_assemble_prompt()` 的非 confirmed 四视图分支当前已有 `return "\n".join(...)`，并有 `test_non_confirmed_four_view_task_assembles_prompt_text` 覆盖；上一线程指出的 return 控制流风险在当前代码中未复现。

未完成：

- 仍需等待用户继续提供自定义 skill、范例 prompt、实际出图反馈或具体优化要求，再决定是否继续调整 `four_view` / `character_lookdev` / `style_transfer` 的提示词。
- 尚未进行真实 Nano Banana 2、GPT Image 2 或 Seedream 5.0 Lite 的端到端生图冒烟。
- 尚未验证真实 DMX 文本模型生成 Prompt Draft 的返回格式稳定性。
- `three_view_prompt` 字段名仍与当前四视图产品目标不一致；目前没有做字段迁移。

风险点：

- 虽然 `_assemble_prompt()` 的非 confirmed 四视图返回问题当前已修复并有测试，但后续修改该函数时应保留该回归测试。
- `character_lookdev` 与 `style_transfer` 的负面词目前仍有部分 fallback / 直接拼接逻辑，未完全统一到 `_merge_negative_prompts()`。
- 真实图片模型仍可能忽略“参考图配色保真契约”，需要根据实际出图反馈继续调整词序、参考图优先级描述或 provider-specific prompt。
- 前端 `PromptBlock` 仍显示“三视图”标签，底层字段仍是 `three_view_prompt`，可能继续造成理解噪声。

本次修改文件：

- `docs/features/2026-05-08-character-image-prompts-optimization.md`

本次验证：

- 未运行自动化测试；本次仅阅读代码和更新任务档案。

## 17. 2026-05-09 完成确认

用户在本线程确认：角色中心生图提示词优化模块已经真实测试通过。

完成结论：

- 任务状态从 `in_progress` 更新为 `done`。
- 角色定稿、四视图生成、参考图配色保真契约、角色模板过滤、候选图纳入参考图库等核心链路可作为已完成能力继续使用。
- 后续不再默认大改本模块；仅在用户提供新的出图反馈、范例 prompt 或具体优化要求时做局部小修。

本次修改文件：

- `docs/features/2026-05-08-character-image-prompts-optimization.md`

本次验证：

- 用户确认已完成真实测试并通过。
