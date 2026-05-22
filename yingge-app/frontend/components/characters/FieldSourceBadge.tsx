import { FileSpreadsheet } from "lucide-react";

type FieldSourceBadgeProps = {
  row: number;
  className?: string;
};

export function FieldSourceBadge({ row, className }: FieldSourceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border border-[color:rgba(233,195,73,0.24)] bg-[color:rgba(233,195,73,0.08)] px-2 py-1 text-xs text-[var(--accent-gold)] ${className ?? ""}`}
    >
      <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
      Excel 第 {row} 行
    </span>
  );
}
