import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CharacterAppearanceSummary } from "./CharacterAppearanceSummary";
import { FieldCompletenessBadge } from "./FieldCompletenessBadge";
import { FieldSourceBadge } from "./FieldSourceBadge";
import { PromptKeywordChips } from "./PromptKeywordChips";

export type CharacterCardData = {
  id: string;
  name: string;
  nickname: string;
  ranking: number;
  star: string;
  liangshanRole: string;
  weapon: string;
  yinggeRole: string;
  facePrimaryColor: string;
  facePrimaryColorCss?: string;
  facePattern: string;
  personalityTags: string[];
  positivePromptKeywords: string[];
  forbiddenPromptKeywords: string[];
  appearanceCount: number;
  referenceAssetCount: number;
  fieldCompleteness: number;
  excelSourceRow: number;
  visualProfile: string;
  narrativeProfile: string;
  commercialProfile: string;
};

type CharacterCardProps = {
  character: CharacterCardData;
};

export function CharacterCard({ character }: CharacterCardProps) {
  const faceColor = character.facePrimaryColorCss ?? character.facePrimaryColor;

  return (
    <article className="overflow-hidden rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(34,37,36,0.88),rgba(24,25,24,0.82))] shadow-[0_20px_44px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(233,195,73,0.06)]">
      <div className="relative flex h-44 items-end p-4">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at 24% 20%, ${faceColor}99, transparent 26%), radial-gradient(circle at 74% 28%, rgba(233,195,73,0.18), transparent 20%), linear-gradient(135deg, ${faceColor}66, rgba(15,15,15,0.96))`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/82 to-transparent" />
        <div className="absolute right-5 top-5 h-28 w-24 rounded-[48%_48%_42%_42%] border border-white/15 bg-black/24 shadow-[0_0_36px_rgba(0,0,0,0.36)]">
          <div
            className="mx-auto mt-4 h-20 w-14 rounded-[45%] border border-white/20"
            style={{
              background: `linear-gradient(135deg, ${faceColor}, rgba(0,0,0,0.45))`,
            }}
          />
          <div className="absolute left-4 top-12 h-px w-16 bg-white/25" />
          <div className="absolute left-9 top-6 h-20 w-px bg-white/18" />
        </div>
        <div className="relative">
          <p className="text-xs text-[var(--accent-gold)]">
            {character.nickname} · 排名 {character.ranking}
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-white">{character.name}</h3>
          <p className="mt-1 text-xs text-white/68">{character.star}</p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {character.yinggeRole}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {character.liangshanRole} · {character.weapon}
            </p>
          </div>
          <Link
            href={`/characters/${character.id}`}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[color:rgba(233,195,73,0.28)] text-[var(--accent-gold)] transition hover:border-[var(--accent-cinnabar)] hover:text-[var(--accent-cinnabar)]"
            aria-label={`查看 ${character.name} 详情`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-[78px_minmax(0,1fr)] gap-x-3 gap-y-2 rounded border border-[color:rgba(111,132,144,0.18)] bg-black/12 p-3 text-xs">
          <span className="text-[var(--accent-gold)]">脸谱主色</span>
          <span className="text-[var(--text-secondary)]">
            {character.facePrimaryColor}
          </span>
          <span className="text-[var(--accent-gold)]">脸谱纹样</span>
          <span className="leading-5 text-[var(--text-secondary)]">
            {character.facePattern}
          </span>
          <span className="text-[var(--accent-gold)]">武器</span>
          <span className="text-[var(--text-secondary)]">{character.weapon}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {character.personalityTags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-[color:rgba(122,166,194,0.24)] bg-[color:rgba(111,132,144,0.12)] px-2 py-1 text-[11px] text-[var(--accent-bluegray)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <PromptKeywordChips
          positive={character.positivePromptKeywords}
          forbidden={character.forbiddenPromptKeywords}
          compact
        />

        <CharacterAppearanceSummary
          appearanceCount={character.appearanceCount}
          referenceAssetCount={character.referenceAssetCount}
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-[color:rgba(111,132,144,0.18)] pt-3">
          <FieldCompletenessBadge value={character.fieldCompleteness} />
          <FieldSourceBadge row={character.excelSourceRow} />
        </div>
      </div>
    </article>
  );
}
