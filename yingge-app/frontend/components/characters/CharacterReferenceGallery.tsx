import type { CharacterReferenceImage } from "@/data/mock/characterDetail";

type CharacterReferenceGalleryProps = {
  references: CharacterReferenceImage[];
};

const statusClassName: Record<CharacterReferenceImage["status"], string> = {
  已采纳: "border-[color:rgba(130,219,111,0.26)] text-[var(--status-success)]",
  候选: "border-[color:rgba(233,195,73,0.24)] text-[var(--accent-gold)]",
  避色: "border-[color:rgba(255,107,95,0.22)] text-[var(--status-error)]",
};

export function CharacterReferenceGallery({
  references,
}: CharacterReferenceGalleryProps) {
  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">参考图集</h3>
        <span className="text-xs text-[var(--text-muted)]">{references.length} 张</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {references.map((item, index) => (
          <div key={item.id} className="overflow-hidden rounded border border-[color:rgba(111,132,144,0.18)] bg-black/20">
            <div className="h-20 bg-[radial-gradient(circle_at_35%_30%,rgba(201,58,50,0.52),transparent_32%),linear-gradient(135deg,rgba(233,195,73,0.12),rgba(12,12,12,0.88))]" />
            <div className="p-2">
              <p className="truncate text-xs text-[var(--text-primary)]">{item.title}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--text-muted)]">{item.type} #{index + 1}</span>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] ${statusClassName[item.status]}`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
