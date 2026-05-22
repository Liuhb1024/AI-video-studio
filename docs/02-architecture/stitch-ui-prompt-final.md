# Google Stitch UI Prompt Final

## 1. Global Design Direction

产品是“AI 英歌漫剧内容生产工作台”，不是通用短剧 SaaS。它服务于内部团队在一个月 MVP 中生产英歌水浒人物介绍短视频：从角色圣经、脚本、分镜、Prompt、生图、生视频、TTS，到素材采纳/拒绝、失败复盘和成本记录。

第一版核心场景是：选择或导入英歌水浒角色，生成 30-60 秒人物介绍文案，拆成 5-8 个分镜，生成图片 Prompt 和视频 Prompt，调用 gpt-image-2 / nano banana 生图，调用 Seedance 2.0 生视频，调用 MiniMax TTS，并把候选素材沉淀为可复用 IP 资产。

视觉关键词：深墨黑、宣纸白、朱砂红、鎏金、青灰、暗玉绿；国风水墨、游戏 CG、黑神话悟空质感、剑来漫剧氛围；东方非遗、英歌脸谱、鼓点、阵势、纹样、角色圣经、专业内容生产工作台。

不要做成：普通 SaaS 后台、营销落地页、赛博朋克、古风网页游戏、泛二次元角色库、普通素材网盘、完整剪辑软件、移动端优先页面、社交社区或电商商城。

## 2. Round 1 Prompt: Dashboard + Character Library

```text
Design high-fidelity desktop web app UI mockups for a product called "AI Yingge Manhua Drama Production Workbench".

Create exactly 2 desktop web pages at 1440px width:
1. Dashboard / Project List
2. Yingge Character Library

Product context:
This is an internal AI content production workbench for Yingge intangible cultural heritage IP, Shuihu character short videos, cultural merchandise traffic, and reusable IP asset accumulation. It is not a generic short drama SaaS and not a marketing website. The MVP helps a small team produce 30-60 second Yingge Shuihu character introduction videos.

Global layout requirements:
- Desktop-first 1440px layout.
- Use a persistent left navigation rail.
- Use a top status bar with current project context, model/task health, and budget/cost hints.
- Use a main work area with dense but readable production information.
- Use a right-side Inspector panel for context, recent tasks, cost, import status, and warnings.
- Suitable for later implementation with Next.js, shadcn/ui, and Tailwind CSS.

Visual style:
- Sophisticated modern Chinese content tool, not an ancient palace UI.
- Use deep ink black, rice paper white, cinnabar red, muted gold, blue-gray, and dark jade green.
- Subtle ink-wash texture is allowed, but keep the interface clear, professional, and production-oriented.
- Use soft shadows, restrained glass-like panels, thin line icons, compact cards, tables, tags, status chips, and cost badges.
- Avoid generic SaaS look, cyberpunk, neon gradients, ancient fantasy game style, decorative orbs, and mobile-first composition.

Page 1: Dashboard / Project List
Goal:
Let the internal team quickly enter Yingge video projects, understand production progress, see cost, and import the character Excel.

Required layout:
- Left navigation: Dashboard, Character Library, Script & Storyboard, Prompt Workspace, Asset Review, Settings.
- Top status bar: product name, current workspace, model health, task queue status, monthly budget remaining.
- Main area: project card grid.
- Right Inspector: recent generation tasks, cost summary, model configuration health, Excel import shortcut.

Required modules and components:
- ProjectCard: show project title, target platform, selected character, current production step, shot count, accepted assets count, failed tasks count, total cost.
- ProjectCreateDialog entry: button for "New Yingge Character Video".
- ProjectStatsStrip: total projects, active projects, imported characters, generated assets, total cost.
- GenerationTaskStatus: compact list of queued, processing, completed, failed tasks.
- CostBadge: show estimated and actual cost in RMB.
- Excel import CTA: import "Yingge Shuihu Character Bible" Excel and show import status.

Must visually emphasize:
- Yingge intangible cultural heritage IP.
- Project production status.
- Cost and budget visibility.
- Role and asset accumulation.
- This is a production workbench, not a homepage.

Do not draw:
- Marketing hero page.
- Generic SaaS analytics dashboard with huge charts.
- Social/community feed.
- E-commerce or order management.
- Complex BI reports.

Page 2: Yingge Character Library
Goal:
Browse and manage the imported Yingge Shuihu character bible as the source of content production.

Required layout:
- Left filter sidebar: face primary color, personality tags, Yingge role position, commercial positioning, field completeness.
- Main area: CharacterCard grid with optional compact table toggle.
- Right Inspector: Excel source info, import batch, missing field summary, positive/negative prompt keywords summary.
- Top bar: search, import/update Excel button, field mapping status, "Add to Project" action.

Required modules and components:
- CharacterCard: name, nickname, ranking, star position, Liangshan role, Yingge role position, face primary color, face pattern, core personality tags, commercial positioning, field completeness.
- PromptKeywordChips: positive keywords and negative keywords must be visible.
- FieldSourceBadge: show source sheet, source row, explicit/inferred/unconfirmed evidence status.
- Character Bible preview: show the five-layer structure as compact chips or tabs.
- Empty state: prompt to import the Excel character bible.
- Loading state: character card skeletons.
- Error state: Excel import failed, header mapping failed, missing fields.

Must visually emphasize:
- Yingge Shuihu characters, role bible, face colors, face patterns, personality tags, positive prompt words, forbidden prompt words, and Excel traceability.
- The character library is the content and IP foundation for scripts, prompts, images, videos, and cultural merchandise.

Do not draw:
- A generic contact list.
- A game character shop.
- A fantasy RPG character inventory.
- A generic asset gallery.
```

## 3. Round 2 Prompt: Character Detail + Script & Storyboard

```text
Design high-fidelity desktop web app UI mockups for the "AI Yingge Manhua Drama Production Workbench".

Create exactly 2 desktop web pages at 1440px width:
1. Character Detail / Character Bible
2. Script & Storyboard Generator

Product context:
This workbench creates 30-60 second Yingge Shuihu character introduction videos. The UI must show how structured character bible fields drive script writing, storyboard generation, character consistency, visual consistency, and later image/video prompts. It is not a generic document editor and not a generic short drama platform.

Global layout requirements:
- Desktop-first 1440px layout.
- Persistent left navigation, top project/status bar, central work area, and right-side Inspector.
- Dense but elegant production UI.
- Suitable for later implementation with Next.js, shadcn/ui, and Tailwind CSS.

Visual style:
- Modern Chinese content production tool with subtle Eastern ink-wash texture.
- Palette: ink black, rice paper white, cinnabar red, muted gold, blue-gray, dark jade green.
- Professional, calm, structured, and content-focused.
- Avoid generic SaaS, cyberpunk, ancient palace style, fantasy game UI, mobile-first layout, and oversized decorative hero sections.

Page 1: Character Detail / Character Bible
Goal:
Show one Yingge Shuihu character as a structured character bible and the source of consistency for scripts, storyboards, prompts, images, videos, and cultural merchandise.

Required layout:
- Left area: character overview with portrait/reference image placeholder, name, nickname, ranking, star position, Liangshan role, weapon, Yingge role position, face primary color.
- Main area: CharacterBibleTabs with five layers.
- Right Inspector: VisualProfilePanel, PromptKeywordChips, consistency checklist, field source and evidence status.
- Top bar: back to library, add to project, generate character look prompt, source row indicator.

The five Character Bible tabs must be prominent:
1. Identity Layer: name, nickname, ranking, star position, origin, Liangshan role, weapon.
2. Inner Core Layer: personality tags, inner conflict, key life events, audience emotional trigger, target audience.
3. Cultural Visual Layer: Yingge role position, face primary color, color symbolism, face patterns, Shuihu color clues, visual tone keywords, positive prompt keywords, negative prompt keywords.
4. Narrative Material Layer: core narrative origin, source chapter, story scene, relationship graph.
5. Commercial Culture Layer: product cultural positioning, blessing/protection meaning, naming directions, merchandising elements.

Required modules and components:
- CharacterBibleTabs.
- VisualProfilePanel: face color, face pattern, weapon, visual tone, reference image slots.
- PromptKeywordChips: positive and negative keywords must be separate and highly readable.
- FieldSourceBadge: source Excel sheet, row number, explicit / inferred / unconfirmed evidence.
- ConsistencyChecklist: role consistency, face color consistency, weapon consistency, forbidden word check.
- CommercialPositionPanel: product cultural positioning and merchandise direction.

Must visually emphasize:
- The five-layer character bible.
- Face color, face pattern, visual tone, narrative origin, commercial culture positioning.
- Structured fields, not just a large character image.
- How character consistency will feed ScriptAgent, StoryboardAgent, PromptAgent, and CriticAgent.

Do not draw:
- A single big avatar page with shallow metadata.
- A game character stats panel.
- A generic CRM profile page.
- A fantasy RPG equipment page.

Page 2: Script & Storyboard Generator
Goal:
Generate or import a 30-60 second character introduction script and split it into 5-8 storyboard shots.

Required layout:
- Left area: ProductionStepRail with steps: Select Character, Generate Script, Split Storyboard, Confirm Shots, Enter Prompt Workspace.
- Main area upper section: ScriptEditor for generated narration/script with version controls.
- Main area lower section: StoryboardTimeline with 5-8 ShotCards.
- Right Inspector: selected character brief, core narrative origin, visual consistency fields, Agent Inspector with ScriptAgent and StoryboardAgent suggestions.
- Top bar: project selector, selected character, target platform, target duration, aspect ratio, generate buttons.
- Bottom area: save status and "Enter Prompt Workspace" action.

Required modules and components:
- ProductionStepRail: clear step states: empty, active, processing, ready, warning.
- ScriptEditor: editable 30-60 second narration/script, regenerate, save version, import script.
- StoryboardTimeline: ordered 5-8 shots.
- ShotCard: shot number, duration, narration segment, image description, action/motion, emotion, bound character, bound scene, consistency status.
- Agent Inspector: ScriptAgent output, StoryboardAgent output, warnings, user-confirmed decisions.
- Character Consistency panel: show how identity, inner core, visual layer, and narrative origin are being used.

Must visually emphasize:
- Character bible fields flowing into script and storyboard.
- The character consistency source: face color, face pattern, weapon, personality tags, core narrative origin, positive/negative keywords.
- Script and storyboard visible in one production flow.
- 5-8 shots for a 30-60 second video.

Do not draw:
- A generic document editor.
- A novel writing app.
- A full video editing timeline.
- A marketing copywriting dashboard.
```

## 4. Round 3 Prompt: Prompt & Generation Workspace + Asset Review

```text
Design high-fidelity desktop web app UI mockups for the "AI Yingge Manhua Drama Production Workbench".

Create exactly 2 desktop web pages at 1440px width:
1. Prompt & Generation Workspace
2. Asset Review / Final Video Library

Product context:
This is the core production area for generating AI images, AI videos, and TTS audio for Yingge Shuihu character introduction videos. The product must help the team manage prompts, reference images, keyframes, Seedance 2.0 video generation, candidate assets, acceptance/rejection, failure reasons, reflection, and cost. It is not a generic asset gallery and not a full video editing suite.

Global layout requirements:
- Desktop-first 1440px layout.
- Persistent left navigation, top project/task/cost bar, central production workspace, and right-side Inspector.
- The interface should feel like a professional AI content production cockpit for Yingge intangible cultural heritage IP.
- Suitable for later implementation with Next.js, shadcn/ui, and Tailwind CSS.

Visual style:
- Modern professional production workbench with Eastern ink-wash restraint.
- Palette: deep ink black, rice paper white, cinnabar red, muted gold, blue-gray, dark jade green.
- Use compact cards, segmented controls, model selectors, prompt editors, progress bars, asset cards, video players, cost badges, and inspector panels.
- Avoid generic SaaS, cyberpunk, ancient palace style, ordinary cloud drive UI, ordinary stock asset gallery, and complex video editing software.

Page 1: Prompt & Generation Workspace
Goal:
For each storyboard shot, generate and edit image prompts, video prompts, images, videos, and TTS audio while keeping role and scene consistency visible.

Required layout:
- Left area: ShotCard list showing each shot status: prompt ready, keyframe selected, video generated, TTS generated, accepted/rejected.
- Main area: four first-level production modules, not hidden in small buttons:
  1. PromptEditor
  2. ImageGenerationPanel
  3. VideoGenerationPanel
  4. TTSGenerationPanel
- Right Inspector: character consistency, scene consistency, Yingge movement accuracy, prompt source fields, forbidden words, Reflection notes.
- Top bar: current project, selected character, batch generate image, batch generate video, task queue status, total cost.
- Bottom bar: previous shot, next shot, save status.

Required modules and components:
- PromptEditor: separate image prompt, video prompt, negative prompt; show source fields from character bible; show positive and forbidden keyword chips.
- ImageGenerationPanel: model selector for gpt-image-2 and nano banana; character reference image; scene reference image; prompt input; negative prompt; candidate generated images; accept as keyframe; failure reason; cost display.
- VideoGenerationPanel: this must be a first-level main module, not just a status button on a ShotCard.
- TTSGenerationPanel: narration text, character dialogue, MiniMax TTS model selector, voice selector, preview audio, generate audio, bind to shot, subtitle text, cost display.
- GenerationTaskStatus: queued, processing, completed, failed, canceled.
- CostBadge: per task and total project cost.

VideoGenerationPanel requirements:
- Show Seedance 2.0 model selection clearly.
- Show mode selector: image-to-video, first-frame video, first-last-frame video.
- Show keyframe selection with current shot keyframe and optional next shot end frame.
- Show reference image selection: character reference, scene reference, style reference.
- Show editable video prompt.
- Show parameters: duration, aspect ratio, motion strength, quality/resolution.
- Show "Submit Video Generation Task" action.
- Show video task status.
- Show candidate video management.
- Show VideoCandidatePlayer for preview.
- Show accept / reject actions.
- Rejecting requires failure reason: character inconsistency, scene inconsistency, Yingge movement inaccurate, face pattern wrong, color wrong, motion too strong, motion too weak, duration mismatch, model error, other.
- Show role consistency check, scene consistency check, Yingge movement accuracy check.
- Show estimated cost before submit and actual cost after completion.
- Show retry mechanism using same prompt or improved prompt from failure reason.

Must visually emphasize:
- VideoGenerationPanel as a primary production module.
- Keyframes, Seedance 2.0 parameters, video prompt, candidate videos, preview, accept/reject, failure reason, and cost.
- The role and scene consistency Inspector must remain visible while generating.

Do not draw:
- A single "Generate Video" button as the whole video workflow.
- A full nonlinear video editor timeline.
- A generic AI prompt playground.
- Hidden model parameters in a settings page.

Page 2: Asset Review / Final Video Library
Goal:
Review generated images, videos, audio, and subtitles; accept or reject assets; record failure reasons; show reflection suggestions; export one video production plan.

Required layout:
- Left area: filters by asset type, character, scene, shot, status, model.
- Main area: AssetReviewGrid with CandidateAssetCards for images, videos, audio, and subtitle records.
- Right Inspector: selected asset details, acceptance history, failure reason, ReflectionInspector, cost details, export preview.
- Top bar: project status, selected character, final video plan readiness, export production plan button.
- Bottom bar: batch actions for selected assets.

Required modules and components:
- AssetReviewGrid: grouped by shot and asset type.
- CandidateAssetCard: thumbnail/preview, model, prompt version, task status, cost, accept/reject actions.
- VideoCandidatePlayer: preview video candidates and accepted video clips.
- GenerationTaskStatus: show task result and errors.
- ReflectionInspector: rejected reason, model failure summary, suggested prompt improvement, next negative constraints.
- CostBadge: estimated and actual cost per asset and total cost.
- ExportProductionPlanButton: export script, storyboard, prompts, accepted images, accepted videos, TTS audio, subtitles, cost, and failure notes.
- Empty state: no assets yet, prompt user to generate images/videos/TTS.
- Error state: missing asset link, preview failed, cost missing, failure reason not filled.

Must visually emphasize:
- Candidate asset review, video preview, accept/reject, failure reason, reflection, cost, and export.
- The asset library is an IP asset sedimentation system, not just storage.
- Accepted assets and rejected assets must look clearly different.

Do not draw:
- A generic cloud drive.
- A plain image waterfall gallery.
- A stock photo library.
- A final video streaming page.
- A complex editing application.
```

## 5. Follow-up Prompts

1. ```text
Strengthen the Eastern ink-wash and intangible cultural heritage atmosphere while keeping the UI modern and professional. Add subtle rice-paper texture, restrained ink strokes, cinnabar accents, muted gold highlights, and Yingge cultural motifs. Do not turn it into an ancient palace UI, fantasy game UI, or decorative marketing page.
```

2. ```text
Make the interface feel more like a professional AI production workbench. Increase information density, clarify task states, make model selectors and cost badges more prominent, strengthen the left navigation, top status bar, right Inspector, and production workflow hierarchy. Avoid generic SaaS dashboard styling.
```

3. ```text
Optimize the Yingge Character Library for higher information density. Character cards should show name, nickname, ranking, star position, Yingge role position, face primary color, face pattern, personality tags, positive prompt keywords, negative prompt keywords, field completeness, and Excel source traceability. Do not make it look like a generic contact list or game character shop.
```

4. ```text
Optimize the Character Detail / Character Bible page. Make the five-layer structure visually clear: Identity Layer, Inner Core Layer, Cultural Visual Layer, Narrative Material Layer, and Commercial Culture Layer. Emphasize face color, face pattern, weapon, visual tone keywords, core narrative origin, positive/negative keywords, and commercial cultural positioning.
```

5. ```text
Optimize the Script & Storyboard Generator page. Make the flow from selected character bible fields to 30-60 second script and 5-8 storyboard shots very clear. Show ScriptEditor, StoryboardTimeline, ShotCards, ProductionStepRail, and Agent Inspector in a coherent desktop production layout. Do not make it look like a normal document editor.
```

6. ```text
Optimize the VideoGenerationPanel as a primary first-level module. It must show Seedance 2.0 model selection, image-to-video / first-frame / first-last-frame modes, keyframe picker, reference images, editable video prompt, duration, aspect ratio, motion strength, quality, task status, candidate videos, preview player, accept/reject actions, failure reason, consistency checks, cost, and retry.
```

7. ```text
Optimize the Asset Review and Reflection experience. Make candidate assets, accepted assets, rejected assets, failure reasons, Reflection suggestions, cost badges, task status, and export readiness easy to scan. The page should feel like an IP asset review and learning loop, not a simple file gallery.
```

8. ```text
Generate both light mode and dark mode versions for the same six-page desktop web app. Light mode should use rice paper white, ink text, cinnabar accents, muted gold, blue-gray, and dark jade green. Dark mode should use deep ink black, warm off-white text, cinnabar red, muted gold, and subtle ink-wash surfaces. Keep both modes professional, readable, and suitable for a production workbench.
```
