import { Bot, CheckCircle2, CircleDashed } from "lucide-react";
import type { MockSkill } from "@/data/mock/skills";

type SkillBadgeProps = {
  skill: MockSkill;
};

export function SkillBadge({ skill }: SkillBadgeProps) {
  const active = skill.status === "启用";
  const Icon = active ? CheckCircle2 : CircleDashed;

  return (
    <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Bot className="h-4 w-4 text-[var(--accent-bluegray)]" />
          <span className="truncate text-sm font-medium text-[var(--text-primary)]">{skill.name}</span>
        </div>
        <span className={active ? "shrink-0 text-xs text-[var(--status-success)]" : "shrink-0 text-xs text-[var(--text-muted)]"}>
          <Icon className="mr-1 inline h-3.5 w-3.5" />
          {skill.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--accent-gold)]">{skill.agent}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">{skill.description}</p>
    </div>
  );
}
