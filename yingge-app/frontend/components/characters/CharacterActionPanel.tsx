import { Download, FilePlus2, ImagePlus, WandSparkles } from "lucide-react";

const actions = [
  { label: "生成造型提示词", icon: WandSparkles, primary: true },
  { label: "生成形象参考图", icon: ImagePlus },
  { label: "新建短片项目", icon: FilePlus2 },
  { label: "导出角色圣经", icon: Download },
];

export function CharacterActionPanel() {
  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[color:rgba(28,27,27,0.72)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">快速操作</h3>
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              className={
                action.primary
                  ? "inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--accent-cinnabar)] px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(154,45,38,0.22)]"
                  : "inline-flex w-full items-center justify-center gap-2 rounded border border-[color:rgba(143,129,125,0.24)] px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent-gold)] hover:text-[var(--text-primary)]"
              }
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
