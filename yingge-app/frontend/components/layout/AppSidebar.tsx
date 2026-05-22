"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Bot,
  Boxes,
  ClipboardList,
  Clapperboard,
  Gauge,
  Library,
  Settings,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { CostBadge } from "@/components/common/CostBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

const primaryNavigation = [
  { label: "项目总览", subtitle: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "角色圣经", subtitle: "Character Bible", href: "/characters", icon: Users },
  { label: "剧本分镜", subtitle: "Script Studio", href: "/script-studio", icon: Clapperboard },
  {
    label: "生成工作台",
    subtitle: "Generation Workspace",
    href: "/generation-workspace",
    icon: Wand2,
  },
  { label: "素材审核", subtitle: "Asset Review", href: "/asset-review", icon: Archive },
];

const reservedNavigation = [
  { label: "任务队列", icon: ClipboardList },
  { label: "模型配置", icon: Settings },
  { label: "素材库", icon: Library },
  { label: "Agent 运行", icon: Bot },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/characters") {
    return pathname === href || pathname.startsWith("/characters/");
  }

  return pathname === href;
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="ink-texture flex h-screen w-[240px] shrink-0 flex-col border-r border-[color:rgba(90,64,62,0.45)] bg-[var(--sidebar-background)]">
      <div className="border-b border-[color:rgba(90,64,62,0.36)] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:rgba(178,34,34,0.45)] bg-[color:rgba(178,34,34,0.16)] text-[var(--accent-cinnabar)] shadow-lg shadow-[rgba(178,34,34,0.12)]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              英歌漫剧工坊
            </p>
            <p className="mt-1 text-xs text-[var(--accent-gold)]">
              Ink & Cinnabar Studio
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="px-2 text-xs text-[var(--text-muted)]">生产导航</p>
        <div className="mt-3 space-y-1">
          {primaryNavigation.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-[color:rgba(178,34,34,0.16)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[color:rgba(42,42,42,0.72)] hover:text-[var(--text-primary)]",
                )}
              >
                {active ? (
                  <span className="absolute left-0 h-6 w-1 rounded-r bg-[var(--accent-cinnabar)]" />
                ) : null}
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active
                      ? "text-[var(--accent-cinnabar)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--accent-gold)]",
                  )}
                  aria-hidden="true"
                />
                <span className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                    {item.subtitle}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <p className="px-2 text-xs text-[var(--text-muted)]">预留入口</p>
          <div className="mt-3 space-y-1">
            {reservedNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)]"
                  aria-disabled="true"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="rounded border border-[color:rgba(143,129,125,0.2)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                    即将开放
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="space-y-3 border-t border-[color:rgba(90,64,62,0.36)] p-4">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Boxes className="h-4 w-4 text-[var(--accent-bluegray)]" aria-hidden="true" />
          <span>静态原型 v0.2</span>
        </div>
        <StatusBadge status="success" className="w-full justify-center">
          Mock 服务正常
        </StatusBadge>
        <CostBadge amount="¥128.40" label="本月" className="w-full justify-center" />
      </div>
    </aside>
  );
}
