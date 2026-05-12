"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog, ToastMessage, ToastViewport, ToastTone } from "@/components/ui/feedback";
import { listProjectCharacters } from "@/lib/api/project-characters";
import { deleteProject, getProject } from "@/lib/api/projects";
import { listProjectScripts } from "@/lib/api/scripts";
import { listProjectShots } from "@/lib/api/shots";
import type { Project } from "@/features/projects/types";

const stageLabels: Record<string, string> = {
  preparing: "筹备中",
  scripting: "剧本中",
  storyboarding: "分镜中",
  generating: "生成中",
  archived: "已归档",
};

type ProjectFolderStatus = "active" | "next" | "planned";

type ProjectFolderConfig = {
  title: string;
  description: string;
  href: string;
  meta: string;
  status: ProjectFolderStatus;
  owner: string;
  currentCapability: string;
};

const projectFolders: ProjectFolderConfig[] = [
  {
    title: "剧本",
    description: "剧本版本、场次拆分、角色出场和冲突点。",
    href: "scripts",
    meta: "Script",
    status: "active",
    owner: "故事核心",
    currentCapability: "已接入生成、版本、场次",
  },
  {
    title: "分镜",
    description: "分镜卡、镜头顺序、景别、构图和运镜。",
    href: "shots",
    meta: "Shot Cards",
    status: "active",
    owner: "生产核心",
    currentCapability: "已接入草案生成、编辑、排序",
  },
  {
    title: "项目角色",
    description: "从全局角色中心引用人物 IP，并做本项目补充设定。",
    href: "characters",
    meta: "IP Assets",
    status: "active",
    owner: "角色引用",
    currentCapability: "已接入全局角色引用",
  },
  {
    title: "生成",
    description: "生图、生视频提示词、模型任务和结果版本。",
    href: "generation",
    meta: "AI Tasks",
    status: "next",
    owner: "模型执行",
    currentCapability: "下一轮接任务记录",
  },
  {
    title: "素材库",
    description: "关键帧、视频片段、参考图、音频和字幕。",
    href: "assets",
    meta: "Assets",
    status: "planned",
    owner: "素材归档",
    currentCapability: "待接 COS 上传",
  },
  {
    title: "成片",
    description: "最终成片版本、交付包和项目复盘备注。",
    href: "final-cuts",
    meta: "Final Cut",
    status: "planned",
    owner: "交付复盘",
    currentCapability: "待接成片版本",
  },
];

type ProjectDetailScreenProps = {
  projectId: string;
};

export function ProjectDetailScreen({ projectId }: ProjectDetailScreenProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [moduleCounts, setModuleCounts] = useState<Record<string, number | null>>({
    scripts: null,
    shots: null,
    characters: null,
    generation: null,
    assets: null,
    "final-cuts": null,
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  function showToast(tone: ToastTone, title: string, description?: string) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, tone, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError(null);
      try {
        const [loadedProject, scriptsResult, shotsResult, charactersResult] = await Promise.allSettled([
          getProject(projectId),
          listProjectScripts(projectId),
          listProjectShots(projectId),
          listProjectCharacters(projectId),
        ]);
        if (loadedProject.status === "rejected") {
          throw loadedProject.reason;
        }
        setProject(loadedProject.value);
        setModuleCounts((current) => ({
          ...current,
          scripts: scriptsResult.status === "fulfilled" ? scriptsResult.value.length : null,
          shots: shotsResult.status === "fulfilled" ? shotsResult.value.length : null,
          characters: charactersResult.status === "fulfilled" ? charactersResult.value.length : null,
        }));
      } catch {
        setError("项目加载失败，可能已经被删除或后端服务未启动。");
        showToast("error", "项目加载失败", "可能已经被删除或后端服务未启动。");
      } finally {
        setLoading(false);
      }
    }

    void loadProject();
  }, [projectId]);

  async function handleDelete() {
    if (!project) {
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await deleteProject(project.id);
      showToast("success", "项目已删除", `「${project.name}」已从项目中心移除。`);
      router.push("/projects");
    } catch {
      setError("项目删除失败，请稍后重试。");
      showToast("error", "项目删除失败", "请稍后重试。");
      setDeleting(false);
    }
  }

  if (loading) {
    return <ProjectDetailState title="正在打开项目文件夹..." description="正在读取项目基础信息。" />;
  }

  if (error || !project) {
    return <ProjectDetailState title="项目打不开" description={error ?? "项目不存在。"} />;
  }

  return (
    <div className="space-y-6">
      <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <ConfirmDialog
        open={confirmOpen}
        title="删除项目文件夹"
        description={`确认删除「${project.name}」？删除后会返回项目中心。`}
        confirmLabel="删除项目"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
      />
      <Breadcrumbs items={[{ label: "项目中心", href: "/projects" }, { label: project.name }]} />
      <PageHeader
        eyebrow="项目文件夹"
        title={project.name}
        description={project.summary || "这个项目还没有简介。你可以先进入剧本、分镜、项目角色等文件夹继续完善。"}
        actions={
          <>
            <button
              type="button"
              onClick={() => router.push("/projects")}
              className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-xs text-stage-100 transition hover:border-stage-300/35"
            >
              返回项目中心
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              className="rounded-full border border-clay-300/30 bg-clay-500/[0.1] px-4 py-2 text-xs text-[#ffd7c3] transition hover:bg-clay-500/[0.18] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {deleting ? "删除中" : "删除项目"}
            </button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <ProjectMeta label="阶段" value={stageLabels[project.stage] ?? project.stage} />
        <ProjectMeta label="所属 IP" value={project.ip_name || "未设置"} />
        <ProjectMeta label="题材" value={project.genre || "未设置"} />
        <ProjectMeta label="更新时间" value={new Date(project.updated_at).toLocaleDateString("zh-CN")} />
      </section>

      <section className="surface rounded-[1.55rem] p-5 shadow-panel md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-medium text-[#fff5df]">项目内部文件夹</div>
            <p className="mt-2 text-sm leading-7 text-[#bfb196]">
              每个模块都是项目下的独立生产目录；已接入的目录显示真实数据，未接入的目录明确标记状态。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/projects")}
              className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-3 py-1.5 text-xs text-stage-100 transition hover:border-stage-300/35"
            >
              项目中心
            </button>
            <button
              type="button"
              onClick={() => router.push("/projects")}
              className="rounded-full border border-stage-300/25 bg-stage-400/[0.08] px-3 py-1.5 text-xs text-stage-100 transition hover:bg-stage-400/[0.15]"
            >
              去项目中心新建
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projectFolders.map((folder) => (
            <ProjectFolderCard
              key={folder.href}
              folder={folder}
              count={moduleCounts[folder.href]}
              onOpen={() => router.push(`/projects/${project.id}/${folder.href}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProjectFolderCard({ folder, count, onOpen }: { folder: ProjectFolderConfig; count: number | null; onOpen: () => void }) {
  const statusCopy = folderStatusCopy[folder.status];
  const countText = count === null ? "未接入" : `${count} 条`;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative min-h-52 overflow-hidden rounded-[1.35rem] border border-[#e7b45f]/10 bg-black/30 p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-stage-300/35 hover:bg-stage-400/[0.055]"
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${statusCopy.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <FolderGlyph active={folder.status === "active"} />
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-full border border-[#e7b45f]/10 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">
            {folder.meta}
          </div>
          <div className={`rounded-full border px-2.5 py-1 text-[10px] ${statusCopy.badgeClass}`}>{statusCopy.label}</div>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-[#fff5df]">{folder.title}</div>
          <div className="mt-1 text-xs text-stage-100">{folder.owner}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-[#fff5df]">{countText}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">Records</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-[#c9bea8]">{folder.description}</p>
      <div className="mt-4 rounded-xl border border-[#e7b45f]/10 bg-[#f5ead6]/[0.035] px-3 py-2 text-xs leading-5 text-[#bfb196]">
        当前能力：{folder.currentCapability}
      </div>
      <div className="mt-5 text-xs text-stage-100 opacity-75 transition group-hover:opacity-100">打开文件夹 &rarr;</div>
    </button>
  );
}

const folderStatusCopy: Record<ProjectFolderStatus, { label: string; badgeClass: string; accent: string }> = {
  active: {
    label: "已接入",
    badgeClass: "border-teal-300/25 bg-teal-400/[0.08] text-teal-100",
    accent: "bg-teal-300/70",
  },
  next: {
    label: "下一轮",
    badgeClass: "border-stage-300/25 bg-stage-400/[0.1] text-stage-100",
    accent: "bg-stage-300/70",
  },
  planned: {
    label: "待开发",
    badgeClass: "border-[#e7b45f]/15 bg-black/30 text-[#a99d87]",
    accent: "bg-[#e7b45f]/25",
  },
};

function FolderGlyph({ active }: { active: boolean }) {
  return (
    <div className="relative h-10 w-14">
      <div className={`absolute left-1 top-0 h-4 w-7 rounded-t-lg ${active ? "bg-stage-300/45" : "bg-[#8f846f]/25"}`} />
      <div
        className={`absolute inset-x-0 bottom-0 h-8 rounded-xl border ${
          active
            ? "border-stage-300/25 bg-[linear-gradient(135deg,rgba(231,180,95,0.32),rgba(79,189,168,0.08))] shadow-stage-glow"
            : "border-[#e7b45f]/10 bg-[#f5ead6]/[0.045]"
        }`}
      />
    </div>
  );
}

function ProjectMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface rounded-[1.35rem] p-5 shadow-panel">
      <div className="text-xs uppercase tracking-[0.22em] text-[#8f846f]">{label}</div>
      <div className="mt-3 line-clamp-2 text-lg font-medium text-[#fff5df]">{value}</div>
    </div>
  );
}

function ProjectDetailState({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="项目文件夹" title={title} description={description} />
    </div>
  );
}
