"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ConfirmDialog, ToastMessage, ToastTone, ToastViewport } from "@/components/ui/feedback";
import { createProject, deleteProject, listProjects } from "@/lib/api/projects";
import type { Project, ProjectCreatePayload, ProjectStage } from "@/features/projects/types";

const stageOptions: Array<{ value: ProjectStage; label: string }> = [
  { value: "preparing", label: "筹备中" },
  { value: "scripting", label: "剧本中" },
  { value: "storyboarding", label: "分镜中" },
  { value: "generating", label: "生成中" },
  { value: "archived", label: "已归档" },
];

const stageLabels: Record<string, string> = {
  preparing: "筹备中",
  scripting: "剧本中",
  storyboarding: "分镜中",
  generating: "生成中",
  archived: "已归档",
};

const initialForm: ProjectCreatePayload = {
  name: "",
  summary: "",
  ip_name: "",
  genre: "英歌民俗奇幻",
  visual_style: "暗色电影感，陶土红、金色舞台光、青绿色边缘光",
  stage: "preparing",
};

export function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectCreatePayload>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteProject, setPendingDeleteProject] = useState<Project | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  function showToast(tone: ToastTone, title: string, description?: string) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, tone, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }

  const refreshProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await listProjects());
    } catch {
      setError("项目数据加载失败，请确认 FastAPI 后端已启动。");
      showToast("error", "项目加载失败", "请确认 FastAPI 后端已启动。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      showToast("info", "缺少项目名称", "请先填写项目名称，再创建项目。");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await createProject({
        ...form,
        name: form.name.trim(),
        summary: form.summary?.trim(),
        ip_name: form.ip_name?.trim(),
        genre: form.genre?.trim(),
        visual_style: form.visual_style?.trim(),
      });
      setProjects((current) => [created, ...current]);
      setForm(initialForm);
      setCreateOpen(false);
      showToast("success", "项目已创建", `「${created.name}」已经加入项目文件夹。`);
    } catch {
      setError("项目创建失败，请检查后端服务和数据库表。");
      showToast("error", "项目创建失败", "请检查后端服务和数据库表。");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProject() {
    if (!pendingDeleteProject) {
      return;
    }

    const target = pendingDeleteProject;
    setDeletingId(target.id);
    setError(null);
    try {
      await deleteProject(target.id);
      setProjects((current) => current.filter((item) => item.id !== target.id));
      setPendingDeleteProject(null);
      showToast("success", "项目已删除", `「${target.name}」已从项目中心移除。`);
    } catch {
      setError("项目删除失败，请稍后重试。");
      showToast("error", "项目删除失败", "请稍后重试。");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProjects = projects.filter((project) => {
    const text = [project.name, project.summary, project.ip_name, project.genre, project.visual_style].filter(Boolean).join(" ");
    return text.toLowerCase().includes(query.trim().toLowerCase());
  });
  const activeProjects = projects.filter((project) => project.stage !== "archived").length;
  const generatingProjects = projects.filter((project) => project.stage === "generating").length;

  return (
    <div className="space-y-5">
      <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <ConfirmDialog
        open={Boolean(pendingDeleteProject)}
        title="删除项目文件夹"
        description={`确认删除「${pendingDeleteProject?.name ?? ""}」？删除后该项目容器会从列表移除。`}
        confirmLabel="删除项目"
        loading={Boolean(deletingId)}
        onCancel={() => setPendingDeleteProject(null)}
        onConfirm={() => void handleDeleteProject()}
      />
      <CreateProjectDialog
        open={createOpen}
        form={form}
        saving={saving}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleSubmit}
        onChange={setForm}
      />

      <Breadcrumbs items={[{ label: "项目中心" }]} />

      <section className="surface rounded-2xl p-5 shadow-panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-stage-200/70">Project Explorer</div>
            <h2 className="mt-2 text-2xl font-semibold text-[#fff5df]">项目文件夹</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#cfc1a6]">
              像文件管理器一样管理项目。先进入项目文件夹，再处理剧本、分镜、项目角色、素材和成片。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refreshProjects()}
              className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-xs text-stage-100 transition hover:border-stage-300/35"
            >
              刷新
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-full border border-stage-300/35 bg-stage-400/[0.14] px-4 py-2 text-xs font-medium text-[#fff5df] shadow-stage-glow transition hover:bg-stage-400/[0.22]"
            >
              新建项目
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <ProjectStat label="项目总数" value={String(projects.length).padStart(2, "0")} />
          <ProjectStat label="活跃项目" value={String(activeProjects).padStart(2, "0")} />
          <ProjectStat label="生成中" value={String(generatingProjects).padStart(2, "0")} />
        </div>
      </section>

      <section className="surface rounded-2xl p-4 shadow-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索项目名、IP、题材、视觉风格..."
            className="field-input lg:max-w-md"
          />
          <div className="text-xs text-[#9f927c]">
            {loading ? "正在加载" : `显示 ${filteredProjects.length} / ${projects.length} 个文件夹`}
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-clay-300/30 bg-clay-500/[0.12] px-4 py-3 text-sm text-[#ffd7c3]">{error}</div>
        ) : null}

        <div className="mt-4">
          {loading ? <ProjectEmpty title="正在加载项目..." description="正在连接 FastAPI 后端读取项目列表。" /> : null}
          {!loading && filteredProjects.length === 0 ? (
            <ProjectEmpty title="没有匹配项目" description="换个关键词，或点击右上角新建项目。" />
          ) : null}
          {!loading && filteredProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectFolder
                  key={project.id}
                  project={project}
                  deleting={deletingId === project.id}
                  onOpen={() => router.push(`/projects/${project.id}`)}
                  onDelete={() => setPendingDeleteProject(project)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function CreateProjectDialog({
  open,
  form,
  saving,
  onClose,
  onSubmit,
  onChange,
}: {
  open: boolean;
  form: ProjectCreatePayload;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (value: ProjectCreatePayload | ((current: ProjectCreatePayload) => ProjectCreatePayload)) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-auto bg-black/60 px-4 py-10 backdrop-blur-sm">
      <form className="surface w-[min(94vw,720px)] rounded-2xl p-5 shadow-panel" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-stage-200/70">Create Folder</div>
            <div className="mt-2 text-xl font-semibold text-[#fff5df]">新建项目文件夹</div>
            <p className="mt-2 text-sm leading-6 text-[#bfb196]">先建容器，后续剧本、分镜、角色和素材都挂进这个文件夹。</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-3 py-1.5 text-xs text-[#d8cab0]">
            关闭
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="项目名称">
            <input
              value={form.name}
              onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))}
              placeholder="例如：岭南夜巡"
              className="field-input"
            />
          </Field>
          <Field label="所属 IP">
            <input
              value={form.ip_name}
              onChange={(event) => onChange((current) => ({ ...current, ip_name: event.target.value }))}
              placeholder="例如：英歌少年宇宙"
              className="field-input"
            />
          </Field>
          <Field label="题材类型">
            <input value={form.genre} onChange={(event) => onChange((current) => ({ ...current, genre: event.target.value }))} className="field-input" />
          </Field>
          <Field label="当前阶段">
            <select
              value={form.stage}
              onChange={(event) => onChange((current) => ({ ...current, stage: event.target.value as ProjectStage }))}
              className="field-input"
            >
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="项目简介">
            <textarea
              value={form.summary}
              onChange={(event) => onChange((current) => ({ ...current, summary: event.target.value }))}
              placeholder="一句话描述故事钩子、主角和冲突。"
              rows={4}
              className="field-input resize-none"
            />
          </Field>
          <Field label="视觉风格">
            <textarea
              value={form.visual_style}
              onChange={(event) => onChange((current) => ({ ...current, visual_style: event.target.value }))}
              rows={4}
              className="field-input resize-none"
            />
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-5 py-2 text-sm text-[#e9dcc4]">
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-stage-300/35 bg-stage-400/[0.16] px-5 py-2 text-sm font-medium text-[#fff5df] shadow-stage-glow disabled:cursor-not-allowed disabled:opacity-55"
          >
            {saving ? "创建中..." : "创建项目"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

function ProjectStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-black/25 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#8f846f]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#fff5df]">{value}</div>
    </div>
  );
}

function ProjectFolder({
  project,
  deleting,
  onOpen,
  onDelete,
}: {
  project: Project;
  deleting: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group rounded-2xl border border-[#e7b45f]/10 bg-black/30 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-stage-300/35 hover:bg-stage-400/[0.055]">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <FolderIcon />
            <div>
              <div className="text-base font-semibold text-[#fff5df]">{project.name}</div>
              <div className="mt-1 text-xs text-[#8f846f]">{new Date(project.updated_at).toLocaleString("zh-CN")}</div>
            </div>
          </div>
          <span className="rounded-full border border-teal-300/25 bg-teal-400/[0.08] px-2.5 py-1 text-xs text-teal-100">
            {stageLabels[project.stage] ?? project.stage}
          </span>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#cfc1a6]">{project.summary || "暂无项目简介。"}</p>
        <div className="mt-4 grid gap-2 text-xs md:grid-cols-3">
          <Meta label="IP" value={project.ip_name || "未设置"} />
          <Meta label="题材" value={project.genre || "未设置"} />
          <Meta label="风格" value={project.visual_style || "未设置"} />
        </div>
      </button>
      <div className="mt-4 flex items-center justify-between border-t border-[#e7b45f]/10 pt-3">
        <button type="button" onClick={onOpen} className="text-xs text-stage-100 opacity-75 transition group-hover:opacity-100">
          打开文件夹 →
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-full border border-clay-300/30 bg-clay-500/[0.1] px-3 py-1.5 text-xs text-[#ffd7c3] transition hover:bg-clay-500/[0.18] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {deleting ? "删除中" : "删除"}
        </button>
      </div>
    </article>
  );
}

function FolderIcon() {
  return (
    <div className="relative h-11 w-14">
      <div className="absolute left-1 top-1 h-4 w-7 rounded-t-lg bg-stage-300/35" />
      <div className="absolute inset-x-0 bottom-0 h-9 rounded-xl border border-stage-300/25 bg-[linear-gradient(135deg,rgba(231,180,95,0.34),rgba(79,189,168,0.08))] shadow-stage-glow" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-[#9c907a]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function ProjectEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#e7b45f]/18 bg-black/25 p-8 text-center">
      <div className="text-lg font-semibold text-[#fff5df]">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#bfb196]">{description}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-[#f5ead6]/[0.035] px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.18em] text-[#8f846f]">{label}</div>
      <div className="mt-1 line-clamp-1 text-xs text-[#e4d5b9]">{value}</div>
    </div>
  );
}
