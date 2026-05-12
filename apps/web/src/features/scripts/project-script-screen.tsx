"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog, ProgressOverlay, ToastMessage, ToastTone, ToastViewport } from "@/components/ui/feedback";
import { deleteProjectScriptVersion, generateProjectScript, getProjectScriptVersion, listProjectScripts } from "@/lib/api/scripts";
import type { Script, ScriptGenerationSettings, ScriptVersionResult } from "@/features/scripts/types";

const aspectRatios = [
  { value: "21:9", label: "21:9", kind: "横版" },
  { value: "16:9", label: "16:9", kind: "横版" },
  { value: "3:2", label: "3:2", kind: "横版" },
  { value: "4:3", label: "4:3", kind: "横版" },
  { value: "1:1", label: "1:1", kind: "方版" },
  { value: "3:4", label: "3:4", kind: "竖版" },
  { value: "2:3", label: "2:3", kind: "竖版" },
  { value: "9:16", label: "9:16", kind: "竖版" },
];

const visualSymbolOptions = ["脸谱", "双槌", "鼓点", "队列", "祠堂", "潮汕街巷", "红黑服饰", "仪式感动作"];
const tabooOptions = ["避免戏谑民俗", "避免文化误读", "避免低俗化", "避免过度恐怖化"];

const initialSettings: ScriptGenerationSettings = {
  story_seed: "",
  duration_seconds: 60,
  platform: "抖音",
  aspect_ratio: "9:16",
  story_structure: "短视频强钩子",
  opening_style: "悬念开头",
  ending_style: "悬念留钩子",
  genre: "民俗奇幻",
  tone: "神秘",
  dialogue_density: "标准",
  action_density: "高",
  narration_ratio: "少量旁白",
  yingge_intensity: "中",
  cultural_expression: "热血仪式感",
  tradition_modern_mix: "现代场景中的传统元素",
  visual_symbols: ["脸谱", "双槌", "鼓点", "队列", "祠堂"],
  taboos: ["避免戏谑民俗", "避免文化误读", "避免低俗化"],
};

type ProjectScriptScreenProps = {
  projectId: string;
};

export function ProjectScriptScreen({ projectId }: ProjectScriptScreenProps) {
  const router = useRouter();
  const resultRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<ScriptGenerationSettings>(initialSettings);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [result, setResult] = useState<ScriptVersionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingVersionId, setLoadingVersionId] = useState<string | null>(null);
  const [pendingDeleteScript, setPendingDeleteScript] = useState<Script | null>(null);
  const [deletingScriptId, setDeletingScriptId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function showToast(tone: ToastTone, title: string, description?: string) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, tone, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }

  useEffect(() => {
    async function loadScripts() {
      setLoading(true);
      try {
        const scriptList = await listProjectScripts(projectId);
        setScripts(scriptList);
      } catch {
        showToast("error", "剧本列表加载失败", "请确认后端服务可用。");
      } finally {
        setLoading(false);
      }
    }

    void loadScripts();
  }, [projectId]);

  useEffect(() => {
    if (!generating) {
      setProgress(0);
      return;
    }

    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current < 28) {
          return current + 8;
        }
        if (current < 74) {
          return current + 3;
        }
        if (current < 88) {
          return current + 1;
        }
        return current;
      });
    }, 700);

    return () => window.clearInterval(timer);
  }, [generating]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings.story_seed.trim()) {
      showToast("info", "先输入故事灵感", "给我一段你的想法，我再帮你扩写成短视频剧本。");
      return;
    }

    setGenerating(true);
    try {
      const generated = await generateProjectScript(projectId, {
        ...settings,
        story_seed: settings.story_seed.trim(),
      });
      setProgress(96);
      setResult({ script: generated.script, scenes: generated.scenes });
      setScripts((current) => [generated.script, ...current]);
      showToast("success", "剧本已生成", "已保存剧本版本，并拆出场次草案。");
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch {
      showToast("error", "剧本生成失败", "请检查后端服务或稍后重试。");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSelectScript(script: Script) {
    setLoadingVersionId(script.id);
    try {
      const version = await getProjectScriptVersion(projectId, script.id);
      setResult(version);
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (error) {
      showToast("error", "版本读取失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setLoadingVersionId(null);
    }
  }

  async function handleDeleteScript() {
    if (!pendingDeleteScript) {
      return;
    }

    const target = pendingDeleteScript;
    setDeletingScriptId(target.id);
    try {
      await deleteProjectScriptVersion(projectId, target.id);
      const nextScripts = scripts.filter((script) => script.id !== target.id);
      setScripts(nextScripts);
      setPendingDeleteScript(null);
      showToast("success", "历史版本已删除", `v${target.version} 已移除。`);
      if (result?.script.id === target.id) {
        if (nextScripts[0]) {
          await handleSelectScript(nextScripts[0]);
        } else {
          setResult(null);
        }
      }
    } catch (error) {
      showToast("error", "版本删除失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setDeletingScriptId(null);
    }
  }

  const progressSteps = [
    { label: "解析故事灵感", threshold: 10 },
    { label: "规划时间轴节奏", threshold: 28 },
    { label: "调用 DMXAPI 模型", threshold: 48 },
    { label: "校验 JSON 结构", threshold: 78 },
    { label: "保存剧本版本", threshold: 92 },
    { label: "拆分场次草案", threshold: 98 },
  ].map((step) => ({
    label: step.label,
    status: progress >= step.threshold ? ("done" as const) : progress >= step.threshold - 18 ? ("active" as const) : ("pending" as const),
  }));

  return (
    <div className="space-y-6">
      <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <ProgressOverlay
        open={generating}
        title="正在生成剧本"
        description="模型正在把故事灵感拆成可生产的时间轴剧本。你可以停留在页面任意位置，进度会一直可见。"
        progress={progress}
        steps={progressSteps}
      />
      <ConfirmDialog
        open={Boolean(pendingDeleteScript)}
        title="删除历史版本"
        description={`确认删除「${pendingDeleteScript?.title ?? ""}」v${pendingDeleteScript?.version ?? ""}？对应场次草案也会一起删除。`}
        confirmLabel="删除版本"
        loading={Boolean(deletingScriptId)}
        onCancel={() => setPendingDeleteScript(null)}
        onConfirm={() => void handleDeleteScript()}
      />
      <Breadcrumbs items={[{ label: "项目中心", href: "/projects" }, { label: "项目文件夹", href: `/projects/${projectId}` }, { label: "剧本" }]} />
      <PageHeader
        eyebrow="项目剧本"
        title="短视频故事线生成"
        description="剧本是故事资产核心。这里先把你的灵感扩成完整短视频剧本，再拆出后续可转分镜的场次。"
        actions={
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-xs text-stage-100 transition hover:border-stage-300/35"
          >
            返回项目文件夹
          </button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <form className="surface rounded-xl p-4 shadow-panel md:p-5" onSubmit={handleGenerate}>
          <div className="text-sm font-medium text-[#fff5df]">故事灵感</div>
          <p className="mt-1.5 text-xs leading-5 text-[#bfb196]">输入故事火花，再通过参数约束生成方向。</p>

          <div className="mt-4 space-y-4">
            <Field label="原始想法">
              <textarea
                value={settings.story_seed}
                onChange={(event) => setSettings((current) => ({ ...current, story_seed: event.target.value }))}
                rows={5}
                placeholder="例如：一个年轻英歌队员夜里听见祠堂鼓点，发现脸谱在月光下变了表情。"
                className="field-input resize-none"
              />
            </Field>

            <div className="grid gap-3 md:grid-cols-2">
              <SelectField
                label="视频时长"
                value={String(settings.duration_seconds)}
                options={[
                  ["15", "15秒"],
                  ["30", "30秒"],
                  ["60", "60秒"],
                  ["90", "90秒"],
                  ["180", "3分钟"],
                ]}
                onChange={(value) => setSettings((current) => ({ ...current, duration_seconds: Number(value) }))}
              />
              <SelectField
                label="目标平台"
                value={settings.platform}
                options={["抖音", "视频号", "小红书", "B站", "快手", "通用"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, platform: value }))}
              />
            </div>

            <Field label="画面比例">
              <div className="grid grid-cols-4 gap-2">
                {aspectRatios.map((ratio) => {
                  const active = settings.aspect_ratio === ratio.value;
                  return (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setSettings((current) => ({ ...current, aspect_ratio: ratio.value }))}
                      className={`rounded-xl border px-2 py-2 text-center transition ${
                        active
                          ? "border-stage-300/45 bg-stage-400/[0.16] text-[#fff5df] shadow-stage-glow"
                          : "border-[#e7b45f]/10 bg-black/25 text-[#bfb196] hover:border-stage-300/30"
                      }`}
                    >
                      <div className="mx-auto mb-1.5 h-4 rounded border-2 border-current opacity-75" style={ratioIconStyle(ratio.value)} />
                      <div className="text-xs font-medium">{ratio.label}</div>
                      <div className="mt-1 text-[10px] opacity-65">{ratio.kind}</div>
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="grid gap-3 md:grid-cols-2">
              <SelectField
                label="故事结构"
                value={settings.story_structure}
                options={["短视频强钩子", "三段式", "四段反转", "起承转合"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, story_structure: value }))}
              />
              <SelectField
                label="类型风格"
                value={settings.genre}
                options={["民俗奇幻", "热血燃向", "悬疑惊悚", "英雄成长", "喜剧反差", "悲壮史诗"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, genre: value }))}
              />
              <SelectField
                label="开头方式"
                value={settings.opening_style}
                options={["悬念开头", "动作开头", "冲突开头", "旁白开头", "视觉奇观开头"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, opening_style: value }))}
              />
              <SelectField
                label="结尾方式"
                value={settings.ending_style}
                options={["完整闭环", "反转结尾", "悬念留钩子", "情绪升华", "系列待续"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, ending_style: value }))}
              />
              <SelectField
                label="情绪基调"
                value={settings.tone}
                options={["燃", "神秘", "压迫", "热闹", "悲壮", "温情", "诡谲"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, tone: value }))}
              />
              <SelectField
                label="英歌强度"
                value={settings.yingge_intensity}
                options={["轻", "中", "重"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, yingge_intensity: value }))}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <SelectField
                label="对白密度"
                value={settings.dialogue_density}
                options={["少对白", "标准", "多对白"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, dialogue_density: value }))}
              />
              <SelectField
                label="动作密度"
                value={settings.action_density}
                options={["低", "中", "高"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, action_density: value }))}
              />
              <SelectField
                label="旁白比例"
                value={settings.narration_ratio}
                options={["无旁白", "少量旁白", "旁白驱动"].map((item) => [item, item])}
                onChange={(value) => setSettings((current) => ({ ...current, narration_ratio: value }))}
              />
            </div>

            <SelectField
              label="文化表达"
              value={settings.cultural_expression}
              options={["自然融入", "强文化展示", "神秘化表达", "热血仪式感", "现代潮流化"].map((item) => [item, item])}
              onChange={(value) => setSettings((current) => ({ ...current, cultural_expression: value }))}
            />
            <SelectField
              label="传统/现代融合"
              value={settings.tradition_modern_mix}
              options={["传统", "传统为主，少量现代", "现代场景中的传统元素", "赛博/潮流重构"].map((item) => [item, item])}
              onChange={(value) => setSettings((current) => ({ ...current, tradition_modern_mix: value }))}
            />

            <ChipGroup
              label="视觉符号"
              options={visualSymbolOptions}
              values={settings.visual_symbols}
              onChange={(values) => setSettings((current) => ({ ...current, visual_symbols: values }))}
            />
            <ChipGroup
              label="禁忌处理"
              options={tabooOptions}
              values={settings.taboos}
              onChange={(values) => setSettings((current) => ({ ...current, taboos: values }))}
            />
          </div>

          <div className="sticky bottom-4 mt-5 rounded-xl border border-[#e7b45f]/15 bg-[#11140f]/90 p-2 shadow-panel backdrop-blur-xl">
            <button
              type="submit"
              disabled={generating}
              className="w-full rounded-lg border border-stage-300/35 bg-stage-400/15 px-4 py-2.5 text-sm font-medium text-[#fff5df] transition hover:bg-stage-400/22 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {generating ? "生成中..." : "生成短视频剧本"}
            </button>
            <div className="mt-2 text-center text-[11px] leading-4 text-[#9c907a]">
              {generating ? "正在调用后端生成剧本，完成后会自动跳到结果区。" : "结果会显示在右侧，并保存为剧本版本。"}
            </div>
          </div>
        </form>

        <div className="space-y-4" ref={resultRef}>
          <section className="surface rounded-xl p-4 shadow-panel md:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-[#fff5df]">生成结果</div>
                <p className="mt-1.5 text-xs leading-5 text-[#bfb196]">保存为剧本版本，并同步生成场次草案。</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="rounded-full border border-stage-300/25 bg-stage-400/[0.08] px-2.5 py-1 text-xs text-stage-100">
                  {result ? `v${result.script.version}` : "等待生成"}
                </div>
                {result ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/projects/${projectId}/shots?scriptId=${result.script.id}`)}
                    className="rounded-full border border-teal-300/30 bg-teal-400/[0.12] px-3 py-1.5 text-xs text-teal-100 transition hover:bg-teal-400/[0.2]"
                  >
                    进入分镜 →
                  </button>
                ) : null}
              </div>
            </div>

            {result ? (
              <div className="mt-4 rounded-xl border border-[#e7b45f]/10 bg-black/30 p-4">
                <div className="text-lg font-semibold text-[#fff5df]">{result.script.title}</div>
                <pre className="mt-3 max-h-[560px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-[#d8cab0]">{result.script.content}</pre>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push(`/projects/${projectId}/shots?scriptId=${result.script.id}`)}
                    className="rounded-xl border border-stage-300/35 bg-stage-400/[0.14] px-4 py-2 text-sm font-medium text-[#fff5df] shadow-stage-glow transition hover:bg-stage-400/[0.22]"
                  >
                    用这个剧本生成分镜草案 →
                  </button>
                </div>
              </div>
            ) : (
              <EmptyPanel title="还没有生成剧本" description="左侧输入故事灵感和参数后，点击生成短视频剧本。" />
            )}
          </section>

          <section className="surface rounded-xl p-4 shadow-panel md:p-5">
            <div className="text-sm font-medium text-[#fff5df]">场次拆分</div>
            <p className="mt-1.5 text-xs leading-5 text-[#bfb196]">这些场次后续会继续转成分镜卡。</p>
            <div className="mt-4 grid gap-2.5">
              {result?.scenes.length ? (
                result.scenes.map((scene) => (
                  <article key={scene.id} className="rounded-xl border border-[#e7b45f]/10 bg-black/30 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full border border-stage-300/25 bg-stage-400/[0.08] px-2.5 py-1 text-xs text-stage-100">
                        {String(scene.order_index).padStart(2, "0")}
                      </div>
                      <div className="font-medium text-[#fff5df]">{scene.title}</div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#c9bea8]">{scene.summary}</p>
                    <p className="mt-2 text-xs leading-5 text-[#9f927c]">{scene.raw_text}</p>
                  </article>
                ))
              ) : (
                <EmptyPanel title="等待场次草案" description="剧本生成后，这里会显示 3秒钩子、冲突推进、高能段落和悬念收束。" />
              )}
            </div>
          </section>

          <section className="surface rounded-xl p-4 shadow-panel md:p-5">
            <div className="text-sm font-medium text-[#fff5df]">历史版本</div>
            <div className="mt-4 grid gap-3">
              {loading ? <EmptyPanel title="正在读取版本..." description="连接后端获取当前项目剧本。" /> : null}
              {!loading && scripts.length === 0 ? <EmptyPanel title="暂无版本" description="生成后会在这里沉淀版本记录。" /> : null}
              {!loading &&
                scripts.map((script) => (
                  <article
                    key={script.id}
                    className={`rounded-xl border px-3.5 py-3 transition ${
                      result?.script.id === script.id
                        ? "border-stage-300/35 bg-stage-400/[0.1]"
                        : "border-[#e7b45f]/10 bg-black/25 hover:border-stage-300/25"
                    }`}
                  >
                    <button type="button" onClick={() => void handleSelectScript(script)} className="block w-full text-left">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-[#fff5df]">{script.title}</div>
                        <div className="text-xs text-stage-100">{loadingVersionId === script.id ? "读取中" : `v${script.version}`}</div>
                      </div>
                      <div className="mt-1 text-xs text-[#8f846f]">{new Date(script.created_at).toLocaleString("zh-CN")}</div>
                    </button>
                    <div className="mt-3 flex justify-end gap-2 border-t border-[#e7b45f]/10 pt-3">
                      <button type="button" onClick={() => void handleSelectScript(script)} className="rounded-full border border-[#e7b45f]/15 bg-black/25 px-3 py-1 text-xs text-stage-100">
                        查看
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteScript(script)}
                        disabled={deletingScriptId === script.id}
                        className="rounded-full border border-clay-300/30 bg-clay-500/[0.1] px-3 py-1 text-xs text-[#ffd7c3] disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {deletingScriptId === script.id ? "删除中" : "删除"}
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-[#9c907a]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="field-input">
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  );
}

function ChipGroup({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    onChange([...values, value]);
  }

  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                active
                  ? "border-stage-300/45 bg-stage-400/[0.14] text-[#fff5df]"
                  : "border-[#e7b45f]/10 bg-black/25 text-[#bfb196] hover:border-stage-300/30"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#e7b45f]/18 bg-black/25 p-5 text-center">
      <div className="text-base font-semibold text-[#fff5df]">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#bfb196]">{description}</p>
    </div>
  );
}

function ratioIconStyle(value: string): React.CSSProperties {
  const [width, height] = value.split(":").map(Number);
  const max = 24;
  const ratio = width / height;
  if (ratio >= 1) {
    return { width: `${max}px`, height: `${Math.max(10, max / ratio)}px` };
  }
  return { width: `${Math.max(10, max * ratio)}px`, height: `${max}px` };
}
