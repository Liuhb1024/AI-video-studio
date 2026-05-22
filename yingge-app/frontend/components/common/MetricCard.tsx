import { cn } from "@/lib/utils";
import type { StatusBadgeStatus } from "./StatusBadge";

const metricStatusClassName: Record<StatusBadgeStatus, string> = {
  success: "text-[var(--status-success)]",
  warning: "text-[var(--status-warning)]",
  error: "text-[var(--status-error)]",
  processing: "text-[var(--status-processing)]",
  muted: "text-[var(--text-muted)]",
};

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  status?: StatusBadgeStatus;
  className?: string;
};

export function MetricCard({
  label,
  value,
  hint,
  status = "muted",
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(35,38,37,0.86),rgba(24,25,24,0.78))] p-4 shadow-[inset_0_1px_0_rgba(233,195,73,0.06)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(178,34,34,0.3),rgba(233,195,73,0.22),transparent)]" />
      <p className="relative text-xs text-[var(--text-muted)]">{label}</p>
      <p
        className={cn(
          "relative mt-2 font-mono text-2xl font-semibold",
          metricStatusClassName[status],
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="relative mt-2 text-xs text-[var(--text-secondary)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
