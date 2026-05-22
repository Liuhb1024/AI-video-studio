import { CostBadge } from "@/components/common/CostBadge";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge, type StatusBadgeStatus } from "@/components/common/StatusBadge";
import { tasks, type MockTaskStatus, type MockTaskType } from "@/data/mock/tasks";

export type DashboardTaskType = MockTaskType;
export type DashboardTaskStatus = MockTaskStatus;

export type DashboardTask = {
  id: string;
  type: DashboardTaskType;
  provider: string;
  model: string;
  status: DashboardTaskStatus;
  shotId: string;
  panelId: string;
  cost: number;
  startedAt: string;
  failureReason?: string;
  title: string;
};

const statusMeta: Record<
  DashboardTaskStatus,
  { label: string; status: StatusBadgeStatus }
> = {
  queued: { label: "排队中", status: "muted" },
  processing: { label: "处理中", status: "processing" },
  completed: { label: "已完成", status: "success" },
  failed: { label: "失败", status: "error" },
};

const typeLabel: Record<DashboardTaskType, string> = {
  image: "生图",
  video: "生视频",
  tts: "TTS",
  agent: "Agent",
  export: "导出",
};

const typeClassName: Record<DashboardTaskType, string> = {
  image: "border-[color:rgba(130,219,111,0.24)] bg-[color:rgba(14,107,8,0.12)] text-[var(--status-success)]",
  video: "border-[color:rgba(178,34,34,0.28)] bg-[color:rgba(178,34,34,0.13)] text-[var(--accent-cinnabar)]",
  tts: "border-[color:rgba(233,195,73,0.24)] bg-[color:rgba(233,195,73,0.1)] text-[var(--accent-gold)]",
  agent: "border-[color:rgba(122,166,194,0.28)] bg-[color:rgba(111,132,144,0.14)] text-[var(--status-processing)]",
  export: "border-[color:rgba(143,129,125,0.22)] bg-black/20 text-[var(--text-muted)]",
};

type RecentTaskPanelProps = {
  tasks?: DashboardTask[];
};

export function RecentTaskPanel({ tasks: taskItems = tasks }: RecentTaskPanelProps) {
  return (
    <SectionCard
      title="最近任务"
      description="任务队列摘要，预留后续任务详情入口。"
    >
      <div className="space-y-3">
        {taskItems.map((task) => {
          const meta = statusMeta[task.status];

          return (
            <div
              key={task.id}
              className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {task.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded border px-2 py-1 text-[11px] ${typeClassName[task.type]}`}
                    >
                      {typeLabel[task.type]}
                    </span>
                    <p className="text-xs text-[var(--text-muted)]">
                      {task.provider} · {task.model}
                    </p>
                  </div>
                </div>
                <StatusBadge status={meta.status}>{meta.label}</StatusBadge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--text-muted)]">
                  {task.shotId} / {task.panelId} · {task.startedAt}
                </p>
                <CostBadge amount={`¥${task.cost.toFixed(2)}`} />
              </div>
              {task.failureReason ? (
                <p className="mt-2 text-xs text-[var(--status-error)]">
                  失败原因：{task.failureReason}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
