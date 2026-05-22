import { GitBranch } from "lucide-react";

const lineageItems = [
  ["Shot", "shot-02 · 景阳冈打虎"],
  ["Panel", "panel-02-a · 首帧绑定"],
  ["Prompt", "prompt-video-01 · v2.1"],
  ["Task", "task-video-021 · Seedance"],
  ["Cost", "UsageCost · ¥1.42"],
];

export function AssetLineagePanel() {
  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-[var(--accent-bluegray)]" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">素材来源链路</h3>
      </div>
      <div className="mt-3 space-y-2">
        {lineageItems.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded border border-[color:rgba(111,132,144,0.16)] bg-black/15 px-3 py-2 text-xs">
            <span className="text-[var(--text-muted)]">{label}</span>
            <span className="text-right text-[var(--text-secondary)]">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
