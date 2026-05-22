import { WandSparkles } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { prompts } from "@/data/mock/prompts";

export function PromptEditor() {
  const imagePrompt = prompts.find((item) => item.type === "image")!;
  const videoPrompt = prompts.find((item) => item.type === "video")!;
  const negativePrompt = prompts.find((item) => item.type === "negative")!;

  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(35,38,37,0.82),rgba(24,25,24,0.76))] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">提示词编辑 / Prompt Editor</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">提示词编辑</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">从角色圣经、Shot、Panel 和上一轮拒绝原因生成当前分镜的 Prompt。</p>
        </div>
        <button type="button" className="inline-flex shrink-0 items-center gap-2 rounded bg-[var(--accent-cinnabar)] px-3 py-2 text-xs font-semibold text-white">
          <WandSparkles className="h-3.5 w-3.5" />
          优化 Prompt
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          ["图像提示词", imagePrompt.content, `${imagePrompt.version} · ${imagePrompt.updatedAt}`],
          ["视频提示词", videoPrompt.content, `${videoPrompt.version} · Seedance`],
          ["负面提示词", negativePrompt.content, `${negativePrompt.version} · Negative Prompt`],
        ].map(([title, content, meta]) => (
          <div key={title} className="h-32 rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
            <div className="min-w-0">
              <p className="truncate whitespace-nowrap text-sm font-semibold text-[var(--text-primary)]">{title}</p>
              <span className="mt-1 block truncate whitespace-nowrap text-[11px] text-[var(--accent-gold)]">{meta}</span>
            </div>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--text-secondary)]">{content}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        <div className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-2.5">
          <p className="text-xs text-[var(--status-processing)]">来源字段</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {videoPrompt.sourceFields.slice(0, 4).map((field) => (
              <span key={field} className="rounded bg-[color:rgba(111,132,144,0.12)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">
                {field}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-2.5">
          <p className="text-xs text-[var(--accent-gold)]">质量检查</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {videoPrompt.qualityChecklist.slice(0, 4).map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-1 text-[11px]">
                <span className="truncate text-[var(--text-secondary)]">{item.label}</span>
                <StatusBadge status={item.passed ? "success" : "warning"}>{item.passed ? "通过" : "复核"}</StatusBadge>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded border border-[color:rgba(14,107,8,0.24)] bg-[color:rgba(14,107,8,0.1)] p-2.5">
          <p className="text-xs text-[var(--status-success)]">正向关键词</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {imagePrompt.positiveKeywords.slice(0, 4).map((item) => (
              <span key={item} className="rounded bg-black/18 px-2 py-1 text-xs text-[var(--text-secondary)]">{item}</span>
            ))}
          </div>
        </div>
        <div className="rounded border border-[color:rgba(255,107,95,0.24)] bg-[color:rgba(147,0,10,0.1)] p-2.5">
          <p className="text-xs text-[var(--status-error)]">禁止关键词</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {negativePrompt.negativeKeywords.slice(0, 4).map((item) => (
              <span key={item} className="rounded bg-black/18 px-2 py-1 text-xs text-[var(--text-secondary)]">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
