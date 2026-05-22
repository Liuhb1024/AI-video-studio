import { AssetFilterPanel } from "@/components/assets/AssetFilterPanel";
import { AssetPreviewPanel } from "@/components/assets/AssetPreviewPanel";
import { AssetReviewGrid } from "@/components/assets/AssetReviewGrid";
import { CostSummaryPanel } from "@/components/assets/CostSummaryPanel";
import { ExportProductionPlanButton } from "@/components/assets/ExportProductionPlanButton";
import { FinalProductionTimeline } from "@/components/assets/FinalProductionTimeline";
import { ReflectionInspector } from "@/components/assets/ReflectionInspector";
import { AppShell } from "@/components/layout/AppShell";

export default function AssetReviewPage() {
  return (
    <AppShell
      title="素材审核与成片库"
      eyebrow="Asset Review & Final Library"
      subtitle="审核图片、视频、音频候选素材，记录采纳、拒绝、失败原因和导出就绪状态。"
      inspectorType="asset"
      inspectorTitle="复盘与建议"
      inspectorDescription="拒绝原因、模型失败模式、Prompt 改进建议和成本风险。"
      currentStage="素材审核"
      rightInspector={<ReflectionInspector />}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-5">
          <AssetFilterPanel />
          <div className="min-w-0 space-y-5">
            <AssetPreviewPanel />
            <AssetReviewGrid />
            <CostSummaryPanel />
          </div>
        </div>
        <FinalProductionTimeline />
        <ExportProductionPlanButton />
      </div>
    </AppShell>
  );
}
