import { PackageCheck } from "lucide-react";
import { productionPlan } from "@/data/mock/productionPlan";

export function ExportProductionPlanButton() {
  return (
    <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--accent-cinnabar)] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(178,34,34,0.24)]">
      <PackageCheck className="h-4 w-4" />
      导出成片方案包（{productionPlan.exportItems.length} 类资料）
    </button>
  );
}
