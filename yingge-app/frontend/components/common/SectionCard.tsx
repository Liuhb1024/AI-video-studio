import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-lg border border-[color:rgba(111,132,144,0.26)] bg-[linear-gradient(180deg,rgba(35,38,37,0.88),rgba(26,27,26,0.8))] shadow-[0_18px_40px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(233,195,73,0.05)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(233,195,73,0.34),transparent)]" />
      {(title || description || actions) && (
        <div className="relative flex items-start justify-between gap-4 border-b border-[color:rgba(111,132,144,0.18)] px-5 py-4">
          <div>
            {title ? (
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      <div className="relative p-5">{children}</div>
    </section>
  );
}
