import {
  ArrowUpRight,
  Clapperboard,
  Film,
  Image as ImageIcon,
  PanelsTopLeft,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { CostBadge } from "@/components/common/CostBadge";
import { StatusBadge, type StatusBadgeStatus } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

export type DashboardProjectStage =
  | "剧本生成"
  | "分镜确认"
  | "素材生成"
  | "素材审核"
  | "已完成"
  | "需复核";

export type DashboardProject = {
  id: string;
  title: string;
  characterName: string;
  yinggeRole: string;
  stage: DashboardProjectStage;
  shotCount: number;
  panelCount: number;
  acceptedImageCount: number;
  acceptedVideoCount: number;
  failedTaskCount: number;
  runningTaskCount: number;
  totalCost: number;
  updatedAt: string;
  readiness: number;
  coverImage: string;
  tags: string[];
};

const coverClassName: Record<string, string> = {
  cinnabar: "from-[#9d2f2a] via-[#3b2a28] to-[#151515]",
  bluegray: "from-[#33556d] via-[#252f35] to-[#121313]",
  gold: "from-[#a67824] via-[#3a3123] to-[#151411]",
  jade: "from-[#355f47] via-[#26332a] to-[#101311]",
  ink: "from-[#56595b] via-[#272727] to-[#111111]",
  error: "from-[#6e1d22] via-[#332222] to-[#121111]",
};

const stageStatus: Record<DashboardProjectStage, StatusBadgeStatus> = {
  剧本生成: "processing",
  分镜确认: "processing",
  素材生成: "warning",
  素材审核: "warning",
  已完成: "success",
  需复核: "error",
};

type ProjectCardProps = {
  project: DashboardProject;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(34,37,36,0.88),rgba(24,25,24,0.82))] shadow-[0_20px_44px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(233,195,73,0.06)]">
      <div
        className={cn(
          "relative h-40 bg-gradient-to-br",
          coverClassName[project.coverImage] ?? coverClassName.ink,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(233,195,73,0.26),transparent_25%),radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.16),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.08)_0,transparent_42%)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/78 to-transparent" />
        <div className="absolute right-8 top-7 h-24 w-20 rotate-3 rounded-[48%_48%_42%_42%] border border-white/15 bg-black/20 shadow-[0_0_36px_rgba(0,0,0,0.28)]">
          <div className="mx-auto mt-4 h-14 w-10 rounded-[46%] border border-white/25 bg-white/10" />
          <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-[color:rgba(233,195,73,0.36)]" />
        </div>
        <StatusBadge
          status={stageStatus[project.stage]}
          className="absolute left-4 top-4"
        >
          {project.stage}
        </StatusBadge>
        <div className="absolute bottom-4 left-4">
          <p className="text-xs text-[var(--accent-gold)]">英歌短片项目</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {project.characterName}
          </p>
          <p className="mt-1 text-xs text-white/68">{project.yinggeRole}</p>
        </div>
        <Link
          href="/generation-workspace"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded border border-white/15 bg-black/30 text-white/80 transition group-hover:border-[var(--accent-cinnabar)] group-hover:text-white"
          aria-label="进入生成工作台"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {project.title}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              最近更新：{project.updatedAt}
            </p>
          </div>
          <CostBadge amount={`¥${project.totalCost.toFixed(1)}`} label="项目成本" />
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs text-[var(--text-secondary)]">
          <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/18 p-2">
            <PanelsTopLeft className="mb-1 h-3.5 w-3.5 text-[var(--accent-bluegray)]" />
            {project.shotCount} 镜 / {project.panelCount} 面板
          </div>
          <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/18 p-2">
            <ImageIcon className="mb-1 h-3.5 w-3.5 text-[var(--status-success)]" />
            图片 {project.acceptedImageCount}
          </div>
          <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/18 p-2">
            <Film className="mb-1 h-3.5 w-3.5 text-[var(--accent-cinnabar)]" />
            视频 {project.acceptedVideoCount}
          </div>
          <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/18 p-2">
            <TriangleAlert className="mb-1 h-3.5 w-3.5 text-[var(--status-error)]" />
            失败 {project.failedTaskCount}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">就绪度</span>
            <span className="font-mono text-[var(--accent-gold)]">
              {project.readiness}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/35">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-cinnabar),var(--accent-gold))]"
              style={{ width: `${project.readiness}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-[color:rgba(143,129,125,0.22)] bg-black/12 px-2 py-1 text-[11px] text-[var(--text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[color:rgba(111,132,144,0.18)] pt-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clapperboard className="h-3.5 w-3.5 text-[var(--accent-gold)]" />
            生产阶段：{project.stage}
          </div>
          <div className="flex items-center gap-2">
            {project.failedTaskCount > 0 ? (
              <StatusBadge status="error">{project.failedTaskCount} 失败</StatusBadge>
            ) : null}
            {project.runningTaskCount > 0 ? (
              <StatusBadge status="processing">
                {project.runningTaskCount} 运行中
              </StatusBadge>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
