# Phase 5.5 Generation Workspace + Asset Review 关键体验打磨计划

## 当前页面问题总结

- 工作目录：`/Users/huabi/code/AI-video-studio/yingge-app/frontend`
- Phase 5 已实现 `/generation-workspace` 与 `/asset-review` 静态页面，且此前 `npm run lint`、`npm run build` 已通过。
- `/generation-workspace` 当前结构完整，但首屏容易被 `PromptEditor` 占据，用户第一眼更像进入 Prompt 页面，而不是“提示词 -> 生图 -> 生视频 -> TTS”的生产闭环。
- `VideoGenerationPanel` 已是一级模块，但在首屏出现较晚，需要更早露出，并在模块顶部强化 `Seedance 2.0`、生成模式、关键帧和候选视频。
- `ImageGenerationPanel` 当前信息完整，但可以压缩为更紧凑的关键帧生产区，保留模型、候选图、采纳为关键帧、一致性分数和成本。
- `/asset-review` 当前结构完整，但素材分组更像长列表；应强化当前选中素材的大预览和审核状态，让页面更像素材审核室，而不是云盘素材库。
- `FinalProductionTimeline` 已在底部，但还可以更像“成片进度条”，突出 6 个镜头的图/视/音/字采纳状态。

## 将要修改的文件

- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/generation-workspace/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/PromptEditor.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/ImageGenerationPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/VideoGenerationPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/generation/TTSGenerationPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/app/asset-review/page.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/AssetPreviewPanel.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/AssetReviewGrid.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/CandidateAssetCard.tsx`
- `/Users/huabi/code/AI-video-studio/yingge-app/frontend/components/assets/FinalProductionTimeline.tsx`

## Generation Workspace 首屏优化策略

- 在主区顶部增加紧凑生产链路摘要，让用户立即看到“Prompt / 生图 / 生视频 / TTS”的状态。
- 压缩 `PromptEditor` 高度：保留图像 Prompt、视频 Prompt、负面 Prompt、来源字段和检查清单，但减少长文本展示高度和大块堆叠。
- 将 `ImageGenerationPanel` 与 `VideoGenerationPanel` 放入更靠前的位置，首屏至少能看到视频生成模块标题和顶部区域。
- 保持 `ShotList` 左侧常驻，保留当前 Shot 的成本、图像/视频/TTS 状态。
- `TTSGenerationPanel` 保持下方，但进一步压缩高度，作为音频和字幕衔接模块。

## VideoGenerationPanel 强化策略

- 模块标题改为更醒目的“视频生成 / Seedance 2.0”，保留朱砂强调和任务进度。
- 顶部直接展示三种生成模式：图生视频、首帧视频、首尾帧视频。
- 关键帧、角色参考、场景参考改成更直观的三张参考卡。
- 视频 Prompt 压缩但不消失，作为当前视频任务上下文。
- mock player 和候选视频对比保持明显，成本、进度、采纳/拒绝/重试按钮保持可见。
- 不把视频生成退化为普通表单或小状态卡。

## Asset Review 审核室感优化策略

- `AssetPreviewPanel` 作为当前选中素材的主预览区，强化“已接受最终版 / 候选 / 已拒绝”状态。
- 增加审核动作区：已接受最终版、重新生成、拒绝此版本，保持像审核室而不是播放器网站。
- `AssetReviewGrid` 组标题增加镜头编号、时长、素材计数和当前组状态。
- `CandidateAssetCard` 使用更强的状态边框/顶部条，明确区分已采纳、候选、已拒绝。
- 失败原因 chip 使用更醒目的低饱和朱砂红。
- `FinalProductionTimeline` 增强为成片进度条视觉，突出 6 个镜头的图/视/音/字状态。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端、不接数据库、不接真实模型 API。
- 不做真实生成、真实任务轮询、真实视频播放、真实上传、真实导出。
- 不复制 Stitch `code.html`。
- 不引入新的大型 UI 库，不处理 shadcn/ui 证书问题。
- 不做完整剪辑器、云盘素材库或通用 AI prompt playground。

## 验收标准

- 已创建本计划文档。
- `/generation-workspace` 首屏能看到生产链路摘要、PromptEditor、ImageGenerationPanel 入口和 VideoGenerationPanel 顶部或摘要。
- `VideoGenerationPanel` 仍是一级主模块，并且更醒目地展示 Seedance 2.0、生成模式、关键帧、候选视频、成本和动作按钮。
- `ImageGenerationPanel` 更紧凑，但仍保留 gpt-image-2 / nano banana、候选图、采纳为关键帧、一致性分数和成本。
- `/asset-review` 强化当前选中素材的大预览与审核状态，不像普通云盘素材库。
- `CandidateAssetCard` 清楚区分已采纳、候选、已拒绝，失败原因 chip 更醒目。
- `FinalProductionTimeline` 像成片进度条，清楚展示 6 个镜头的图/视/音/字状态。
- 用户可见文案中文为主，英文仅作为模型名、Prompt、Provider、Task 等技术辅助。
- 页面无明显文字竖排、遮挡或过度挤压。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器检查 `/generation-workspace` 与 `/asset-review` 可访问，并符合上述体验要求。
