import { AgentRunMini } from "@/components/common/AgentRunMini";
import { CostSummaryMini } from "@/components/common/CostSummaryMini";
import { TaskQueueMini } from "@/components/common/TaskQueueMini";
import {
  CostBreakdownPanel,
  type DashboardCost,
  type DashboardCostSummary,
} from "@/components/dashboard/CostBreakdownPanel";
import {
  DashboardStats,
  type DashboardStat,
} from "@/components/dashboard/DashboardStats";
import { ModelHealthPanel } from "@/components/dashboard/ModelHealthPanel";
import type { DashboardProject } from "@/components/dashboard/ProjectCard";
import { ProjectGrid } from "@/components/dashboard/ProjectGrid";
import {
  RecentTaskPanel,
  type DashboardTask,
  type DashboardTaskStatus,
  type DashboardTaskType,
} from "@/components/dashboard/RecentTaskPanel";
import { RecentAgentRunPanel } from "@/components/dashboard/RecentAgentRunPanel";
import { AppShell } from "@/components/layout/AppShell";
import { getCharacter } from "@/lib/api/characters";
import { API_BASE_URL } from "@/lib/api/config";
import {
  getProjectAssets,
  getProjectCosts,
  getProjectExportPlan,
  getProjects,
  getProjectTasks,
} from "@/lib/api/projects";
import type {
  ApiAsset,
  ApiCharacter,
  ApiCostRecord,
  ApiExportPlan,
  ApiGenerationTask,
  ApiProject,
} from "@/lib/api/types";

export const dynamic = "force-dynamic";

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "number" ? value : Number(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getTimelineShotCount(exportPlan?: ApiExportPlan) {
  const shots = exportPlan?.timeline?.shots;

  return Array.isArray(shots) ? shots.length : 0;
}

function mapTaskStatus(status: ApiGenerationTask["status"]): DashboardTaskStatus {
  if (status === "running") return "processing";
  if (status === "succeeded") return "completed";
  if (status === "failed" || status === "cancelled") return "failed";
  return "queued";
}

function mapTaskType(type: ApiGenerationTask["type"]): DashboardTaskType {
  if (type === "video") return "video";
  if (type === "tts") return "tts";
  if (type === "prompt_optimize") return "agent";
  if (type === "subtitle") return "export";
  return "image";
}

function mapProjectStage(
  tasks: ApiGenerationTask[],
  assets: ApiAsset[],
  exportPlan?: ApiExportPlan,
): DashboardProject["stage"] {
  if (exportPlan?.status === "ready" || exportPlan?.status === "exported") {
    return "素材审核";
  }
  if (tasks.some((task) => task.status === "running" || task.status === "queued")) {
    return "素材生成";
  }
  if (assets.some((asset) => asset.status === "rejected")) {
    return "需复核";
  }
  return "分镜确认";
}

function buildDashboardProject(
  project: ApiProject,
  character: ApiCharacter | null,
  tasks: ApiGenerationTask[],
  assets: ApiAsset[],
  costs: ApiCostRecord[],
  exportPlan?: ApiExportPlan,
): DashboardProject {
  const acceptedImages = assets.filter(
    (asset) => asset.type === "image" && asset.status === "accepted",
  ).length;
  const acceptedVideos = assets.filter(
    (asset) => asset.type === "video" && asset.status === "accepted",
  ).length;
  const failedTasks = tasks.filter((task) => task.status === "failed").length;
  const runningTasks = tasks.filter((task) => task.status === "running").length;
  const totalCost = costs.reduce(
    (sum, cost) => sum + toNumber(cost.amount),
    0,
  );
  const shotCount = getTimelineShotCount(exportPlan);

  return {
    id: project.id,
    title: project.name,
    characterName: character?.name ?? "当前角色",
    yinggeRole: character?.yingge_role ?? "英歌角色",
    stage: mapProjectStage(tasks, assets, exportPlan),
    shotCount,
    panelCount: shotCount * 2,
    acceptedImageCount: acceptedImages,
    acceptedVideoCount: acceptedVideos,
    failedTaskCount: failedTasks,
    runningTaskCount: runningTasks,
    totalCost,
    updatedAt: formatDate(project.updated_at),
    readiness: exportPlan?.status === "ready" ? 78 : 48,
    coverImage: "cinnabar",
    tags: [
      project.platform ?? "抖音 / TikTok",
      project.aspect_ratio ?? "9:16",
      `${project.duration_seconds ?? 45}s`,
    ],
  };
}

function buildStats(
  projects: ApiProject[],
  tasks: ApiGenerationTask[],
  assets: ApiAsset[],
  costs: ApiCostRecord[],
): DashboardStat[] {
  const runningTasks = tasks.filter((task) => task.status === "running").length;
  const failedTasks = tasks.filter((task) => task.status === "failed").length;
  const acceptedAssets = assets.filter((asset) => asset.status === "accepted").length;
  const acceptedVideos = assets.filter(
    (asset) => asset.status === "accepted" && asset.type === "video",
  ).length;
  const totalCost = costs.reduce((sum, cost) => sum + toNumber(cost.amount), 0);

  return [
    {
      label: "当前项目",
      value: `${projects.length}`,
      hint: "来自后端 API",
      status: "processing",
    },
    {
      label: "已采纳素材",
      value: `${acceptedAssets}`,
      hint: "图片 / 视频 / 音频 / 字幕",
      status: "success",
    },
    {
      label: "运行中任务",
      value: `${runningTasks}`,
      hint: "GenerationTask 状态",
      status: "warning",
    },
    {
      label: "已采纳视频",
      value: `${acceptedVideos}`,
      hint: "可进入成片库",
      status: "success",
    },
    {
      label: "失败任务",
      value: `${failedTasks}`,
      hint: "需人工复盘",
      status: failedTasks > 0 ? "error" : "muted",
    },
    {
      label: "本轮成本",
      value: `¥${totalCost.toFixed(2)}`,
      hint: "CostRecord 汇总",
      status: "warning",
    },
  ];
}

function buildTasks(tasks: ApiGenerationTask[]): DashboardTask[] {
  return tasks.map((task) => ({
    id: task.id,
    type: mapTaskType(task.type),
    provider: task.provider ?? "mock",
    model: task.model ?? "未确认模型",
    status: mapTaskStatus(task.status),
    shotId: task.shot_id?.slice(-4) ?? "未绑定镜头",
    panelId: task.panel_id?.slice(-4) ?? "未绑定面板",
    cost: toNumber(task.actual_cost ?? task.estimated_cost),
    startedAt: formatDate(task.created_at),
    failureReason: task.failure_reason ?? undefined,
    title: `${task.type} · ${task.status}`,
  }));
}

function buildCosts(costs: ApiCostRecord[]): {
  costs: DashboardCost[];
  summary: DashboardCostSummary;
} {
  const total = costs.reduce((sum, cost) => sum + toNumber(cost.amount), 0);
  const costItems = costs.map((cost) => {
    const amount = toNumber(cost.amount);

    return {
      id: cost.id,
      label: cost.type === "estimated" ? "预估成本" : "实际成本",
      model: cost.model ?? "未确认模型",
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    };
  });

  return {
    costs: costItems,
    summary: {
      month: total,
      nextEstimated: costItems[0]?.amount ?? 0,
      budgetUsedPercent: Math.min(100, Math.round(total)),
    },
  };
}

function ApiStateCard({
  title,
  description,
  detail,
}: {
  title: string;
  description: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-[color:rgba(233,195,73,0.22)] bg-[linear-gradient(180deg,rgba(39,35,25,0.78),rgba(24,25,24,0.72))] p-6">
      <p className="text-sm font-semibold text-[var(--accent-gold)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
      {detail ? (
        <p className="mt-3 rounded border border-[color:rgba(111,132,144,0.2)] bg-black/20 p-3 font-mono text-xs text-[var(--text-muted)]">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

type DashboardLoadResult =
  | {
      status: "ok";
      projects: ApiProject[];
      currentProject?: ApiProject;
      tasks: ApiGenerationTask[];
      assets: ApiAsset[];
      costs: ApiCostRecord[];
      exportPlan?: ApiExportPlan;
      character: ApiCharacter | null;
    }
  | {
      status: "error";
      message: string;
    };

async function loadDashboardData(): Promise<DashboardLoadResult> {
  try {
    const projects = await getProjects();

    if (projects.length === 0) {
      return {
        status: "ok",
        projects,
        tasks: [],
        assets: [],
        costs: [],
        character: null,
      };
    }

    const currentProject = projects[0];
    const [tasks, assets, costs, exportPlanResult, characterResult] =
      await Promise.allSettled([
        getProjectTasks(currentProject.id),
        getProjectAssets(currentProject.id),
        getProjectCosts(currentProject.id),
        getProjectExportPlan(currentProject.id),
        currentProject.current_character_id
          ? getCharacter(currentProject.current_character_id)
          : Promise.resolve(null),
      ]);

    const tasksData: ApiGenerationTask[] =
      tasks.status === "fulfilled" ? tasks.value : [];
    const assetsData: ApiAsset[] =
      assets.status === "fulfilled" ? assets.value : [];
    const costsData: ApiCostRecord[] =
      costs.status === "fulfilled" ? costs.value : [];
    const exportPlan =
      exportPlanResult.status === "fulfilled" ? exportPlanResult.value : undefined;
    const character =
      characterResult.status === "fulfilled" ? characterResult.value : null;

    return {
      status: "ok",
      projects,
      currentProject,
      tasks: tasksData,
      assets: assetsData,
      costs: costsData,
      exportPlan,
      character,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "未知错误",
    };
  }
}

export default async function DashboardPage() {
  const data = await loadDashboardData();

  if (data.status === "error") {
    return (
      <AppShell
        title="项目总览"
        eyebrow="AI Yingge Drama Studio"
        subtitle="管理英歌水浒人物介绍短片的生产进度、任务队列、模型状态和成本。"
        inspectorType="task"
        inspectorTitle="任务检查"
        inspectorDescription="后端 API 暂不可用。"
        currentStage="项目总览"
      >
        <ApiStateCard
          title="后端 API 连接失败"
          description="页面已进入错误态，没有白屏。请确认 FastAPI 后端正在 8000 端口运行。"
          detail={`${API_BASE_URL} · ${data.message}`}
        />
      </AppShell>
    );
  }

  if (!data.currentProject) {
    return (
      <AppShell
        title="项目总览"
        eyebrow="AI Yingge Drama Studio"
        subtitle="管理英歌水浒人物介绍短片的生产进度、任务队列、模型状态和成本。"
        inspectorType="task"
        inspectorTitle="任务检查"
        inspectorDescription="后端 API 已连接，但当前没有项目数据。"
        currentStage="项目总览"
      >
        <ApiStateCard
          title="暂无项目数据"
          description="后端返回了空项目列表。请确认已执行 Backend Phase 6 seed 脚本。"
        />
      </AppShell>
    );
  }

  const dashboardProject = buildDashboardProject(
    data.currentProject,
    data.character,
    data.tasks,
    data.assets,
    data.costs,
    data.exportPlan,
  );
  const costBreakdown = buildCosts(data.costs);
  const taskSummary = {
    running: data.tasks.filter((task) => task.status === "running").length,
    queued: data.tasks.filter(
      (task) => task.status === "queued" || task.status === "pending",
    ).length,
    failed: data.tasks.filter((task) => task.status === "failed").length,
    completed: data.tasks.filter((task) => task.status === "succeeded").length,
  };

  return (
      <AppShell
        title="项目总览"
        eyebrow="AI Yingge Drama Studio"
        subtitle="管理英歌水浒人物介绍短片的生产进度、任务队列、模型状态和成本。"
        inspectorType="task"
        inspectorTitle="任务检查"
        inspectorDescription="全局任务队列、成本摘要与最近 Agent 运行入口。"
        currentStage="项目总览"
        actions={
          <button
            type="button"
            className="rounded bg-[var(--accent-cinnabar)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(154,45,38,0.28)]"
          >
            新建英歌短片项目
          </button>
        }
        rightInspector={
          <div className="space-y-4">
            <TaskQueueMini summary={taskSummary} />
            <CostSummaryMini
              month={costBreakdown.summary.month}
              nextEstimated={costBreakdown.summary.nextEstimated}
              today={costBreakdown.summary.nextEstimated}
            />
            <AgentRunMini />
          </div>
        }
      >
        <div className="space-y-5">
          <DashboardStats
            stats={buildStats(data.projects, data.tasks, data.assets, data.costs)}
          />
          <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-5">
            <div className="space-y-5">
              <ProjectGrid projects={[dashboardProject]} />
            </div>
            <div className="space-y-5">
              <RecentTaskPanel tasks={buildTasks(data.tasks)} />
              <ModelHealthPanel />
              <CostBreakdownPanel
                costs={costBreakdown.costs}
                summary={costBreakdown.summary}
              />
              <RecentAgentRunPanel />
            </div>
          </div>
        </div>
      </AppShell>
  );
}
