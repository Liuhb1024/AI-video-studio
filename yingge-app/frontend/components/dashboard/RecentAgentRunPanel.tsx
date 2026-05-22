import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge, type StatusBadgeStatus } from "@/components/common/StatusBadge";
import { agentRuns, type MockAgentRun } from "@/data/mock/agents";

const statusMeta: Record<MockAgentRun["status"], { label: string; status: StatusBadgeStatus }> = {
  completed: { label: "已完成", status: "success" },
  reviewing: { label: "评审中", status: "warning" },
  processing: { label: "处理中", status: "processing" },
  idle: { label: "空闲", status: "muted" },
  warning: { label: "需复核", status: "error" },
};

export function RecentAgentRunPanel() {
  return (
    <SectionCard title="最近 Agent 运行" description="静态占位，不触发真实 Agent。">
      <div className="space-y-3">
        {agentRuns.map((run) => {
          const meta = statusMeta[run.status];

          return (
            <div
              key={run.agentName}
              className="rounded border border-[color:rgba(90,64,62,0.28)] bg-black/15 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {run.agentName}
                  </p>
                  <p className="mt-1 text-xs text-[var(--accent-gold)]">
                    {run.relatedProject}
                  </p>
                </div>
                <StatusBadge status={meta.status}>{meta.label}</StatusBadge>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
                {run.summary}
              </p>
              <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                最近运行：{run.lastRunAt}
              </p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
