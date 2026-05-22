import { BookOpen, History, Image as ImageIcon } from "lucide-react";

const memoryItems = [
  { icon: BookOpen, label: "角色圣经字段", value: "脸谱主色、哨棒、行者人格已注入" },
  { icon: History, label: "上一轮失败原因", value: "第 3 镜武器形态偏离，需加强禁止词" },
  { icon: ImageIcon, label: "已采纳素材", value: "主外观 1 张、关键帧 4 张可作为参考" },
];

export function MemoryContextPanel() {
  return (
    <section className="rounded-lg border border-[color:rgba(111,132,144,0.22)] bg-[color:rgba(28,27,27,0.72)] p-3">
      <p className="text-sm font-semibold text-[var(--text-primary)]">上下文记忆 / Memory</p>
      <div className="mt-3 space-y-2">
        {memoryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-2.5">
              <div className="flex items-center gap-2 text-xs text-[var(--accent-gold)]">
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{item.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
