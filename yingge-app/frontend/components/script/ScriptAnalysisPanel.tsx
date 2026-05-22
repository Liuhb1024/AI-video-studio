import type { MockScript } from "@/data/mock/scripts";

type ScriptAnalysisPanelProps = {
  script: MockScript;
};

export function ScriptAnalysisPanel({ script }: ScriptAnalysisPanelProps) {
  const metrics = [
    ["字数估计", "112 字", "对白密度适中"],
    ["预计时长", script.duration, "适合 30-60 秒人物介绍"],
    ["镜头建议", "6-7 个", "已拆分为 6 个 Shot"],
    ["节奏判断", "前强中密", "结尾回落到传承主题"],
  ];

  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">Script Analysis</p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">剧本分析</h3>
        </div>
        <p className="max-w-[360px] text-xs leading-5 text-[var(--text-secondary)]">
          节奏曲线：开场钩子强，中段动作密度高，结尾回落到英歌传承主题。
        </p>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
        {metrics.map(([label, value, hint]) => (
          <div key={label} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
            <p className="text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 font-mono text-sm text-[var(--accent-gold)]">{value}</p>
            <p className="mt-2 leading-5 text-[var(--text-secondary)]">{hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
