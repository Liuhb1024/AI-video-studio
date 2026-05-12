import { moduleChips } from "@/lib/navigation";

export function TopBar() {
  return (
    <header className="border-b border-[#e7b45f]/10 bg-black/25 px-4 py-3 backdrop-blur-2xl md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-stage-200/70">Production Command Table</div>
            <h1 className="mt-1 text-xl font-semibold text-[#fff5df] md:text-2xl">AI 英歌漫剧生产工作台</h1>
            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#cfc1a6]">
              像一张导演桌：剧本在左，分镜在中，生成任务和素材回收在右。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-stage-300/35 bg-stage-400/10 px-3 py-1 text-xs font-medium text-stage-100 shadow-stage-glow">
              生产就绪
            </div>
            <div className="rounded-full border border-[#e7b45f]/10 bg-[#f5ead6]/[0.045] px-3 py-1 text-xs text-[#e8dbc2]">
              10 个模块已接入
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {moduleChips.map((chip) => (
            <div
              key={chip}
              className="rounded-full border border-[#e7b45f]/10 bg-black/25 px-2.5 py-0.5 text-[11px] tracking-[0.08em] text-[#bfb196]"
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
