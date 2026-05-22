import type { FailureReasonCode } from "@/data/mock/failureReasons";
import { failureReasons } from "@/data/mock/failureReasons";

type FailureReasonChipsProps = {
  codes: FailureReasonCode[];
};

export function FailureReasonChips({ codes }: FailureReasonChipsProps) {
  if (codes.length === 0) {
    return <span className="text-xs text-[var(--status-success)]">暂无拒绝原因</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {codes.map((code) => {
        const reason = failureReasons.find((item) => item.code === code);
        return (
          <span key={code} className="rounded border border-[color:rgba(255,107,95,0.22)] bg-[color:rgba(147,0,10,0.14)] px-2 py-1 text-[10px] text-[var(--status-error)]">
            {reason?.label ?? code}
          </span>
        );
      })}
    </div>
  );
}
