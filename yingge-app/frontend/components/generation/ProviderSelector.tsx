import { Server } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

type ProviderSelectorProps = {
  provider: string;
  status?: "healthy" | "warning";
};

export function ProviderSelector({ provider, status = "healthy" }: ProviderSelectorProps) {
  return (
    <div className="rounded border border-[color:rgba(111,132,144,0.22)] bg-black/15 p-3">
      <p className="text-xs text-[var(--text-muted)]">服务商 Provider</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)]">
          <Server className="h-4 w-4 text-[var(--accent-bluegray)]" />
          {provider}
        </span>
        <StatusBadge status={status === "healthy" ? "success" : "warning"}>
          {status === "healthy" ? "正常" : "预警"}
        </StatusBadge>
      </div>
    </div>
  );
}
