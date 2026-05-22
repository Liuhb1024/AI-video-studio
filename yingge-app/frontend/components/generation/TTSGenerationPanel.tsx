import { Mic2, Play } from "lucide-react";
import { CostBadge } from "@/components/common/CostBadge";
import { audioAssets } from "@/data/mock/audioAssets";
import { prompts } from "@/data/mock/prompts";
import { subtitleAssets } from "@/data/mock/subtitleAssets";
import { ModelSelector } from "./ModelSelector";
import { ProviderSelector } from "./ProviderSelector";

export function TTSGenerationPanel() {
  const prompt = prompts.find((item) => item.type === "tts")!;
  const audio = audioAssets[1];
  const subtitle = subtitleAssets[1];

  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">语音生成 / TTS Generation</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">语音生成</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">MiniMax TTS 旁白、字幕与镜头绑定占位。</p>
        </div>
        <CostBadge amount={`¥${audio.cost.toFixed(2)}`} label="实际" />
      </div>
      <div className="mt-3 grid grid-cols-[210px_minmax(0,1fr)] gap-3">
        <div className="space-y-3">
          <ProviderSelector provider="MiniMax" />
          <ModelSelector label="TTS 模型" model="MiniMax TTS 2.0" costHint="按字符计费" capabilities={["TTS", "旁白", "字幕绑定"]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">旁白文本</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{prompt.content}</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded border border-[color:rgba(111,132,144,0.16)] bg-black/20 px-3 py-2">
              <span className="inline-flex items-center gap-2 text-xs text-[var(--accent-gold)]"><Mic2 className="h-3.5 w-3.5" />{audio.voice}</span>
              <button type="button" className="rounded bg-[var(--accent-cinnabar)] px-3 py-1.5 text-xs font-semibold text-white">生成语音</button>
            </div>
          </div>
          <div className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">音频预览与字幕</p>
            <div className="mt-3 flex items-center gap-3 rounded border border-[color:rgba(111,132,144,0.16)] bg-black/20 p-3">
              <Play className="h-4 w-4 text-[var(--accent-gold)]" />
              <div className="h-8 flex-1 rounded bg-[repeating-linear-gradient(90deg,rgba(233,195,73,0.35)_0_2px,transparent_2px_8px)]" />
              <span className="font-mono text-xs text-[var(--text-muted)]">{audio.duration}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{subtitle.text}</p>
            <p className="mt-2 text-xs text-[var(--status-success)]">字幕：{subtitle.timingStatus} · 已绑定到 Shot 02</p>
          </div>
        </div>
      </div>
    </section>
  );
}
