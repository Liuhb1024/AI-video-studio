import { CostBadge } from "./CostBadge";

type CostSummaryMiniProps = {
  today?: number;
  month?: number;
  nextEstimated?: number;
};

export function CostSummaryMini({
  today = 12.8,
  month = 128.4,
  nextEstimated = 3.2,
}: CostSummaryMiniProps) {
  return (
    <div className="shrink-0 rounded-lg border border-[color:rgba(233,195,73,0.22)] bg-[linear-gradient(180deg,rgba(39,35,25,0.78),rgba(24,25,24,0.72))] px-3 py-2 shadow-[inset_0_1px_0_rgba(233,195,73,0.1)]">
      <p className="whitespace-nowrap text-xs text-[var(--text-secondary)]">成本摘要</p>
      <div className="mt-2 flex items-center gap-2 whitespace-nowrap">
        <CostBadge amount={`¥${today.toFixed(2)}`} label="今日" />
        <CostBadge amount={`¥${month.toFixed(2)}`} label="本月" />
        <span className="text-xs text-[var(--text-muted)]">
          预计下次任务 ¥{nextEstimated.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
