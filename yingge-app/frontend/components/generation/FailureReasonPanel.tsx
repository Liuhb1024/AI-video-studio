import { AlertTriangle } from "lucide-react";
import { failureReasons } from "@/data/mock/failureReasons";

export function FailureReasonPanel() {
  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-[var(--status-warning)]" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">失败原因与下一轮约束</h3>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {failureReasons.slice(0, 7).map((reason) => (
          <span
            key={reason.code}
            className={
              reason.severity === "error"
                ? "rounded border border-[color:rgba(255,107,95,0.22)] bg-[color:rgba(147,0,10,0.14)] px-2 py-1 text-xs text-[var(--status-error)]"
                : "rounded border border-[color:rgba(233,195,73,0.22)] bg-[color:rgba(175,141,17,0.12)] px-2 py-1 text-xs text-[var(--status-warning)]"
            }
          >
            {reason.label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
        下一轮建议：强化脸谱正红、眼尾飞锋、哨棒形态和英歌槌动作，降低运动强度并禁止现代服饰、长枪和水印文字。
      </p>
    </section>
  );
}
