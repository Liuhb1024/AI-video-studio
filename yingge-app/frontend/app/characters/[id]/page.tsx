import { CharacterActionPanel } from "@/components/characters/CharacterActionPanel";
import { CharacterBibleTabs } from "@/components/characters/CharacterBibleTabs";
import { CharacterHeroPanel } from "@/components/characters/CharacterHeroPanel";
import { CharacterReferenceGallery } from "@/components/characters/CharacterReferenceGallery";
import { ConsistencyChecklist } from "@/components/characters/ConsistencyChecklist";
import { AppShell } from "@/components/layout/AppShell";
import { characterDetail } from "@/data/mock/characterDetail";

export default function CharacterDetailPage() {
  return (
    <AppShell
      title="角色圣经详情"
      eyebrow="Character Bible Detail"
      subtitle="查看单个角色的身份、内核、文化视觉、叙事素材和商业文化档案，并追踪字段来源与视觉一致性。"
      inspectorType="consistency"
      inspectorTitle="一致性检查"
      inspectorDescription="用于后续剧本、Prompt、生图和生视频的一致性约束。"
      currentStage="角色圣经详情"
      rightInspector={
        <div className="space-y-4">
          <ConsistencyChecklist
            items={characterDetail.consistencyChecklist}
            fieldSources={characterDetail.fieldSources}
          />
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded bg-[var(--accent-cinnabar)] px-4 py-3 text-sm font-semibold text-white"
          >
            在剧本中使用此角色
          </button>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded border border-[color:rgba(233,195,73,0.28)] px-4 py-3 text-sm font-semibold text-[var(--accent-gold)]"
          >
            创建视频项目
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5">
        <div className="space-y-4">
          <CharacterHeroPanel character={characterDetail} />
          <CharacterReferenceGallery references={characterDetail.referenceImages} />
          <CharacterActionPanel />
        </div>
        <CharacterBibleTabs character={characterDetail} />
      </div>
    </AppShell>
  );
}
