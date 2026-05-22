import { StatusBadge } from "@/components/common/StatusBadge";
import type { MockGenerationTask } from "@/data/mock/generationTasks";

const statusTone = {
  queued: "muted",
  processing: "processing",
  completed: "success",
  failed: "error",
} as const;

const statusLabel = {
  queued: "排队中",
  processing: "生成中",
  completed: "已完成",
  failed: "失败",
};

type GenerationTaskStatusProps = {
  task: MockGenerationTask;
};

export function GenerationTaskStatus({ task }: GenerationTaskStatusProps) {
  return (
    <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">{task.model}</p>
          <p className="mt-1 text-sm text-[var(--text-primary)]">{task.mode}</p>
        </div>
        <StatusBadge status={statusTone[task.status]}>{statusLabel[task.status]}</StatusBadge>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-jade),var(--accent-gold))]"
          style={{ width: `${task.progress}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[var(--text-muted)]">
        <span>Task：{task.id}</span>
        <span>预计 ¥{task.estimatedCost.toFixed(2)}</span>
      </div>
      {task.failureReason ? (
        <p className="mt-2 text-xs leading-5 text-[var(--status-error)]">{task.failureReason}</p>
      ) : null}
    </div>
  );
}
