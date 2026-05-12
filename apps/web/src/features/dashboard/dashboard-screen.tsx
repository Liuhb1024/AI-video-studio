import { PageHeader } from "@/components/layout/page-header";

const kpis = [
  { label: "活跃项目", value: "12", hint: "本周新增 3 个立项，2 个进入分镜阶段。" },
  { label: "待处理镜头", value: "48", hint: "其中 14 条等待素材确认，8 条待生成。" },
  { label: "生成队列", value: "07", hint: "图像 4、视频 2、配音 1，均在生产中。" },
  { label: "交付节点", value: "03", hint: "2 个粗剪包、1 个最终交付包排期中。" },
];

const pipeline = [
  { stage: "项目", detail: "立项、分组、预算、里程碑", status: "平稳推进" },
  { stage: "剧本", detail: "大纲、对白、场景版本同步", status: "1 个版本待审" },
  { stage: "分镜", detail: "镜头拆解、节奏和构图", status: "8 个镜头待补全" },
  { stage: "生成", detail: "图像、视频、音频批量产出", status: "生成排队 7 项" },
  { stage: "成片", detail: "粗剪、精剪、导出与归档", status: "3 个交付包" },
];

const alerts = [
  {
    title: "素材断点提醒",
    description: "项目「岭南夜巡」第 3 场关键道具缺少定稿素材，需要在进入生成前锁定。",
  },
  {
    title: "协同提醒",
    description: "角色「阿英」设定卡已更新，建议同步到剧本和分镜引用位。",
  },
];

export function DashboardScreen() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="数据看板"
        title="制作节奏总览"
        description="在一个界面里跟踪项目推进、镜头生产、生成排队和交付风险，帮助制作团队快速判断下一步。"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.label} className="surface rounded-[1.35rem] p-5 shadow-panel">
            <div className="text-xs uppercase tracking-[0.22em] text-[#8f846f]">{item.label}</div>
            <div className="mt-3 text-5xl font-semibold text-[#fff5df]">{item.value}</div>
            <div className="mt-3 h-px bg-gradient-to-r from-stage-300/45 to-transparent" />
            <p className="mt-3 text-sm leading-7 text-[#c9bea8]">{item.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <div className="surface rounded-[1.55rem] p-5 shadow-panel md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-[#fff5df]">生产流水线</div>
              <p className="mt-1 text-sm text-[#9c907a]">从项目到成片的关键链路状态。</p>
            </div>
            <div className="rounded-full border border-stage-400/30 bg-stage-400/10 px-3 py-1 text-xs text-stage-100">
              今日追踪
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {pipeline.map((item) => (
              <div
                key={item.stage}
                className="grid gap-3 rounded-2xl border border-[#e7b45f]/10 bg-black/30 p-4 transition duration-300 hover:border-stage-300/30 hover:bg-stage-400/[0.055] md:grid-cols-[140px_1fr_120px] md:items-center"
              >
                <div className="text-sm font-medium text-[#fff5df]">{item.stage}</div>
                <div className="text-sm leading-7 text-[#d4c6aa]">{item.detail}</div>
                <div className="text-sm text-stage-100 md:text-right">{item.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <article key={alert.title} className="rounded-[1.35rem] border border-teal-300/25 bg-teal-400/[0.08] p-5 shadow-panel">
              <div className="text-sm font-medium text-[#fff5df]">{alert.title}</div>
              <p className="mt-2 text-sm leading-7 text-[#c9bea8]">{alert.description}</p>
            </article>
          ))}

          <article className="surface rounded-[1.35rem] p-5 shadow-panel">
            <div className="text-sm font-medium text-[#fff5df]">建议动作</div>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-[#d4c6aa]">
              <li>• 先从项目页锁定当前优先级最高的两个制作包。</li>
              <li>• 将剧本版本和角色设定同步到分镜与生成队列。</li>
              <li>• 进入成片页检查导出规范与交付包完整性。</li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
