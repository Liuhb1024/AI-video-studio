import { CostBadge } from "@/components/common/CostBadge";
import { SectionCard } from "@/components/common/SectionCard";
import { costs, costSummary } from "@/data/mock/costs";

export type DashboardCost = {
  id: string;
  label: string;
  model: string;
  amount: number;
  percent: number;
};

export type DashboardCostSummary = {
  month: number;
  nextEstimated: number;
  budgetUsedPercent: number;
};

type CostBreakdownPanelProps = {
  costs?: DashboardCost[];
  summary?: DashboardCostSummary;
};

export function CostBreakdownPanel({
  costs: costItems = costs,
  summary = costSummary,
}: CostBreakdownPanelProps) {
  return (
    <SectionCard
      title="成本拆解"
      description="按生成类型统计的本月 Mock 成本。"
      actions={<CostBadge amount={`¥${summary.month.toFixed(2)}`} label="本月" />}
    >
      <div className="space-y-4">
        {costItems.map((cost) => (
          <div
            key={cost.id}
            className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/12 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <div>
                <span className="font-medium text-[var(--text-primary)]">
                  {cost.label}
                </span>
                <span className="ml-2 text-xs text-[var(--text-muted)]">
                  {cost.model}
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--accent-gold)]">
                ¥{cost.amount.toFixed(2)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/35">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-cinnabar),var(--accent-gold))]"
                style={{ width: `${cost.percent}%` }}
              />
            </div>
          </div>
        ))}
        <div className="rounded border border-[color:rgba(233,195,73,0.22)] bg-[color:rgba(233,195,73,0.07)] p-3 text-xs text-[var(--text-secondary)]">
          预算使用率 {summary.budgetUsedPercent}% · 预计下次任务 ¥
          {summary.nextEstimated.toFixed(2)}
        </div>
      </div>
    </SectionCard>
  );
}
