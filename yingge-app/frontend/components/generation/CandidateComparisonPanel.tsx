import { Check, X } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { videoAssets } from "@/data/mock/videoAssets";

export function CandidateComparisonPanel() {
  return (
    <div className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-black/15 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">候选视频对比</p>
        <span className="text-xs text-[var(--text-muted)]">同一 Panel 保留多候选</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {videoAssets.slice(0, 3).map((asset) => (
          <article key={asset.id} className="overflow-hidden rounded border border-[color:rgba(111,132,144,0.18)] bg-[color:rgba(28,27,27,0.72)]">
            <div className="h-24 bg-[radial-gradient(circle_at_35%_24%,rgba(233,195,73,0.2),transparent_28%),linear-gradient(135deg,rgba(69,57,48,0.88),rgba(12,12,11,0.96))] p-2">
              <span className="rounded bg-black/35 px-2 py-1 text-[10px] text-white/75">{asset.thumbnail}</span>
            </div>
            <div className="space-y-2 p-2 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={asset.status === "accepted" ? "success" : asset.status === "rejected" ? "error" : "processing"}>
                  {asset.status === "accepted" ? "已采纳" : asset.status === "rejected" ? "已拒绝" : "候选"}
                </StatusBadge>
                <span className="text-[var(--accent-gold)]">{asset.consistencyScore}%</span>
              </div>
              <p className="text-[var(--text-muted)]">{asset.mode}</p>
              <div className="flex gap-1">
                <button type="button" className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-[color:rgba(14,107,8,0.22)] px-2 py-1 text-[var(--status-success)]"><Check className="h-3 w-3" />采纳</button>
                <button type="button" className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-[color:rgba(147,0,10,0.2)] px-2 py-1 text-[var(--status-error)]"><X className="h-3 w-3" />拒绝</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
