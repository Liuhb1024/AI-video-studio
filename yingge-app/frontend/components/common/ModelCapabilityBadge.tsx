import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ModelCapabilityBadgeProps = {
  label: string;
  active?: boolean;
  className?: string;
};

export function ModelCapabilityBadge({
  label,
  active = true,
  className,
}: ModelCapabilityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs",
        active
          ? "border-[color:rgba(122,166,194,0.34)] bg-[color:rgba(111,132,144,0.16)] text-[var(--status-processing)]"
          : "border-[color:rgba(143,129,125,0.2)] bg-[color:rgba(53,53,53,0.18)] text-[var(--text-muted)]",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}
