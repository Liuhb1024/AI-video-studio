import { CostBadge } from "@/components/common/CostBadge";
import { assetReviewSummary } from "@/data/mock/assetReview";

export function CostSummaryPanel() {
  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">Cost Summary</p>
          <h2 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">成片汇总</h2>
        </div>
        <CostBadge amount={`¥${assetReviewSummary.totalCost.toFixed(2)}`} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
        {[
          ["图像", "45 / 48", "已接受"],
          ["视频", "32 / 36", "已接受"],
          ["音频", "6 / 6", "已接受"],
          ["字幕", "6 / 6", "已接受"],
        ].map(([label, value, status]) => (
          <div key={label} className="rounded border border-[color:rgba(111,132,144,0.16)] bg-black/15 p-3">
            <p className="text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">{value}</p>
            <p className="mt-1 text-[var(--status-success)]">{status}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs text-[var(--text-muted)]">成片就绪度</span>
        <div className="h-1.5 flex-1 rounded-full bg-black/30">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-jade),var(--accent-gold))]" style={{ width: `${assetReviewSummary.readiness}%` }} />
        </div>
        <span className="font-mono text-xs text-[var(--status-success)]">{assetReviewSummary.readiness}%</span>
      </div>
    </section>
  );
}
