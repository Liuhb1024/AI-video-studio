import { Check, RefreshCcw, X } from "lucide-react";
import { CostBadge } from "@/components/common/CostBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { imageAssets } from "@/data/mock/imageAssets";
import { generationTasks } from "@/data/mock/generationTasks";
import { GenerationTaskStatus } from "./GenerationTaskStatus";
import { ModelSelector } from "./ModelSelector";
import { ProviderSelector } from "./ProviderSelector";

export function ImageGenerationPanel() {
  const task = generationTasks.find((item) => item.type === "image")!;

  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">图像生成 / Image Generation</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">图像生成</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">生成候选关键帧，并采纳为视频首帧或角色参考图。</p>
        </div>
        <CostBadge amount="¥0.86" label="本轮实际" />
      </div>

      <div className="mt-3 grid grid-cols-[210px_minmax(0,1fr)] gap-3">
        <div className="space-y-3">
          <ProviderSelector provider="OpenAI" />
          <ModelSelector
            label="生图模型"
            model="gpt-image-2 / nano banana"
            costHint="单张约 ¥0.80 起"
            capabilities={["参考图", "多候选", "角色定妆"]}
          />
          <GenerationTaskStatus task={task} />
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {imageAssets.slice(0, 3).map((asset) => (
              <article key={asset.id} className="overflow-hidden rounded border border-[color:rgba(111,132,144,0.2)] bg-black/18">
                <div className="h-20 bg-[radial-gradient(circle_at_35%_24%,rgba(178,34,34,0.3),transparent_30%),linear-gradient(135deg,rgba(65,58,51,0.9),rgba(12,12,11,0.95))] p-2">
                  <span className="rounded bg-black/35 px-2 py-1 text-xs text-white/75">{asset.thumbnail}</span>
                </div>
                <div className="space-y-2 p-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={asset.status === "accepted" ? "success" : asset.status === "rejected" ? "error" : "processing"}>
                      {asset.status === "accepted" ? "已采纳" : asset.status === "rejected" ? "已拒绝" : "候选"}
                    </StatusBadge>
                    <span className="text-[var(--accent-gold)]">{asset.consistencyScore}%</span>
                  </div>
                  <p className="truncate text-[var(--text-muted)]">{asset.model}</p>
                  <div className="flex gap-2">
                    <button type="button" className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-[color:rgba(14,107,8,0.28)] px-2 py-1 text-[var(--status-success)]"><Check className="h-3 w-3" />采纳</button>
                    <button type="button" className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-[color:rgba(147,0,10,0.24)] px-2 py-1 text-[var(--status-error)]"><X className="h-3 w-3" />拒绝</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded border border-[color:rgba(233,195,73,0.28)] px-3 py-2 text-xs text-[var(--accent-gold)]">
            <RefreshCcw className="h-3.5 w-3.5" />
            使用相同 Prompt 再抽一轮
          </button>
        </div>
      </div>
    </section>
  );
}
