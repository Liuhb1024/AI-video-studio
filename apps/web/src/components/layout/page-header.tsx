import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <section className="surface flex flex-col gap-3 rounded-xl p-4 shadow-panel md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="text-[10px] uppercase tracking-[0.28em] text-stage-200/70">{eyebrow}</div>
          <h2 className="mt-2 text-2xl font-semibold text-[#fff5df] md:text-3xl">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#cfc1a6]">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
