"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToastMessage, ToastTone, ToastViewport } from "@/components/ui/feedback";
import type { Character } from "@/features/characters/types";
import { createCharacter, importYinggeBible, listCharactersPaginated } from "@/lib/api/characters";

const biblePath = "/Users/huabi/Downloads/英歌水浒角色基础信息.xlsx";
const pageSize = 12;

type LibraryMode = "browse" | "create" | "import";
type FilterMode = "all" | "prompt-ready" | "needs-prompt" | "has-reference";
type DraftMode = "manual" | "ai";

const emptyDraft = {
  name: "",
  alias: "",
  weapons: "",
  facepaint_main_color: "",
  yingge_role: "",
  bio: "",
  positive_prompt_terms: "",
  negative_prompt_terms: "",
};

export function CharactersScreen() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState<LibraryMode>("browse");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [draftMode, setDraftMode] = useState<DraftMode>("manual");
  const [draft, setDraft] = useState(emptyDraft);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const filteredCharacters = useMemo(() => {
    if (filterMode === "prompt-ready") {
      return characters.filter((item) => item.image_consistency_prompt && item.three_view_prompt);
    }
    if (filterMode === "needs-prompt") {
      return characters.filter((item) => !item.image_consistency_prompt || !item.three_view_prompt);
    }
    if (filterMode === "has-reference") {
      return characters.filter((item) => item.reference_asset_ids.length > 0 || item.reference_asset_id);
    }
    return characters;
  }, [characters, filterMode]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const withPromptCount = characters.filter((item) => item.image_consistency_prompt && item.three_view_prompt).length;
  const facepaintCount = characters.filter((item) => item.facepaint_main_color || item.facepaint_patterns).length;
  const referenceCount = characters.filter((item) => item.reference_asset_ids.length > 0 || item.reference_asset_id).length;

  const showToast = useCallback((tone: ToastTone, title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, tone, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const refresh = useCallback(async (nextPage: number, nextQuery: string) => {
    setLoading(true);
    try {
      const result = await listCharactersPaginated({ query: nextQuery.trim() || undefined, page: nextPage, pageSize });
      setCharacters(result.items);
      setTotal(result.total);
      setPage(result.page);
    } catch (error) {
      showToast("error", "角色中心加载失败", error instanceof Error ? error.message : "请确认后端服务可用。");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void refresh(1, "");
  }, [refresh]);

  function submitSearch() {
    setSubmittedQuery(query);
    setPage(1);
    void refresh(1, query);
  }

  async function handleImport() {
    setImporting(true);
    try {
      const result = await importYinggeBible(biblePath);
      showToast("success", "角色圣经已同步", `新增 ${result.imported_count} 个，更新 ${result.updated_count} 个，跳过 ${result.skipped_count} 个。`);
      setMode("browse");
      await refresh(1, submittedQuery);
    } catch (error) {
      showToast("error", "导入失败", error instanceof Error ? error.message : "请检查 Excel 路径和后端依赖。");
    } finally {
      setImporting(false);
    }
  }

  async function handleCreate() {
    if (!draft.name.trim()) {
      showToast("error", "需要角色姓名", "先填写姓名，再保存角色卡。");
      return;
    }
    setCreating(true);
    try {
      await createCharacter({
        name: draft.name.trim(),
        alias: draft.alias.trim() || null,
        weapons: draft.weapons.trim() || null,
        facepaint_main_color: draft.facepaint_main_color.trim() || null,
        yingge_role: draft.yingge_role.trim() || null,
        bio: draft.bio.trim() || null,
        positive_prompt_terms: draft.positive_prompt_terms.trim() || null,
        negative_prompt_terms: draft.negative_prompt_terms.trim() || null,
        source: "manual",
        status: "draft",
      });
      showToast("success", "角色草稿已创建", "系统已自动生成基础一致性提示词。");
      setDraft(emptyDraft);
      setMode("browse");
      await refresh(1, submittedQuery);
    } catch (error) {
      showToast("error", "创建失败", error instanceof Error ? error.message : "请检查角色字段。");
    } finally {
      setCreating(false);
    }
  }

  function applyAiPolishPreview() {
    const name = draft.name.trim() || "新英歌角色";
    setDraft((current) => ({
      ...current,
      bio: current.bio || `${name}，英歌漫剧角色资产。人物设定需同时服务剧情、脸谱妆造和后续关键帧生成。`,
      yingge_role: current.yingge_role || `${name}在英歌队列中承担具有辨识度的舞台位置，动作需要清晰、节奏强、适合转化为分镜。`,
      positive_prompt_terms: current.positive_prompt_terms || "英歌舞姿、潮汕民俗、脸谱妆造、红黑服饰、鼓点节奏、电影感光影",
      negative_prompt_terms: current.negative_prompt_terms || "现代廉价感、脸谱错乱、服饰不统一、五官畸变、手部错误、低清晰度",
    }));
    showToast("info", "AI 辅助草稿已预填", "当前是本地模板预览，后续可接入大模型润色。");
  }

  return (
    <div className="space-y-5">
      <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <Breadcrumbs items={[{ label: "角色中心" }]} />

      <section className="surface relative overflow-hidden rounded-2xl p-5 shadow-panel">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-stage-400/[0.11] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-teal-400/[0.08] blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.34em] text-stage-200/70">Character IP Asset Center</div>
            <h2 className="display-type mt-2 text-3xl font-semibold text-[#fff5df]">角色中心</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#cfc1a6]">
              这里不做“大列表堆满”。角色会被分页、搜索、筛选；新增角色先以草稿卡进入资产库，再逐步挂参考图、生图任务和项目引用。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setMode(mode === "create" ? "browse" : "create")} className="rounded-full border border-teal-300/25 bg-teal-400/[0.1] px-4 py-2 text-xs font-medium text-teal-100 transition hover:bg-teal-400/[0.16]">
              新增角色
            </button>
            <button type="button" onClick={() => setMode(mode === "import" ? "browse" : "import")} className="rounded-full border border-stage-300/35 bg-stage-400/[0.14] px-4 py-2 text-xs font-medium text-[#fff5df] shadow-stage-glow transition hover:bg-stage-400/[0.22]">
              导入角色圣经
            </button>
            <button type="button" onClick={() => void refresh(page, submittedQuery)} className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-xs text-stage-100 transition hover:border-stage-300/35">
              刷新
            </button>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 md:grid-cols-4">
          <Stat label="总角色" value={String(total).padStart(2, "0")} hint="资产库总量" />
          <Stat label="本页提示词就绪" value={String(withPromptCount).padStart(2, "0")} hint="生图/三视图草案" />
          <Stat label="本页脸谱设定" value={String(facepaintCount).padStart(2, "0")} hint="颜色与纹样资产" />
          <Stat label="本页参考图" value={String(referenceCount).padStart(2, "0")} hint="后续接 COS" />
        </div>
      </section>

      {mode === "create" ? (
        <DraftCharacterCard
          draft={draft}
          draftMode={draftMode}
          creating={creating}
          onChange={setDraft}
          onModeChange={setDraftMode}
          onAiPreview={applyAiPolishPreview}
          onSave={() => void handleCreate()}
          onCancel={() => setMode("browse")}
        />
      ) : null}

      {mode === "import" ? (
        <ImportPanel importing={importing} onImport={() => void handleImport()} onCancel={() => setMode("browse")} />
      ) : null}

      <section className="surface rounded-2xl p-4 shadow-panel">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-sm font-medium text-[#fff5df]">人物 IP 卡片墙</div>
            <p className="mt-1 text-xs leading-5 text-[#9e927c]">每页 {pageSize} 张卡。搜索走后端，筛选作用于当前页，后续可扩展成全库高级筛选。</p>
          </div>
          <div className="flex w-full flex-col gap-2 lg:flex-row xl:w-auto">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitSearch();
              }}
              placeholder="搜索姓名、绰号、脸谱、武器、英歌定位..."
              className="field-input min-w-0 lg:w-[360px]"
            />
            <select value={filterMode} onChange={(event) => setFilterMode(event.target.value as FilterMode)} className="field-input lg:w-[170px]">
              <option value="all">全部角色</option>
              <option value="prompt-ready">提示词就绪</option>
              <option value="needs-prompt">待补提示词</option>
              <option value="has-reference">已有参考图</option>
            </select>
            <button type="button" onClick={submitSearch} className="rounded-xl border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-sm text-[#e9dcc4] transition hover:border-stage-300/35">
              搜索
            </button>
          </div>
        </div>

        {loading ? <EmptyBlock title="正在读取角色中心..." description="正在从后端分页加载角色资产。" /> : null}
        {!loading && filteredCharacters.length === 0 ? <EmptyBlock title="没有匹配角色" description="换个关键词或筛选条件；也可以点击新增角色创建草稿卡。" /> : null}
        {!loading && filteredCharacters.length > 0 ? (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredCharacters.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={(next) => void refresh(next, submittedQuery)} />
          </>
        ) : null}
      </section>
    </div>
  );
}

function DraftCharacterCard({
  draft,
  draftMode,
  creating,
  onChange,
  onModeChange,
  onAiPreview,
  onSave,
  onCancel,
}: {
  draft: typeof emptyDraft;
  draftMode: DraftMode;
  creating: boolean;
  onChange: (draft: typeof emptyDraft) => void;
  onModeChange: (mode: DraftMode) => void;
  onAiPreview: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  function update(key: keyof typeof emptyDraft, value: string) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <section className="surface rounded-2xl border-teal-300/20 p-4 shadow-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-[#fff5df]">新角色草稿卡</div>
          <p className="mt-1 text-xs leading-5 text-[#9e927c]">先建最小角色资产，系统保存时会补基础生图/生视频一致性提示词。</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onModeChange("manual")} className={`rounded-full border px-3 py-1.5 text-xs ${draftMode === "manual" ? "border-stage-300/35 bg-stage-400/[0.14] text-[#fff5df]" : "border-[#e7b45f]/12 bg-black/25 text-[#bfb196]"}`}>
            手动填写
          </button>
          <button type="button" onClick={() => onModeChange("ai")} className={`rounded-full border px-3 py-1.5 text-xs ${draftMode === "ai" ? "border-teal-300/35 bg-teal-400/[0.12] text-teal-100" : "border-[#e7b45f]/12 bg-black/25 text-[#bfb196]"}`}>
            AI 辅助建档
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="姓名">
            <input value={draft.name} onChange={(event) => update("name", event.target.value)} className="field-input" placeholder="例如：宋江" />
          </Field>
          <Field label="绰号">
            <input value={draft.alias} onChange={(event) => update("alias", event.target.value)} className="field-input" placeholder="例如：及时雨·呼保义" />
          </Field>
          <Field label="武器/道具">
            <input value={draft.weapons} onChange={(event) => update("weapons", event.target.value)} className="field-input" placeholder="例如：骨朵、双锏、蛇矛" />
          </Field>
          <Field label="脸谱主色">
            <input value={draft.facepaint_main_color} onChange={(event) => update("facepaint_main_color", event.target.value)} className="field-input" placeholder="例如：正红、黑白、青绿" />
          </Field>
          <Field label="英歌定位">
            <textarea value={draft.yingge_role} onChange={(event) => update("yingge_role", event.target.value)} rows={3} className="field-input resize-y leading-6" placeholder="他在英歌队列中的舞台职责、动作节奏、站位。" />
          </Field>
          <Field label="角色简介">
            <textarea value={draft.bio} onChange={(event) => update("bio", event.target.value)} rows={3} className="field-input resize-y leading-6" placeholder="一句话人物钩子，方便后续生成分镜和角色提示词。" />
          </Field>
          <Field label="正向提示词">
            <textarea value={draft.positive_prompt_terms} onChange={(event) => update("positive_prompt_terms", event.target.value)} rows={3} className="field-input resize-y leading-6" placeholder="脸谱、服饰、武器、气质、光影、动作关键词。" />
          </Field>
          <Field label="禁忌提示词">
            <textarea value={draft.negative_prompt_terms} onChange={(event) => update("negative_prompt_terms", event.target.value)} rows={3} className="field-input resize-y leading-6" placeholder="不要出现的形象偏差、服饰错误、低质问题。" />
          </Field>
        </div>
        <aside className="rounded-2xl border border-[#e7b45f]/10 bg-black/22 p-4">
          <div className="text-sm font-medium text-[#fff5df]">{draftMode === "ai" ? "AI 辅助建档" : "草稿卡预览"}</div>
          <p className="mt-2 text-xs leading-5 text-[#9e927c]">
            {draftMode === "ai" ? "当前先用本地模板辅助预填。后续接大模型后，会把你的粗略描述润色成完整角色圣经字段。" : "保存后，它会成为正式角色卡，进入全局角色中心。"}
          </p>
          <div className="mt-4 rounded-xl border border-[#e7b45f]/10 bg-[#f5ead6]/[0.035] p-4">
            <div className="text-lg font-semibold text-[#fff5df]">{draft.name || "未命名角色"}</div>
            <div className="mt-1 text-xs text-stage-100">{draft.alias || "待补绰号"}</div>
            <p className="mt-3 line-clamp-5 text-xs leading-5 text-[#bfb196]">{draft.yingge_role || draft.bio || "填写角色信息后，这里会形成资产卡预览。"}</p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {draftMode === "ai" ? (
              <button type="button" onClick={onAiPreview} className="rounded-xl border border-teal-300/25 bg-teal-400/[0.1] px-4 py-2 text-sm text-teal-100 transition hover:bg-teal-400/[0.16]">
                用 AI 模板辅助预填
              </button>
            ) : null}
            <button type="button" onClick={onSave} disabled={creating} className="rounded-xl border border-stage-300/35 bg-stage-400/[0.14] px-4 py-2 text-sm font-medium text-[#fff5df] transition hover:bg-stage-400/[0.22] disabled:opacity-55">
              {creating ? "保存中" : "保存角色草稿"}
            </button>
            <button type="button" onClick={onCancel} className="rounded-xl border border-[#e7b45f]/12 bg-black/25 px-4 py-2 text-sm text-[#bfb196] transition hover:text-[#fff5df]">
              收起
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ImportPanel({ importing, onImport, onCancel }: { importing: boolean; onImport: () => void; onCancel: () => void }) {
  return (
    <section className="surface rounded-2xl p-4 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-sm font-semibold text-[#fff5df]">导入角色圣经模板</div>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-[#9e927c]">
            当前兼容你提供的 Excel：`英歌水浒角色基础信息.xlsx`，工作表为 `角色IP圣经`。导入逻辑会按角色姓名更新，不重复制造同名角色。
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onImport} disabled={importing} className="rounded-full border border-stage-300/35 bg-stage-400/[0.14] px-4 py-2 text-xs font-medium text-[#fff5df] transition hover:bg-stage-400/[0.22] disabled:opacity-55">
            {importing ? "导入中" : "开始导入"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-4 py-2 text-xs text-[#bfb196]">
            收起
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <ImportRequirement title="身份字段" items={["角色名称", "绰号/别名", "梁山排名", "天罡地煞星位", "梁山职务", "武器/道具"]} />
        <ImportRequirement title="英歌视觉字段" items={["英歌角色定位", "脸谱主色", "颜色寓意", "脸谱纹样", "视觉调性关键词"]} />
        <ImportRequirement title="生成控制字段" items={["正向提示词", "禁忌提示词", "人物钩子", "商业调性", "祝福寓意"]} />
      </div>
    </section>
  );
}

function CharacterCard({ character }: { character: Character }) {
  const tags = splitTerms(character.positive_prompt_terms || character.visual_tone_keywords).slice(0, 3);
  const referenceCount = character.reference_asset_ids?.length ?? 0;

  return (
    <Link
      href={`/characters/${character.id}`}
      className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-[#e7b45f]/12 bg-[#0d110d]/78 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-0.5 hover:border-stage-300/35 hover:bg-[#15180f]"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-bl-[4rem] bg-[radial-gradient(circle_at_top_right,rgba(231,180,95,0.22),transparent_66%)]" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#8f846f]">{character.rank || "未排名"} · {character.star || "星位未设"}</div>
          <h3 className="mt-2 text-xl font-semibold text-[#fff5df]">{character.name}</h3>
          <p className="mt-1 text-xs text-stage-100">{character.alias || "无绰号"}</p>
        </div>
        <span className="rounded-full border border-teal-300/25 bg-teal-400/[0.08] px-2.5 py-1 text-[10px] text-teal-100">
          {character.role_type || character.status || "角色"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <Meta label="脸谱" value={character.facepaint_main_color || "未设置"} />
        <Meta label="武器" value={character.weapons || character.weapon || "未设置"} />
      </div>

      <p className="mt-4 line-clamp-3 text-xs leading-5 text-[#bfb196]">{character.yingge_role || character.bio || "暂无英歌定位，进入详情后可补充。"}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.length > 0 ? tags.map((tag) => <Chip key={tag}>{tag}</Chip>) : <Chip>待补视觉关键词</Chip>}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] text-[#9e927c]">
        <MiniStatus active={Boolean(character.image_consistency_prompt)} label="生图词" />
        <MiniStatus active={Boolean(character.three_view_prompt)} label="三视图" />
        <MiniStatus active={referenceCount > 0} label={`${referenceCount} 参考图`} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#e7b45f]/10 pt-3">
        <span className="text-xs text-[#8f846f]">{character.source === "yingge_bible" ? `角色圣经 ${character.source_row ?? ""}` : "手动资产"}</span>
        <span className="text-xs font-medium text-stage-100 transition group-hover:text-[#fff5df]">打开角色档案 →</span>
      </div>
    </Link>
  );
}

function Pagination({ page, totalPages, total, onPageChange }: { page: number; totalPages: number; total: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-[#e7b45f]/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-[#8f846f]">共 {total} 个角色 · 第 {page} / {totalPages} 页</div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-4 py-2 text-xs text-[#e9dcc4] disabled:cursor-not-allowed disabled:opacity-40">
          上一页
        </button>
        <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-4 py-2 text-xs text-[#e9dcc4] disabled:cursor-not-allowed disabled:opacity-40">
          下一页
        </button>
      </div>
    </div>
  );
}

function ImportRequirement({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-black/22 p-4">
      <div className="text-sm font-medium text-[#fff5df]">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-[#e7b45f]/12 bg-[#f5ead6]/[0.035] px-2.5 py-1 text-[10px] text-[#d8ccb3]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-black/25 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#8f846f]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#fff5df]">{value}</div>
      <div className="mt-1 text-xs text-[#8f846f]">{hint}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e7b45f]/10 bg-[#f5ead6]/[0.035] px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.16em] text-[#8f846f]">{label}</div>
      <div className="mt-1 truncate text-xs text-[#e4d5b9]">{value}</div>
    </div>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-stage-300/20 bg-stage-400/[0.08] px-2.5 py-1 text-[10px] text-[#e8dbc2]">
      {children}
    </span>
  );
}

function MiniStatus({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`rounded-lg border px-2 py-2 ${active ? "border-teal-300/22 bg-teal-400/[0.08] text-teal-100" : "border-[#e7b45f]/10 bg-black/22"}`}>
      <div className="mx-auto mb-1 h-1.5 w-1.5 rounded-full" style={{ background: active ? "#4fbda8" : "rgba(245,234,214,0.28)" }} />
      {label}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">{label}</div>
      {children}
    </label>
  );
}

function EmptyBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-[#e7b45f]/18 bg-black/25 p-8 text-center">
      <div className="text-lg font-semibold text-[#fff5df]">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#bfb196]">{description}</p>
    </div>
  );
}

function splitTerms(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/[、,，;；\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
