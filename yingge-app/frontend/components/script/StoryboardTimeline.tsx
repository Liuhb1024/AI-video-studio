import { panels } from "@/data/mock/panels";
import { shots } from "@/data/mock/shots";
import { ShotCard } from "./ShotCard";

export function StoryboardTimeline() {
  const panelCount = panels.length;

  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(35,38,37,0.78),rgba(22,23,22,0.74))] p-5 shadow-[0_20px_48px_rgba(0,0,0,0.2)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--accent-gold)]">Storyboard Timeline</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">分镜时间线</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {shots.length} 个镜头 / {panelCount} 个 Panel / 45 秒
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="rounded border border-[color:rgba(233,195,73,0.26)] px-3 py-2 text-xs text-[var(--accent-gold)]">自动分镜</button>
          <button type="button" className="rounded border border-[color:rgba(143,129,125,0.26)] px-3 py-2 text-xs text-[var(--text-secondary)]">调整顺序</button>
          <button type="button" className="rounded bg-[var(--accent-cinnabar)] px-3 py-2 text-xs font-semibold text-white">进入提示词工作台</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {shots.map((shot) => (
          <ShotCard
            key={shot.id}
            shot={shot}
            panels={panels.filter((panel) => panel.shotId === shot.id)}
          />
        ))}
      </div>
    </section>
  );
}
