import type { MockPanel } from "@/data/mock/panels";

type PanelMiniCardProps = {
  panel: MockPanel;
};

export function PanelMiniCard({ panel }: PanelMiniCardProps) {
  const keyword = panel.imageDescription.split("，")[0] ?? panel.imageDescription;

  return (
    <div className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/18 p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-[var(--accent-gold)]">P{panel.panelNo}</span>
        <span className="text-[10px] text-[var(--text-muted)]">{panel.videoStatus}</span>
      </div>
      <p className="mt-2 truncate text-[11px] leading-4 text-[var(--text-secondary)]">{keyword}</p>
      <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
        {panel.camera} / {panel.motion}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded bg-[color:rgba(111,132,144,0.16)] px-1.5 py-0.5 text-[10px] text-[var(--status-processing)]">{panel.promptStatus}</span>
        <span className="rounded bg-[color:rgba(14,107,8,0.14)] px-1.5 py-0.5 text-[10px] text-[var(--status-success)]">{panel.keyframeStatus}</span>
      </div>
    </div>
  );
}
