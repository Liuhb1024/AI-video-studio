import { StatusBadge } from "@/components/common/StatusBadge";

type FieldCompletenessBadgeProps = {
  value: number;
};

export function FieldCompletenessBadge({ value }: FieldCompletenessBadgeProps) {
  const status = value >= 92 ? "success" : value >= 85 ? "warning" : "error";

  return <StatusBadge status={status}>字段完整度 {value}%</StatusBadge>;
}
