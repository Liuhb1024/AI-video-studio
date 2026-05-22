import { ShieldCheck, Star } from "lucide-react";
import { FieldCompletenessBadge } from "./FieldCompletenessBadge";
import { CharacterAppearanceSummary } from "./CharacterAppearanceSummary";
import type { characterDetail } from "@/data/mock/characterDetail";

type CharacterHeroPanelProps = {
  character: typeof characterDetail;
};

export function CharacterHeroPanel({ character }: CharacterHeroPanelProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(34,37,36,0.88),rgba(24,25,24,0.82))] shadow-[0_20px_44px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(233,195,73,0.06)]">
      <div className="relative h-60 p-5">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 18%, ${character.facePrimaryColor}a8, transparent 28%), radial-gradient(circle at 78% 24%, rgba(233,195,73,0.18), transparent 20%), linear-gradient(145deg, ${character.facePrimaryColor}58, rgba(11,11,10,0.96))`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 to-transparent" />
        <div className="absolute right-7 top-7 h-32 w-24 rounded-[48%_48%_42%_42%] border border-white/15 bg-black/25 shadow-[0_0_48px_rgba(0,0,0,0.42)]">
          <div
            className="mx-auto mt-5 h-20 w-14 rounded-[45%] border border-white/20"
            style={{
              background: `linear-gradient(135deg, ${character.facePrimaryColor}, rgba(0,0,0,0.5))`,
            }}
          />
          <div className="absolute left-4 top-[60px] h-px w-16 bg-white/25" />
          <div className="absolute left-11 top-8 h-20 w-px bg-white/18" />
        </div>
        <div className="relative flex h-full flex-col justify-end">
          <p className="text-xs text-[var(--accent-gold)]">
            {character.nickname} · 梁山第 {character.ranking} 位
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{character.name}</h2>
          <p className="mt-2 text-sm text-white/70">{character.star}</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["梁山职务", character.liangshanRole],
            ["英歌定位", character.yinggeRole],
            ["兵器", character.weapon],
            ["脸谱主色", character.facePrimaryColor],
          ].map(([label, value]) => (
            <div key={label} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-2.5">
              <p className="text-[var(--text-muted)]">{label}</p>
              <p className="mt-1 font-medium text-[var(--text-primary)]">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <FieldCompletenessBadge value={96} />
          <span className="inline-flex items-center gap-1.5 rounded border border-[color:rgba(130,219,111,0.24)] bg-[color:rgba(14,107,8,0.12)] px-2 py-1 text-xs text-[var(--status-success)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            视觉规范已确认
          </span>
          <span className="inline-flex items-center gap-1.5 rounded border border-[color:rgba(233,195,73,0.24)] bg-[color:rgba(233,195,73,0.08)] px-2 py-1 text-xs text-[var(--accent-gold)]">
            <Star className="h-3.5 w-3.5" />
            Excel 第 15 行
          </span>
        </div>

        <CharacterAppearanceSummary
          appearanceCount={character.appearances.length}
          referenceAssetCount={character.referenceImages.length}
        />
      </div>
    </section>
  );
}
