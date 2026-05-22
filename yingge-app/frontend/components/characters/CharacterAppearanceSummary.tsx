import { Image as ImageIcon, Layers3 } from "lucide-react";

type CharacterAppearanceSummaryProps = {
  appearanceCount: number;
  referenceAssetCount: number;
};

export function CharacterAppearanceSummary({
  appearanceCount,
  referenceAssetCount,
}: CharacterAppearanceSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded border border-[color:rgba(90,64,62,0.28)] bg-black/15 p-2">
        <Layers3 className="mb-1 h-3.5 w-3.5 text-[var(--accent-bluegray)]" />
        <p className="text-xs text-[var(--text-muted)]">外观数量</p>
        <p className="mt-1 font-mono text-lg text-[var(--text-primary)]">
          {appearanceCount}
        </p>
      </div>
      <div className="rounded border border-[color:rgba(90,64,62,0.28)] bg-black/15 p-2">
        <ImageIcon className="mb-1 h-3.5 w-3.5 text-[var(--accent-gold)]" />
        <p className="text-xs text-[var(--text-muted)]">参考素材</p>
        <p className="mt-1 font-mono text-lg text-[var(--text-primary)]">
          {referenceAssetCount}
        </p>
      </div>
    </div>
  );
}
