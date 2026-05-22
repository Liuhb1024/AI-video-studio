import { FileText, ImageIcon, Mic2, Video } from "lucide-react";

const steps = [
  {
    label: "提示词",
    hint: "Prompt v2.1",
    status: "已锁定",
    icon: FileText,
    className: "border-[color:rgba(233,195,73,0.3)] bg-[color:rgba(233,195,73,0.08)] text-[var(--accent-gold)]",
  },
  {
    label: "生图",
    hint: "gpt-image-2",
    status: "关键帧已采纳",
    icon: ImageIcon,
    className: "border-[color:rgba(14,107,8,0.28)] bg-[color:rgba(14,107,8,0.1)] text-[var(--status-success)]",
  },
  {
    label: "生视频",
    hint: "Seedance 2.0",
    status: "生成中 65%",
    icon: Video,
    className: "border-[color:rgba(178,34,34,0.5)] bg-[color:rgba(178,34,34,0.16)] text-[var(--text-primary)] shadow-[0_0_26px_rgba(178,34,34,0.16)]",
  },
  {
    label: "TTS",
    hint: "MiniMax TTS",
    status: "已绑定字幕",
    icon: Mic2,
    className: "border-[color:rgba(122,166,194,0.28)] bg-[color:rgba(122,166,194,0.1)] text-[var(--status-processing)]",
  },
];

export function GenerationPipelineSummary() {
  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(90deg,rgba(35,38,37,0.86),rgba(24,25,24,0.72))] p-3 shadow-[0_18px_46px_rgba(0,0,0,0.2)]">
      <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-3">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">生成闭环 / Production Loop</p>
          <h2 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">生成闭环</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Shot 02 · 45 秒短片链路</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article key={step.label} className={`relative rounded-md border px-3 py-2 ${step.className}`}>
                {index > 0 ? <span className="absolute -left-2 top-1/2 h-px w-2 bg-[color:rgba(233,195,73,0.42)]" /> : null}
                <div className="min-w-0">
                  <span className="inline-flex max-w-full items-center gap-2 whitespace-nowrap text-sm font-semibold">
                    <Icon className="h-3.5 w-3.5" />
                    {step.label}
                  </span>
                  <span className="ml-2 hidden truncate text-[11px] text-[var(--text-muted)] xl:inline">{step.hint}</span>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{step.status}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
