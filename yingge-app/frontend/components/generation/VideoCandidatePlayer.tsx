import { Maximize2, Pause, Play } from "lucide-react";
import type { MockVideoAsset } from "@/data/mock/videoAssets";

type VideoCandidatePlayerProps = {
  video: MockVideoAsset;
};

export function VideoCandidatePlayer({ video }: VideoCandidatePlayerProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-black/25">
      <div className="relative h-56 bg-[radial-gradient(circle_at_38%_22%,rgba(178,34,34,0.32),transparent_28%),radial-gradient(circle_at_68%_26%,rgba(233,195,73,0.18),transparent_22%),linear-gradient(135deg,rgba(54,57,55,0.92),rgba(9,9,8,0.96))]">
        <div className="absolute left-5 top-5 rounded border border-white/12 bg-black/24 px-3 py-2 text-xs text-white/75">
          {video.thumbnail}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
          <div className="flex items-center gap-3 text-white">
            <Play className="h-4 w-4" />
            <Pause className="h-4 w-4 text-white/45" />
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/18">
              <div className="h-full w-2/5 rounded-full bg-[var(--accent-gold)]" />
            </div>
            <span className="font-mono text-xs">{video.duration}</span>
            <Maximize2 className="h-4 w-4 text-white/65" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-px bg-[color:rgba(111,132,144,0.12)] text-xs">
        {[
          ["模型", video.model],
          ["模式", video.mode],
          ["分辨率", `${video.resolution} ${video.aspectRatio}`],
          ["成本", `¥${video.cost.toFixed(2)}`],
        ].map(([label, value]) => (
          <div key={label} className="bg-[color:rgba(28,27,27,0.84)] p-3">
            <p className="text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 text-[var(--text-primary)]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
