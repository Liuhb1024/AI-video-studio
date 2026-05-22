import type { characterDetail, CharacterDetailLayer } from "@/data/mock/characterDetail";
import { VisualProfilePanel } from "./VisualProfilePanel";

type CharacterBibleTabsProps = {
  character: typeof characterDetail;
};

function LayerFields({ layer }: { layer: CharacterDetailLayer }) {
  return (
    <div className="space-y-4 rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.7)] p-5">
      <div>
        <p className="text-xs text-[var(--accent-gold)]">{layer.subtitle}</p>
        <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{layer.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{layer.summary}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {layer.fields.map((field) => (
          <div key={field.label} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
            <p className="text-xs text-[var(--accent-gold)]">{field.label}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CharacterBibleTabs({ character }: CharacterBibleTabsProps) {
  const layers = [
    character.identityLayer,
    character.innerCoreLayer,
    character.culturalVisualLayer,
    character.narrativeMaterialLayer,
    character.commercialCultureLayer,
  ];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {layers.map((layer, index) => {
          const active = layer.title === "文化视觉层";
          return (
            <div
              key={layer.title}
              className={
                active
                  ? "min-h-[86px] rounded-lg border border-[color:rgba(178,34,34,0.48)] bg-[color:rgba(178,34,34,0.24)] p-3 shadow-[inset_0_1px_0_rgba(255,180,172,0.16)]"
                  : "min-h-[86px] rounded-lg border border-[color:rgba(111,132,144,0.2)] bg-[color:rgba(28,27,27,0.72)] p-3"
              }
            >
              <p className="text-sm font-semibold leading-5 text-[var(--text-primary)]">
                {index + 1}. {layer.title}
              </p>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">{layer.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(35,38,37,0.84),rgba(24,25,24,0.78))] p-5">
        <div className="mb-4">
          <p className="text-xs text-[var(--accent-gold)]">Cultural Visual Layer</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">文化视觉层</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            定义角色的视觉符号体系，确保图片、视频与后续素材中保持一致的文化表达。
          </p>
        </div>
        <VisualProfilePanel character={character} />
      </div>

      <LayerFields layer={character.narrativeMaterialLayer} />
      <LayerFields layer={character.commercialCultureLayer} />
    </section>
  );
}
