import { productionTimeline } from "@/data/mock/productionPlan";

const statusClassName = {
  已采纳: "bg-[color:rgba(14,107,8,0.22)] text-[var(--status-success)]",
  候选: "bg-[color:rgba(175,141,17,0.18)] text-[var(--status-warning)]",
  缺失: "bg-[color:rgba(147,0,10,0.18)] text-[var(--status-error)]",
  需微调: "bg-[color:rgba(122,166,194,0.18)] text-[var(--status-processing)]",
} as const;

export function FinalProductionTimeline() {
  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">成片时间线 / Final Timeline</p>
          <h2 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">成片时间线（6 镜头 / 45 秒）</h2>
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-0 right-0 top-4 h-px bg-[color:rgba(233,195,73,0.24)]" />
        <div className="grid grid-cols-6 gap-3">
        {productionTimeline.map((item, index) => (
          <article key={item.shotId} className="relative rounded-lg border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
            <div className={index < 4 ? "absolute left-3 right-3 top-0 h-1 rounded-b bg-[var(--status-success)]" : "absolute left-3 right-3 top-0 h-1 rounded-b bg-[var(--status-warning)]"} />
            <div className="mt-1 h-16 rounded bg-[radial-gradient(circle_at_35%_24%,rgba(178,34,34,0.26),transparent_30%),linear-gradient(135deg,rgba(61,55,49,0.88),rgba(11,11,10,0.96))]" />
            <p className="mt-2 font-mono text-xs text-[var(--accent-gold)]">{String(item.shotNo).padStart(2, "0")} · {item.timeRange}</p>
            <h3 className="mt-1 truncate text-xs font-semibold text-[var(--text-primary)]">{item.title}</h3>
            <div className="mt-2 grid grid-cols-4 gap-1 text-[10px]">
              {[
                ["图", item.imageStatus],
                ["视", item.videoStatus],
                ["音", item.audioStatus],
                ["字", item.subtitleStatus],
              ].map(([label, status]) => (
                <span key={label} className={`rounded px-1.5 py-1 text-center ${statusClassName[status as keyof typeof statusClassName]}`}>
                  {label}
                </span>
              ))}
            </div>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}
