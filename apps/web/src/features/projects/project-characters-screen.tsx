"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog, ToastMessage, ToastTone, ToastViewport } from "@/components/ui/feedback";
import type { Character } from "@/features/characters/types";
import type { Project, ProjectCharacter, ProjectCharacterStatus } from "@/features/projects/types";
import { listCharacters } from "@/lib/api/characters";
import { createProjectCharacter, deleteProjectCharacter, listProjectCharacters, updateProjectCharacter } from "@/lib/api/project-characters";
import { getProject } from "@/lib/api/projects";

const statusOptions: Array<{ value: ProjectCharacterStatus; label: string }> = [
  { value: "draft", label: "草稿" },
  { value: "selected", label: "已选用" },
  { value: "needs_reference", label: "待补参考" },
  { value: "ready", label: "可用于生产" },
];

const statusLabels: Record<string, string> = {
  draft: "草稿",
  selected: "已选用",
  needs_reference: "待补参考",
  ready: "可用于生产",
};

type ProjectCharactersScreenProps = {
  projectId: string;
};

export function ProjectCharactersScreen({ projectId }: ProjectCharactersScreenProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [projectCharacters, setProjectCharacters] = useState<ProjectCharacter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ProjectCharacter | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const linkedCharacterIds = useMemo(() => new Set(projectCharacters.map((item) => item.character_id)), [projectCharacters]);
  const readyCount = projectCharacters.filter((item) => item.status === "ready").length;
  const needsReferenceCount = projectCharacters.filter((item) => item.status === "needs_reference").length;
  const referenceCount = projectCharacters.filter((item) => item.character.reference_asset_count > 0 || item.character.reference_asset_id).length;

  const showToast = useCallback((tone: ToastTone, title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, tone, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const refreshProjectCharacters = useCallback(async () => {
    const linked = await listProjectCharacters(projectId);
    setProjectCharacters(linked);
  }, [projectId]);

  const refreshLibrary = useCallback(async (nextQuery: string) => {
    setLibraryLoading(true);
    try {
      const result = await listCharacters(nextQuery.trim() || undefined);
      setCharacters(result);
    } catch (error) {
      showToast("error", "角色中心加载失败", error instanceof Error ? error.message : "请确认后端服务可用。");
    } finally {
      setLibraryLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [loadedProject, linked, library] = await Promise.all([
          getProject(projectId),
          listProjectCharacters(projectId),
          listCharacters(),
        ]);
        setProject(loadedProject);
        setProjectCharacters(linked);
        setCharacters(library);
      } catch (error) {
        const message = error instanceof Error ? error.message : "项目角色加载失败，请确认后端服务可用。";
        setError(message);
        showToast("error", "项目角色加载失败", message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [projectId, showToast]);

  async function handleAdd(character: Character) {
    setAddingId(character.id);
    try {
      await createProjectCharacter(projectId, {
        character_id: character.id,
        role_in_project: "",
        usage_note: "",
        status: character.reference_asset_id || character.reference_asset_ids.length > 0 ? "selected" : "needs_reference",
      });
      showToast("success", "已加入项目角色", `「${character.name}」现在可以在项目内使用。`);
      await refreshProjectCharacters();
    } catch (error) {
      showToast("error", "加入失败", error instanceof Error ? error.message : "这个角色暂时无法加入项目。");
    } finally {
      setAddingId(null);
    }
  }

  async function handleUpdate(projectCharacter: ProjectCharacter, payload: { role_in_project?: string | null; usage_note?: string | null; status?: string }) {
    setSavingId(projectCharacter.id);
    try {
      const updated = await updateProjectCharacter(projectId, projectCharacter.id, payload);
      setProjectCharacters((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      showToast("success", "项目角色已更新", `「${updated.character.name}」的项目设定已保存。`);
    } catch (error) {
      showToast("error", "保存失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setSavingId(null);
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setSavingId(removeTarget.id);
    try {
      await deleteProjectCharacter(projectId, removeTarget.id);
      setProjectCharacters((current) => current.filter((item) => item.id !== removeTarget.id));
      showToast("success", "已移出项目", `「${removeTarget.character.name}」仍保留在全局角色中心。`);
      setRemoveTarget(null);
    } catch (error) {
      showToast("error", "移除失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <ProjectCharactersState title="正在打开项目角色..." description="正在读取项目文件夹和全局角色中心。" />;
  }

  if (error || !project) {
    return <ProjectCharactersState title="项目角色打不开" description={error ?? "项目不存在。"} />;
  }

  return (
    <div className="space-y-5">
      <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="移出项目角色"
        description={removeTarget ? `确认把「${removeTarget.character.name}」移出本项目？全局角色资料不会被删除。` : ""}
        confirmLabel="移出项目"
        loading={Boolean(removeTarget && savingId === removeTarget.id)}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => void handleRemove()}
      />
      <Breadcrumbs items={[{ label: "项目中心", href: "/projects" }, { label: project.name, href: `/projects/${project.id}` }, { label: "项目角色" }]} />
      <PageHeader
        eyebrow="项目内部模块"
        title="项目角色"
        description="从全局角色中心引用人物 IP，只保存本项目内的身份、用途、状态和排序信息。"
        actions={
          <button
            type="button"
            onClick={() => router.push(`/projects/${project.id}`)}
            className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-xs text-stage-100 transition hover:border-stage-300/35"
          >
            返回项目文件夹
          </button>
        }
      />

      <section className="grid gap-3 md:grid-cols-4">
        <ProjectRoleStat label="项目角色" value={String(projectCharacters.length).padStart(2, "0")} hint="已引用角色" />
        <ProjectRoleStat label="生产就绪" value={String(readyCount).padStart(2, "0")} hint="状态为可用于生产" />
        <ProjectRoleStat label="待补参考" value={String(needsReferenceCount).padStart(2, "0")} hint="需补主参考或候选图" />
        <ProjectRoleStat label="已有参考" value={String(referenceCount).padStart(2, "0")} hint="全局角色资产摘要" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="surface rounded-2xl p-4 shadow-panel">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-medium text-[#fff5df]">本项目角色卡</div>
              <p className="mt-1 text-xs leading-5 text-[#9e927c]">项目内字段只影响当前项目；姓名、脸谱、提示词和参考资产继续来自全局角色中心。</p>
            </div>
            <button
              type="button"
              onClick={() => void refreshProjectCharacters()}
              className="rounded-xl border border-[#e7b45f]/15 bg-black/25 px-3 py-2 text-xs text-stage-100 transition hover:border-stage-300/35"
            >
              刷新项目角色
            </button>
          </div>

          {projectCharacters.length === 0 ? (
            <EmptyBlock title="还没有项目角色" description="从右侧全局角色中心选择人物 IP，加入后就会出现在这里。" />
          ) : (
            <div className="mt-4 grid gap-4 2xl:grid-cols-2">
              {projectCharacters.map((item) => (
                <ProjectCharacterCard
                  key={item.id}
                  item={item}
                  saving={savingId === item.id}
                  onUpdate={(payload) => void handleUpdate(item, payload)}
                  onRemove={() => setRemoveTarget(item)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="surface rounded-2xl p-4 shadow-panel">
          <div className="text-sm font-medium text-[#fff5df]">添加全局角色</div>
          <p className="mt-1 text-xs leading-5 text-[#9e927c]">搜索姓名、绰号、武器或英歌定位；已加入的角色会锁定，避免重复引用。</p>
          <div className="mt-4 flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void refreshLibrary(query);
              }}
              className="field-input"
              placeholder="搜索全局角色..."
            />
            <button
              type="button"
              onClick={() => void refreshLibrary(query)}
              className="rounded-xl border border-stage-300/25 bg-stage-400/[0.12] px-4 py-2 text-sm text-[#fff5df] transition hover:bg-stage-400/[0.2]"
            >
              搜索
            </button>
          </div>

          <div className="mt-4 max-h-[680px] space-y-3 overflow-y-auto pr-1">
            {libraryLoading ? <EmptyBlock title="正在搜索..." description="正在读取全局角色中心。" compact /> : null}
            {!libraryLoading && characters.length === 0 ? <EmptyBlock title="没有匹配角色" description="换个关键词，或先到角色中心新增角色。" compact /> : null}
            {!libraryLoading && characters.map((character) => (
              <LibraryCharacterRow
                key={character.id}
                character={character}
                linked={linkedCharacterIds.has(character.id)}
                adding={addingId === character.id}
                onAdd={() => void handleAdd(character)}
              />
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

function ProjectCharacterCard({
  item,
  saving,
  onUpdate,
  onRemove,
}: {
  item: ProjectCharacter;
  saving: boolean;
  onUpdate: (payload: { role_in_project?: string | null; usage_note?: string | null; status?: string }) => void;
  onRemove: () => void;
}) {
  const [role, setRole] = useState(item.role_in_project ?? "");
  const [note, setNote] = useState(item.usage_note ?? "");
  const [status, setStatus] = useState(item.status);

  useEffect(() => {
    setRole(item.role_in_project ?? "");
    setNote(item.usage_note ?? "");
    setStatus(item.status);
  }, [item]);

  const dirty = role !== (item.role_in_project ?? "") || note !== (item.usage_note ?? "") || status !== item.status;
  const promptReady = Boolean(item.character.image_consistency_prompt);
  const referenceReady = item.character.reference_asset_count > 0 || Boolean(item.character.reference_asset_id);

  return (
    <article className="rounded-2xl border border-[#e7b45f]/10 bg-black/28 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold text-[#fff5df]">{item.character.name}</div>
          <div className="mt-1 truncate text-xs text-stage-100">{item.character.alias || item.character.yingge_role || "未填写绰号/英歌定位"}</div>
        </div>
        <div className="rounded-full border border-teal-300/20 bg-teal-400/[0.08] px-2.5 py-1 text-[10px] text-teal-100">
          {statusLabels[item.status] ?? item.status}
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-[#cfc1a6] sm:grid-cols-3">
        <Badge label="武器/道具" value={item.character.weapons || item.character.weapon || "未设置"} />
        <Badge label="参考资产" value={referenceReady ? `${item.character.reference_asset_count || 1} 个` : "待补"} />
        <Badge label="生成候选" value={item.character.generated_asset_count ? `${item.character.generated_asset_count} 个` : promptReady ? "提示词就绪" : "待补提示词"} />
      </div>

      <div className="mt-4 grid gap-3">
        <Field label="项目内身份">
          <input value={role} onChange={(event) => setRole(event.target.value)} className="field-input" placeholder="主角 / 反派 / 配角 / 队长..." />
        </Field>
        <Field label="项目内备注或用途">
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="field-input resize-y leading-6" placeholder="说明此角色在本项目中的人物定位、出场用途或资产注意点。" />
        </Field>
        <Field label="项目内状态">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="field-input">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onRemove}
          disabled={saving}
          className="rounded-xl border border-clay-300/25 bg-clay-500/[0.08] px-3 py-2 text-xs text-[#ffd7c3] transition hover:bg-clay-500/[0.16] disabled:cursor-not-allowed disabled:opacity-60"
        >
          移出项目
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ role_in_project: role.trim() || null, usage_note: note.trim() || null, status })}
          disabled={!dirty || saving}
          className="rounded-xl border border-stage-300/30 bg-stage-400/[0.14] px-3 py-2 text-xs text-[#fff5df] transition hover:bg-stage-400/[0.22] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "保存中" : "保存项目设定"}
        </button>
      </div>
    </article>
  );
}

function LibraryCharacterRow({ character, linked, adding, onAdd }: { character: Character; linked: boolean; adding: boolean; onAdd: () => void }) {
  const referenceCount = character.reference_asset_ids.length + (character.reference_asset_id && !character.reference_asset_ids.includes(character.reference_asset_id) ? 1 : 0);
  return (
    <div className="rounded-2xl border border-[#e7b45f]/10 bg-black/24 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#fff5df]">{character.name}</div>
          <div className="mt-1 truncate text-xs text-[#a99d87]">{character.alias || character.yingge_role || "全局角色"}</div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={linked || adding}
          className={`rounded-xl border px-3 py-1.5 text-xs transition ${
            linked
              ? "cursor-not-allowed border-teal-300/18 bg-teal-400/[0.08] text-teal-100/70"
              : "border-stage-300/25 bg-stage-400/[0.12] text-[#fff5df] hover:bg-stage-400/[0.2]"
          }`}
        >
          {linked ? "已加入" : adding ? "加入中" : "加入"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#cfc1a6]">
        <span className="rounded-full border border-[#e7b45f]/10 bg-black/25 px-2 py-1">{character.weapons || character.weapon || "无武器信息"}</span>
        <span className="rounded-full border border-[#e7b45f]/10 bg-black/25 px-2 py-1">{referenceCount > 0 ? `参考 ${referenceCount}` : "待补参考"}</span>
        <span className="rounded-full border border-[#e7b45f]/10 bg-black/25 px-2 py-1">{character.image_consistency_prompt ? "提示词就绪" : "待补提示词"}</span>
      </div>
    </div>
  );
}

function ProjectRoleStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="surface rounded-2xl p-4 shadow-panel">
      <div className="text-xs uppercase tracking-[0.22em] text-[#8f846f]">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-[#fff5df]">{value}</div>
      <div className="mt-1 text-xs text-[#9e927c]">{hint}</div>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-[#f5ead6]/[0.035] p-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">{label}</div>
      <div className="mt-1 line-clamp-2 text-[#fff5df]">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-xs text-[#bfb196]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function EmptyBlock({ title, description, compact = false }: { title: string; description: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-dashed border-[#e7b45f]/15 bg-black/20 text-center ${compact ? "p-4" : "mt-4 p-8"}`}>
      <div className="text-sm font-medium text-[#fff5df]">{title}</div>
      <p className="mt-2 text-xs leading-5 text-[#9e927c]">{description}</p>
    </div>
  );
}

function ProjectCharactersState({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="项目角色" title={title} description={description} />
    </div>
  );
}
