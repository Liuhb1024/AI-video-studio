import { CheckCircle2, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AssetLineagePanel } from "./AssetLineagePanel";
import { FailureReasonPanel } from "./FailureReasonPanel";

const checks = [
  ["角色一致性", "脸谱主色、哨棒、行者气质保持稳定", "success"],
  ["场景一致性", "景阳冈山林、烟尘、水墨写意已绑定", "success"],
  ["英歌动作准确性", "短促、顿挫、扫打动作需继续关注", "warning"],
  ["Prompt 来源字段", "已使用 28 / 32 项角色圣经字段", "processing"],
] as const;

export function ConsistencyInspector() {
  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--status-success)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">一致性检查</h3>
        </div>
        <div className="mt-3 space-y-2">
          {checks.map(([title, desc, status]) => (
            <div key={title} className="rounded border border-[color:rgba(111,132,144,0.16)] bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
                  {title}
                </span>
                <StatusBadge status={status}>{status === "success" ? "通过" : status === "warning" ? "预警" : "处理中"}</StatusBadge>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <FailureReasonPanel />
      <AssetLineagePanel />
      <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reflection 建议</h3>
        <div className="mt-3 space-y-2 text-xs leading-5 text-[var(--text-secondary)]">
          <p>ScriptAgent：旁白节奏稳定，可继续保留“打虎英雄”钩子。</p>
          <p>PromptAgent：第 3 镜需增加“禁止现代武侠服饰”。</p>
          <p>CriticAgent：英歌动作应突出踩拍和槌法，不要生成普通打斗。</p>
        </div>
      </section>
    </div>
  );
}
