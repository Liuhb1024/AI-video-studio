import { CheckCircle2, Plus } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import type { CharacterCardData } from "./CharacterCard";
import { CharacterAppearanceSummary } from "./CharacterAppearanceSummary";
import { FieldCompletenessBadge } from "./FieldCompletenessBadge";
import { FieldSourceBadge } from "./FieldSourceBadge";
import { PromptKeywordChips } from "./PromptKeywordChips";

type CharacterDetailInspectorProps = {
  character: CharacterCardData;
};

const layerLabels = [
  { title: "身份层", subtitle: "Identity Layer", score: "12/12" },
  { title: "内核层", subtitle: "Inner Core Layer", score: "11/12" },
  { title: "文化视觉层", subtitle: "Cultural Visual Layer", score: "15/17" },
  { title: "叙事素材层", subtitle: "Narrative Material Layer", score: "18/20" },
  { title: "商业文化层", subtitle: "Commercial Culture Layer", score: "10/12" },
];

export function CharacterDetailInspector({
  character,
}: CharacterDetailInspectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-[var(--accent-gold)]">当前选中角色</p>
        <h3 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
          {character.name} · {character.nickname}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {character.yinggeRole}，{character.liangshanRole}，武器为
          {character.weapon}。
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FieldCompletenessBadge value={character.fieldCompleteness} />
        <FieldSourceBadge row={character.excelSourceRow} />
      </div>

      <CharacterAppearanceSummary
        appearanceCount={character.appearanceCount}
        referenceAssetCount={character.referenceAssetCount}
      />

      <div className="space-y-2">
        {layerLabels.map((layer, index) => (
          <div
            key={layer.title}
            className="rounded border border-[color:rgba(111,132,144,0.2)] bg-black/15 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[var(--accent-gold)]">
                  {index + 1}. {layer.title}
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  {layer.subtitle}
                </p>
              </div>
              <span className="font-mono text-[11px] text-[var(--accent-gold)]">
                {layer.score}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
              {layer.title === "身份层"
                ? `${character.star}，梁山排名第 ${character.ranking}，绰号 ${character.nickname}。`
                : null}
              {layer.title === "内核层" ? character.narrativeProfile : null}
              {layer.title === "文化视觉层" ? character.visualProfile : null}
              {layer.title === "叙事素材层" ? character.narrativeProfile : null}
              {layer.title === "商业文化层" ? character.commercialProfile : null}
            </p>
          </div>
        ))}
      </div>

      <SectionCard title="提示词 / Prompt 关键词" className="bg-black/10">
        <PromptKeywordChips
          positive={character.positivePromptKeywords}
          forbidden={character.forbiddenPromptKeywords}
        />
      </SectionCard>

      <div className="rounded border border-[color:rgba(130,219,111,0.22)] bg-[color:rgba(14,107,8,0.12)] p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--status-success)]">
          <CheckCircle2 className="h-4 w-4" />
          视觉一致性通过
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
          当前主色、武器、脸谱纹样和正向提示词已形成一致性来源，可用于
          gpt-image-2 与 Seedance 2.0 的后续生成约束。
        </p>
      </div>

      <button
        type="button"
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--accent-cinnabar)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(154,45,38,0.28)]"
      >
        <Plus className="h-4 w-4" />
        创建英歌短片
      </button>
    </div>
  );
}
