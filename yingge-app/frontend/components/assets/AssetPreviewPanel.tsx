import { Check, RotateCcw, X } from "lucide-react";
import { CostBadge } from "@/components/common/CostBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { videoAssets } from "@/data/mock/videoAssets";
import { VideoCandidatePlayer } from "@/components/generation/VideoCandidatePlayer";

export function AssetPreviewPanel() {
  const video = videoAssets[1];

  return (
    <section className="space-y-4 rounded-xl border border-[color:rgba(14,107,8,0.34)] bg-[linear-gradient(180deg,rgba(36,47,39,0.9),rgba(24,25,24,0.8))] p-4 shadow-[0_24px_62px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(125,180,132,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">当前审片素材 / Review Room</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">视频预览 · 已接受最终版</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Shot 02 · 景阳冈逼近 · 生视频候选 02 已锁定为成片主版本。</p>
        </div>
        <StatusBadge status="success">已接受（最终版）</StatusBadge>
      </div>
      <VideoCandidatePlayer video={video} />
      <div className="grid grid-cols-4 gap-2 text-xs">
        {[
          ["审核状态", "最终版已锁定"],
          ["当前轮次", "第 3 轮重试"],
          ["一致性", `${video.consistencyScore}%`],
          ["动作强度", `${video.motionStrength}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-[color:rgba(14,107,8,0.18)] bg-[color:rgba(14,107,8,0.1)] p-2">
            <p className="text-[var(--status-success)]">{label}</p>
            <p className="mt-1 font-mono text-[var(--accent-gold)]">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 text-xs">
        {[
          ["模型", video.model],
          ["关键帧", "源自图像 01-03"],
          ["提示词版本", "v2.1"],
          ["Task id", "task-video-021"],
          ["生成时间", video.createdAt],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-[color:rgba(111,132,144,0.16)] bg-black/15 p-2">
            <p className="text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 truncate text-[var(--text-primary)]">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
        <p className="text-xs text-[var(--accent-gold)]">视频提示词</p>
        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">武松在景阳冈山林中向前踏步，虎影从烟尘后压近，镜头低机位环绕，哨棒随鼓点短促横扫。</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <CostBadge amount={`¥${video.cost.toFixed(2)}`} label="实际成本" />
        <div className="flex gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded bg-[color:rgba(14,107,8,0.24)] px-3 py-2 text-xs text-[var(--status-success)]"><Check className="h-3.5 w-3.5" />已接受为最终版本</button>
          <button type="button" className="inline-flex items-center gap-2 rounded border border-[color:rgba(233,195,73,0.28)] px-3 py-2 text-xs text-[var(--accent-gold)]"><RotateCcw className="h-3.5 w-3.5" />重新生成</button>
          <button type="button" className="inline-flex items-center gap-2 rounded bg-[color:rgba(147,0,10,0.22)] px-3 py-2 text-xs text-[var(--status-error)]"><X className="h-3.5 w-3.5" />拒绝此版本</button>
        </div>
      </div>
    </section>
  );
}
