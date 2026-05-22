import { Play, RefreshCcw, WandSparkles } from "lucide-react";
import { CostBadge } from "@/components/common/CostBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { generationTasks } from "@/data/mock/generationTasks";
import { prompts } from "@/data/mock/prompts";
import { videoAssets } from "@/data/mock/videoAssets";
import { CandidateComparisonPanel } from "./CandidateComparisonPanel";
import { GenerationTaskStatus } from "./GenerationTaskStatus";
import { ModelSelector } from "./ModelSelector";
import { ProviderSelector } from "./ProviderSelector";
import { VideoCandidatePlayer } from "./VideoCandidatePlayer";

const modes = ["图生视频", "首帧视频", "首尾帧视频"];

export function VideoGenerationPanel() {
  const task = generationTasks.find((item) => item.type === "video" && item.status === "processing")!;
  const prompt = prompts.find((item) => item.type === "video")!;
  const activeVideo = videoAssets[1];

  return (
    <section className="rounded-xl border border-[color:rgba(178,34,34,0.48)] bg-[linear-gradient(180deg,rgba(82,35,30,0.56),rgba(25,26,25,0.9))] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.34),0_0_34px_rgba(178,34,34,0.12),inset_0_1px_0_rgba(255,180,172,0.14)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">视频生成 / Video Generation / Seedance 2.0</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">视频生成 / Seedance 2.0</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">基于已采纳关键帧和视频 Prompt 生成候选视频，是当前页面的核心生产模块。</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <CostBadge amount="¥1.42" label="预计" />
          <StatusBadge status="processing">生成中 65%</StatusBadge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {modes.map((mode) => (
          <button
            key={mode}
            type="button"
            className={mode === "首帧视频" ? "rounded-md border border-[color:rgba(233,195,73,0.34)] bg-[color:rgba(178,34,34,0.24)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)]" : "rounded-md border border-[color:rgba(111,132,144,0.22)] bg-black/16 px-3 py-2 text-sm text-[var(--text-secondary)]"}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[230px_minmax(0,1fr)] gap-4">
        <div className="space-y-3">
          <ProviderSelector provider="Seedance" status="warning" />
          <ModelSelector
            label="生视频模型"
            model="Seedance 2.0 PRO"
            costHint="首帧视频预计 ¥1.42"
            capabilities={["Video", "First-frame", "First-last-frame", "1080P"]}
          />
          <div className="rounded border border-[color:rgba(111,132,144,0.22)] bg-black/15 p-3">
            <p className="text-xs text-[var(--text-muted)]">模式说明</p>
            <div className="mt-2 grid grid-cols-1 gap-1.5">
              {modes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={mode === "首帧视频" ? "rounded border border-[color:rgba(178,34,34,0.46)] bg-[color:rgba(178,34,34,0.18)] px-3 py-1.5 text-left text-xs text-[var(--text-primary)]" : "rounded border border-[color:rgba(111,132,144,0.18)] bg-black/10 px-3 py-1.5 text-left text-xs text-[var(--text-secondary)]"}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <GenerationTaskStatus task={task} />
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["关键帧", "武松正红脸谱首帧", "已采纳"],
                ["角色参考图", "武松主外观 01", "已绑定"],
                ["场景参考图", "景阳冈山林", "已绑定"],
              ].map(([label, value, status]) => (
                <div key={label} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
                  <p className="text-xs text-[var(--text-muted)]">{label}</p>
                  <div className="mt-2 h-16 rounded bg-[radial-gradient(circle_at_35%_26%,rgba(178,34,34,0.35),transparent_30%),linear-gradient(135deg,rgba(73,63,52,0.86),rgba(10,10,9,0.96))]" />
                  <p className="mt-2 truncate text-xs text-[var(--text-secondary)]">{value}</p>
                  <p className="mt-1 text-[11px] text-[var(--status-success)]">{status}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                ["时长", "5 秒"],
                ["画幅", "9:16 竖屏"],
                ["运动强度", "0.75"],
                ["分辨率", "1080P"],
              ].map(([label, value]) => (
                <div key={label} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-2">
                  <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
                  <p className="mt-1 font-mono text-xs text-[var(--accent-gold)]">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">可编辑视频 Prompt</p>
                <span className="text-xs text-[var(--accent-gold)]">{prompt.version}</span>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-6 text-[var(--text-secondary)]">{prompt.content}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="inline-flex items-center gap-2 rounded border border-[color:rgba(233,195,73,0.26)] px-3 py-2 text-xs text-[var(--accent-gold)]"><WandSparkles className="h-3.5 w-3.5" />AI 优化</button>
                <button type="button" className="rounded border border-[color:rgba(111,132,144,0.26)] px-3 py-2 text-xs text-[var(--text-secondary)]">动作增强</button>
                <button type="button" className="rounded border border-[color:rgba(111,132,144,0.26)] px-3 py-2 text-xs text-[var(--text-secondary)]">镜头语言增强</button>
              </div>
            </div>
            <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--accent-cinnabar)] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(178,34,34,0.24)]">
              <Play className="h-4 w-4" />
              生成视频任务
            </button>
          </div>

          <VideoCandidatePlayer video={activeVideo} />
          <CandidateComparisonPanel />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button type="button" className="rounded bg-[color:rgba(14,107,8,0.24)] px-3 py-2 text-[var(--status-success)]">接受此视频</button>
            <button type="button" className="rounded bg-[color:rgba(147,0,10,0.22)] px-3 py-2 text-[var(--status-error)]">拒绝</button>
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded border border-[color:rgba(233,195,73,0.26)] px-3 py-2 text-[var(--accent-gold)]"><RefreshCcw className="h-3.5 w-3.5" />优化后重试</button>
          </div>
        </div>
      </div>
    </section>
  );
}
