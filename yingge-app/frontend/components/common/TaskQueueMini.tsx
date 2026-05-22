import { ListChecks } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

const taskQueueSummary = {
  running: 3,
  queued: 5,
  failed: 1,
  completed: 18,
};

type TaskQueueMiniProps = {
  summary?: typeof taskQueueSummary;
};

export function TaskQueueMini({ summary = taskQueueSummary }: TaskQueueMiniProps) {
  return (
    <div className="shrink-0 rounded-lg border border-[color:rgba(111,132,144,0.28)] bg-[linear-gradient(180deg,rgba(35,38,37,0.9),rgba(24,25,24,0.76))] px-3 py-2 shadow-[inset_0_1px_0_rgba(122,166,194,0.08)]">
      <div className="flex items-center gap-2 whitespace-nowrap text-xs text-[var(--text-secondary)]">
        <ListChecks className="h-4 w-4 text-[var(--status-processing)]" aria-hidden="true" />
        <span>任务队列</span>
      </div>
      <div className="mt-2 flex items-center gap-2 whitespace-nowrap">
        <StatusBadge status="processing">运行中 {summary.running}</StatusBadge>
        <span className="font-mono text-xs text-[var(--text-muted)]">
          排队中 {summary.queued}
        </span>
        <span className="font-mono text-xs text-[var(--status-error)]">
          失败 {summary.failed}
        </span>
      </div>
    </div>
  );
}
