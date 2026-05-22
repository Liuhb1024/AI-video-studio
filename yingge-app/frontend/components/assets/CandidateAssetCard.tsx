import { ImageIcon, Mic2, Subtitles, Video } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { MockAudioAsset } from "@/data/mock/audioAssets";
import type { MockImageAsset } from "@/data/mock/imageAssets";
import type { MockSubtitleAsset } from "@/data/mock/subtitleAssets";
import type { MockVideoAsset } from "@/data/mock/videoAssets";
import { FailureReasonChips } from "./FailureReasonChips";

type CandidateAssetCardProps = {
  asset: MockImageAsset | MockVideoAsset | MockAudioAsset | MockSubtitleAsset;
  type: "image" | "video" | "audio" | "subtitle";
};

const iconMap = {
  image: ImageIcon,
  video: Video,
  audio: Mic2,
  subtitle: Subtitles,
};

function getStatus(status: string) {
  if (status === "accepted") return { tone: "success" as const, label: "已采纳" };
  if (status === "rejected") return { tone: "error" as const, label: "已拒绝" };
  return { tone: "processing" as const, label: "候选" };
}

function getStatusClass(status: string) {
  if (status === "accepted") {
    return {
      card: "border-[color:rgba(14,107,8,0.36)] bg-[linear-gradient(180deg,rgba(14,107,8,0.12),rgba(28,27,27,0.72))]",
      bar: "bg-[var(--status-success)]",
    };
  }

  if (status === "rejected") {
    return {
      card: "border-[color:rgba(255,107,95,0.34)] bg-[linear-gradient(180deg,rgba(147,0,10,0.14),rgba(28,27,27,0.72))]",
      bar: "bg-[var(--status-error)]",
    };
  }

  return {
    card: "border-[color:rgba(233,195,73,0.28)] bg-[linear-gradient(180deg,rgba(233,195,73,0.08),rgba(28,27,27,0.72))]",
    bar: "bg-[var(--accent-gold)]",
  };
}

export function CandidateAssetCard({ asset, type }: CandidateAssetCardProps) {
  const Icon = iconMap[type];
  const status = getStatus(asset.status);
  const statusClass = getStatusClass(asset.status);
  const hasVisual = type === "image" || type === "video";
  const title =
    "thumbnail" in asset
      ? asset.thumbnail
      : "voice" in asset
        ? asset.voice
        : asset.text.slice(0, 18);
  const cost = "cost" in asset ? asset.cost : 0;
  const reasons = "failureReasons" in asset ? asset.failureReasons : [];

  return (
    <article className={`overflow-hidden rounded-lg border ${statusClass.card}`}>
      <div className={`h-1 ${statusClass.bar}`} />
      {hasVisual ? (
        <div className="h-20 bg-[radial-gradient(circle_at_35%_24%,rgba(178,34,34,0.26),transparent_30%),linear-gradient(135deg,rgba(61,55,49,0.88),rgba(11,11,10,0.96))] p-2">
          <span className="rounded bg-black/35 px-2 py-1 text-[10px] text-white/75">{title}</span>
        </div>
      ) : null}
      <div className="space-y-2 p-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-1 text-[var(--text-primary)]">
            <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--accent-bluegray)]" />
            <span className="truncate">{title}</span>
          </span>
          <StatusBadge status={status.tone}>{status.label}</StatusBadge>
        </div>
        {"model" in asset ? <p className="text-[var(--text-muted)]">{asset.model}</p> : null}
        <div className="flex items-center justify-between text-[11px] text-[var(--accent-gold)]">
          <span>成本 ¥{cost.toFixed(2)}</span>
          {"consistencyScore" in asset ? <span>一致性 {asset.consistencyScore}%</span> : null}
        </div>
        <div className="rounded bg-black/12 p-1">
          <FailureReasonChips codes={reasons} />
        </div>
      </div>
    </article>
  );
}
