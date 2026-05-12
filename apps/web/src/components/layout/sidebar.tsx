"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { navigationItems } from "@/lib/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[#e7b45f]/10 bg-black/32 px-4 py-4 backdrop-blur-2xl lg:flex">
      <div className="flex h-full w-full flex-col">
        <div className="surface rounded-xl px-4 py-4 shadow-panel">
          <div className="text-[10px] uppercase tracking-[0.3em] text-stage-200/80">Yingge AI Studio</div>
          <div className="mt-2 text-xl font-semibold text-[#fff5df]">英歌片场</div>
          <div className="mt-3 h-px bg-gradient-to-r from-transparent via-stage-300/40 to-transparent" />
          <p className="mt-3 text-xs leading-5 text-[#d7c8aa]">
            项目、剧本、分镜、生成与成片归档的统一生产桌。
          </p>
        </div>

        <nav className="mt-4 flex-1 space-y-1">
          {navigationItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all duration-300",
                  active
                    ? "border-stage-300/40 bg-[linear-gradient(135deg,rgba(231,180,95,0.16),rgba(79,189,168,0.06))] text-[#fff5df] shadow-stage-glow"
                    : "border-transparent text-[#c9bea8] hover:border-stage-300/20 hover:bg-[#f5ead6]/[0.055] hover:text-[#fff5df]",
                )}
              >
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="mt-1 text-xs text-[#8f846f] group-hover:text-[#c9bea8]">{item.description}</div>
                </div>
                <div className="rounded-full border border-[#e7b45f]/15 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-stage-100">
                  {item.shortLabel}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="surface rounded-xl px-3 py-3 text-sm text-[#e9dcc4]">
          <div className="text-[10px] uppercase tracking-[0.22em] text-teal-100/80">Current Mode</div>
          <div className="mt-1.5 font-medium text-[#fff5df]">分镜驱动生产</div>
          <p className="mt-1.5 text-xs leading-5 text-[#bdb097]">先锁镜头，再沉淀角色、提示词、素材与成本记录。</p>
        </div>
      </div>
    </aside>
  );
}
