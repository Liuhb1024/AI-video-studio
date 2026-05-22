import { Clock, MapPin, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { MockPanel } from "@/data/mock/panels";
import type { MockShot } from "@/data/mock/shots";
import { PanelMiniCard } from "./PanelMiniCard";

type ShotCardProps = {
  shot: MockShot;
  panels: MockPanel[];
};

const consistencyStatus = {
  一致: "success",
  优秀: "success",
  预警: "warning",
} as const;

export function ShotCard({ shot, panels }: ShotCardProps) {
  return (
    <article className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(35,38,37,0.84),rgba(24,25,24,0.78))] p-4 shadow-[inset_0_1px_0_rgba(233,195,73,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded bg-[var(--accent-cinnabar)] px-2 py-1 font-mono text-xs font-semibold text-white">
              {shot.shotNo}
            </span>
            <h3 className="truncate text-base font-semibold text-[var(--text-primary)]">{shot.title}</h3>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{shot.duration}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{shot.scene}</span>
            <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />武松</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={consistencyStatus[shot.consistencyStatus]}>{shot.consistencyStatus}</StatusBadge>
          <StatusBadge status={shot.promptStatus === "需复核" ? "warning" : "success"}>{shot.promptStatus}</StatusBadge>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        <div className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
          <p className="text-[var(--accent-gold)]">旁白片段</p>
          <p className="mt-2 line-clamp-2 leading-5 text-[var(--text-secondary)]">{shot.narrationSegment}</p>
        </div>
        <div className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
          <p className="text-[var(--accent-gold)]">画面描述</p>
          <p className="mt-2 line-clamp-3 leading-5 text-[var(--text-secondary)]">{shot.visualDescription}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)]">
        {[
          ["动作", shot.action],
          ["镜头语言", shot.cameraMovement],
          ["情绪", shot.emotion],
          ["Panel", `${shot.panelCount} 个`],
        ].map(([label, value]) => (
          <div key={label} className="truncate rounded border border-[color:rgba(111,132,144,0.14)] bg-black/10 px-2 py-1.5">
            <span className="text-[var(--text-muted)]">{label}：</span>
            {value}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {panels.map((panel) => (
          <PanelMiniCard key={panel.id} panel={panel} />
        ))}
      </div>
    </article>
  );
}
