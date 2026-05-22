import { ChevronDown } from "lucide-react";
import { ModelCapabilityBadge } from "@/components/common/ModelCapabilityBadge";

type ModelSelectorProps = {
  label: string;
  model: string;
  costHint: string;
  capabilities: string[];
};

export function ModelSelector({ label, model, costHint, capabilities }: ModelSelectorProps) {
  return (
    <div className="rounded border border-[color:rgba(111,132,144,0.22)] bg-black/15 p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3 rounded border border-[color:rgba(233,195,73,0.18)] bg-[color:rgba(233,195,73,0.06)] px-3 py-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">{model}</span>
        <ChevronDown className="h-4 w-4 text-[var(--accent-gold)]" />
      </div>
      <p className="mt-2 text-xs text-[var(--accent-gold)]">{costHint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {capabilities.map((item) => (
          <ModelCapabilityBadge key={item} label={item} />
        ))}
      </div>
    </div>
  );
}
