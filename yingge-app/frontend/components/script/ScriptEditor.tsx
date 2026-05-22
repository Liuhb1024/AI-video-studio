import { Download, RotateCcw, Save } from "lucide-react";
import type { MockScript } from "@/data/mock/scripts";
import { StatusBadge } from "@/components/common/StatusBadge";

type ScriptEditorProps = {
  script: MockScript;
};

export function ScriptEditor({ script }: ScriptEditorProps) {
  return (
    <section className="min-w-0 rounded-lg border border-[color:rgba(111,132,144,0.24)] bg-[linear-gradient(180deg,rgba(35,38,37,0.84),rgba(24,25,24,0.78))] p-5 shadow-[0_20px_48px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(233,195,73,0.06)]">
      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <p className="text-xs text-[var(--accent-gold)]">剧本编辑器 / Script Editor</p>
          <h2 className="mt-1 whitespace-normal text-2xl font-semibold leading-8 text-[var(--text-primary)]">
            {script.title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status="success">
            {script.version} · {script.status}
          </StatusBadge>
          <button type="button" className="inline-flex shrink-0 items-center gap-2 rounded border border-[color:rgba(143,129,125,0.26)] px-3 py-2 text-xs text-[var(--text-secondary)]">
            <Download className="h-3.5 w-3.5" />
            导入剧本
          </button>
          <button type="button" className="inline-flex shrink-0 items-center gap-2 rounded border border-[color:rgba(233,195,73,0.26)] px-3 py-2 text-xs text-[var(--accent-gold)]">
            <RotateCcw className="h-3.5 w-3.5" />
            重新生成
          </button>
          <button type="button" className="inline-flex shrink-0 items-center gap-2 rounded bg-[var(--accent-cinnabar)] px-3 py-2 text-xs font-semibold text-white shadow-[0_0_18px_rgba(178,34,34,0.22)]">
            <Save className="h-3.5 w-3.5" />
            保存版本
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
        {[
          ["平台", script.platform],
          ["时长", script.duration],
          ["画幅", script.aspectRatio],
          ["语气", script.tone],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-[color:rgba(111,132,144,0.18)] bg-black/15 p-3">
            <p className="text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 whitespace-normal font-medium leading-5 text-[var(--text-primary)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded border border-[color:rgba(111,132,144,0.2)] bg-black/18">
        <div className="border-b border-[color:rgba(111,132,144,0.16)] px-4 py-3">
          <p className="text-xs text-[var(--accent-gold)]">Hook</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{script.hook}</p>
        </div>
        <div className="divide-y divide-[color:rgba(111,132,144,0.12)]">
          {script.narration.map((line, index) => (
            <div key={line} className="grid grid-cols-[32px_minmax(0,1fr)_72px] gap-3 px-4 py-3 text-sm">
              <span className="font-mono text-xs text-[var(--text-muted)]">{index + 1}</span>
              <p className="min-w-0 whitespace-normal leading-7 text-[var(--text-secondary)]">{line}</p>
              <span className="font-mono text-xs text-[var(--text-muted)]">00:{String(index * 5).padStart(2, "0")}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[color:rgba(111,132,144,0.16)] px-4 py-3">
          <p className="text-xs text-[var(--accent-gold)]">Ending</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{script.ending}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {script.keywords.map((keyword) => (
          <span key={keyword} className="rounded border border-[color:rgba(122,166,194,0.24)] bg-[color:rgba(111,132,144,0.12)] px-2 py-1 text-xs text-[var(--status-processing)]">
            {keyword}
          </span>
        ))}
      </div>
    </section>
  );
}
