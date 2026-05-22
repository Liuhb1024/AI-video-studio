import { CheckCircle2, Clock3, ImageIcon, Mic2, Video } from "lucide-react";
import { CostBadge } from "@/components/common/CostBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { shots } from "@/data/mock/shots";

const costByShot: Record<string, string> = {
  "shot-01": "¥0.68",
  "shot-02": "¥1.42",
  "shot-03": "¥1.28",
  "shot-04": "¥1.36",
  "shot-05": "¥1.38",
  "shot-06": "¥1.32",
};

export function ShotList() {
  return (
    <aside className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">Shot List</p>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">分镜列表（6 镜头）</h2>
        </div>
        <button type="button" className="rounded border border-[color:rgba(233,195,73,0.26)] px-2 py-1 text-xs text-[var(--accent-gold)]">
          添加镜头
        </button>
      </div>
      <div className="space-y-2">
        {shots.map((shot) => {
          const active = shot.id === "shot-02";
          return (
            <article
              key={shot.id}
              className={
                active
                  ? "rounded-lg border border-[color:rgba(178,34,34,0.48)] bg-[color:rgba(178,34,34,0.16)] p-3"
                  : "rounded-lg border border-[color:rgba(111,132,144,0.2)] bg-[color:rgba(28,27,27,0.72)] p-3"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-black/35 px-2 py-1 font-mono text-xs text-[var(--accent-gold)]">
                    {String(shot.shotNo).padStart(2, "0")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Clock3 className="h-3 w-3" />
                    {shot.duration}
                  </span>
                </div>
                <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{shot.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-[var(--status-success)]"><ImageIcon className="h-3 w-3" />图 ✓</span>
                <span className={active ? "inline-flex items-center gap-1 text-[var(--status-warning)]" : "inline-flex items-center gap-1 text-[var(--text-muted)]"}><Video className="h-3 w-3" />视 {active ? "生成中" : "待生成"}</span>
                <span className="inline-flex items-center gap-1 text-[var(--status-success)]"><Mic2 className="h-3 w-3" />音 ✓</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <StatusBadge status={active ? "processing" : "success"}>{active ? "当前镜头" : "可生成"}</StatusBadge>
                <CostBadge amount={costByShot[shot.id]} />
              </div>
            </article>
          );
        })}
      </div>
      <div className="rounded-lg border border-[color:rgba(233,195,73,0.22)] bg-[color:rgba(233,195,73,0.08)] p-3">
        <p className="text-xs text-[var(--text-muted)]">预计合成成本</p>
        <p className="mt-1 font-mono text-xl text-[var(--accent-gold)]">¥7.44</p>
      </div>
    </aside>
  );
}
