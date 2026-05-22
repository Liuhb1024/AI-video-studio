import { SlidersHorizontal } from "lucide-react";

const filterGroups: Array<[string, string[]]> = [
  ["素材类型", ["全部", "图像", "视频", "音频", "字幕"]],
  ["镜头筛选", ["全部", "01", "02", "03", "04", "05", "06"]],
  ["状态", ["全部", "已采纳", "候选中", "已拒绝"]],
  ["拒绝原因", ["角色不一致", "脸谱错误", "动作不准", "模型错误"]],
];

export function AssetFilterPanel() {
  return (
    <aside className="space-y-4 rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <SlidersHorizontal className="h-4 w-4 text-[var(--accent-bluegray)]" />
          素材筛选
        </h2>
        <button type="button" className="text-xs text-[var(--text-muted)]">重置</button>
      </div>
      {filterGroups.map(([title, items]) => (
        <section key={title} className="border-t border-[color:rgba(111,132,144,0.14)] pt-4">
          <p className="text-xs text-[var(--accent-gold)]">{title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {items.map((item, index) => (
              <button
                key={item}
                type="button"
                className={index === 0 ? "rounded bg-[var(--accent-cinnabar)] px-2 py-1 text-xs text-white" : "rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 px-2 py-1 text-xs text-[var(--text-secondary)]"}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      ))}
      <section className="border-t border-[color:rgba(111,132,144,0.14)] pt-4">
        <p className="text-xs text-[var(--accent-gold)]">成本范围（¥）</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 px-3 py-2">最小</span>
          <span>→</span>
          <span className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 px-3 py-2">最大</span>
        </div>
      </section>
      <button type="button" className="w-full rounded bg-[var(--accent-cinnabar)] px-4 py-3 text-sm font-semibold text-white">应用筛选（75）</button>
    </aside>
  );
}
