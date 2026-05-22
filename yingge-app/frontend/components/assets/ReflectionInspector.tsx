import { AlertTriangle, Sparkles } from "lucide-react";
import { CostBadge } from "@/components/common/CostBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { assetReviewSummary } from "@/data/mock/assetReview";
import { AssetLineagePanel } from "./AssetLineagePanel";

export function ReflectionInspector() {
  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">拒绝原因统计</h3>
          <button type="button" className="text-xs text-[var(--text-muted)]">查看详情</button>
        </div>
        <div className="mt-3 space-y-2">
          {assetReviewSummary.rejectionStats.map(([label, count]) => (
            <div key={label} className="flex items-center justify-between border-b border-[color:rgba(111,132,144,0.12)] pb-2 text-xs">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className="font-mono text-[var(--status-error)]">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">模型失败模式</h3>
        <div className="mt-3 space-y-3">
          {assetReviewSummary.modelFailureModes.map(([model, note, status]) => (
            <div key={model} className="rounded border border-[color:rgba(111,132,144,0.16)] bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[var(--text-primary)]">{model}</span>
                <StatusBadge status={status === "稳定" ? "success" : status === "问题较多" ? "error" : "warning"}>{status}</StatusBadge>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <Sparkles className="h-4 w-4 text-[var(--accent-gold)]" />
          Prompt 改进建议
        </h3>
        <ul className="mt-3 space-y-2 text-xs leading-5 text-[var(--text-secondary)]">
          <li>加强英歌动作钟摆性描述，避免普通武打动作。</li>
          <li>强调脸谱红白纹样与对称结构，减少随机脸部干扰。</li>
          <li>减少背景干扰，突出角色主体和哨棒动作。</li>
        </ul>
      </section>

      <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <AlertTriangle className="h-4 w-4 text-[var(--status-warning)]" />
          成本与风险提醒
        </h3>
        <div className="mt-3 flex items-center justify-between gap-3">
          <CostBadge amount={`¥${assetReviewSummary.totalCost.toFixed(2)}`} label="本项目总成本" />
          <span className="text-xs text-[var(--text-muted)]">预算使用 71%</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-black/30">
          <div className="h-full w-[71%] rounded-full bg-[linear-gradient(90deg,var(--accent-jade),var(--accent-gold))]" />
        </div>
      </section>

      <AssetLineagePanel />
      <button type="button" className="w-full rounded border border-[color:rgba(233,195,73,0.28)] bg-[color:rgba(233,195,73,0.08)] px-4 py-3 text-sm font-semibold text-[var(--accent-gold)]">
        生成下一轮负面约束
      </button>
    </div>
  );
}
