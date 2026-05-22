import { Bot } from "lucide-react";
import { StatusBadge, type StatusBadgeStatus } from "./StatusBadge";

const agentRuns: Array<{
  name: string;
  status: string;
  tone: StatusBadgeStatus;
}> = [
  { name: "ScriptAgent", status: "已完成", tone: "success" },
  { name: "StoryboardAgent", status: "评审中", tone: "processing" },
  { name: "ProductionAgent", status: "空闲", tone: "muted" },
];

export function AgentRunMini() {
  return (
    <div className="rounded-lg border border-[color:rgba(111,132,144,0.26)] bg-[color:rgba(28,27,27,0.68)] p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
        <Bot className="h-4 w-4 text-[var(--accent-bluegray)]" aria-hidden="true" />
        Agent 运行
      </div>
      <div className="mt-3 space-y-2">
        {agentRuns.map((run) => (
          <div key={run.name} className="flex items-center justify-between gap-3">
            <span className="text-xs text-[var(--text-secondary)]">{run.name}</span>
            <StatusBadge status={run.tone}>{run.status}</StatusBadge>
          </div>
        ))}
      </div>
    </div>
  );
}
