import { AlertTriangle, CheckCircle2, CircleHelp } from "lucide-react";
import type { ConsistencyChecklistItem, FieldSource } from "@/data/mock/characterDetail";

type ConsistencyChecklistProps = {
  items: ConsistencyChecklistItem[];
  fieldSources: FieldSource[];
};

const statusIcon = {
  通过: CheckCircle2,
  预警: AlertTriangle,
  缺失: CircleHelp,
};

const statusClassName = {
  通过: "text-[var(--status-success)]",
  预警: "text-[var(--status-warning)]",
  缺失: "text-[var(--status-error)]",
};

export function ConsistencyChecklist({
  items,
  fieldSources,
}: ConsistencyChecklistProps) {
  const visibleFieldSources = fieldSources.slice(0, 4);

  return (
    <div className="space-y-3">
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">一致性检查清单</h3>
        <div className="mt-3 space-y-2">
          {items.map((item) => {
            const Icon = statusIcon[item.status];
            return (
              <div key={item.id} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${statusClassName[item.status]}`} />
                    <span className="text-sm text-[var(--text-primary)]">{item.label}</span>
                  </div>
                  <span className={`text-xs ${statusClassName[item.status]}`}>{item.status}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{item.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">字段来源</h3>
        <div className="mt-3 space-y-2">
          {visibleFieldSources.map((source) => (
            <div key={source.field} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--accent-gold)]">{source.field}</span>
                <span className="text-[11px] text-[var(--text-muted)]">第 {source.row} 行</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{source.source}</p>
              <p className="mt-1 text-[11px] text-[var(--status-processing)]">{source.evidence}</p>
            </div>
          ))}
          {fieldSources.length > visibleFieldSources.length ? (
            <div className="rounded border border-[color:rgba(111,132,144,0.16)] bg-black/10 px-3 py-2 text-xs text-[var(--text-muted)]">
              另有 {fieldSources.length - visibleFieldSources.length} 条来源记录已收起
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">常见错误示例</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {["现代武侠装", "写实照片脸", "长枪替代哨棒", "西式盔甲"].map((error) => (
            <div key={error} className="rounded border border-[color:rgba(255,107,95,0.2)] bg-[color:rgba(147,0,10,0.12)] p-2 text-xs text-[var(--status-error)]">
              {error}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
