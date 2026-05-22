import { AgentRunMini } from "@/components/common/AgentRunMini";
import { StatusBadge } from "@/components/common/StatusBadge";
import { currentScript } from "@/data/mock/scripts";
import { skills } from "@/data/mock/skills";
import { reflections } from "@/data/mock/reflections";
import { MemoryContextPanel } from "./MemoryContextPanel";
import { SkillBadge } from "./SkillBadge";

const statusTone = {
  通过: "success",
  建议: "processing",
  风险: "warning",
} as const;

const severityTone = {
  info: "processing",
  warning: "warning",
  error: "error",
} as const;

export function AgentInspector() {
  const visibleReflections = reflections.slice(0, 4);

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Agent 建议</h3>
        <div className="mt-3 space-y-2">
          {currentScript.agentNotes.map((note) => (
            <div key={note.agent} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">{note.agent}</span>
                <StatusBadge status={statusTone[note.status]}>{note.status}</StatusBadge>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{note.note}</p>
            </div>
          ))}
        </div>
      </section>

      <AgentRunMini />

      <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Skill 运行占位</h3>
        <div className="mt-3 space-y-2">
          {skills.map((skill) => (
            <SkillBadge key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      <MemoryContextPanel />

      <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reflection notes</h3>
        <div className="mt-3 space-y-2">
          {visibleReflections.map((item) => (
            <div key={item.id} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--accent-gold)]">{item.source}</span>
                <StatusBadge status={severityTone[item.severity]}>{item.severity}</StatusBadge>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{item.message}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--status-processing)]">建议：{item.suggestion}</p>
            </div>
          ))}
          <button type="button" className="w-full rounded border border-[color:rgba(111,132,144,0.18)] px-3 py-2 text-xs text-[var(--text-muted)]">
            查看更多 Reflection notes
          </button>
        </div>
      </section>

      <button type="button" className="inline-flex w-full items-center justify-center rounded bg-[var(--accent-cinnabar)] px-4 py-3 text-sm font-semibold text-white">
        使用此脚本进入提示词工作台
      </button>
    </div>
  );
}
