"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ConfirmDialog, ProgressOverlay, ToastMessage, ToastTone, ToastViewport } from "@/components/ui/feedback";
import { getProject } from "@/lib/api/projects";
import { getProjectScriptVersion, listProjectScripts } from "@/lib/api/scripts";
import { deleteProjectShot, generateProjectShots, listProjectShots, reorderProjectShots, updateProjectShot } from "@/lib/api/shots";
import type { Project } from "@/features/projects/types";
import type { GeneratedScene, Script, ScriptVersionResult } from "@/features/scripts/types";
import type { Shot } from "@/features/shots/types";

type ProjectShotsScreenProps = {
  projectId: string;
};

type GenerationPhase = "idle" | "preparing" | "requesting" | "ai_generating" | "syncing" | "complete";

type GenerationSummary = {
  total: number;
  ready: number;
  needsReference: number;
  highRisk: number;
};

type ShotDraft = {
  shot_no: string;
  story_beat: string;
  description: string;
  characters: string;
  setting: string;
  emotion: string;
  action: string;
  expression: string;
  props: string;
  shot_size: string;
  camera_angle: string;
  composition: string;
  camera_movement: string;
  lighting: string;
  transition_in: string;
  transition_out: string;
  edit_point: string;
  duration_seconds: string;
  image_prompt: string;
  video_prompt: string;
  negative_prompt: string;
  continuity_constraints: string;
  generation_risk: string;
  simplify_strategy: string;
  readiness: string;
  status: string;
};

const readinessLabels: Record<string, string> = {
  ready: "可生成",
  needs_reference: "需参考",
  high_risk: "高风险",
  draft: "草案",
};

const statusLabels: Record<string, string> = {
  draft: "草案",
  ready: "提示词就绪",
  generating: "生成中",
  generated: "待挑选",
  approved: "已采纳",
  needs_revision: "需返工",
  locked: "已锁定",
};

export function ProjectShotsScreen({ projectId }: ProjectShotsScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialScriptId = searchParams.get("scriptId");
  const [project, setProject] = useState<Project | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [scriptVersion, setScriptVersion] = useState<ScriptVersionResult | null>(null);
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [shots, setShots] = useState<Shot[]>([]);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ShotDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [shotsLoading, setShotsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>("idle");
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
  const [generationSummary, setGenerationSummary] = useState<GenerationSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Shot | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const selectedShot = useMemo(() => shots.find((shot) => shot.id === selectedShotId) ?? null, [selectedShotId, shots]);
  const currentScenes = scriptVersion?.scenes ?? [];
  const highRiskCount = shots.filter((shot) => shot.readiness === "high_risk" || shot.generation_risk).length;
  const readyCount = shots.filter((shot) => shot.readiness === "ready").length;

  function showToast(tone: ToastTone, title: string, description?: string) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, tone, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [loadedProject, loadedScripts] = await Promise.all([getProject(projectId), listProjectScripts(projectId)]);
        setProject(loadedProject);
        setScripts(loadedScripts);
        const preferredScriptId = initialScriptId ?? loadedScripts[0]?.id ?? "";
        setSelectedScriptId(preferredScriptId);
        if (preferredScriptId) {
          const [loadedVersion, loadedShots] = await Promise.all([getProjectScriptVersion(projectId, preferredScriptId), listProjectShots(projectId, preferredScriptId)]);
          setScriptVersion(loadedVersion);
          setShots(loadedShots);
          setSelectedShotId(loadedShots[0]?.id ?? null);
        } else {
          setScriptVersion(null);
          setShots([]);
          setSelectedShotId(null);
        }
      } catch (error) {
        showToast("error", "分镜工作台加载失败", error instanceof Error ? error.message : "请确认后端服务可用。");
      } finally {
        setLoading(false);
      }
    }

    void loadInitialData();
  }, [initialScriptId, projectId]);

  useEffect(() => {
    setDraft(selectedShot ? shotToDraft(selectedShot) : null);
  }, [selectedShot]);

  async function handleScriptChange(scriptId: string) {
    setSelectedScriptId(scriptId);
    setSelectedShotId(null);
    setShots([]);
    setScriptVersion(null);
    if (!scriptId) {
      return;
    }
    setShotsLoading(true);
    try {
      const [loadedVersion, loadedShots] = await Promise.all([getProjectScriptVersion(projectId, scriptId), listProjectShots(projectId, scriptId)]);
      setScriptVersion(loadedVersion);
      setShots(loadedShots);
      setSelectedShotId(loadedShots[0]?.id ?? null);
    } catch (error) {
      showToast("error", "剧本版本读取失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setShotsLoading(false);
    }
  }

  function requestGenerateShots() {
    if (!selectedScriptId) {
      showToast("info", "先选择剧本版本", "分镜草案需要从一个剧本版本开始。");
      return;
    }
    setGenerateConfirmOpen(true);
  }

  async function handleGenerateShots() {
    if (!selectedScriptId) {
      return;
    }

    setGenerateConfirmOpen(false);
    setGenerationSummary(null);
    setGenerating(true);
    setGenerationPhase("preparing");
    try {
      await waitForPaint();
      setGenerationPhase("requesting");
      await waitForPaint();
      setGenerationPhase("ai_generating");
      const result = await generateProjectShots(projectId, selectedScriptId);
      setGenerationPhase("syncing");
      setShots(result.shots);
      setSelectedShotId(result.shots[0]?.id ?? null);
      const summary = summarizeShots(result.shots);
      setGenerationSummary(summary);
      showToast("success", "分镜草案已生成", `共 ${summary.total} 张，${summary.ready} 张可直接进入生成。`);
      setGenerationPhase("complete");
    } catch (error) {
      showToast("error", "分镜生成失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setGenerating(false);
      window.setTimeout(() => setGenerationPhase("idle"), 300);
    }
  }

  async function handleSaveShot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedShot || !draft) {
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProjectShot(projectId, selectedShot.id, draftToPayload(draft));
      setShots((current) => current.map((shot) => (shot.id === updated.id ? updated : shot)));
      setSelectedShotId(updated.id);
      showToast("success", "镜头已保存", `${updated.shot_no} 已更新。`);
    } catch (error) {
      showToast("error", "镜头保存失败", error instanceof Error ? error.message : "请稍后重试。");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteShot() {
    if (!pendingDelete) {
      return;
    }

    const target = pendingDelete;
    try {
      await deleteProjectShot(projectId, target.id);
      const nextShots = shots.filter((shot) => shot.id !== target.id);
      setShots(nextShots);
      setSelectedShotId(nextShots[0]?.id ?? null);
      setPendingDelete(null);
      showToast("success", "镜头已删除", `${target.shot_no} 已移除。`);
    } catch (error) {
      showToast("error", "镜头删除失败", error instanceof Error ? error.message : "请稍后重试。");
    }
  }

  async function handleMoveShot(shotId: string, direction: "up" | "down") {
    const index = shots.findIndex((shot) => shot.id === shotId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= shots.length) {
      return;
    }

    const nextShots = [...shots];
    const [shot] = nextShots.splice(index, 1);
    nextShots.splice(targetIndex, 0, shot);
    setShots(nextShots.map((item, itemIndex) => ({ ...item, order_index: itemIndex + 1 })));

    try {
      const reordered = await reorderProjectShots(projectId, nextShots.map((item) => item.id));
      setShots(reordered);
    } catch (error) {
      showToast("error", "排序保存失败", error instanceof Error ? error.message : "请稍后重试。");
      setShots(shots);
    }
  }

  if (loading) {
    return <div className="surface rounded-xl p-5 text-sm text-[#cfc1a6]">正在打开分镜工作台...</div>;
  }

  return (
    <div className="space-y-5">
      <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <ProgressOverlay {...buildGenerationProgress(generationPhase)} open={generating} />
      <ConfirmDialog
        open={generateConfirmOpen}
        title={shots.length ? "重新生成当前剧本分镜" : "生成当前剧本分镜"}
        description={
          shots.length
            ? `当前剧本已有 ${shots.length} 张镜头卡。继续后会替换这个剧本版本下的旧分镜，不会影响其他剧本版本和素材。`
            : `将基于当前剧本的 ${currentScenes.length} 个场次生成 Shot Cards，并写入这个剧本版本下。`
        }
        confirmLabel={shots.length ? "替换并生成" : "开始生成"}
        onCancel={() => setGenerateConfirmOpen(false)}
        onConfirm={() => void handleGenerateShots()}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="删除镜头"
        description={`确认删除 ${pendingDelete?.shot_no ?? ""}？这个操作只会删除分镜卡，不会删除素材。`}
        confirmLabel="删除镜头"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleDeleteShot()}
      />

      <Breadcrumbs items={[{ label: "项目中心", href: "/projects" }, { label: project?.name ?? "项目文件夹", href: `/projects/${projectId}` }, { label: "分镜" }]} />

      <header className="surface rounded-xl p-4 shadow-panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-stage-200/70">Storyboard Workbench</div>
            <h1 className="mt-2 text-2xl font-semibold text-[#fff5df]">分镜生产工作台</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#cfc1a6]">把剧本场次拆成可生图、可生视频、可检查的 Shot Cards。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedScriptId} onChange={(event) => void handleScriptChange(event.target.value)} className="field-input min-w-56">
              <option value="">选择剧本版本</option>
              {scripts.map((script) => (
                <option key={script.id} value={script.id}>
                  v{script.version} · {script.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={requestGenerateShots}
              disabled={generating || !selectedScriptId}
              className="rounded-lg border border-stage-300/35 bg-stage-400/[0.14] px-4 py-2 text-sm font-medium text-[#fff5df] shadow-stage-glow transition hover:bg-stage-400/[0.22] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {generating ? "生成中" : "从剧本生成分镜"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/projects/${projectId}/scripts`)}
              className="rounded-lg border border-[#e7b45f]/15 bg-black/25 px-4 py-2 text-sm text-stage-100 transition hover:border-stage-300/35"
            >
              返回剧本
            </button>
          </div>
        </div>
        <GenerationPreflight selectedScript={scripts.find((script) => script.id === selectedScriptId) ?? null} sceneCount={currentScenes.length} shotCount={shots.length} />
        {generationSummary ? <GenerationResultSummary summary={generationSummary} onGoNext={() => setSelectedShotId(shots[0]?.id ?? null)} /> : null}
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Stat label="镜头总数" value={String(shots.length)} />
          <Stat label="可生成" value={String(readyCount)} />
          <Stat label="风险提示" value={String(highRiskCount)} />
          <Stat label="场次数" value={String(currentScenes.length)} />
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[280px_minmax(360px,1fr)_430px]">
        <aside className="surface h-fit rounded-xl p-4 shadow-panel xl:sticky xl:top-4">
          <div className="text-sm font-medium text-[#fff5df]">场次时间轴</div>
          <div className="mt-3 space-y-2">
            {currentScenes.length ? (
              currentScenes.map((scene) => <SceneRow key={scene.id} scene={scene} active={shots.some((shot) => shot.scene_id === scene.id && shot.id === selectedShotId)} />)
            ) : (
              <EmptyBlock title="未选择剧本" description="先选择剧本版本，再生成分镜草案。" />
            )}
          </div>
          <div className="mt-5 border-t border-[#e7b45f]/10 pt-4">
            <div className="text-xs uppercase tracking-[0.22em] text-[#8f846f]">Context</div>
            <p className="mt-2 text-xs leading-5 text-[#c9bea8]">当前上下文会引用剧本版本、场次 raw_text、项目视觉风格和画面比例。</p>
          </div>
        </aside>

        <main className="surface rounded-xl p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-[#fff5df]">镜头卡序列</div>
              <p className="mt-1 text-xs text-[#9e927c]">只显示当前剧本版本下的 Shot Cards，避免旧版本串入。</p>
            </div>
            <div className="rounded-full border border-[#e7b45f]/10 bg-black/25 px-3 py-1 text-xs text-[#9e927c]">Shot Cards</div>
          </div>
          <div className="mt-4 space-y-3">
            {shotsLoading ? (
              <EmptyBlock title="正在读取当前剧本的分镜" description="切换剧本版本时，镜头卡序列会重新绑定到该版本。" />
            ) : shots.length ? (
              shots.map((shot, index) => (
                <ShotCard
                  key={shot.id}
                  shot={shot}
                  active={shot.id === selectedShotId}
                  first={index === 0}
                  last={index === shots.length - 1}
                  onSelect={() => setSelectedShotId(shot.id)}
                  onMove={(direction) => void handleMoveShot(shot.id, direction)}
                  onDelete={() => setPendingDelete(shot)}
                />
              ))
            ) : (
              <DirectorEmptyState
                title={selectedScriptId ? "当前剧本还没有分镜卡" : "先选择一个剧本版本"}
                description={selectedScriptId ? "点击“从剧本生成分镜”，系统会基于该剧本的场次生成镜头卡序列。" : "选择剧本后，这里只会显示该剧本版本下的镜头卡。"}
              />
            )}
          </div>
        </main>

        <aside className="surface h-fit rounded-xl p-4 shadow-panel xl:sticky xl:top-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-[#fff5df]">镜头 Inspector</div>
              <p className="mt-1 text-xs text-[#9e927c]">导演台：检查镜头语言、提示词、风险和连续性。</p>
            </div>
            <div className="rounded-full border border-stage-300/20 bg-stage-400/[0.08] px-2.5 py-1 text-[10px] text-stage-100">Inspector</div>
          </div>
          {selectedShot && draft ? (
            <form className="mt-4 space-y-4" onSubmit={handleSaveShot}>
              <InspectorGroup title="基础镜头">
              <div className="grid gap-3 md:grid-cols-2">
                <TextField label="镜号" value={draft.shot_no} onChange={(value) => setDraft({ ...draft, shot_no: value })} />
                <TextField label="时长" value={draft.duration_seconds} onChange={(value) => setDraft({ ...draft, duration_seconds: value })} />
              </div>
              <TextField label="剧情目的" value={draft.story_beat} onChange={(value) => setDraft({ ...draft, story_beat: value })} />
              <TextAreaField label="镜头描述" value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} rows={3} />
              </InspectorGroup>
              <InspectorGroup title="画面调度">
              <div className="grid gap-3 md:grid-cols-2">
                <TextField label="角色" value={draft.characters} onChange={(value) => setDraft({ ...draft, characters: value })} />
                <TextField label="道具" value={draft.props} onChange={(value) => setDraft({ ...draft, props: value })} />
                <TextField label="景别" value={draft.shot_size} onChange={(value) => setDraft({ ...draft, shot_size: value })} />
                <TextField label="机位" value={draft.camera_angle} onChange={(value) => setDraft({ ...draft, camera_angle: value })} />
                <TextField label="构图" value={draft.composition} onChange={(value) => setDraft({ ...draft, composition: value })} />
                <TextField label="运镜" value={draft.camera_movement} onChange={(value) => setDraft({ ...draft, camera_movement: value })} />
              </div>
              <TextField label="光影" value={draft.lighting} onChange={(value) => setDraft({ ...draft, lighting: value })} />
              <TextField label="转场 / 剪辑点" value={`${draft.transition_in} -> ${draft.transition_out}`} onChange={(value) => {
                const [transitionIn, transitionOut] = value.split("->").map((item) => item.trim());
                setDraft({ ...draft, transition_in: transitionIn ?? "", transition_out: transitionOut ?? "" });
              }} />
              <TextField label="剪辑点" value={draft.edit_point} onChange={(value) => setDraft({ ...draft, edit_point: value })} />
              </InspectorGroup>
              <InspectorGroup title="生成提示词">
              <TextAreaField label="生图提示词" value={draft.image_prompt} onChange={(value) => setDraft({ ...draft, image_prompt: value })} rows={4} />
              <TextAreaField label="生视频提示词" value={draft.video_prompt} onChange={(value) => setDraft({ ...draft, video_prompt: value })} rows={5} />
              <TextAreaField label="负面提示词" value={draft.negative_prompt} onChange={(value) => setDraft({ ...draft, negative_prompt: value })} rows={2} />
              </InspectorGroup>
              <InspectorGroup title="风控与状态">
              <TextAreaField label="连续性约束" value={draft.continuity_constraints} onChange={(value) => setDraft({ ...draft, continuity_constraints: value })} rows={2} />
              <TextAreaField label="生成风险" value={draft.generation_risk} onChange={(value) => setDraft({ ...draft, generation_risk: value })} rows={2} />
              <TextAreaField label="规避策略" value={draft.simplify_strategy} onChange={(value) => setDraft({ ...draft, simplify_strategy: value })} rows={2} />
              <div className="grid gap-3 md:grid-cols-2">
                <SelectField label="就绪度" value={draft.readiness} options={["draft", "ready", "needs_reference", "high_risk"]} onChange={(value) => setDraft({ ...draft, readiness: value })} />
                <SelectField label="状态" value={draft.status} options={["draft", "ready", "generating", "generated", "approved", "needs_revision", "locked"]} onChange={(value) => setDraft({ ...draft, status: value })} />
              </div>
              </InspectorGroup>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg border border-stage-300/35 bg-stage-400/[0.14] px-4 py-2.5 text-sm font-medium text-[#fff5df] transition hover:bg-stage-400/[0.22] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {saving ? "保存中" : "保存镜头"}
              </button>
            </form>
          ) : (
            <InspectorEmptyState selectedScriptId={selectedScriptId} />
          )}
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e7b45f]/10 bg-black/20 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[#fff5df]">{value}</div>
    </div>
  );
}

function GenerationPreflight({ selectedScript, sceneCount, shotCount }: { selectedScript: Script | null; sceneCount: number; shotCount: number }) {
  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
      <div className="rounded-xl border border-[#e7b45f]/10 bg-black/20 px-4 py-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">当前剧本版本</div>
        <div className="mt-1 text-sm font-medium text-[#fff5df]">{selectedScript ? `v${selectedScript.version} · ${selectedScript.title}` : "尚未选择"}</div>
      </div>
      <div className="rounded-xl border border-[#e7b45f]/10 bg-black/20 px-4 py-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">生成输入</div>
        <div className="mt-1 text-sm font-medium text-[#fff5df]">{sceneCount ? `${sceneCount} 个场次` : "等待场次"}</div>
      </div>
      <div className={`rounded-xl border px-4 py-3 ${shotCount ? "border-clay-300/20 bg-clay-500/[0.08]" : "border-teal-300/18 bg-teal-400/[0.06]"}`}>
        <div className="text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">覆盖提醒</div>
        <div className="mt-1 text-sm font-medium text-[#fff5df]">{shotCount ? `已有 ${shotCount} 张，重新生成会替换` : "当前版本暂无分镜"}</div>
      </div>
    </div>
  );
}

function GenerationResultSummary({ summary, onGoNext }: { summary: GenerationSummary; onGoNext: () => void }) {
  return (
    <section className="mt-4 rounded-xl border border-stage-300/22 bg-[linear-gradient(135deg,rgba(79,189,168,0.1),rgba(231,180,95,0.05))] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-[#fff5df]">分镜生成摘要</div>
          <p className="mt-1 text-xs leading-5 text-[#bfb196]">先检查高风险和需参考镜头，再进入生图/生视频生产。</p>
        </div>
        <button
          type="button"
          onClick={onGoNext}
          className="rounded-full border border-stage-300/30 bg-stage-400/[0.12] px-4 py-2 text-xs text-stage-100 transition hover:bg-stage-400/[0.2]"
        >
          检查第一张镜头卡
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <SummaryPill label="总镜头" value={summary.total} />
        <SummaryPill label="可生成" value={summary.ready} />
        <SummaryPill label="需参考" value={summary.needsReference} />
        <SummaryPill label="高风险" value={summary.highRisk} />
      </div>
    </section>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#e7b45f]/10 bg-black/22 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">{label}</div>
      <div className="mt-1 text-xl font-semibold text-[#fff5df]">{value}</div>
    </div>
  );
}

function SceneRow({ scene, active }: { scene: GeneratedScene; active: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${active ? "border-stage-300/35 bg-stage-400/[0.08]" : "border-[#e7b45f]/10 bg-black/20"}`}>
      <div className="text-xs font-medium text-[#fff5df]">{scene.title}</div>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#a99d87]">{scene.summary || scene.raw_text}</p>
    </div>
  );
}

function ShotCard({
  shot,
  active,
  first,
  last,
  onSelect,
  onMove,
  onDelete,
}: {
  shot: Shot;
  active: boolean;
  first: boolean;
  last: boolean;
  onSelect: () => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}) {
  return (
    <article className={`rounded-lg border p-3 transition ${active ? "border-stage-300/45 bg-stage-400/[0.08]" : "border-[#e7b45f]/10 bg-black/25 hover:border-stage-300/25"}`}>
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[#fff5df]">
              {shot.shot_no} <span className="text-xs font-normal text-[#8f846f]">#{shot.order_index}</span>
            </div>
            <p className="mt-1 text-xs text-stage-100">{shot.story_beat || "未设置剧情目的"}</p>
          </div>
          <span className={`rounded-full border px-2 py-1 text-[10px] ${shot.readiness === "ready" ? "border-teal-300/25 text-teal-100" : "border-clay-300/25 text-[#ffd7c3]"}`}>
            {readinessLabels[shot.readiness] ?? shot.readiness}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#d8ccb3]">{shot.description}</p>
        <div className="mt-3 grid gap-2 text-xs text-[#a99d87] md:grid-cols-3">
          <span>{shot.shot_size || "景别未定"}</span>
          <span>{shot.camera_angle || "机位未定"}</span>
          <span>{shot.camera_movement || "运镜未定"}</span>
        </div>
        <div className="mt-3 rounded-lg border border-clay-300/10 bg-clay-500/[0.06] px-3 py-2 text-xs leading-5 text-[#d8aa91]">
          风险：{shot.generation_risk || "暂无"}
        </div>
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={first} onClick={() => onMove("up")} className="rounded-md border border-[#e7b45f]/10 px-2 py-1 text-xs text-[#cfc1a6] disabled:opacity-35">
          上移
        </button>
        <button type="button" disabled={last} onClick={() => onMove("down")} className="rounded-md border border-[#e7b45f]/10 px-2 py-1 text-xs text-[#cfc1a6] disabled:opacity-35">
          下移
        </button>
        <button type="button" onClick={onDelete} className="rounded-md border border-clay-300/20 px-2 py-1 text-xs text-[#ffd7c3]">
          删除
        </button>
      </div>
    </article>
  );
}

function EmptyBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#e7b45f]/18 bg-black/18 px-4 py-8 text-center">
      <div className="text-sm font-medium text-[#fff5df]">{title}</div>
      <p className="mt-2 text-xs leading-5 text-[#a99d87]">{description}</p>
    </div>
  );
}

function DirectorEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-stage-300/22 bg-[radial-gradient(circle_at_50%_0%,rgba(79,189,168,0.13),transparent_45%),rgba(0,0,0,0.22)] px-5 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-stage-300/25 bg-stage-400/[0.08] shadow-stage-glow">
        <div className="h-7 w-9 rounded border border-[#fff5df]/45">
          <div className="mt-2 h-px bg-[#fff5df]/35" />
          <div className="mt-2 h-px bg-[#fff5df]/25" />
        </div>
      </div>
      <div className="mt-4 text-base font-semibold text-[#fff5df]">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#bfb196]">{description}</p>
      <div className="mx-auto mt-5 grid max-w-lg gap-2 text-xs text-[#8f846f] md:grid-cols-3">
        <span className="rounded-full border border-[#e7b45f]/10 bg-black/25 px-3 py-1.5">绑定剧本版本</span>
        <span className="rounded-full border border-[#e7b45f]/10 bg-black/25 px-3 py-1.5">生成 Shot Cards</span>
        <span className="rounded-full border border-[#e7b45f]/10 bg-black/25 px-3 py-1.5">再进入 Inspector</span>
      </div>
    </div>
  );
}

function InspectorEmptyState({ selectedScriptId }: { selectedScriptId: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-[#e7b45f]/18 bg-black/20 p-5">
      <div className="text-sm font-semibold text-[#fff5df]">{selectedScriptId ? "等待选择镜头卡" : "Inspector 暂未激活"}</div>
      <p className="mt-2 text-xs leading-6 text-[#a99d87]">
        {selectedScriptId
          ? "当前剧本没有选中的 Shot Card。生成或点击一张镜头卡后，这里才会显示可编辑字段。"
          : "先选择剧本版本。Inspector 不会显示旧镜头，避免把别的剧本数据误当成当前版本。"}
      </p>
      <div className="mt-4 space-y-2 text-xs text-[#c9bea8]">
        <InspectorHint label="镜头语言" value="景别、机位、构图、运镜、光影、转场" />
        <InspectorHint label="生成控制" value="生图提示词、生视频提示词、负面提示词" />
        <InspectorHint label="风控" value="连续性约束、生成风险、失败后拆镜策略" />
      </div>
    </div>
  );
}

function InspectorHint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e7b45f]/10 bg-[#f5ead6]/[0.035] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">{label}</div>
      <div className="mt-1 leading-5">{value}</div>
    </div>
  );
}

function InspectorGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-[#e7b45f]/10 bg-black/18 p-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-stage-100">{title}</div>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-[#9e927c]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="field-input mt-1.5" />
    </label>
  );
}

function TextAreaField({ label, value, onChange, rows }: { label: string; value: string; rows: number; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-[#9e927c]">{label}</span>
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="field-input mt-1.5 resize-none" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-[#9e927c]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="field-input mt-1.5">
        {options.map((option) => (
          <option key={option} value={option}>
            {statusLabels[option] ?? readinessLabels[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function buildGenerationProgress(phase: GenerationPhase) {
  const phaseIndex: Record<GenerationPhase, number> = {
    idle: 0,
    preparing: 0,
    requesting: 1,
    ai_generating: 2,
    syncing: 3,
    complete: 4,
  };
  const steps = [
    { label: "读取当前剧本版本和场次" },
    { label: "提交给分镜导演模型" },
    { label: "拆解镜头并生成提示词" },
    { label: "解析结果并写入数据库" },
    { label: "刷新 Shot Card 序列" },
  ];
  const activeIndex = phaseIndex[phase];

  return {
    title: progressTitle[phase],
    description: progressDescription[phase],
    progress: progressValue[phase],
    steps: steps.map((step, index) => ({
      label: step.label,
      status: index < activeIndex ? ("done" as const) : index === activeIndex ? ("active" as const) : ("pending" as const),
    })),
  };
}

const progressTitle: Record<GenerationPhase, string> = {
  idle: "等待生成",
  preparing: "正在准备剧本上下文",
  requesting: "正在连接分镜模型",
  ai_generating: "正在生成分镜草案",
  syncing: "正在保存分镜卡",
  complete: "分镜草案已完成",
};

const progressDescription: Record<GenerationPhase, string> = {
  idle: "选择剧本版本后，可以生成分镜草案。",
  preparing: "正在确认剧本版本、场次、项目视觉风格和画面比例。",
  requesting: "请求已发送到后端，后端会调用当前配置的分镜模型。",
  ai_generating: "模型正在把场次拆成镜头，并生成生图/生视频提示词、风险和规避策略。",
  syncing: "模型已返回，正在解析 JSON 并同步到项目分镜库。",
  complete: "分镜卡已写入数据库，正在刷新页面数据。",
};

const progressValue: Record<GenerationPhase, number> = {
  idle: 0,
  preparing: 12,
  requesting: 28,
  ai_generating: 58,
  syncing: 86,
  complete: 100,
};

function waitForPaint() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

function summarizeShots(nextShots: Shot[]): GenerationSummary {
  return {
    total: nextShots.length,
    ready: nextShots.filter((shot) => shot.readiness === "ready").length,
    needsReference: nextShots.filter((shot) => shot.readiness === "needs_reference").length,
    highRisk: nextShots.filter((shot) => shot.readiness === "high_risk" || Boolean(shot.generation_risk)).length,
  };
}

function shotToDraft(shot: Shot): ShotDraft {
  return {
    shot_no: shot.shot_no,
    story_beat: shot.story_beat ?? "",
    description: shot.description,
    characters: shot.characters.join("、"),
    setting: shot.setting ?? "",
    emotion: shot.emotion ?? "",
    action: shot.action ?? "",
    expression: shot.expression ?? "",
    props: shot.props.join("、"),
    shot_size: shot.shot_size ?? "",
    camera_angle: shot.camera_angle ?? "",
    composition: shot.composition ?? "",
    camera_movement: shot.camera_movement ?? "",
    lighting: shot.lighting ?? "",
    transition_in: shot.transition_in ?? "",
    transition_out: shot.transition_out ?? "",
    edit_point: shot.edit_point ?? "",
    duration_seconds: shot.duration_seconds ? String(shot.duration_seconds) : "",
    image_prompt: shot.image_prompt ?? "",
    video_prompt: shot.video_prompt ?? "",
    negative_prompt: shot.negative_prompt ?? "",
    continuity_constraints: shot.continuity_constraints.join("、"),
    generation_risk: shot.generation_risk ?? "",
    simplify_strategy: shot.simplify_strategy ?? "",
    readiness: shot.readiness,
    status: shot.status,
  };
}

function draftToPayload(draft: ShotDraft) {
  return {
    shot_no: draft.shot_no,
    story_beat: draft.story_beat,
    description: draft.description,
    characters: splitList(draft.characters),
    setting: draft.setting,
    emotion: draft.emotion,
    action: draft.action,
    expression: draft.expression,
    props: splitList(draft.props),
    shot_size: draft.shot_size,
    camera_angle: draft.camera_angle,
    composition: draft.composition,
    camera_movement: draft.camera_movement,
    lighting: draft.lighting,
    transition_in: draft.transition_in,
    transition_out: draft.transition_out,
    edit_point: draft.edit_point,
    duration_seconds: draft.duration_seconds ? Number(draft.duration_seconds) : null,
    image_prompt: draft.image_prompt,
    video_prompt: draft.video_prompt,
    negative_prompt: draft.negative_prompt,
    continuity_constraints: splitList(draft.continuity_constraints),
    generation_risk: draft.generation_risk,
    simplify_strategy: draft.simplify_strategy,
    readiness: draft.readiness,
    status: draft.status,
  };
}

function splitList(value: string): string[] {
  return value
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
