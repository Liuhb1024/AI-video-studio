import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type ProviderHealth = "healthy" | "warning" | "error" | "idle";

const providerHealthClassName: Record<ProviderHealth, string> = {
  healthy:
    "border-[color:rgba(130,219,111,0.32)] bg-[color:rgba(14,107,8,0.18)] text-[var(--status-success)]",
  warning:
    "border-[color:rgba(233,195,73,0.34)] bg-[color:rgba(175,141,17,0.16)] text-[var(--status-warning)]",
  error:
    "border-[color:rgba(255,107,95,0.34)] bg-[color:rgba(147,0,10,0.18)] text-[var(--status-error)]",
  idle: "border-[color:rgba(143,129,125,0.2)] bg-[color:rgba(53,53,53,0.18)] text-[var(--text-muted)]",
};

const providerHealthLabel: Record<ProviderHealth, string> = {
  healthy: "正常",
  warning: "预警",
  error: "异常",
  idle: "空闲",
};

type ProviderHealthBadgeProps = {
  provider: string;
  health: ProviderHealth;
  className?: string;
};

export function ProviderHealthBadge({
  provider,
  health,
  className,
}: ProviderHealthBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs",
        providerHealthClassName[health],
        className,
      )}
    >
      <Activity className="h-3 w-3" aria-hidden="true" />
      {provider} {providerHealthLabel[health]}
    </span>
  );
}
