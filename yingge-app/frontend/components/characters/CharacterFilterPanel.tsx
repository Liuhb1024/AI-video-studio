import { SectionCard } from "@/components/common/SectionCard";

const filters = [
  {
    title: "脸谱主色",
    values: ["朱砂红", "冷蓝", "黑红", "青绿", "金白"],
  },
  {
    title: "梁山职务",
    values: ["步军头领", "马军五虎将", "马军八骠骑"],
  },
  {
    title: "英歌定位",
    values: ["先锋", "二番", "力量", "射手"],
  },
  {
    title: "武器",
    values: ["哨棒", "长枪", "禅杖", "双斧", "弓箭"],
  },
  {
    title: "人格标签",
    values: ["勇猛", "隐忍", "豪侠", "赤诚", "精准"],
  },
  {
    title: "字段完整度",
    values: ["90% 以上", "需补字段", "需人工确认"],
  },
  {
    title: "素材引用状态",
    values: ["有定妆图", "有参考素材", "缺少视频"],
  },
];

export function CharacterFilterPanel() {
  return (
    <SectionCard
      title="角色筛选"
      description="按文化视觉与生产可用性筛选。"
      className="sticky top-24"
    >
      <div className="space-y-4">
        {filters.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-[11px] font-semibold text-[var(--accent-gold)]">
              {group.title}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => (
                <button
                  key={value}
                  type="button"
                  className="rounded border border-[color:rgba(143,129,125,0.22)] bg-black/14 px-2 py-1 text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--accent-cinnabar)] hover:bg-[color:rgba(178,34,34,0.12)] hover:text-[var(--text-primary)]"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
