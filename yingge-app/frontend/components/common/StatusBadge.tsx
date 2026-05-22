import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusBadgeStatus =
  | "success"
  | "warning"
  | "error"
  | "processing"
  | "muted";

const statusClassName: Record<StatusBadgeStatus, string> = {
  success:
    "border-[color:rgba(130,219,111,0.34)] bg-[color:rgba(14,107,8,0.22)] text-[var(--status-success)]",
  warning:
    "border-[color:rgba(233,195,73,0.34)] bg-[color:rgba(175,141,17,0.18)] text-[var(--status-warning)]",
  error:
    "border-[color:rgba(255,107,95,0.34)] bg-[color:rgba(147,0,10,0.2)] text-[var(--status-error)]",
  processing:
    "border-[color:rgba(122,166,194,0.34)] bg-[color:rgba(111,132,144,0.18)] text-[var(--status-processing)]",
  muted:
    "border-[color:rgba(143,129,125,0.26)] bg-[color:rgba(53,53,53,0.34)] text-[var(--text-muted)]",
};

const statusLabel: Record<StatusBadgeStatus, string> = {
  success: "成功",
  warning: "预警",
  error: "异常",
  processing: "处理中",
  muted: "等待中",
};

type StatusBadgeProps = {
  status: StatusBadgeStatus;
  children?: ReactNode;
  className?: string;
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium",
        statusClassName[status],
        className,
      )}
      >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children ?? statusLabel[status]}
    </span>
  );
}
