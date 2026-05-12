"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToastMessage, ToastTone, ToastViewport } from "@/components/ui/feedback";
import type { StyleTemplate, StyleTemplateAnalysisTaskDetail, StyleTemplateAnalysisTaskListItem, StyleTemplatePayload } from "@/features/style-templates/types";
import {
  analyzeStyleTemplate,
  createStyleTemplate,
  createStyleTemplateFromImage,
  deleteStyleTemplate,
  getStyleTemplateAnalysisTask,
  listStyleTemplateAnalysisTasks,
  listStyleTemplates,
} from "@/lib/api/style-templates";

const emptyDraft: StyleTemplatePayload = {
  name: "",
  source_image_url: "",
  style_category: "角色模板",
  visual_summary: "",
  line_style: "",
  color_palette: "",
  lighting_style: "",
  composition_style: "",
  character_rendering: "",
  background_rendering: "",
  texture_keywords: "",
  image_prompt_template: "",
  video_prompt_template: "",
  negative_prompt: "",
  analysis_status: "manual",
  status: "draft",
};

const templateFilters = [
  { id: "all", label: "全部" },
  { id: "active", label: "启用" },
  { id: "draft", label: "草稿" },
  { id: "analyzed", label: "已识别" },
  { id: "failed", label: "识别失败" },
] as const;

type TemplateFilter = (typeof templateFilters)[number]["id"];
const templateCategories = ["角色模板", "场景模板"] as const;
type TemplateCategory = (typeof templateCategories)[number];

const STYLE_ANALYSIS_MODEL = "gpt-5.4-nano";
const analysisSteps = ["上传截图", "创建模板", "创建识别任务", "风格分析中", "回填字段", "完成"] as const;

const statusTone: Record<string, string> = {
  completed: "border-teal-300/25 bg-teal-400/[0.1] text-teal-100",
  mock_completed: "border-teal-300/25 bg-teal-400/[0.1] text-teal-100",
  running: "border-stage-300/25 bg-stage-400/[0.12] text-stage-100",
  pending: "border-[#e7b45f]/12 bg-black/25 text-[#d8ccb3]",
  failed: "border-clay-300/25 bg-clay-500/[0.1] text-[#ffd7c3]",
};

export function StyleTemplatesScreen() {
  const [templates, setTemplates] = useState<StyleTemplate[]>([]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filter, setFilter] = useState<TemplateFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | TemplateCategory>("all");
  const [draft, setDraft] = useState<StyleTemplatePayload>(emptyDraft);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<{ step: number; title: string } | null>(null);
  const [detailTemplate, setDetailTemplate] = useState<StyleTemplate | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((tone: ToastTone, title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, tone, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const refresh = useCallback(async (nextQuery: string, nextCategory: "all" | TemplateCategory) => {
    setLoading(true);
    try {
      setTemplates(await listStyleTemplates({
        query: nextQuery.trim() || undefined,
        styleCategory: nextCategory === "all" ? undefined : nextCategory,
      }));
    } catch (error) {
      showToast("error", "风格模板加载失败", error instanceof Error ? error.message : "请确认后端服务可用。");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void refresh("", "all");
  }, [refresh]);

  const filteredTemplates = useMemo(() => {
    if (filter === "active") return templates.filter((item) => item.status === "active");
    if (filter === "draft") return templates.filter((item) => item.status === "draft");
    if (filter === "analyzed") return templates.filter((item) => item.analysis_status === "analyzed");
    if (filter === "failed") return templates.filter((item) => item.analysis_status === "failed");
    return templates;
  }, [filter, templates]);

  const activeCount = templates.filter((item) => item.status === "active").length;
  const roleCount = templates.filter((item) => item.style_category === "角色模板").length;
  const sceneCount = templates.filter((item) => item.style_category === "场景模板").length;

  function submitSearch() {
    setSubmittedQuery(query);
    void refresh(query, categoryFilter);
  }

  function switchCategory(nextCategory: "all" | TemplateCategory) {
    setCategoryFilter(nextCategory);
    void refresh(submittedQuery, nextCategory);
  }

  function applyLocalAnalysisDraft() {
    setDraft((current) => ({
      ...current,
      name: current.name || "新漫剧风格模板",
      visual_summary: current.visual_summary || "基于上传截图整理的漫剧视觉风格。后续会由大模型自动识别线条、色彩、光影、构图和角色渲染方式。",
      line_style: current.line_style || "清晰轮廓线，人物边缘强调，局部细节保留。",
      color_palette: current.color_palette || "主色、辅助色、高光色待 AI 识别。",
      lighting_style: current.lighting_style || "电影感主光，角色边缘光，背景层次分明。",
      composition_style: current.composition_style || "主体突出，适合短视频竖屏关键帧延展。",
      character_rendering: current.character_rendering || "人物五官稳定，服饰纹样清晰，动作剪影明确。",
      background_rendering: current.background_rendering || "背景服务人物，不抢主体，保留空间纵深。",
      texture_keywords: current.texture_keywords || "高质量漫剧质感，干净线条，稳定细节。",
      image_prompt_template: current.image_prompt_template || "参考全局风格模板，保持角色脸谱、服饰和道具一致，生成高质量 AI 漫剧关键帧。",
      video_prompt_template: current.video_prompt_template || "参考全局风格模板，保持角色一致性、镜头稳定、动作自然、画面连贯。",
      negative_prompt: current.negative_prompt || "低清晰度、脸部崩坏、肢体畸形、服饰错乱、廉价滤镜、水印、文字乱码",
      analysis_status: "manual",
    }));
    showToast("info", "已填入模板草案", "当前是本地草案，后续会替换成大模型风格识别。");
  }

  async function handleCreate(options?: { analyzeAfterCreate?: boolean }) {
    if (!draft.name.trim()) {
      showToast("error", "需要模板名称", "先填写风格模板名称。");
      return;
    }
    setSaving(true);
    if (options?.analyzeAfterCreate) {
      setAnalysisProgress({ step: 0, title: "准备上传风格截图" });
    }
    try {
      if (options?.analyzeAfterCreate) setAnalysisProgress({ step: 1, title: "正在创建模板记录" });
      const created = sourceFile
        ? await createStyleTemplateFromImage({
            file: sourceFile,
            name: draft.name.trim(),
            styleCategory: draft.style_category?.trim() || null,
          })
        : await createStyleTemplate({
            ...draft,
            name: draft.name.trim(),
            source_image_url: draft.source_image_url?.trim() || null,
            style_category: draft.style_category?.trim() || null,
          });
      let nextTemplate = created;
      if (options?.analyzeAfterCreate) {
        setAnalysisProgress({ step: 2, title: "正在创建风格识别任务" });
        setAnalyzingId(created.id);
        setAnalysisProgress({ step: 3, title: `正在使用 ${STYLE_ANALYSIS_MODEL} 分析风格` });
        nextTemplate = await analyzeStyleTemplate(created.id, { model_name: STYLE_ANALYSIS_MODEL, temperature: 1.0 });
        setAnalysisProgress({ step: 4, title: "正在回填结构化字段" });
      }
      setTemplates((current) => [nextTemplate, ...current]);
      setDraft(emptyDraft);
      setSourceFile(null);
      setCreateOpen(false);
      if (options?.analyzeAfterCreate) setAnalysisProgress({ step: 5, title: "风格模板已完成" });
      if (options?.analyzeAfterCreate && nextTemplate.analysis_status === "failed") {
        showToast("error", "模板已创建，但 AI 识别失败", "系统没有回填模拟字段，请检查 DMXAPI、模型名或 COS 图片访问权限后重新识别。");
      } else {
        showToast("success", options?.analyzeAfterCreate ? "模板已创建并识别" : "风格模板已创建", options?.analyzeAfterCreate ? "已自动回填风格字段和提示词模板。" : sourceFile ? "截图已上传，卡片上可继续点击 AI 识别。" : `「${created.name}」已进入全局模板库。`);
      }
    } catch (error) {
      showToast("error", "创建失败", error instanceof Error ? error.message : "请检查字段。");
    } finally {
      setSaving(false);
      setAnalyzingId(null);
      if (options?.analyzeAfterCreate) {
        window.setTimeout(() => setAnalysisProgress(null), 900);
      }
    }
  }

  async function handleDelete(template: StyleTemplate) {
    setDeletingId(template.id);
    try {
      await deleteStyleTemplate(template.id);
      setTemplates((current) => current.filter((item) => item.id !== template.id));
      showToast("success", "风格模板已删除", `「${template.name}」已从全局库移除。`);
    } catch (error) {
      showToast("error", "删除失败", error instanceof Error ? error.message : "请稍后再试。");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAnalyze(template: StyleTemplate) {
    setAnalyzingId(template.id);
    try {
      const analyzed = await analyzeStyleTemplate(template.id, { model_name: STYLE_ANALYSIS_MODEL, temperature: 1.0 });
      setTemplates((current) => current.map((item) => item.id === analyzed.id ? analyzed : item));
      if (analyzed.analysis_status === "failed") {
        showToast("error", "风格识别失败", "系统没有回填模拟字段，请检查 DMXAPI、模型名或 COS 图片访问权限后重新识别。");
      } else {
        showToast("success", "风格识别完成", "已按项目词汇库回填生图/生视频风格模板。");
      }
    } catch (error) {
      showToast("error", "风格识别失败", error instanceof Error ? error.message : "请稍后再试。");
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <Breadcrumbs items={[{ label: "风格模板库" }]} />

      <section className="surface rounded-2xl p-5 shadow-panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-stage-200/70">Global Style Template Library</div>
            <h2 className="mt-2 text-2xl font-semibold text-[#fff5df]">风格模板库</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#cfc1a6]">
              全局共用的视觉模板资产。现在明确分为角色模板和场景模板：角色模板进入角色定稿/四视图，场景模板留给后续场景和关键帧背景。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void refresh(submittedQuery, categoryFilter)} className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-xs text-stage-100 transition hover:border-stage-300/35">
              刷新
            </button>
            <button type="button" onClick={() => setCreateOpen((current) => !current)} className="rounded-full border border-stage-300/35 bg-stage-400/[0.14] px-4 py-2 text-xs font-medium text-[#fff5df] shadow-stage-glow transition hover:bg-stage-400/[0.22]">
              新建模板
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <TemplateStat label="模板总数" value={String(templates.length).padStart(2, "0")} />
          <TemplateStat label="已启用" value={String(activeCount).padStart(2, "0")} />
          <TemplateStat label="角色模板" value={String(roleCount).padStart(2, "0")} />
          <TemplateStat label="场景模板" value={String(sceneCount).padStart(2, "0")} />
        </div>
      </section>

      {createOpen ? (
        <CreateTemplatePanel
          draft={draft}
          sourceFile={sourceFile}
          saving={saving}
          onChange={setDraft}
          onFileChange={setSourceFile}
          onAnalyzeDraft={applyLocalAnalysisDraft}
          onCancel={() => {
            setCreateOpen(false);
            setSourceFile(null);
          }}
          onSave={() => void handleCreate()}
          onSaveAndAnalyze={() => void handleCreate({ analyzeAfterCreate: true })}
          analysisProgress={analysisProgress}
        />
      ) : null}

      <section className="surface rounded-2xl p-4 shadow-panel">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["all", ...templateCategories] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchCategory(item)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  categoryFilter === item
                    ? "border-teal-300/35 bg-teal-400/[0.12] text-teal-100"
                    : "border-[#e7b45f]/12 bg-black/25 text-[#bfb196] hover:text-[#fff5df]"
                }`}
              >
                {item === "all" ? "全部类型" : item}
              </button>
            ))}
            <span className="mx-1 hidden h-7 w-px bg-[#3b301f] sm:block" />
            {templateFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  filter === item.id
                    ? "border-stage-300/35 bg-stage-400/[0.14] text-[#fff5df] shadow-stage-glow"
                    : "border-[#e7b45f]/12 bg-black/25 text-[#bfb196] hover:text-[#fff5df]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex w-full flex-col gap-2 lg:flex-row xl:w-auto">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitSearch();
              }}
              placeholder="搜索模板名、风格类型、摘要、提示词..."
              className="field-input min-w-0 lg:w-[360px]"
            />
            <button type="button" onClick={submitSearch} className="rounded-xl border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-sm text-[#e9dcc4] transition hover:border-stage-300/35">
              搜索
            </button>
          </div>
        </div>

        {loading ? <TemplateEmpty title="正在读取风格模板..." description="正在连接后端模板库。" /> : null}
        {!loading && filteredTemplates.length === 0 ? (
          <TemplateEmpty
            title="还没有风格模板"
            description="先点击“新建模板”上传一张漫剧风格截图，保存后卡片上会出现 AI 识别按钮。"
            actionLabel="新建模板"
            onAction={() => setCreateOpen(true)}
          />
        ) : null}
        {!loading && filteredTemplates.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredTemplates.map((template) => (
              <StyleTemplateCard
                key={template.id}
                template={template}
                deleting={deletingId === template.id}
                analyzing={analyzingId === template.id}
                onAnalyze={() => void handleAnalyze(template)}
                onView={() => setDetailTemplate(template)}
                onDelete={() => void handleDelete(template)}
              />
            ))}
          </div>
        ) : null}
      </section>

      {detailTemplate ? <StyleTemplateDetailModal template={detailTemplate} onClose={() => setDetailTemplate(null)} /> : null}
    </div>
  );
}

function CreateTemplatePanel({
  draft,
  sourceFile,
  saving,
  onChange,
  onFileChange,
  onAnalyzeDraft,
  onCancel,
  onSave,
  onSaveAndAnalyze,
  analysisProgress,
}: {
  draft: StyleTemplatePayload;
  sourceFile: File | null;
  saving: boolean;
  onChange: (value: StyleTemplatePayload | ((current: StyleTemplatePayload) => StyleTemplatePayload)) => void;
  onFileChange: (file: File | null) => void;
  onAnalyzeDraft: () => void;
  onCancel: () => void;
  onSave: () => void;
  onSaveAndAnalyze: () => void;
  analysisProgress: { step: number; title: string } | null;
}) {
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceFile) {
      setSourcePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(sourceFile);
    setSourcePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [sourceFile]);

  function patch<K extends keyof StyleTemplatePayload>(key: K, value: StyleTemplatePayload[K]) {
    onChange((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="surface rounded-2xl p-4 shadow-panel">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-sm font-medium text-[#fff5df]">新建全局风格模板</div>
          <p className="mt-1 text-xs leading-5 text-[#9e927c]">上传一张漫剧截图作为风格来源；当前先落库为待识别，下一步接 AI 自动分析字段。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onAnalyzeDraft} className="rounded-full border border-teal-300/25 bg-teal-400/[0.1] px-3 py-1.5 text-xs text-teal-100">
            填入识别草案
          </button>
          <button type="button" onClick={onCancel} className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-3 py-1.5 text-xs text-[#d8ccb3]">
            取消
          </button>
          <button type="button" onClick={onSave} disabled={saving} className="rounded-full border border-stage-300/35 bg-stage-400/[0.14] px-3 py-1.5 text-xs text-[#fff5df] disabled:opacity-60">
            {saving ? "保存中" : "保存模板"}
          </button>
          <button type="button" onClick={onSaveAndAnalyze} disabled={saving} className="rounded-full border border-teal-300/30 bg-teal-400/[0.12] px-3 py-1.5 text-xs font-medium text-teal-100 disabled:opacity-60">
            {saving ? "处理中" : "保存并 AI 识别"}
          </button>
        </div>
      </div>

      {analysisProgress ? (
        <div className="mt-4 rounded-2xl border border-teal-300/20 bg-teal-400/[0.07] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[#fff5df]">{analysisProgress.title}</div>
              <p className="mt-1 text-xs text-[#9e927c]">模型：{STYLE_ANALYSIS_MODEL} · temperature 1.0</p>
            </div>
            <div className="rounded-full border border-teal-300/25 bg-black/25 px-3 py-1 text-xs text-teal-100">
              {analysisProgress.step + 1}/{analysisSteps.length}
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/35">
            <div className="h-full rounded-full bg-teal-300 transition-all duration-500" style={{ width: `${((analysisProgress.step + 1) / analysisSteps.length) * 100}%` }} />
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-6">
            {analysisSteps.map((step, index) => (
              <div key={step} className={`rounded-xl border px-2 py-2 text-center text-[10px] ${index <= analysisProgress.step ? "border-teal-300/25 bg-teal-400/[0.1] text-teal-100" : "border-[#e7b45f]/10 bg-black/20 text-[#8f846f]"}`}>
                {step}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <label className="block rounded-2xl border border-dashed border-stage-300/25 bg-stage-400/[0.055] p-4">
          <span className="text-[11px] font-medium text-[#d5a753]">风格截图来源</span>
          <div className="mt-3 min-h-[180px] overflow-hidden rounded-xl border border-[#e7b45f]/10 bg-black/25">
            {sourcePreviewUrl ? (
              <div className="group relative aspect-[16/9] w-full overflow-hidden bg-[#080a07]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sourcePreviewUrl} alt={sourceFile?.name || "风格截图预览"} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/78 to-transparent p-4">
                  <div className="line-clamp-1 text-sm font-semibold text-[#fff5df]">{sourceFile?.name}</div>
                  <p className="mt-1 text-[11px] text-[#cfc1a6]">已选择截图，保存后会上传到 COS 并进入待识别状态。</p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
                <div className="text-sm font-semibold text-[#fff5df]">上传漫剧风格截图</div>
                <p className="mt-2 max-w-md text-xs leading-5 text-[#9e927c]">建议上传目标漫剧画面的截图，后续 AI 会识别线条、色彩、光影、构图、人物渲染和背景处理方式。</p>
              </div>
            )}
          </div>
          <span className="mt-3 inline-flex rounded-full border border-stage-300/25 bg-black/25 px-3 py-1.5 text-xs text-stage-100">
            {sourceFile ? "更换截图" : "选择图片"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              event.currentTarget.value = "";
              onFileChange(file);
            }}
          />
        </label>
        <div className="grid gap-3">
          <Field label="模板名称" value={draft.name} onChange={(value) => patch("name", value)} placeholder="例如：暗色电影国漫" />
          <label className="block">
            <span className="text-[11px] font-medium text-[#9e927c]">模板类型</span>
            <select value={draft.style_category || "角色模板"} onChange={(event) => patch("style_category", event.target.value)} className="field-input mt-2 w-full">
              {templateCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <div className="rounded-2xl border border-[#e7b45f]/10 bg-black/20 p-4">
            <div className="text-xs font-semibold text-[#fff5df]">识别状态</div>
            <p className="mt-2 text-xs leading-5 text-[#9e927c]">截图创建后状态为 pending。接入大模型后，会自动填充下方全部风格字段。</p>
          </div>
        </div>
      </div>

      <div className="mt-3 hidden gap-3 xl:grid-cols-3">
        <Field label="模板名称" value={draft.name} onChange={(value) => patch("name", value)} placeholder="例如：暗色电影国漫" />
        <Field label="模板类型" value={draft.style_category || ""} onChange={(value) => patch("style_category", value)} placeholder="角色模板 / 场景模板" />
        <Field label="截图 URL" value={draft.source_image_url || ""} onChange={(value) => patch("source_image_url", value)} placeholder="后续会替换为 COS 上传" />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <TextArea label="视觉摘要" value={draft.visual_summary || ""} onChange={(value) => patch("visual_summary", value)} />
        <TextArea label="色彩倾向" value={draft.color_palette || ""} onChange={(value) => patch("color_palette", value)} />
        <TextArea label="线条特征" value={draft.line_style || ""} onChange={(value) => patch("line_style", value)} />
        <TextArea label="光影特征" value={draft.lighting_style || ""} onChange={(value) => patch("lighting_style", value)} />
        <TextArea label="构图倾向" value={draft.composition_style || ""} onChange={(value) => patch("composition_style", value)} />
        <TextArea label="人物表现" value={draft.character_rendering || ""} onChange={(value) => patch("character_rendering", value)} />
        <TextArea label="生图 Prompt 模板" value={draft.image_prompt_template || ""} onChange={(value) => patch("image_prompt_template", value)} />
        <TextArea label="负面约束词" value={draft.negative_prompt || ""} onChange={(value) => patch("negative_prompt", value)} />
      </div>
    </section>
  );
}

function StyleTemplateCard({
  template,
  deleting,
  analyzing,
  onAnalyze,
  onView,
  onDelete,
}: {
  template: StyleTemplate;
  deleting: boolean;
  analyzing: boolean;
  onAnalyze: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  const [imageBroken, setImageBroken] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setImageBroken(false);
  }, [template.source_image_url]);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e7b45f]/12 bg-black/24 shadow-panel">
      <div className="flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-[#e7b45f]/10 bg-[#0a0d09]">
        {template.source_image_url && !imageBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={template.source_image_url} alt={template.name} className="h-full w-full object-cover" onError={() => setImageBroken(true)} />
        ) : (
          <div className="px-5 text-center text-xs leading-5 text-[#8f846f]">
            {template.source_image_url ? "截图加载失败，请检查 COS 访问权限" : "等待截图来源"}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="line-clamp-1 text-sm font-semibold text-[#fff5df]">{template.name}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-stage-100">{template.style_category || "未分类"} · {template.status}</div>
          </div>
          <span className={`rounded-full border px-2 py-1 text-[10px] ${
            template.analysis_status === "failed"
              ? "border-clay-300/25 bg-clay-500/[0.1] text-[#ffd7c3]"
              : template.analysis_status === "analyzed"
                ? "border-teal-300/25 bg-teal-400/[0.1] text-teal-100"
                : "border-[#e7b45f]/12 bg-black/25 text-[#d8ccb3]"
          }`}>
            {template.analysis_status}
          </span>
        </div>
        <p className="mt-3 line-clamp-3 min-h-[60px] text-xs leading-5 text-[#bfb196]">{template.visual_summary || "暂无风格摘要。"}</p>
        <div className="mt-3 grid gap-2">
          <MiniField label="色彩" value={template.color_palette} />
          <MiniField label="光影" value={template.lighting_style} />
          <MiniField label="线条" value={template.line_style} />
          <MiniField label="人物" value={template.character_rendering} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onAnalyze} disabled={analyzing} className="rounded-full border border-teal-300/25 bg-teal-400/[0.1] px-2.5 py-1 text-[10px] text-teal-100 disabled:opacity-60">
            {analyzing ? "识别中" : template.analysis_status === "analyzed" || template.analysis_status === "failed" ? "重新识别" : "AI 识别"}
          </button>
          <button type="button" onClick={onView} className="rounded-full border border-stage-300/20 bg-stage-400/[0.08] px-2.5 py-1 text-[10px] text-stage-100">
            查看详情
          </button>
          <button type="button" onClick={() => setConfirmDelete(true)} disabled={deleting} className="rounded-full border border-clay-300/20 bg-clay-500/[0.08] px-2.5 py-1 text-[10px] text-[#ffd7c3] disabled:opacity-60">
            {deleting ? "删除中" : "删除"}
          </button>
        </div>
        {confirmDelete ? (
          <div className="mt-3 rounded-xl border border-clay-300/20 bg-clay-500/[0.08] p-3">
            <div className="text-xs font-medium text-[#ffd7c3]">确认删除这个全局风格模板？</div>
            <p className="mt-1 text-[10px] leading-4 text-[#c8a99c]">删除后角色、项目和分镜将无法继续绑定这个模板。</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={onDelete} disabled={deleting} className="rounded-full border border-clay-300/25 bg-clay-500/[0.14] px-2.5 py-1 text-[10px] text-[#ffd7c3] disabled:opacity-60">
                确认删除
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#d8ccb3]">
                取消
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function StyleTemplateDetailModal({ template, onClose }: { template: StyleTemplate; onClose: () => void }) {
  const [tasks, setTasks] = useState<StyleTemplateAnalysisTaskListItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<StyleTemplateAnalysisTaskDetail | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskDetailLoading, setTaskDetailLoading] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setTasksLoading(true);
    setTaskError(null);
    setSelectedTask(null);
    listStyleTemplateAnalysisTasks(template.id)
      .then((items) => {
        if (active) setTasks(items);
      })
      .catch((error) => {
        if (active) setTaskError(error instanceof Error ? error.message : "识别任务记录加载失败。");
      })
      .finally(() => {
        if (active) setTasksLoading(false);
      });
    return () => {
      active = false;
    };
  }, [template.id]);

  async function openTaskDetail(taskId: string) {
    setTaskDetailLoading(true);
    setTaskError(null);
    try {
      setSelectedTask(await getStyleTemplateAnalysisTask(template.id, taskId));
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "识别任务详情加载失败。");
    } finally {
      setTaskDetailLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020402]/80 p-4 backdrop-blur-sm">
      <button type="button" aria-label="关闭详情" className="absolute inset-0 cursor-default" onClick={onClose} />
      <section className="relative max-h-[92vh] w-[min(1120px,96vw)] overflow-hidden rounded-2xl border border-[#6c512a] bg-[#0d100b] shadow-[0_30px_120px_rgba(0,0,0,0.78)]">
        <header className="flex items-start justify-between gap-4 border-b border-[#2e2518] bg-[#15160f] px-5 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-stage-100">Style Template Detail</div>
            <h3 className="mt-2 text-xl font-semibold text-[#fff5df]">{template.name}</h3>
            <p className="mt-1 text-xs text-[#9e927c]">{template.style_category || "未分类"} · {template.analysis_status} · {template.status}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#5a4527] bg-[#0a0b08] px-3 py-1.5 text-xs text-[#e9dcc4] transition hover:border-[#d5a753]">
            关闭
          </button>
        </header>
        <div className="grid max-h-[calc(92vh-84px)] gap-4 overflow-y-auto p-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-[#332a1c] bg-black/25">
              {template.source_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={template.source_image_url} alt={template.name} className="aspect-[16/9] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center text-xs text-[#8f846f]">暂无截图</div>
              )}
            </div>
            <MiniField label="分析模型" value={template.analysis_model || "未识别"} />
            <MiniField label="分析版本" value={template.analysis_version || "未识别"} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <DetailText label="视觉摘要" value={template.visual_summary} wide />
            <DetailText label="线条特征" value={template.line_style} />
            <DetailText label="色彩倾向" value={template.color_palette} />
            <DetailText label="光影特征" value={template.lighting_style} />
            <DetailText label="构图倾向" value={template.composition_style} />
            <DetailText label="人物表现" value={template.character_rendering} />
            <DetailText label="背景处理" value={template.background_rendering} />
            <DetailText label="质感关键词" value={template.texture_keywords} wide />
            <DetailText label="英歌迁移规则" value={template.yingge_adaptation} wide />
            <DetailText label="生图 Prompt 模板" value={template.image_prompt_template} wide />
            <DetailText label="生视频 Prompt 模板" value={template.video_prompt_template} wide />
            <DetailText label="负面约束词" value={template.negative_prompt} wide />
            <section className="md:col-span-2 rounded-2xl border border-[#e7b45f]/12 bg-black/18 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-stage-100">Analysis Task Records</div>
                  <h4 className="mt-1 text-sm font-semibold text-[#fff5df]">识别任务记录</h4>
                  <p className="mt-1 text-xs leading-5 text-[#9e927c]">每次重新识别都会保留独立 GenerateTask，便于复盘模型输入、Prompt、原始响应和错误信息。</p>
                </div>
                <span className="w-fit rounded-full border border-[#e7b45f]/12 bg-black/25 px-3 py-1 text-[10px] text-[#d8ccb3]">
                  {tasks.length} 条记录
                </span>
              </div>

              {taskError ? (
                <div className="mt-3 rounded-xl border border-clay-300/20 bg-clay-500/[0.08] p-3 text-xs leading-5 text-[#ffd7c3]">{taskError}</div>
              ) : null}

              {tasksLoading ? (
                <div className="mt-3 rounded-xl border border-[#e7b45f]/10 bg-black/20 p-4 text-xs text-[#9e927c]">正在加载识别任务记录...</div>
              ) : null}

              {!tasksLoading && tasks.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-[#e7b45f]/14 bg-black/20 p-4 text-xs leading-5 text-[#9e927c]">暂无识别任务。点击卡片上的“AI 识别”后，这里会出现可追溯任务记录。</div>
              ) : null}

              {!tasksLoading && tasks.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => void openTaskDetail(task.id)}
                      className={`rounded-xl border p-3 text-left transition hover:border-stage-300/35 hover:bg-stage-400/[0.07] ${selectedTask?.id === task.id ? "border-stage-300/35 bg-stage-400/[0.08]" : "border-[#e7b45f]/10 bg-black/20"}`}
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2 py-1 text-[10px] ${statusTone[task.status] ?? statusTone.pending}`}>{task.status}</span>
                          <span className="text-xs font-semibold text-[#fff5df]">{formatModel(task)}</span>
                          <span className="text-[10px] text-[#8f846f]">{shortId(task.id)}</span>
                        </div>
                        <span className="text-[10px] text-[#8f846f]">{formatDateTime(task.created_at)}</span>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
                        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-black/35">
                          <div className="h-full rounded-full bg-stage-300" style={{ width: `${Math.max(0, Math.min(100, task.progress))}%` }} />
                        </div>
                        <div className="text-[10px] text-[#bfb196]">{task.current_step} · {task.progress}%</div>
                      </div>
                      {task.error_message ? (
                        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#ffd7c3]">{task.error_code ? `${task.error_code}: ` : ""}{task.error_message}</p>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}

              {taskDetailLoading ? (
                <div className="mt-3 rounded-xl border border-stage-300/15 bg-stage-400/[0.06] p-4 text-xs text-stage-100">正在读取任务详情...</div>
              ) : null}

              {selectedTask ? <StyleAnalysisTaskDetailPanel task={selectedTask} /> : null}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

function StyleAnalysisTaskDetailPanel({ task }: { task: StyleTemplateAnalysisTaskDetail }) {
  return (
    <div className="mt-4 rounded-2xl border border-stage-300/20 bg-[#11160f] p-4 shadow-stage-glow">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-stage-100">Task Detail</div>
          <h5 className="mt-1 text-sm font-semibold text-[#fff5df]">{shortId(task.id)} · {task.task_type}</h5>
          <p className="mt-1 text-xs text-[#9e927c]">创建：{formatDateTime(task.created_at)} · 更新：{formatDateTime(task.updated_at)}</p>
        </div>
        <span className={`w-fit rounded-full border px-2 py-1 text-[10px] ${statusTone[task.status] ?? statusTone.pending}`}>{task.status}</span>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <DetailText label="模型" value={formatModel(task)} />
        <DetailText label="当前步骤" value={`${task.current_step} · ${task.progress}%`} />
        <DetailText label="输入资产" value={task.input_asset_ids.length > 0 ? task.input_asset_ids.join("\n") : "无"} wide />
        {task.error_code || task.error_message ? <DetailText label="错误信息" value={[task.error_code, task.error_message].filter(Boolean).join("\n")} wide /> : null}
        <DetailText label="Prompt Text" value={task.prompt_text || task.input_prompt} wide />
        <JsonBlock label="参数" value={task.params_json ?? task.parameters} />
        <JsonBlock label="输入快照" value={task.input_snapshot_json} />
        <JsonBlock label="Raw Response" value={task.raw_response} wide />
      </div>
    </div>
  );
}

function JsonBlock({ label, value, wide }: { label: string; value: unknown; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-[#e7b45f]/10 bg-black/22 p-3 ${wide ? "md:col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">{label}</div>
      <pre className="mt-2 max-h-[280px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/25 p-3 text-[11px] leading-5 text-[#d8ccb3]">{formatJson(value)}</pre>
    </div>
  );
}

function formatModel(task: { model_provider: string | null; model_name: string; model_version: string | null }) {
  return [task.model_provider, task.model_name, task.model_version].filter(Boolean).join(" / ") || "未记录模型";
}

function shortId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatJson(value: unknown) {
  if (value === null || value === undefined || value === "") return "未记录";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function DetailText({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-[#e7b45f]/10 bg-black/22 p-3 ${wide ? "md:col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">{label}</div>
      <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#d8ccb3]">{value || "未填写"}</p>
    </div>
  );
}

function TemplateStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-black/20 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#fff5df]">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-[#9e927c]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-input mt-2 w-full" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-[#9e927c]">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="field-input mt-2 min-h-[104px] w-full resize-y leading-6" />
    </label>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-black/20 px-3 py-2">
      <div className="text-[10px] text-[#8f846f]">{label}</div>
      <div className="mt-1 line-clamp-1 text-xs text-[#d8ccb3]">{value || "未填写"}</div>
    </div>
  );
}

function TemplateEmpty({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-[#e7b45f]/18 bg-black/22 p-8 text-center">
      <div className="text-sm font-semibold text-[#fff5df]">{title}</div>
      <p className="mt-2 text-xs text-[#9e927c]">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="mt-4 rounded-full border border-stage-300/35 bg-stage-400/[0.14] px-4 py-2 text-xs font-medium text-[#fff5df] shadow-stage-glow transition hover:bg-stage-400/[0.22]">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
