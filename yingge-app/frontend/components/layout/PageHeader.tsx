import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-6">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium text-[var(--accent-gold)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
