import { Download, FileSpreadsheet, Plus } from "lucide-react";

export function CharacterLibraryToolbar() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[color:rgba(90,64,62,0.42)] bg-[color:rgba(32,32,31,0.7)] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-[color:rgba(233,195,73,0.26)] bg-[color:rgba(233,195,73,0.08)] text-[var(--accent-gold)]">
          <FileSpreadsheet className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            角色圣经 Excel 已导入
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            45 个角色 · 6 个当前精选 · 字段平均完整度 92%
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded border border-[color:rgba(143,129,125,0.26)] px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent-gold)] hover:text-[var(--text-primary)]"
        >
          <Download className="h-4 w-4" />
          导出字段检查
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded bg-[var(--accent-cinnabar)] px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(154,45,38,0.28)]"
        >
          <Plus className="h-4 w-4" />
          从角色创建短片
        </button>
      </div>
    </div>
  );
}
