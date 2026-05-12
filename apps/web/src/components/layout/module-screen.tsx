import { PageHeader } from "@/components/layout/page-header";

type Stat = {
  label: string;
  value: string;
  hint: string;
};

type Insight = {
  title: string;
  description: string;
  tone?: "warm" | "cool" | "neutral";
};

type ModuleScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats: Stat[];
  insights: Insight[];
  workflowTitle?: string;
  workflowSteps?: string[];
};

export function ModuleScreen({
  eyebrow,
  title,
  description,
  stats,
  insights,
  workflowTitle = "本模块链路",
  workflowSteps = [],
}: ModuleScreenProps) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="surface rounded-[1.35rem] p-5 shadow-panel transition duration-300 hover:-translate-y-0.5 hover:border-stage-300/30"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="text-xs uppercase tracking-[0.22em] text-[#8f846f]">{stat.label}</div>
            <div className="mt-3 text-4xl font-semibold text-[#fff5df]">{stat.value}</div>
            <div className="mt-3 h-px bg-gradient-to-r from-stage-300/45 to-transparent" />
            <div className="mt-3 text-sm leading-7 text-[#c9bea8]">{stat.hint}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="surface rounded-[1.55rem] p-5 shadow-panel md:p-6">
          <div className="text-sm font-medium text-[#fff5df]">{workflowTitle}</div>
          <div className="mt-4 grid gap-3">
            {workflowSteps.length ? (
              workflowSteps.map((step, index) => (
                <div
                  key={step}
                  className="group flex items-start gap-3 rounded-2xl border border-[#e7b45f]/10 bg-black/30 px-4 py-3.5 transition duration-300 hover:border-stage-300/30 hover:bg-stage-400/[0.06]"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stage-300/25 bg-stage-400/12 text-xs font-semibold text-stage-100 group-hover:shadow-stage-glow">
                    {index + 1}
                  </div>
                  <div className="text-sm leading-7 text-[#d4c6aa]">{step}</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e7b45f]/14 bg-black/25 p-6 text-sm leading-7 text-[#9c907a]">
                这里会承载该模块的核心流程、待办和联动状态。
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {insights.map((item) => {
            const toneClass =
              item.tone === "warm"
                ? "border-stage-300/25 bg-stage-400/[0.08]"
                : item.tone === "cool"
                  ? "border-teal-300/25 bg-teal-400/[0.08]"
                  : "border-[#e7b45f]/10 bg-black/30";

            return (
              <article key={item.title} className={`rounded-[1.35rem] border p-5 shadow-panel ${toneClass}`}>
                <div className="text-sm font-medium text-[#fff5df]">{item.title}</div>
                <p className="mt-2 text-sm leading-7 text-[#c9bea8]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
