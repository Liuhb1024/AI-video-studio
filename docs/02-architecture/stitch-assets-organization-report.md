# Stitch 设计资产整理报告

## 1. 整理结果总览

| 页面 | 来源目录 | 目标目录 | code.html | DESIGN.md | screen.png | notes.md | 状态 |
|---|---|---|---|---|---|---|---|
| Dashboard / Project List | `stitch_ai1` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-01-dashboard` | 已复制 | 已复制 | 已复制 | 已生成 | 完成 |
| Yingge Character Library | `stitch_ai2` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-02-character-library` | 已复制 | 已复制 | 已复制 | 已生成 | 完成 |
| Character Detail / Character Bible | `stitch_ai3` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-03-character-detail` | 已复制 | 已复制 | 已复制 | 已生成 | 完成 |
| Script & Storyboard Generator | `stitch_ai4` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-04-script-storyboard` | 已复制 | 已复制 | 已复制 | 已生成 | 完成 |
| Prompt & Generation Workspace | `stitch_ai5` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-05-generation-workspace` | 已复制 | 已复制 | 已复制 | 已生成 | 完成 |
| Asset Review / Final Video Library | `stitch_ai6` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-06-asset-review` | 已复制 | 已复制 | 已复制 | 已生成 | 完成 |

## 2. 文件选择说明

| 页面 | code.html 来源 | DESIGN.md 来源 | screen.png 来源 | 选择说明 |
|---|---|---|---|---|
| Dashboard / Project List | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai1/code.html` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai1/DESIGN.md` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai1/screen.png` | `stitch_ai1` 根目录文件齐全，直接采用根目录三件套。 |
| Yingge Character Library | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai2/ai/code.html` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai2/ink_cinnabar_production/DESIGN.md` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai2/02_character_library.jpeg/screen.png` | `screen.png` 按规则优先采用页面命名目录；`code.html` 与 `DESIGN.md` 递归查找后采用最相关文件。 |
| Character Detail / Character Bible | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai3/ai/code.html` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai3/ink_cinnabar_production/DESIGN.md` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai3/03_character_detail.jpeg/screen.png` | `screen.png` 按规则优先采用页面命名目录；`code.html` 与 `DESIGN.md` 递归查找后采用最相关文件。 |
| Script & Storyboard Generator | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai4/ai/code.html` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai4/ink_cinnabar_production/DESIGN.md` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai4/04_script_storyboard.jpeg/screen.png` | `screen.png` 按规则优先采用页面命名目录；`code.html` 与 `DESIGN.md` 递归查找后采用最相关文件。 |
| Prompt & Generation Workspace | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai5/ai/code.html` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai5/ink_cinnabar_production/DESIGN.md` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai5/05_generation_workspace.jpeg/screen.png` | `screen.png` 按规则优先采用页面命名目录；`code.html` 与 `DESIGN.md` 递归查找后采用最相关文件。 |
| Asset Review / Final Video Library | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai6/ai/code.html` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai6/ink_cinnabar_production/DESIGN.md` | `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch_ai/stitch_ai6/06_asset_review.jpeg/screen.png` | `screen.png` 按规则优先采用页面命名目录；`code.html` 与 `DESIGN.md` 递归查找后采用最相关文件。 |

## 3. 缺失或异常

- 未发现必须文件缺失。6 个目标页面目录均包含 `code.html`、`DESIGN.md`、`screen.png`、`notes.md`。
- `stitch_ai2` 至 `stitch_ai6` 均存在多个 `screen.png`：页面命名目录下的 1600 x 900 截图，以及 `ai/screen.png`。本次按规则优先选择页面命名目录下的 `screen.png`。
- `stitch_ai3/ai/screen.png` 尺寸为 1363 x 1600，偏纵向；本次未采用，改用 `03_character_detail.jpeg/screen.png`。
- 源目录中存在 `.DS_Store` 文件，未复制。
- 源目录名称包含 `.jpeg` 后缀但实际是目录，例如 `05_generation_workspace.jpeg/`，属于 Stitch 导出命名异常，不影响整理。

## 4. 后续使用建议

- 后续 Codex 做前端静态原型时，优先读取 `/Users/huabi/code/AI-video-studio/yingge-app/design-references/stitch-from-gpt-image/page-XX-*/notes.md`，确认页面用途、来源和不可直接采用项。
- 再查看对应 `screen.png` 理解视觉布局、信息密度、左右栏比例、卡片层级和 Inspector 位置。
- `DESIGN.md` 可作为设计意图参考；如与 PRD、UI 模块规格或 Excel 字段冲突，以项目文档为准。
- `code.html` 只能用于识别布局结构、组件层级和视觉风格，正式前端必须用 Next.js + TypeScript + Tailwind CSS + shadcn/ui 重写。
- 不要直接复制 Stitch 的 HTML/CSS 到生产代码，不要照抄图片中的错别字、不准确中文文案或与 PRD 不一致的字段。
