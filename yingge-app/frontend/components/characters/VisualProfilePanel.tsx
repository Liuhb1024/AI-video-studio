import type { characterDetail } from "@/data/mock/characterDetail";
import { PromptKeywordChips } from "./PromptKeywordChips";

type VisualProfilePanelProps = {
  character: typeof characterDetail;
};

export function VisualProfilePanel({ character }: VisualProfilePanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-4">
          <p className="text-xs text-[var(--text-muted)]">脸谱主色</p>
          <div className="mt-3 h-16 rounded border border-white/10" style={{ background: character.facePrimaryColor }} />
          <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">正红</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{character.colorSymbolism}</p>
        </div>
        <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-4">
          <p className="text-xs text-[var(--text-muted)]">脸谱纹样</p>
          <div className="mt-3 flex h-16 items-center justify-center rounded border border-[color:rgba(233,195,73,0.22)] bg-[color:rgba(233,195,73,0.08)] text-3xl text-[var(--accent-gold)]">面</div>
          <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{character.facePattern}</p>
        </div>
        <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-4">
          <p className="text-xs text-[var(--text-muted)]">服饰纹样</p>
          <div className="mt-3 h-16 rounded border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(233,195,73,0.24),transparent_28%),linear-gradient(135deg,rgba(201,58,50,0.22),rgba(20,20,20,0.9))]" />
          <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">{character.costumePattern}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">武器 / 英歌槌设定</p>
          <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
            {character.weapon}，近身爆发力强。英歌槌动作以“短促、顿挫、扫打”为主，避免生成成长枪或西式兵器。
          </p>
        </div>
        <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">视觉调性关键词</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {character.visualToneKeywords.map((keyword) => (
              <span key={keyword} className="rounded border border-[color:rgba(122,166,194,0.24)] bg-[color:rgba(111,132,144,0.12)] px-2 py-1 text-xs text-[var(--status-processing)]">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-4">
        <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">提示词 / Prompt 约束</p>
        <PromptKeywordChips
          positive={character.positivePromptKeywords}
          forbidden={character.forbiddenPromptKeywords}
        />
      </div>

      <div className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">材质关键词</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["粗糙皮革", "铁锈", "汗水", "烟尘", "木质纹理", "厚重布料"].map((keyword) => (
            <span key={keyword} className="rounded border border-[color:rgba(143,129,125,0.22)] bg-black/20 px-2 py-1 text-xs text-[var(--text-secondary)]">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
