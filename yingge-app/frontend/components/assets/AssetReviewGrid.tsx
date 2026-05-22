import { ChevronDown } from "lucide-react";
import { reviewAssetGroups } from "@/data/mock/assetReview";
import { shots } from "@/data/mock/shots";
import { CandidateAssetCard } from "./CandidateAssetCard";

export function AssetReviewGrid() {
  return (
    <section className="space-y-4 rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">素材审核网格 / Asset Review Grid</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">按镜头分组</h2>
        </div>
        <div className="flex rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-1 text-xs">
          <button type="button" className="rounded bg-[var(--accent-cinnabar)] px-3 py-1.5 text-white">按镜头分组</button>
          <button type="button" className="px-3 py-1.5 text-[var(--text-muted)]">按类型分组</button>
        </div>
      </div>
      {reviewAssetGroups.map((group, index) => {
        const shot = shots.find((item) => item.id === group.shotId);
        const acceptedCount = [
          ...group.imageAssets,
          ...group.videoAssets,
          ...group.audioAssets,
          ...group.subtitleAssets,
        ].filter((asset) => asset.status === "accepted").length;
        const rejectedCount = [...group.imageAssets, ...group.videoAssets].filter((asset) => asset.status === "rejected").length;

        return (
          <article
            key={group.shotId}
            className={index === 0 ? "rounded-lg border border-[color:rgba(178,34,34,0.36)] bg-[linear-gradient(180deg,rgba(178,34,34,0.1),rgba(0,0,0,0.12))] p-3 shadow-[0_0_26px_rgba(178,34,34,0.08)]" : "rounded-lg border border-[color:rgba(111,132,144,0.2)] bg-black/12 p-3"}
          >
            <div className="mb-3 flex items-center justify-between gap-3 rounded border border-[color:rgba(111,132,144,0.14)] bg-black/18 px-3 py-2">
              <div className="min-w-0">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <ChevronDown className="h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
                  <span className="truncate">镜头 {shot?.shotNo} · {shot?.title}</span>
                </h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  图像 {group.imageAssets.length} · 视频 {group.videoAssets.length} · 音频 {group.audioAssets.length} · 字幕 {group.subtitleAssets.length}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs">
                <span className="rounded bg-[color:rgba(14,107,8,0.2)] px-2 py-1 text-[var(--status-success)]">已采纳 {acceptedCount}</span>
                <span className="rounded bg-[color:rgba(147,0,10,0.18)] px-2 py-1 text-[var(--status-error)]">已拒绝 {rejectedCount}</span>
                <span className="rounded bg-black/20 px-2 py-1 text-[var(--text-muted)]">{shot?.duration}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs text-[var(--accent-gold)]">图像</p>
                <div className="grid grid-cols-3 gap-2">
                  {group.imageAssets.map((asset) => <CandidateAssetCard key={asset.id} asset={asset} type="image" />)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs text-[var(--accent-gold)]">视频</p>
                <div className="grid grid-cols-3 gap-2">
                  {group.videoAssets.map((asset) => <CandidateAssetCard key={asset.id} asset={asset} type="video" />)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.audioAssets.map((asset) => <CandidateAssetCard key={asset.id} asset={asset} type="audio" />)}
                {group.subtitleAssets.map((asset) => <CandidateAssetCard key={asset.id} asset={asset} type="subtitle" />)}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
