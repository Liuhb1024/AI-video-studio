import { CheckCircle2, Circle, PlayCircle } from "lucide-react";

const steps = [
  { no: 1, title: "选择角色", subtitle: "Select Character", status: "done" },
  { no: 2, title: "生成剧本", subtitle: "Generate Script", status: "current" },
  { no: 3, title: "拆分分镜", subtitle: "Split Storyboard", status: "done" },
  { no: 4, title: "确认镜头", subtitle: "Confirm Shots", status: "next" },
  { no: 5, title: "进入提示词工作台", subtitle: "Enter Prompt Workspace", status: "next" },
];

export function ProductionStepRail() {
  return (
    <aside className="space-y-3">
      <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">制作流程</h2>
        <div className="mt-3 space-y-3">
          {steps.map((step) => {
            const current = step.status === "current";
            const done = step.status === "done";
            const Icon = done ? CheckCircle2 : current ? PlayCircle : Circle;

            return (
              <div
                key={step.no}
                className={
                  current
                    ? "rounded border border-[color:rgba(178,34,34,0.42)] bg-[color:rgba(178,34,34,0.16)] p-2.5"
                    : "rounded border border-[color:rgba(111,132,144,0.16)] bg-black/10 p-2.5"
                }
              >
                <div className="flex items-center gap-2">
                  <Icon className={done ? "h-4 w-4 text-[var(--status-success)]" : current ? "h-4 w-4 text-[var(--accent-cinnabar)]" : "h-4 w-4 text-[var(--text-muted)]"} />
                  <span className="text-sm font-medium text-[var(--text-primary)]">{step.title}</span>
                </div>
                <p className="mt-1 truncate pl-6 text-[11px] text-[var(--text-muted)]">{step.subtitle}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-3 text-sm">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">脚本信息</h2>
        <div className="mt-3 space-y-2 text-xs text-[var(--text-secondary)]">
          <div className="flex justify-between gap-3"><span>目标平台</span><span className="text-[var(--accent-gold)]">抖音 / TikTok</span></div>
          <div className="flex justify-between gap-3"><span>视频时长</span><span className="text-[var(--accent-gold)]">45 秒</span></div>
          <div className="flex justify-between gap-3"><span>画面比例</span><span className="text-[var(--accent-gold)]">9:16 竖屏</span></div>
          <div className="flex justify-between gap-3"><span>故事语气</span><span className="text-[var(--accent-gold)]">英雄史诗</span></div>
          <div className="flex justify-between gap-3"><span>生成版本</span><span className="text-[var(--accent-gold)]">v2.1</span></div>
        </div>
      </section>
    </aside>
  );
}
