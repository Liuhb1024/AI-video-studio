import type { ReactNode } from "react";
import {
  Archive,
  Bot,
  ClipboardList,
  Coins,
  PanelRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type InspectorType =
  | "default"
  | "task"
  | "agent"
  | "cost"
  | "consistency"
  | "asset";

const inspectorMeta = {
  default: {
    label: "工作台检查",
    subtitle: "Inspector",
    icon: PanelRight,
    accent: "text-[var(--accent-bluegray)]",
  },
  task: {
    label: "任务检查",
    subtitle: "Task Inspector",
    icon: ClipboardList,
    accent: "text-[var(--status-processing)]",
  },
  agent: {
    label: "Agent 运行",
    subtitle: "Agent Inspector",
    icon: Bot,
    accent: "text-[var(--accent-bluegray)]",
  },
  cost: {
    label: "成本检查",
    subtitle: "Cost Inspector",
    icon: Coins,
    accent: "text-[var(--accent-gold)]",
  },
  consistency: {
    label: "一致性检查",
    subtitle: "Consistency Inspector",
    icon: ShieldCheck,
    accent: "text-[var(--status-success)]",
  },
  asset: {
    label: "素材复盘",
    subtitle: "Asset Inspector",
    icon: Archive,
    accent: "text-[var(--accent-cinnabar)]",
  },
} satisfies Record<
  InspectorType,
  {
    label: string;
    subtitle: string;
    icon: typeof PanelRight;
    accent: string;
  }
>;

type RightInspectorProps = {
  type?: InspectorType;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function RightInspector({
  type = "default",
  title,
  description,
  children,
  className,
}: RightInspectorProps) {
  const meta = inspectorMeta[type];
  const Icon = meta.icon;

  return (
    <aside
      className={cn(
        "h-full w-[360px] shrink-0 border-l border-[color:rgba(90,64,62,0.42)] bg-[color:rgba(19,19,19,0.82)] p-4",
        className,
      )}
    >
      <section className="flex h-full flex-col rounded-lg border border-[color:rgba(111,132,144,0.28)] bg-[color:rgba(28,27,27,0.72)] shadow-2xl shadow-black/20">
        <div className="border-b border-[color:rgba(90,64,62,0.34)] p-4">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", meta.accent)} aria-hidden="true" />
            <p className="text-xs text-[var(--text-muted)]">{meta.subtitle}</p>
          </div>
          <h2 className="mt-2 text-base font-semibold text-[var(--text-primary)]">
            {title ?? meta.label}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex-1 overflow-auto p-4">
          {children ?? (
            <div className="rounded-lg border border-dashed border-[color:rgba(111,132,144,0.32)] bg-[color:rgba(111,132,144,0.08)] p-4 text-sm leading-6 text-[var(--text-muted)]">
              当前页面暂未注入检查内容。后续页面会在这里展示任务、成本、Agent、一致性或素材复盘信息。
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
