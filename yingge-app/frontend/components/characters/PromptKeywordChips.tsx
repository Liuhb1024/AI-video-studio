type PromptKeywordChipsProps = {
  positive: string[];
  forbidden: string[];
  compact?: boolean;
};

export function PromptKeywordChips({
  positive,
  forbidden,
  compact = false,
}: PromptKeywordChipsProps) {
  const limit = compact ? 3 : 8;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {positive.slice(0, limit).map((keyword) => (
          <span
            key={keyword}
            className="rounded border border-[color:rgba(130,219,111,0.26)] bg-[color:rgba(14,107,8,0.14)] px-2 py-1 text-[11px] text-[var(--status-success)] shadow-[inset_0_1px_0_rgba(130,219,111,0.06)]"
          >
            {keyword}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {forbidden.slice(0, limit).map((keyword) => (
          <span
            key={keyword}
            className="rounded border border-[color:rgba(255,107,95,0.24)] bg-[color:rgba(147,0,10,0.14)] px-2 py-1 text-[11px] text-[var(--status-error)] shadow-[inset_0_1px_0_rgba(255,107,95,0.05)]"
          >
            禁止：{keyword}
          </span>
        ))}
      </div>
    </div>
  );
}
