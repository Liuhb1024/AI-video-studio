import { Activity, CircleDollarSign, Film, ListChecks, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type TopStatusBarProps = {
  currentProject?: string;
  currentCharacter?: string;
  currentStage?: string;
  modelStatus?: "normal" | "warning";
  runningTaskCount?: number;
  monthlyCost?: string;
};

export function TopStatusBar({
  currentProject = "英歌水浒人物介绍片",
  currentCharacter = "武松",
  currentStage = "项目总览",
  modelStatus = "normal",
  runningTaskCount = 3,
  monthlyCost = "¥128.40",
}: TopStatusBarProps) {
  const modelLabel = modelStatus === "warning" ? "模型预警" : "模型正常";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 overflow-hidden border-b border-[color:rgba(111,132,144,0.18)] bg-[color:rgba(16,17,17,0.96)] px-5 shadow-[0_10px_26px_rgba(0,0,0,0.18)]">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
          <Film className="h-4 w-4 shrink-0 text-[var(--accent-cinnabar)]" aria-hidden="true" />
          <span className="text-xs text-[var(--text-muted)]">当前项目</span>
          <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {currentProject}
          </span>
        </div>

        <div className="h-5 w-px shrink-0 bg-[color:rgba(111,132,144,0.22)]" />

        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span className="text-xs text-[var(--text-muted)]">当前角色</span>
          <span className="rounded border border-[color:rgba(178,34,34,0.28)] bg-[color:rgba(178,34,34,0.14)] px-2 py-1 text-xs font-medium text-[var(--text-primary)]">
            {currentCharacter}
          </span>
        </div>

        <div className="h-5 w-px shrink-0 bg-[color:rgba(111,132,144,0.22)]" />

        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-[var(--text-secondary)]">
          <MapPin className="h-3.5 w-3.5 text-[var(--accent-gold)]" aria-hidden="true" />
          {currentStage}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2.5 py-1.5 text-xs",
            modelStatus === "warning"
              ? "border-[color:rgba(233,195,73,0.3)] bg-[color:rgba(233,195,73,0.09)] text-[var(--status-warning)]"
              : "border-[color:rgba(130,219,111,0.28)] bg-[color:rgba(14,107,8,0.12)] text-[var(--status-success)]",
          )}
        >
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          {modelLabel}
        </span>

        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded border border-[color:rgba(122,166,194,0.24)] bg-[color:rgba(111,132,144,0.12)] px-2.5 py-1.5 text-xs text-[var(--status-processing)]">
          <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
          任务 {runningTaskCount}
        </span>

        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded border border-[color:rgba(233,195,73,0.24)] bg-[color:rgba(233,195,73,0.08)] px-2.5 py-1.5 text-xs text-[var(--accent-gold)]">
          <CircleDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
          本月 {monthlyCost}
        </span>
      </div>
    </header>
  );
}
