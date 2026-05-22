import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

type CostBadgeProps = {
  amount: string;
  label?: string;
  className?: string;
};

export function CostBadge({ amount, label, className }: CostBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded border border-[color:rgba(233,195,73,0.28)] bg-[color:rgba(233,195,73,0.08)] px-2.5 py-1.5 text-xs text-[var(--accent-gold)]",
        className,
      )}
    >
      <Coins className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="font-mono font-semibold">{amount}</span>
      {label ? <span className="text-[var(--text-muted)]">{label}</span> : null}
    </span>
  );
}
