# GPT Image 2 图片编辑接入

状态：done
负责人线程：Codex 功能开发线程
创建时间：2026-05-08
最后更新：2026-05-08

## 1. 为什么现在做

角色生图已经有 `nano banana 2` 真实链路和异步 GenerateTask 队列 MVP。下一步在进入关键帧生成前，先把角色生图的模型能力补强：接入 `gpt-image-2` 图片编辑，并统一扩展输出比例和等级。

这样后续关键帧生成可以复用更完整的图片模型适配层，而不是只绑定 `dmx-gemini` 一条链路。

## 2. 参考文档

- DMXAPI `gpt-image-2` 图片编辑文档：https://doc.dmxapi.cn/gpt-image-2-image-edit.html

从文档提取的关键点：

- 请求地址：`https://www.dmxapi.cn/v1/images/edits`
- 推荐模型：`gpt-image-2-ssvip`
- 请求方式：multipart form-data
- 图片字段：一个或多个 `image`
- 鉴权：`Authorization: Bearer <DMX_API_KEY>`
- 核心参数：`model`、`prompt`、`size`、`quality`、`background`、`output_format`、`output_compression`、`n`
- 返回：`data[]` 中可能包含 `b64_json` 或 `url`
- 约束：最大边长不超过 3840px，宽高为 16 的倍数，长宽比不超过 3:1，总像素在 655,360 到 8,294,400 之间

## 3. 目标链路

```text
角色参考图 + 风格模板 + Prompt
  ↓
选择模型：nano banana 2 或 GPT Image 2
  ↓
选择比例：1:1 / 16:9 / 9:16 / 4:3 / 3:4 / 3:2 / 2:3 / 21:9
  ↓
选择等级：1K / 2K / 4K
  ↓
GenerateTask queued
  ↓
worker 调用对应图片 provider
  ↓
输出资产入库
  ↓
人工采纳 / 标废
```

## 4. 本次范围

- 新增 DMX `gpt-image-2` 图片编辑 provider。
- 将前端 GPT Image 2 从预留模型改为可用模型。
- 角色生图任务支持 `model_provider = "dmx-gpt-image"`。
- 复用现有 GenerateTask 队列、任务查询、失败重试、资产落库和前端轮询。
- 扩展前端比例选项：
  - `1:1`
  - `16:9`
  - `9:16`
  - `4:3`
  - `3:4`
  - `3:2`
  - `2:3`
  - `21:9`
- 扩展前端等级选项：
  - `1K`
  - `2K`
  - `4K`
- 为 `gpt-image-2` 建立比例 + 等级到 `size` 的映射。
- 保证 `nano banana 2` 继续使用 `aspectRatio` + `imageSize`，并能接收新增比例和 `4K` 等级。
- 补齐后端 provider 单元测试和 generation API 测试。
- 前端通过 typecheck/lint。
- 更新本任务档案完成记录。

## 5. 明确不做

- 不做关键帧生成。
- 不做生视频生成。
- 不做模型价格/成本统计。
- 不做 mask 局部编辑。
- 不做文生图独立入口。
- 不做 WebSocket/SSE。
- 不做模型市场或模型动态配置页面。
- 不做复杂多模型自动路由。

## 6. 设计建议

### 6.1 Provider 边界

建议新增：

- `apps/api/app/ai/dmx_gpt_image.py`

建议提供类似 `DMXGeminiImageProvider` 的统一返回结构：

- 输入：prompt、参考图片列表、aspect_ratio、image_size、model、output_format、quality
- 输出：图片 bytes、mime type、raw response summary

`GenerateTaskService._execute_character_image_task` 根据 `task.model_provider` 分流：

- `dmx-gemini` -> 现有 `DMXGeminiImageProvider`
- `dmx-gpt-image` -> 新增 `DMXGPTImageProvider`
- 其他 -> mock

### 6.2 GPT Image 2 参数映射

前端仍传：

```json
{
  "aspect_ratio": "16:9",
  "image_size": "2K"
}
```

后端 provider 内部转换为 `size`。

建议映射如下，所有尺寸都应为 16 的倍数，并满足 DMXAPI 文档约束：

| 比例 | 1K | 2K | 4K |
| --- | --- | --- | --- |
| 1:1 | 1024x1024 | 2048x2048 | 2880x2880 |
| 16:9 | 1536x864 | 2048x1152 | 3840x2160 |
| 9:16 | 864x1536 | 1152x2048 | 2160x3840 |
| 4:3 | 1536x1152 | 2048x1536 | 3200x2400 |
| 3:4 | 1152x1536 | 1536x2048 | 2400x3200 |
| 3:2 | 1536x1024 | 2304x1536 | 3456x2304 |
| 2:3 | 1024x1536 | 1536x2304 | 2304x3456 |
| 21:9 | 1792x768 | 2688x1152 | 3584x1536 |

如果接口拒绝某个尺寸，功能线程应记录失败尺寸和错误信息，并优先改为同约束下更保守的尺寸，而不是回退成 `auto`。

### 6.3 GPT Image 2 默认参数

建议默认：

- `model`: `gpt-image-2-ssvip`
- `background`: `auto`
- `output_format`: `png`
- `quality`: `auto`
- `n`: 1

如果前端继续传 `output_count`，后端可映射到 `n`，但 MVP 建议限制为 1，降低资产处理复杂度。

### 6.4 nano banana 适配

当前 `DMXGeminiImageProvider` 已把 `aspectRatio` 和 `imageSize` 放到 Gemini `imageConfig`。本次需要：

- 前端允许新增比例和 `4K`。
- 后端保留透传逻辑。
- 测试确认新增比例/等级会进入 Gemini payload。
- 如果某些 Gemini 模型不支持 `4K` 或 `21:9`，失败应记录为任务失败，不应悄悄改参数。

## 7. 涉及模块

后端：

- `apps/api/app/ai/dmx_gpt_image.py`
- `apps/api/app/ai/dmx_gemini.py`
- `apps/api/app/modules/generation/service.py`
- `apps/api/app/modules/generation/schemas.py`
- `apps/api/tests/test_dmx_gpt_image_provider.py`
- `apps/api/tests/test_dmx_gemini_provider.py`
- `apps/api/tests/test_generation_api.py`

前端：

- `apps/web/src/features/characters/character-detail-screen.tsx`
- `apps/web/src/features/generation/types.ts`

配置：

- `apps/api/app/core/config.py`
- `.env.example`

## 8. 验收标准

- 前端角色生图抽屉中 GPT Image 2 可选择并启用。
- 前端比例包含：`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`21:9`。
- 前端等级包含：`1K`、`2K`、`4K`。
- 创建 GPT Image 2 任务时，任务 `model_provider` 为 `dmx-gpt-image`，接口立即返回 `queued`。
- worker 能调用 GPT Image 2 provider。
- GPT Image 2 provider 使用 multipart form-data 调用 `/v1/images/edits`。
- GPT Image 2 provider 能处理 `b64_json` 和 `url` 两种返回。
- GPT Image 2 成功输出后创建 Asset，并回填 `output_asset_ids`。
- GPT Image 2 失败后任务记录清晰的 `error_code` 和 `error_message`。
- nano banana 2 原有链路仍可用，并能收到新增比例/等级参数。
- 后端测试覆盖 GPT Image 2 payload、返回解析、generation service 分流和失败路径。
- `cd apps/api && .venv/bin/python -m pytest -q` 通过。
- `cd apps/web && npm run typecheck` 通过。
- `cd apps/web && npm run lint` 通过。

## 9. 建议测试

后端：

```bash
cd apps/api
.venv/bin/python -m pytest tests/test_dmx_gpt_image_provider.py -q
.venv/bin/python -m pytest tests/test_generation_api.py -q
.venv/bin/python -m pytest -q
```

前端：

```bash
cd apps/web
npm run typecheck
npm run lint
```

本地体验：

```bash
cd apps/api
uvicorn app.main:app --reload
```

```bash
cd apps/web
npm run dev
```

## 10. 开发记录

- 读取任务档案并核对 DMXAPI `gpt-image-2` 图片编辑文档，确认接口为 `https://www.dmxapi.cn/v1/images/edits`，请求为 multipart form-data，图片字段为一个或多个 `image`，返回需支持 `b64_json` 和 `url`。
- 新增 `apps/api/app/ai/dmx_gpt_image.py`：
  - 默认模型 `gpt-image-2-ssvip`。
  - 默认参数 `background=auto`、`output_format=png`、`quality=auto`、`n=1`。
  - 内置比例/等级到 `size` 的映射，覆盖 `1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`21:9` 与 `1K`、`2K`、`4K`。
  - 使用 `Authorization: Bearer <DMX_API_KEY>` 调用 `/images/edits`。
  - 支持解析 base64 图片和下载 URL 图片。
- 扩展配置：
  - `DMX_GPT_IMAGE_BASE_URL=https://www.dmxapi.cn/v1`
  - `DMX_GPT_IMAGE_MODEL=gpt-image-2-ssvip`
  - `.env.example` 同步补充 Gemini/GPT 图片模型配置。
- 接入 `GenerateTaskService`：
  - `model_provider="dmx-gpt-image"` 分流到 GPT Image 2 provider。
  - 复用现有参考图读取、Prompt 组装、任务状态推进、输出资产入库、`output_asset_ids` 回填和失败记录。
  - GPT Image 2 MVP 强制 `output_count=1`，避免多图资产处理复杂度扩散。
  - 失败记录 `error_code=DMX_GPT_IMAGE_ERROR`，`raw_response.provider=dmx-gpt-image`。
- 保持 nano banana 2 链路：
  - `dmx-gemini` 原分流不变。
  - 新增单元测试确认 `21:9` 和 `4K` 会透传到 Gemini `imageConfig`。
- 更新角色生图抽屉：
  - GPT Image 2 从预留改为可选可用，provider 为 `dmx-gpt-image`，模型名为 `gpt-image-2-ssvip`。
  - 比例扩展为 `1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`21:9`。
  - 等级扩展为 `1K`、`2K`、`4K`。
  - 真实模型判断同时覆盖 `dmx-gemini` 和 `dmx-gpt-image`，mock 失败开关仅对 mock provider 生效。
- 补齐测试：
  - `tests/test_dmx_gpt_image_provider.py` 覆盖 multipart payload、尺寸映射、base64 解析、URL 下载解析和未知尺寸失败。
  - `tests/test_dmx_gemini_provider.py` 覆盖新增比例/等级透传。
  - `tests/test_generation_api.py` 覆盖 GPT Image 2 service 分流、资产落库和失败路径。

## 11. 完成记录

完成状态：DONE_WITH_CONCERNS

完成了什么：

- 已完成 GPT Image 2 图片编辑 provider、新配置、GenerateTask 队列分流、资产落库、失败记录、前端模型启用、比例/等级扩展和 nano banana 2 参数透传回归测试。
- 未进入明确排除范围：未做关键帧生成、生视频生成、成本统计、mask 局部编辑、文生图独立入口、WebSocket/SSE、模型市场。

修改文件：

- `apps/api/app/ai/dmx_gpt_image.py`
- `apps/api/app/core/config.py`
- `apps/api/app/modules/generation/service.py`
- `apps/api/tests/test_dmx_gpt_image_provider.py`
- `apps/api/tests/test_dmx_gemini_provider.py`
- `apps/api/tests/test_generation_api.py`
- `apps/web/src/features/characters/character-detail-screen.tsx`
- `.env.example`
- `docs/features/2026-05-08-gpt-image-2-image-edit.md`

验证结果：

- `cd apps/api && .venv/bin/python -m pytest tests/test_dmx_gpt_image_provider.py -q`：3 passed。
- `cd apps/api && .venv/bin/python -m pytest tests/test_dmx_gemini_provider.py -q`：2 passed。
- `cd apps/api && .venv/bin/python -m pytest tests/test_generation_api.py -q`：7 passed。
- `cd apps/api && .venv/bin/python -m pytest -q`：40 passed。
- `cd apps/web && npm run typecheck`：通过。
- `cd apps/web && npm run lint`：通过。

真实调用情况：

- GPT Image 2 未做真实模型调用测试。原因：当前开发验证未使用真实 `DMX_API_KEY`、账户余额和线上 COS/网络调用环境；已完成 provider payload/parse 单元测试和 generation service mocked provider 分流验证。
- nano banana 2 未做真实模型调用测试。已完成新增比例/等级的 payload 单元测试，并在 generation API 中保持原真实链路 mocked 回归通过。

遗留问题：

- GPT Image 2 的 `4K` 非 16:9/9:16 尺寸虽然满足任务档案约束，但仍需在有真实 DMXAPI key 和余额时逐项实测，若接口拒绝某个尺寸，应按任务档案记录失败尺寸并调整为更保守尺寸。
- 前端暂未提供 `quality`、`output_format`、`background` 的显式控件，当前由后端默认值兜底。
- GPT Image 2 MVP 强制 `output_count=1`，后续若要多图返回，需要补资产展示和批量质量门交互。

下一步建议：

- 配置真实 `DMX_API_KEY`、COS 和测试角色参考图后，分别跑一次 `dmx-gpt-image` 与 `dmx-gemini` 的端到端生成，记录真实返回结构、耗时和失败尺寸。
- 若 GPT Image 2 真实调用稳定，再考虑在角色生图抽屉暴露 `quality` 与 `output_format`，但仍保持 mask/文生图入口不进入当前范围。
- 是否建议进入关键帧生成阶段。

## 12. 遗留问题

- GPT Image 2 和 nano banana 2 本轮未做真实线上模型调用；当前验证基于 provider payload/parse 单测和 mocked service 分流。
- GPT Image 2 的 `4K` 非 16:9/9:16 尺寸需要在真实 DMXAPI key、余额和 COS 环境下逐项实测。
- 前端暂未暴露 `quality`、`output_format`、`background` 控件，当前使用后端默认值。
- GPT Image 2 MVP 限制 `output_count=1`，后续多图返回需要补候选资产展示和批量质量门交互。

## 13. 下一步建议

- 回到指挥官线程更新 `docs/current-development-map.md`。
- 配置真实 `DMX_API_KEY`、COS 和测试角色参考图后，分别跑一次 `dmx-gpt-image` 与 `dmx-gemini` 的端到端生成。
- 如果 GPT Image 2 和 nano banana 2 真实调用稳定，下一模块继续进入“关键帧生成”。
