# Phase 3.5 Dashboard + Character Library 视觉与文案打磨计划

## 当前页面问题总结

- 当前 `/dashboard` 与 `/characters` 的信息结构已经接近 Phase 3 要求，但视觉仍偏普通 dark admin：卡片背景层次不足，封面区不够像英歌短片或角色圣经系统。
- `TopStatusBar` 信息密度过高，模型、服务商、任务、成本、导出等信息并排后容易挤压；在 1440px 桌面宽度下应优先稳定显示核心信息，避免文字竖排或被压缩。
- Dashboard 项目卡目前像数据盒子，缺少参考图中的“项目封面 + 当前阶段 + 生产进度 + 成本/任务底部信息”的强层级。
- Character Library 角色卡已有字段，但文化视觉层级不够突出；脸谱主色、脸谱纹样、英歌定位、武器、Prompt 关键词、Excel 来源和字段完整度需要更像“角色圣经卡”。
- 全局卡片、指标卡和面板可读性足够，但缺少 subtle ink texture、暗青灰层、鎏金数据、朱砂主操作和暗玉成功状态之间的精细差异。

## 将要修改的文件

计划修改：

- `yingge-app/frontend/components/layout/TopStatusBar.tsx`
- `yingge-app/frontend/components/common/SectionCard.tsx`
- `yingge-app/frontend/components/common/MetricCard.tsx`
- `yingge-app/frontend/components/common/TaskQueueMini.tsx`
- `yingge-app/frontend/components/common/CostSummaryMini.tsx`
- `yingge-app/frontend/components/dashboard/ProjectCard.tsx`
- `yingge-app/frontend/components/dashboard/RecentTaskPanel.tsx`
- `yingge-app/frontend/components/dashboard/ModelHealthPanel.tsx`
- `yingge-app/frontend/components/dashboard/CostBreakdownPanel.tsx`
- `yingge-app/frontend/components/characters/CharacterCard.tsx`
- `yingge-app/frontend/components/characters/CharacterFilterPanel.tsx`
- `yingge-app/frontend/components/characters/CharacterDetailInspector.tsx`
- `yingge-app/frontend/components/characters/PromptKeywordChips.tsx`
- `yingge-app/frontend/components/characters/CharacterLibraryToolbar.tsx`
- `yingge-app/frontend/styles/ink-texture.css`
- 如有必要，轻量调整 `yingge-app/frontend/app/dashboard/page.tsx` 与 `yingge-app/frontend/app/characters/page.tsx` 的网格间距。

## 视觉打磨策略

- 强化“深墨黑 + 深青灰 + 低透明边框”的层次，避免纯黑平铺。
- 为卡片和面板增加非常克制的 top highlight、inner glow、环境 shadow，不使用赛博朋克式霓虹。
- 水墨纹理只作为极低透明底纹，主信息区保持清晰。
- 关键数字、成本、Excel 来源、进度用鎏金强调；主操作按钮继续用朱砂红；成功/通过/健康用暗玉绿。
- 保持 1440px 桌面优先、高信息密度、8px 以下圆角，不做移动端重排。

## 顶部状态栏优化策略

- 将高度从 72px 提升到约 88px，使用 compact card / pill 分组。
- 分为五组：当前项目/当前角色、模型状态、服务商状态、任务队列、成本摘要。
- 去掉重复的独立“可导出”和“本月成本”块，把成本集中到成本摘要，减少横向拥挤。
- 每组设置 `shrink-0`、`whitespace-nowrap`、固定或最小宽度，禁止文字被挤成竖排。
- 模型状态显示“生图 / 生视频 / TTS”；服务商显示 “OpenAI 正常 / Seedance 预警 / MiniMax 正常”；任务显示“运行中 3 / 排队中 5 / 失败 1”；成本显示“今日 ¥12.80 / 本月 ¥128.40”。

## Dashboard 项目卡优化策略

- 项目卡改成更明确的短片项目卡：顶部增加更大的 mock 封面区，使用渐变、水墨纹理、脸谱色块和人物名，不引入外部图片。
- 封面区显示阶段 badge、角色名、英歌定位、进入工作台按钮。
- 内容区按“项目标题 -> 角色/定位 -> 阶段与分镜/面板 -> 图片/视频/失败/成本 -> readiness 进度条”的层级重排。
- 最近任务面板强化任务类型视觉区分：生图、生视频、TTS、Agent 使用不同低饱和色条或标识。
- 模型状态面板补足能力 badge：Image、Video、TTS、First-frame、First-last-frame 作为英文技术标签，但旁边保持中文说明。
- 成本拆解面板改成 production cost panel，增强金额、比例、预算提示的层级。

## Character Library 卡片优化策略

- 角色卡增加更明显的脸谱封面区：主色光晕、抽象脸谱形、星宿/排名、选中状态感。
- 卡片中把“脸谱主色 / 脸谱纹样 / 英歌定位 / 武器 / 正向提示词 / 禁止提示词”分区呈现。
- 字段完整度、Excel 来源行、外观数量、参考素材数放在卡片底部生产元数据区，提升可见性。
- 左侧筛选区改为更紧凑的生产筛选器，使用小标题、选项 pills、字段完整度复选式视觉。
- 右侧 `CharacterDetailInspector` 改成五层角色圣经摘要结构，每层有序号、中文标题、英文辅助小字和完成度/摘要。
- 正向提示词使用暗玉绿或青灰 badge；禁止提示词使用低饱和朱砂红 badge。

## 不做什么

- 不修改 `/Users/huabi/code/AI-video-studio/references/`。
- 不读取 `.env`、key、token、证书文件。
- 不接后端、不接数据库、不接真实模型 API。
- 不复制 Stitch `code.html` 到正式代码。
- 不引入外部图片，不做真实上传/搜索/筛选/生成。
- 不重构 AppShell 架构，不新增真实页面流程，不处理 shadcn/ui 证书问题。
- 不做移动端适配。

## 验收标准

- 已创建本计划文档。
- `TopStatusBar` 五组信息稳定显示，1440px 桌面宽度下不出现文字竖排或严重挤压。
- Dashboard 更像项目生产控制台，项目卡具备明显 mock 封面区、阶段、任务、成本和 readiness 层级。
- Character Library 更像文化 IP 角色圣经系统，角色卡与右侧 Inspector 清晰展示五层圣经、脸谱视觉、Prompt、Excel 来源和字段完整度。
- 用户可见主文案继续中文为主，英文只作为技术标签或辅助副标题。
- 不修改 `references/`，不接真实 API/数据库。
- `npm run lint` 通过。
- `npm run build` 通过。
