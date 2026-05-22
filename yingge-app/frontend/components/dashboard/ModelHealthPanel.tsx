import { ModelCapabilityBadge } from "@/components/common/ModelCapabilityBadge";
import { ProviderHealthBadge } from "@/components/common/ProviderHealthBadge";
import { SectionCard } from "@/components/common/SectionCard";
import { models } from "@/data/mock/models";

export function ModelHealthPanel() {
  return (
    <SectionCard title="模型状态" description="Provider 健康与能力摘要。">
      <div className="space-y-3">
        {models.map((model) => (
          <div
            key={`${model.provider}-${model.modelName}`}
            className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {model.modelName}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {model.costHint}
                </p>
              </div>
              <ProviderHealthBadge provider={model.provider} health={model.health} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {model.capabilities.map((capability) => (
                <ModelCapabilityBadge key={capability} label={capability} />
              ))}
              {model.supportedModes.map((mode) => (
                <ModelCapabilityBadge
                  key={mode}
                  label={mode}
                  className="border-[color:rgba(233,195,73,0.22)] bg-[color:rgba(233,195,73,0.08)] text-[var(--accent-gold)]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
