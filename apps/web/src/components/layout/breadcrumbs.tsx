"use client";

import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs text-[#9f927c]" aria-label="当前位置">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !last ? (
              <Link className="rounded-full border border-[#e7b45f]/10 bg-black/20 px-3 py-1 transition hover:border-stage-300/30 hover:text-[#fff5df]" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="rounded-full border border-stage-300/20 bg-stage-400/[0.08] px-3 py-1 text-stage-100">{item.label}</span>
            )}
            {!last ? <span className="text-[#5f5646]">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
