"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToastMessage, ToastViewport } from "@/components/ui/feedback";
import type { Character, CharacterReferenceAsset } from "@/features/characters/types";
import type { GenerateTask } from "@/features/generation/types";
import type { StyleTemplate } from "@/features/style-templates/types";
import { deleteCharacterReference, getCharacter, listCharacterGeneratedAssets, listCharacterReferences, promoteCharacterGeneratedAssetToReference, replaceCharacterReferenceFile, restoreCharacterReference, updateCharacterGeneratedAsset, updateCharacterReference, uploadCharacterReference } from "@/lib/api/characters";
import { cancelCharacterImageTask, createCharacterImagePromptDraft, createCharacterImageTask, getCharacterImageTask, listCharacterImageTasks, retryCharacterImageTask } from "@/lib/api/generation";
import { listStyleTemplates } from "@/lib/api/style-templates";

const imageModels = [
  { id: "gemini-3.1-flash-image-preview", label: "nano banana 2", hint: "真实接入：支持多图融合，适合角色定稿和四视图参考融合", provider: "dmx-gemini", enabled: true },
  { id: "gpt-image-2-ssvip", label: "GPT Image 2", hint: "真实接入：DMX 图片编辑，支持多参考图和高分辨率输出", provider: "dmx-gpt-image", enabled: true },
  { id: "doubao-seedream-5.0-lite", label: "Seedream 5.0 Lite", hint: "真实接入：DMX responses 多图融合，适合角色设定图和参考图保真", provider: "dmx-seedream", enabled: true },
  { id: "gemini-2.5-flash-image", label: "nano banana", hint: "预留：快速图像理解与编辑", provider: "mock", enabled: false },
  { id: "gemini-3-pro-image-preview", label: "nano banana pro", hint: "预留：高质量角色概念图", provider: "mock", enabled: false },
];

const outputAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9"] as const;
const outputImageSizes = ["1K", "2K", "4K"] as const;

const generationTypes = [
  { id: "character_lookdev", label: "角色定稿", group: "MVP 任务", desc: "选择角色模板和参考图，生成可手动纳入参考图库的定稿候选图。", promptKey: "image_consistency_prompt" },
  { id: "four_view", label: "角色四视图生成", group: "MVP 任务", desc: "正面 / 半侧 / 侧面 / 背面，先建立角色视觉标准。", promptKey: "three_view_prompt" },
] as const;

const workbenchReferenceTypes = [
  { id: "facepaint", label: "脸谱参考" },
  { id: "character_final_reference", label: "角色定稿参考" },
  { id: "full_body_front_photo", label: "真人全身正面" },
  { id: "half_side_photo_1", label: "真人半侧身（1）" },
  { id: "half_side_photo_2", label: "真人半侧身（2）" },
  { id: "back_photo", label: "真人背后" },
] as const;

type CharacterDetailScreenProps = {
  characterId: string;
};

export function CharacterDetailScreen({ characterId }: CharacterDetailScreenProps) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [referenceAssets, setReferenceAssets] = useState<CharacterReferenceAsset[]>([]);
  const [generatedAssets, setGeneratedAssets] = useState<CharacterReferenceAsset[]>([]);
  const [styleTemplates, setStyleTemplates] = useState<StyleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<string>(generationTypes[0].id);
  const [model, setModel] = useState(imageModels[0].id);
  const [aspectRatio, setAspectRatio] = useState<(typeof outputAspectRatios)[number]>("3:4");
  const [imageSize, setImageSize] = useState<(typeof outputImageSizes)[number]>("1K");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [latestTask, setLatestTask] = useState<GenerateTask | null>(null);
  const [generationTasks, setGenerationTasks] = useState<GenerateTask[]>([]);
  const [retryingTaskId, setRetryingTaskId] = useState<string | null>(null);
  const [cancellingTaskId, setCancellingTaskId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const selectedGeneration = useMemo(() => generationTypes.find((item) => item.id === generationType) ?? generationTypes[0], [generationType]);
  const selectedModel = useMemo(() => imageModels.find((item) => item.id === model) ?? imageModels[0], [model]);
  const selectedModelIsReal = selectedModel.provider === "dmx-gemini" || selectedModel.provider === "dmx-gpt-image" || selectedModel.provider === "dmx-seedream";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getCharacter(characterId),
      listCharacterReferences(characterId, { includeDeleted: true }),
      listCharacterGeneratedAssets(characterId, { includeDeleted: true }),
      listStyleTemplates(),
      listCharacterImageTasks(characterId),
    ])
      .then(([result, references, generated, templates, tasks]) => {
        if (!mounted) return;
        setCharacter(result);
        setReferenceAssets(references);
        setGeneratedAssets(generated);
        setStyleTemplates(templates);
        setGenerationTasks(tasks);
        setLatestTask(tasks[0] ?? null);
        setPrompt(result.three_view_prompt || result.image_consistency_prompt || "");
        setNegativePrompt(result.negative_prompt || result.negative_keywords || "");
      })
      .catch((error) => {
        if (!mounted) return;
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setToasts([{ id, tone: "error", title: "角色档案加载失败", description: error instanceof Error ? error.message : "请确认后端服务可用。" }]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [characterId]);

  useEffect(() => {
    if (!character) return;
    const nextPrompt = selectedGeneration.promptKey === "three_view_prompt" ? character.three_view_prompt : character.image_consistency_prompt;
    setPrompt(nextPrompt || "");
  }, [character, selectedGeneration]);

  function showToast(title: string, description?: string, tone: "success" | "error" | "info" = "info") {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, tone, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }

  const refreshGenerationState = useCallback(async (activeCharacterId = characterId) => {
    const [generated, tasks] = await Promise.all([
      listCharacterGeneratedAssets(activeCharacterId, { includeDeleted: true }),
      listCharacterImageTasks(activeCharacterId),
    ]);
    setGeneratedAssets(generated);
    setGenerationTasks(tasks);
    setLatestTask(tasks[0] ?? null);
    return { generated, tasks };
  }, [characterId]);

  useEffect(() => {
    if (!drawerOpen || !character) return;
    const timer = window.setInterval(() => {
      void refreshGenerationState(character.id).catch(() => null);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [drawerOpen, character, refreshGenerationState]);

  function upsertGenerationTask(task: GenerateTask) {
    setLatestTask(task);
    setGenerationTasks((current) => [task, ...current.filter((item) => item.id !== task.id)]);
  }

  async function pollGenerationTaskUntilTerminal(taskId: string, successDescription: string) {
    for (let attempt = 0; attempt < 240; attempt += 1) {
      await wait(attempt === 0 ? 700 : 1500);
      try {
        const nextTask = await getCharacterImageTask(taskId);
        upsertGenerationTask(nextTask);
        if (isTerminalGenerationTask(nextTask)) {
          if (character) {
            await refreshGenerationState(character.id);
          }
          if (nextTask.status === "cancelled") {
            showToast("生成任务已终止", nextTask.error_message || "任务已从队列中截断。", "info");
          } else if (nextTask.status === "failed") {
            showToast("生成任务失败", nextTask.error_message || "已记录失败状态，可在最近任务中重试。", "error");
          } else {
            showToast("生成任务已完成", successDescription, "success");
          }
          return;
        }
      } catch (error) {
        showToast("任务进度刷新失败", error instanceof Error ? error.message : "请稍后手动刷新任务列表。", "error");
        return;
      }
    }
    showToast("任务仍在后台执行", "当前任务尚未完成，可稍后查看最近任务进度。", "info");
  }

  async function handleUploadReference(file: File, referenceType: string, styleBoard?: string) {
    setUploadingType(styleBoard || referenceType);
    try {
      const asset = await uploadCharacterReference({
        characterId,
        file,
        referenceType,
        styleBoard,
        title: styleBoard ? `${styleBoard} · ${file.name}` : file.name,
        isPrimary: !referenceAssets.some((item) => item.reference_type === referenceType),
      });
      const refreshed = await listCharacterReferences(characterId, { includeDeleted: true });
      setReferenceAssets(refreshed);
      showToast("参考图已上传", "已写入角色参考图库。", "success");
      return asset;
    } catch (error) {
      showToast("上传失败", error instanceof Error ? error.message : "请检查 COS 配置或文件格式。", "error");
      return null;
    } finally {
      setUploadingType(null);
    }
  }

  async function handlePrimaryReference(assetId: string) {
    try {
      const next = await updateCharacterReference(characterId, assetId, { is_primary: true });
      setReferenceAssets((current) => current.map((item) => item.reference_type === next.reference_type ? { ...item, is_primary: item.id === next.id } : item));
      showToast("已设为主参考图", "后续生成会优先使用这张图。", "success");
    } catch (error) {
      showToast("设置失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    }
  }

  async function handleUpdateReference(assetId: string, payload: Partial<Pick<CharacterReferenceAsset, "title" | "note">>) {
    try {
      const next = await updateCharacterReference(characterId, assetId, payload);
      setReferenceAssets((current) => current.map((item) => item.id === next.id ? next : item));
      showToast("参考图信息已更新", "标题和备注已保存。", "success");
    } catch (error) {
      showToast("更新失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    }
  }

  async function handleReplaceReference(assetId: string, file: File) {
    setUploadingType(assetId);
    try {
      const next = await replaceCharacterReferenceFile({ characterId, assetId, file, title: file.name });
      setReferenceAssets((current) => current.map((item) => item.id === next.id ? next : item));
      showToast("参考图已替换", "COS 文件和数据库记录已更新。", "success");
    } catch (error) {
      showToast("替换失败", error instanceof Error ? error.message : "请检查 COS 配置或文件格式。", "error");
    } finally {
      setUploadingType(null);
    }
  }

  async function handleDeleteReference(assetId: string) {
    try {
      await deleteCharacterReference(characterId, assetId);
      const deletedAt = new Date().toISOString();
      setReferenceAssets((current) => current.map((item) => item.id === assetId ? { ...item, deleted_at: item.deleted_at || deletedAt, is_primary: false, status: "deleted" } : item));
      showToast("参考图已移入回收站", "COS 文件已保留，可从回收站恢复。", "success");
    } catch (error) {
      showToast("删除失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    }
  }

  async function handleRestoreReference(assetId: string) {
    try {
      const next = await restoreCharacterReference(characterId, assetId);
      setReferenceAssets((current) => current.map((item) => item.id === next.id ? next : item));
      showToast("参考图已恢复", "已回到原来的分类卡位。", "success");
    } catch (error) {
      showToast("恢复失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    }
  }

  async function handleCreateGenerationTask(params: {
    inputAssetIds: string[];
    styleTemplateId: string | null;
    mockForceFail?: boolean;
  }) {
    if (!character) return;
    setCreatingTask(true);
    try {
      const task = await createCharacterImageTask({
        character_id: character.id,
        generation_type: generationType as "four_view" | "character_lookdev",
        model_name: model,
        model_provider: selectedModel.provider,
        input_asset_ids: params.inputAssetIds,
        style_template_id: params.styleTemplateId,
        prompt_text: prompt,
        negative_prompt: negativePrompt,
        params_json: {
          output_count: 1,
          mode: selectedModelIsReal ? "real" : "mock",
          prompt_mode: generationType === "four_view" || generationType === "character_lookdev" ? "confirmed" : "assembled",
          aspect_ratio: aspectRatio,
          image_size: imageSize,
          mock_force_fail: !selectedModelIsReal && params.mockForceFail === true,
        },
      });
      upsertGenerationTask(task);
      showToast("生成任务已入队", "后台会更新 progress/current_step，完成后自动刷新候选资产。", "info");
      void pollGenerationTaskUntilTerminal(task.id, selectedModelIsReal ? `${selectedModel.label} 输出已进入生成资产区。` : "当前为 mock 输出，候选资产已进入生成资产区。");
    } catch (error) {
      await refreshGenerationState(character.id).catch(() => null);
      showToast("生成任务创建失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    } finally {
      setCreatingTask(false);
    }
  }

  async function handleGeneratePromptDraft(params: { inputAssetIds: string[]; styleTemplateId: string | null }) {
    if (!character || !["four_view", "character_lookdev"].includes(generationType)) return;
    setGeneratingPrompt(true);
    try {
      const draft = await createCharacterImagePromptDraft({
        character_id: character.id,
        generation_type: generationType as "four_view" | "character_lookdev",
        input_asset_ids: params.inputAssetIds,
        style_template_id: params.styleTemplateId,
        prompt_text: prompt,
        negative_prompt: negativePrompt,
        model_provider: selectedModelIsReal ? "dmx" : "mock",
        model_name: selectedModelIsReal ? "gpt-5.4-nano" : "mock-prompt",
        temperature: 0.4,
      });
      setPrompt(draft.prompt_text);
      setNegativePrompt(draft.negative_prompt);
      showToast(
        generationType === "four_view" ? "四视图 Prompt 已生成" : "角色定稿 Prompt 已生成",
        generationType === "four_view"
          ? "已按固定 16:9 四视图版式更新正向和负面提示词。"
          : "已按角色定稿工作流更新正向和负面提示词，可继续微调后发起生成。",
        "success",
      );
    } catch (error) {
      showToast("Prompt 生成失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    } finally {
      setGeneratingPrompt(false);
    }
  }

  async function handleRetryGenerationTask(taskId: string) {
    if (!character) return;
    setRetryingTaskId(taskId);
    try {
      const task = await retryCharacterImageTask(taskId);
      upsertGenerationTask(task);
      showToast("重试任务已入队", "旧任务保留，新任务会在后台重新执行。", "info");
      void pollGenerationTaskUntilTerminal(task.id, "旧任务保留，新任务已生成候选资产。");
    } catch (error) {
      await refreshGenerationState(character.id).catch(() => null);
      showToast("重试失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    } finally {
      setRetryingTaskId(null);
    }
  }

  async function handleCancelGenerationTask(taskId: string) {
    setCancellingTaskId(taskId);
    try {
      const task = await cancelCharacterImageTask(taskId);
      upsertGenerationTask(task);
      showToast("生成任务已终止", "任务已标记为 cancelled；若真实模型请求已经发出，返回后也不会保存候选资产。", "info");
      if (character) {
        await refreshGenerationState(character.id);
      }
    } catch (error) {
      showToast("终止失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    } finally {
      setCancellingTaskId(null);
    }
  }

  async function handleUpdateGeneratedAsset(assetId: string, payload: Partial<Pick<CharacterReferenceAsset, "accepted_for_keyframe" | "status" | "quality_note" | "title" | "note">>) {
    if (!character) return;
    try {
      const next = await updateCharacterGeneratedAsset(character.id, assetId, payload);
      setGeneratedAssets((current) => current.map((asset) => asset.id === next.id ? next : asset));
      showToast("生成资产已更新", next.status === "accepted" ? "已采纳为可用于关键帧资产。" : "质量门状态已保存。", "success");
    } catch (error) {
      showToast("生成资产更新失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    }
  }

  async function handlePromoteGeneratedAsset(assetId: string) {
    if (!character) return;
    try {
      const promoted = await promoteCharacterGeneratedAssetToReference(character.id, assetId);
      setReferenceAssets((current) => [promoted, ...current.filter((asset) => asset.id !== promoted.id)]);
      showToast("已纳入参考图", "这张角色定稿图已进入参考图库；四视图生成时可手动勾选。", "success");
    } catch (error) {
      showToast("纳入参考图失败", error instanceof Error ? error.message : "请稍后再试。", "error");
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Breadcrumbs items={[{ label: "角色中心", href: "/characters" }, { label: "读取中" }]} />
        <section className="surface rounded-2xl p-8 text-center shadow-panel">
          <div className="text-lg font-semibold text-[#fff5df]">正在读取角色档案...</div>
          <p className="mt-2 text-sm text-[#bfb196]">角色信息、提示词资产和参考图状态正在加载。</p>
        </section>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="space-y-5">
        <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
        <Breadcrumbs items={[{ label: "角色中心", href: "/characters" }, { label: "未找到" }]} />
        <section className="surface rounded-2xl p-8 text-center shadow-panel">
          <div className="text-lg font-semibold text-[#fff5df]">没有找到这个角色</div>
          <p className="mt-2 text-sm text-[#bfb196]">可能已删除，或后端服务返回异常。</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ToastViewport messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      <Breadcrumbs items={[{ label: "角色中心", href: "/characters" }, { label: character.name }]} />

      <section className="surface relative overflow-hidden rounded-2xl p-5 shadow-panel">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_80%_20%,rgba(231,180,95,0.14),transparent_34%),radial-gradient(circle_at_70%_80%,rgba(79,189,168,0.1),transparent_30%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.34em] text-stage-200/70">Character Archive</div>
            <h2 className="display-type mt-2 text-4xl font-semibold text-[#fff5df]">{character.name}</h2>
            <p className="mt-2 text-sm text-stage-100">{character.alias || "无绰号"} · {character.rank || "未排名"} · {character.star || "星位未设"}</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#cfc1a6]">{character.bio || character.yingge_role || "暂无角色简介。"}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:w-[560px]">
            <Badge label="IP" value={character.ip_name || "英歌水浒"} />
            <Badge label="脸谱" value={character.facepaint_main_color || "未设置"} />
            <Badge label="来源" value={character.source === "yingge_bible" ? `圣经 ${character.source_row ?? ""}` : "手动"} />
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-xl border border-stage-300/35 bg-stage-400/[0.14] px-4 py-3 text-left text-sm font-medium text-[#fff5df] shadow-stage-glow transition hover:bg-stage-400/[0.22] sm:col-span-3"
            >
              打开生图工作台 →
              <span className="mt-1 block text-xs font-normal text-stage-100/80">选择生成目标、模型、参考图和提示词。</span>
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <DetailPanel title="角色设定" description="先把人物设定沉淀清楚，后续每一次关键帧和视频都会复用这些约束。">
          <DetailGrid
            items={[
              ["梁山职务", character.liangshan_role],
              ["出身", character.origin],
              ["武器/道具", character.weapons || character.weapon],
              ["核心人格", character.personality_tags],
              ["内在冲突", character.internal_conflict],
              ["人生事件", character.life_events],
            ]}
          />
        </DetailPanel>

        <DetailPanel title="英歌视觉资产" description="脸谱、服饰、色彩和舞台职责，是角色一致性的硬约束。">
          <DetailGrid
            items={[
              ["英歌定位", character.yingge_role],
              ["脸谱主色", character.facepaint_main_color],
              ["颜色寓意", character.color_symbolism],
              ["脸谱纹样", character.facepaint_patterns],
              ["色彩出处", character.source_color_clues],
              ["视觉调性", character.visual_tone_keywords],
              ["正向提示词", character.positive_prompt_terms],
              ["禁忌提示词", character.negative_prompt_terms],
            ]}
          />
        </DetailPanel>

        <DetailPanel title="参考图库" description="角色这里只保留硬参考：脸谱、真人妆造四面、以及从角色定稿候选手动纳入的参考图。风格截图已抽离到全局模板库。">
          <ReferenceLibrary
            assets={referenceAssets}
            uploadingType={uploadingType}
            onUpload={(file, referenceType, styleBoard) => void handleUploadReference(file, referenceType, styleBoard)}
            onSetPrimary={(assetId) => void handlePrimaryReference(assetId)}
            onUpdate={(assetId, payload) => void handleUpdateReference(assetId, payload)}
            onReplace={(assetId, file) => void handleReplaceReference(assetId, file)}
            onDelete={(assetId) => void handleDeleteReference(assetId)}
            onRestore={(assetId) => void handleRestoreReference(assetId)}
          />
        </DetailPanel>

        <DetailPanel title="生成资产区" description="AI 生图工作台产出的结果先放这里。角色定稿候选满意后，可以手动纳入参考图库，再去四视图生成里勾选使用。">
          <GeneratedAssetsPanel
            assets={generatedAssets}
            onUpdateAsset={(assetId, payload) => void handleUpdateGeneratedAsset(assetId, payload)}
            onPromoteAsset={(assetId) => void handlePromoteGeneratedAsset(assetId)}
          />
        </DetailPanel>

        <DetailPanel title="提示词资产" description="这里是系统自动从角色圣经生成的基础资产，可作为后续生图/生视频的角色一致性底座。">
          <div className="grid gap-3 xl:grid-cols-3">
            <PromptBlock label="生图一致性" value={character.image_consistency_prompt} />
            <PromptBlock label="生视频一致性" value={character.video_consistency_prompt} />
            <PromptBlock label="三视图" value={character.three_view_prompt} />
          </div>
        </DetailPanel>
      </section>

      <GenerationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        generationType={generationType}
        model={model}
        prompt={prompt}
        negativePrompt={negativePrompt}
        selectedModel={selectedModel}
        aspectRatio={aspectRatio}
        imageSize={imageSize}
        onGenerationTypeChange={setGenerationType}
        onModelChange={setModel}
        onAspectRatioChange={setAspectRatio}
        onImageSizeChange={setImageSize}
        onPromptChange={setPrompt}
        onNegativePromptChange={setNegativePrompt}
        referenceAssets={referenceAssets}
        generatedAssets={generatedAssets}
        styleTemplates={styleTemplates}
        latestTask={latestTask}
        tasks={generationTasks}
        creatingTask={creatingTask}
        generatingPrompt={generatingPrompt}
        retryingTaskId={retryingTaskId}
        cancellingTaskId={cancellingTaskId}
        uploadingType={uploadingType}
        onUploadReference={(file, referenceType) => handleUploadReference(file, referenceType)}
        onGeneratePromptDraft={(params) => void handleGeneratePromptDraft(params)}
        onCreateTask={(params) => void handleCreateGenerationTask(params)}
        onRetryTask={(taskId) => void handleRetryGenerationTask(taskId)}
        onCancelTask={(taskId) => void handleCancelGenerationTask(taskId)}
        onDeleteReference={(assetId) => void handleDeleteReference(assetId)}
        onUpdateGeneratedAsset={(assetId, payload) => void handleUpdateGeneratedAsset(assetId, payload)}
        onPromoteGeneratedAsset={(assetId) => void handlePromoteGeneratedAsset(assetId)}
      />
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-black/25 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#8f846f]">{label}</div>
      <div className="mt-1 truncate text-sm font-medium text-[#fff5df]">{value}</div>
    </div>
  );
}

function DetailPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="surface rounded-2xl p-4 shadow-panel">
      <div className="text-sm font-semibold text-[#fff5df]">{title}</div>
      <p className="mt-1 text-xs leading-5 text-[#9e927c]">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailGrid({ items }: { items: Array<[string, string | null]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-[#e7b45f]/10 bg-black/20 px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">{label}</div>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#d8ccb3]">{value || "未设置"}</p>
        </div>
      ))}
    </div>
  );
}

function ReferenceSlot({
  title,
  description,
  examples,
  referenceType,
  assets,
  uploading,
  onUpload,
  onSetPrimary,
  onUpdate,
  onReplace,
  onDelete,
}: {
  title: string;
  description: string;
  examples: string[];
  referenceType: string;
  assets: CharacterReferenceAsset[];
  uploading: boolean;
  onUpload: (file: File, referenceType: string, styleBoard?: string) => void;
  onSetPrimary: (assetId: string) => void;
  onUpdate: (assetId: string, payload: Partial<Pick<CharacterReferenceAsset, "title" | "note">>) => void;
  onReplace: (assetId: string, file: File) => void;
  onDelete: (assetId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e7b45f]/18 bg-black/22 p-4">
      <div className="grid gap-2">
        {assets.length > 0 ? assets.slice(0, 2).map((asset) => (
          <ReferenceAssetCard key={asset.id} asset={asset} replacing={uploading} onSetPrimary={onSetPrimary} onUpdate={onUpdate} onReplace={onReplace} onDelete={onDelete} />
        )) : (
          <div className="aspect-[4/3] rounded-xl border border-[#e7b45f]/12 bg-[radial-gradient(circle_at_50%_20%,rgba(231,180,95,0.14),transparent_45%),rgba(245,234,214,0.035)]" />
        )}
      </div>
      <div className="mt-4 text-sm font-semibold text-[#fff5df]">{title}</div>
      <p className="mt-2 text-xs leading-5 text-[#9e927c]">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((item) => (
          <span key={item} className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#d8ccb3]">
            {item}
          </span>
        ))}
      </div>
      <label className="mt-4 block w-full cursor-pointer rounded-xl border border-stage-300/22 bg-stage-400/[0.08] px-4 py-2 text-center text-xs text-stage-100 transition hover:bg-stage-400/[0.14]">
        {uploading ? "上传中..." : "上传参考图"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.currentTarget.value = "";
            if (file) onUpload(file, referenceType);
          }}
        />
      </label>
    </div>
  );
}

function ReferenceLibrary({
  assets,
  uploadingType,
  onUpload,
  onSetPrimary,
  onUpdate,
  onReplace,
  onDelete,
  onRestore,
}: {
  assets: CharacterReferenceAsset[];
  uploadingType: string | null;
  onUpload: (file: File, referenceType: string, styleBoard?: string) => void;
  onSetPrimary: (assetId: string) => void;
  onUpdate: (assetId: string, payload: Partial<Pick<CharacterReferenceAsset, "title" | "note">>) => void;
  onReplace: (assetId: string, file: File) => void;
  onDelete: (assetId: string) => void;
  onRestore: (assetId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"facepaint" | "photo" | "trash">("photo");
  const liveAssets = assets.filter((asset) => !asset.deleted_at);
  const deletedAssets = assets.filter((asset) => Boolean(asset.deleted_at));
  const byType = (referenceType: string) => liveAssets.filter((asset) => asset.reference_type === referenceType);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[
          { id: "facepaint", label: "脸谱参考" },
          { id: "photo", label: "真人妆照" },
          { id: "trash", label: `回收站 ${deletedAssets.length}` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as "facepaint" | "photo" | "trash")}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              activeTab === tab.id
                ? "border-stage-300/35 bg-stage-400/[0.14] text-[#fff5df] shadow-stage-glow"
                : "border-[#e7b45f]/12 bg-black/25 text-[#bfb196] hover:text-[#fff5df]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "facepaint" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,520px)]">
          <ReferenceSlot title="脸谱参考图" description="角色脸谱只保留一张当前生效图。再次上传会把旧图移入回收站，新的脸谱自动成为主参考。" examples={["正脸", "色彩标准", "纹样边界"]} referenceType="facepaint" assets={byType("facepaint")} uploading={uploadingType === "facepaint"} onUpload={onUpload} onSetPrimary={onSetPrimary} onUpdate={onUpdate} onReplace={onReplace} onDelete={onDelete} />
        </div>
      ) : null}

      {activeTab === "photo" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReferenceSlot title="真人全身正面" description="锁定身形比例、完整服饰、头饰、脸谱正面、鞋靴和道具正面位置。" examples={["全身", "正面", "比例"]} referenceType="full_body_front_photo" assets={byType("full_body_front_photo")} uploading={uploadingType === "full_body_front_photo"} onUpload={onUpload} onSetPrimary={onSetPrimary} onUpdate={onUpdate} onReplace={onReplace} onDelete={onDelete} />
          <ReferenceSlot title="真人半侧身（1）" description="补充左/右半侧服饰层次、肩线厚度、腰带轮廓和面部转角。" examples={["半侧身", "服饰层次", "转角"]} referenceType="half_side_photo_1" assets={byType("half_side_photo_1")} uploading={uploadingType === "half_side_photo_1"} onUpload={onUpload} onSetPrimary={onSetPrimary} onUpdate={onUpdate} onReplace={onReplace} onDelete={onDelete} />
          <ReferenceSlot title="真人半侧身（2）" description="作为另一侧或不同角度半侧补充，减少生图时衣摆、头饰和武器位置漂移。" examples={["另一侧", "衣摆", "道具位置"]} referenceType="half_side_photo_2" assets={byType("half_side_photo_2")} uploading={uploadingType === "half_side_photo_2"} onUpload={onUpload} onSetPrimary={onSetPrimary} onUpdate={onUpdate} onReplace={onReplace} onDelete={onDelete} />
          <ReferenceSlot title="真人背后" description="锁定背面头饰、背部服装纹样、腰带后侧、裤装和鞋靴背面结构。" examples={["背面", "纹样", "服装结构"]} referenceType="back_photo" assets={byType("back_photo")} uploading={uploadingType === "back_photo"} onUpload={onUpload} onSetPrimary={onSetPrimary} onUpdate={onUpdate} onReplace={onReplace} onDelete={onDelete} />
        </div>
      ) : null}

      {activeTab === "trash" ? (
        <div className="mt-4">
          {deletedAssets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {deletedAssets.map((asset) => (
                <TrashAssetCard key={asset.id} asset={asset} onRestore={onRestore} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#e7b45f]/18 bg-black/22 p-8 text-center">
              <div className="text-sm font-semibold text-[#fff5df]">回收站为空</div>
              <p className="mt-2 text-xs text-[#9e927c]">删除的参考图会先放在这里，COS 文件不会立刻删除。</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

const generatedAssetTypes = [
  { id: "character_lookdev", label: "角色定稿", description: "角色主视觉候选，可手动纳入参考图库。" },
  { id: "four_view", label: "四视图", description: "正面、半侧、侧面、背面，适合定稿。" },
  { id: "expression_sheet", label: "表情表", description: "喜怒肃穆、咆哮、凝视等表演资产。" },
  { id: "pose_sheet", label: "动作姿态", description: "踏步、挥槌、转身、亮相等动作资产。" },
  { id: "costume_sheet", label: "服饰拆解", description: "头饰、腰带、鞋靴、纹样和材质细节。" },
  { id: "weapon_sheet", label: "武器道具", description: "武器造型、比例、材质和握持方式。" },
  { id: "keyframe_test", label: "关键帧测试", description: "用角色资产验证一张剧情关键帧。" },
] as const;

function GeneratedAssetsPanel({
  assets,
  onUpdateAsset,
  onPromoteAsset,
}: {
  assets: CharacterReferenceAsset[];
  onUpdateAsset: (
    assetId: string,
    payload: Partial<Pick<CharacterReferenceAsset, "accepted_for_keyframe" | "status" | "quality_note" | "title" | "note">>,
  ) => void;
  onPromoteAsset: (assetId: string) => void;
}) {
  const visibleAssets = assets.filter((asset) => !asset.deleted_at && asset.status !== "deleted");
  const acceptedAssets = visibleAssets.filter((asset) => asset.accepted_for_keyframe || asset.status === "accepted");
  const rejectedAssets = visibleAssets.filter((asset) => asset.status === "rejected");
  const candidateAssets = visibleAssets.filter((asset) => !asset.accepted_for_keyframe && asset.status !== "accepted" && asset.status !== "rejected" && asset.status !== "deleted");
  const byType = (generationType: string) => visibleAssets.filter((asset) => asset.generation_type === generationType);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <MiniMetric label="采纳区" value={String(acceptedAssets.length).padStart(2, "0")} />
        <MiniMetric label="候选区" value={String(candidateAssets.length).padStart(2, "0")} />
        <MiniMetric label="废片区" value={String(rejectedAssets.length).padStart(2, "0")} />
      </div>

      {visibleAssets.length > 0 ? (
        <div className="space-y-4">
          <GeneratedAssetSection
            title="采纳区"
            count={acceptedAssets.length}
            description="后续关键帧默认读取这里。放入这里的资产会作为角色关键帧链路的优先参考。"
            emptyText="还没有采纳资产。确认满意的候选图后，点击卡片上的“采纳”。"
            assets={acceptedAssets}
            onUpdateAsset={onUpdateAsset}
            onPromoteAsset={onPromoteAsset}
          />
          <GeneratedAssetSection
            title="候选区"
            count={candidateAssets.length}
            description="未删除、未采纳、且未标废的生成结果先集中在这里做质量判断。"
            emptyText="候选区为空。新的生图任务完成后，会优先进入这里等待筛选。"
            assets={candidateAssets}
            onUpdateAsset={onUpdateAsset}
            onPromoteAsset={onPromoteAsset}
          />
          <GeneratedAssetSection
            title="废片区"
            count={rejectedAssets.length}
            description="已标废的生成结果保留在这里，方便回看失败原因和质量备注。"
            emptyText="废片区为空。质量不达标的资产可在卡片上点击“标废”。"
            assets={rejectedAssets}
            onUpdateAsset={onUpdateAsset}
            onPromoteAsset={onPromoteAsset}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#e7b45f]/18 bg-black/22 p-6">
          <div className="text-sm font-semibold text-[#fff5df]">还没有生成资产</div>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-[#9e927c]">
            后续从角色生图工作台发起任务后，角色定稿图、四视图、表情表和动作姿态图会先进入这里。角色定稿图满意后，可以手动纳入参考图库。
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {generatedAssetTypes.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#e7b45f]/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-[#fff5df]">{item.label}</div>
                <p className="mt-1 text-[11px] leading-5 text-[#8f846f]">{item.description}</p>
                <div className="mt-3 rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#bfb196]">
                  {byType(item.id).length} 张
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GeneratedAssetSection({
  title,
  count,
  description,
  emptyText,
  assets,
  onUpdateAsset,
  onPromoteAsset,
}: {
  title: string;
  count: number;
  description: string;
  emptyText: string;
  assets: CharacterReferenceAsset[];
  onUpdateAsset: (
    assetId: string,
    payload: Partial<Pick<CharacterReferenceAsset, "accepted_for_keyframe" | "status" | "quality_note" | "title" | "note">>,
  ) => void;
  onPromoteAsset: (assetId: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-[#e7b45f]/12 bg-black/16 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#fff5df]">{title}</h3>
            <span className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#f6d89a]">{count} 张</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#9e927c]">{description}</p>
        </div>
      </div>
      {assets.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {assets.map((asset) => (
            <GeneratedAssetCard key={asset.id} asset={asset} onUpdateAsset={onUpdateAsset} onPromoteAsset={onPromoteAsset} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-[#e7b45f]/16 bg-black/18 p-5 text-xs leading-5 text-[#9e927c]">{emptyText}</div>
      )}
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-black/20 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#fff5df]">{value}</div>
    </div>
  );
}

function GeneratedAssetCard({
  asset,
  onUpdateAsset,
  onPromoteAsset,
}: {
  asset: CharacterReferenceAsset;
  onUpdateAsset: (
    assetId: string,
    payload: Partial<Pick<CharacterReferenceAsset, "accepted_for_keyframe" | "status" | "quality_note" | "title" | "note">>,
  ) => void;
  onPromoteAsset: (assetId: string) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(asset.quality_note || "");
  const displayName = asset.title || asset.filename;
  const typeLabel = generatedAssetTypes.find((item) => item.id === asset.generation_type)?.label || asset.generation_type || "生成资产";
  const isRejected = asset.status === "rejected";
  const isAccepted = asset.accepted_for_keyframe || asset.status === "accepted";
  const canPromoteToReference = asset.generation_type === "character_lookdev" && asset.status !== "rejected";

  useEffect(() => {
    setNoteDraft(asset.quality_note || "");
  }, [asset.quality_note]);

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-[#e7b45f]/12 bg-black/24 shadow-panel">
        {asset.url ? (
          <button type="button" onClick={() => setPreviewOpen(true)} className="group relative flex aspect-[4/3] w-full overflow-hidden bg-[#080a07]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={displayName} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
            {isAccepted ? (
              <span className="absolute left-3 top-3 rounded-full border border-teal-300/25 bg-teal-400/15 px-2.5 py-1 text-[10px] text-teal-100">可用于关键帧</span>
            ) : null}
            {isRejected ? (
              <span className="absolute left-3 top-3 rounded-full border border-clay-300/25 bg-clay-500/15 px-2.5 py-1 text-[10px] text-[#ffd7c3]">废片</span>
            ) : null}
          </button>
        ) : (
          <div className="aspect-[4/3] bg-black/30" />
        )}
        <div className="p-3">
          <div className="line-clamp-1 text-xs font-medium text-[#fff5df]">{displayName}</div>
          <div className="mt-1 text-[10px] text-stage-100">{typeLabel}</div>
          <textarea
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-[#e7b45f]/12 bg-black/25 px-2 py-1.5 text-[11px] leading-4 text-[#d8ccb3] outline-none transition focus:border-stage-300/35"
            placeholder="质量备注：脸谱是否稳定、服饰是否一致、是否可用于关键帧..."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {asset.url ? (
              <button type="button" onClick={() => setPreviewOpen(true)} className="rounded-full border border-stage-300/20 bg-stage-400/[0.08] px-2.5 py-1 text-[10px] text-stage-100">
                预览
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onUpdateAsset(asset.id, { accepted_for_keyframe: true, status: "accepted", quality_note: noteDraft || "人工采纳为可用于关键帧资产。" })}
              className="rounded-full border border-teal-300/25 bg-teal-400/[0.1] px-2.5 py-1 text-[10px] text-teal-100"
            >
              采纳
            </button>
            {canPromoteToReference ? (
              <button
                type="button"
                onClick={() => onPromoteAsset(asset.id)}
                className="rounded-full border border-stage-300/25 bg-stage-400/[0.08] px-2.5 py-1 text-[10px] text-stage-100"
              >
                纳入参考图
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onUpdateAsset(asset.id, { accepted_for_keyframe: false, status: "rejected", quality_note: noteDraft || "人工标记为废片，暂不进入关键帧链路。" })}
              className="rounded-full border border-clay-300/20 bg-clay-500/[0.08] px-2.5 py-1 text-[10px] text-[#ffd7c3]"
            >
              标废
            </button>
            <button
              type="button"
              onClick={() => onUpdateAsset(asset.id, { quality_note: noteDraft })}
              className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#d8ccb3]"
            >
              保存备注
            </button>
          </div>
        </div>
      </article>
      {previewOpen && asset.url ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020402]/88 p-5 backdrop-blur-sm">
          <button type="button" aria-label="关闭预览" className="absolute inset-0 cursor-zoom-out" onClick={() => setPreviewOpen(false)} />
          <div className="relative flex max-h-[92vh] w-[min(1200px,96vw)] flex-col overflow-hidden rounded-2xl border border-[#6c512a] bg-[#0d100b] shadow-[0_30px_120px_rgba(0,0,0,0.78)]">
            <header className="flex items-center justify-between gap-4 border-b border-[#2e2518] bg-[#15160f] px-4 py-3">
              <div>
                <div className="line-clamp-1 text-sm font-semibold text-[#fff5df]">{displayName}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">{typeLabel}</div>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="rounded-full border border-[#5a4527] bg-[#0a0b08] px-3 py-1.5 text-xs text-[#e9dcc4] transition hover:border-[#d5a753]">
                关闭
              </button>
            </header>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-[#070907] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt={displayName} className="max-h-[78vh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TrashAssetCard({ asset, onRestore }: { asset: CharacterReferenceAsset; onRestore: (assetId: string) => void }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const displayName = asset.title || asset.filename;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-clay-300/18 bg-black/24 p-3">
        {asset.url ? (
          <button type="button" onClick={() => setPreviewOpen(true)} className="relative flex aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#080a07]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={displayName} className="h-full w-full object-cover opacity-70 grayscale-[0.35]" />
            <span className="absolute left-3 top-3 rounded-full border border-clay-300/20 bg-black/65 px-2 py-1 text-[10px] text-[#ffd7c3]">已删除</span>
          </button>
        ) : (
          <div className="aspect-[4/3] rounded-xl bg-black/30" />
        )}
        <div className="mt-3">
          <div className="line-clamp-1 text-xs font-medium text-[#fff5df]">{displayName}</div>
          <div className="mt-1 text-[10px] text-[#8f846f]">{asset.reference_type || "reference"} · {asset.deleted_at ? new Date(asset.deleted_at).toLocaleString("zh-CN") : "未知时间"}</div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setPreviewOpen(true)} className="rounded-full border border-stage-300/20 bg-stage-400/[0.08] px-2.5 py-1 text-[10px] text-stage-100">
              预览
            </button>
            <button type="button" onClick={() => onRestore(asset.id)} className="rounded-full border border-[#e7b45f]/16 bg-[#e7b45f]/10 px-2.5 py-1 text-[10px] text-[#f6d89a]">
              恢复
            </button>
          </div>
        </div>
      </div>
      {previewOpen && asset.url ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020402]/88 p-5 backdrop-blur-sm">
          <button type="button" aria-label="关闭预览" className="absolute inset-0 cursor-zoom-out" onClick={() => setPreviewOpen(false)} />
          <div className="relative flex max-h-[92vh] w-[min(1200px,96vw)] flex-col overflow-hidden rounded-2xl border border-[#6c512a] bg-[#0d100b] shadow-[0_30px_120px_rgba(0,0,0,0.78)]">
            <header className="flex items-center justify-between gap-4 border-b border-[#2e2518] bg-[#15160f] px-4 py-3">
              <div className="line-clamp-1 text-sm font-semibold text-[#fff5df]">{displayName}</div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="rounded-full border border-[#5a4527] bg-[#0a0b08] px-3 py-1.5 text-xs text-[#e9dcc4] transition hover:border-[#d5a753]">
                关闭
              </button>
            </header>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-[#070907] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt={displayName} className="max-h-[78vh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ReferenceAssetCard({
  asset,
  replacing,
  onSetPrimary,
  onUpdate,
  onReplace,
  onDelete,
}: {
  asset: CharacterReferenceAsset;
  replacing: boolean;
  onSetPrimary: (assetId: string) => void;
  onUpdate: (assetId: string, payload: Partial<Pick<CharacterReferenceAsset, "title" | "note">>) => void;
  onReplace: (assetId: string, file: File) => void;
  onDelete: (assetId: string) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [titleDraft, setTitleDraft] = useState(asset.title || asset.filename);
  const displayName = asset.title || asset.filename;

  useEffect(() => {
    setTitleDraft(displayName);
  }, [displayName]);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[#e7b45f]/12 bg-[#0d100b] shadow-[0_14px_36px_rgba(0,0,0,0.24)]">
        {asset.url ? (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[#080a07]"
            aria-label={`预览 ${displayName}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={displayName} className="relative h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
            <span className="absolute bottom-3 right-3 rounded-full border border-[#e7b45f]/18 bg-black/70 px-2.5 py-1 text-[10px] text-[#fff5df] opacity-0 backdrop-blur transition group-hover:opacity-100">
              点击预览
            </span>
          </button>
        ) : (
          <div className="aspect-[4/3] bg-black/30" />
        )}
        <div className="p-3">
          {editing ? (
            <div className="space-y-2">
              <input
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                className="w-full rounded-lg border border-[#e7b45f]/18 bg-black/35 px-2.5 py-2 text-xs text-[#fff5df] outline-none transition focus:border-stage-300/45"
                placeholder="参考图标题"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdate(asset.id, { title: titleDraft.trim() || asset.filename });
                    setEditing(false);
                  }}
                  className="rounded-full border border-stage-300/22 bg-stage-400/[0.1] px-2.5 py-1 text-[10px] text-stage-100"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitleDraft(displayName);
                    setEditing(false);
                  }}
                  className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#d8ccb3]"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="line-clamp-1 text-xs font-medium text-[#fff5df]">{displayName}</div>
          )}
          <div className="mt-1 text-[10px] text-[#8f846f]">{asset.is_primary ? "主参考图" : asset.provider}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {asset.url ? (
              <button type="button" onClick={() => setPreviewOpen(true)} className="rounded-full border border-stage-300/20 bg-stage-400/[0.08] px-2.5 py-1 text-[10px] text-stage-100">
                预览
              </button>
            ) : null}
            <button type="button" onClick={() => onSetPrimary(asset.id)} className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#d8ccb3]">
              设主图
            </button>
            <button type="button" onClick={() => setEditing(true)} className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#d8ccb3]">
              改名
            </button>
            <label className="cursor-pointer rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#d8ccb3]">
              {replacing ? "替换中" : "替换"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={replacing}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.currentTarget.value = "";
                  if (file) onReplace(asset.id, file);
                }}
              />
            </label>
            <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full border border-clay-300/20 bg-clay-500/[0.08] px-2.5 py-1 text-[10px] text-[#ffd7c3]">
              删除
            </button>
          </div>
          {confirmDelete ? (
            <div className="mt-3 rounded-xl border border-clay-300/20 bg-clay-500/[0.08] p-3">
              <div className="text-xs font-medium text-[#ffd7c3]">确认删除这张参考图？</div>
              <p className="mt-1 text-[10px] leading-4 text-[#bfa58f]">会删除数据库记录，并尝试同步删除 COS 文件。</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(asset.id);
                    setConfirmDelete(false);
                  }}
                  className="rounded-full border border-clay-300/25 bg-clay-500/[0.14] px-2.5 py-1 text-[10px] text-[#ffd7c3]"
                >
                  确认删除
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-[#e7b45f]/12 bg-black/25 px-2.5 py-1 text-[10px] text-[#d8ccb3]">
                  取消
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {previewOpen && asset.url ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020402]/88 p-5 backdrop-blur-sm">
          <button type="button" aria-label="关闭预览" className="absolute inset-0 cursor-zoom-out" onClick={() => setPreviewOpen(false)} />
          <div className="relative flex max-h-[92vh] w-[min(1200px,96vw)] flex-col overflow-hidden rounded-2xl border border-[#6c512a] bg-[#0d100b] shadow-[0_30px_120px_rgba(0,0,0,0.78)]">
            <header className="flex items-center justify-between gap-4 border-b border-[#2e2518] bg-[#15160f] px-4 py-3">
              <div className="min-w-0">
                <div className="line-clamp-1 text-sm font-semibold text-[#fff5df]">{displayName}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">{asset.reference_type || "reference"} · {asset.provider}</div>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="rounded-full border border-[#5a4527] bg-[#0a0b08] px-3 py-1.5 text-xs text-[#e9dcc4] transition hover:border-[#d5a753]">
                关闭
              </button>
            </header>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-[radial-gradient(circle_at_50%_8%,rgba(231,180,95,0.1),transparent_38%),#070907] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt={displayName} className="max-h-[78vh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function GenerationDrawer({
  open,
  onClose,
  generationType,
  model,
  prompt,
  negativePrompt,
  selectedModel,
  aspectRatio,
  imageSize,
  onGenerationTypeChange,
  onModelChange,
  onAspectRatioChange,
  onImageSizeChange,
  onPromptChange,
  onNegativePromptChange,
  referenceAssets,
  generatedAssets,
  styleTemplates,
  latestTask,
  tasks,
  creatingTask,
  generatingPrompt,
  retryingTaskId,
  cancellingTaskId,
  uploadingType,
  onUploadReference,
  onGeneratePromptDraft,
  onCreateTask,
  onRetryTask,
  onCancelTask,
  onDeleteReference,
  onUpdateGeneratedAsset,
  onPromoteGeneratedAsset,
}: {
  open: boolean;
  onClose: () => void;
  generationType: string;
  model: string;
  prompt: string;
  negativePrompt: string;
  selectedModel: { id: string; label: string; hint: string; provider: string; enabled: boolean };
  aspectRatio: (typeof outputAspectRatios)[number];
  imageSize: (typeof outputImageSizes)[number];
  onGenerationTypeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onAspectRatioChange: (value: (typeof outputAspectRatios)[number]) => void;
  onImageSizeChange: (value: (typeof outputImageSizes)[number]) => void;
  onPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
  referenceAssets: CharacterReferenceAsset[];
  generatedAssets: CharacterReferenceAsset[];
  styleTemplates: StyleTemplate[];
  latestTask: GenerateTask | null;
  tasks: GenerateTask[];
  creatingTask: boolean;
  generatingPrompt: boolean;
  retryingTaskId: string | null;
  cancellingTaskId: string | null;
  uploadingType: string | null;
  onUploadReference: (file: File, referenceType: string) => Promise<CharacterReferenceAsset | null>;
  onGeneratePromptDraft: (params: { inputAssetIds: string[]; styleTemplateId: string | null }) => void;
  onCreateTask: (params: { inputAssetIds: string[]; styleTemplateId: string | null; mockForceFail?: boolean }) => void;
  onRetryTask: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
  onDeleteReference: (assetId: string) => void;
  onUpdateGeneratedAsset: (
    assetId: string,
    payload: Partial<Pick<CharacterReferenceAsset, "accepted_for_keyframe" | "status" | "quality_note" | "title" | "note">>,
  ) => void;
  onPromoteGeneratedAsset: (assetId: string) => void;
}) {
  const liveReferenceAssets = useMemo(() => referenceAssets.filter((asset) => !asset.deleted_at), [referenceAssets]);
  const liveGeneratedAssets = useMemo(() => generatedAssets.filter((asset) => !asset.deleted_at), [generatedAssets]);
  const roleStyleTemplates = useMemo(() => styleTemplates.filter((item) => item.style_category !== "场景模板"), [styleTemplates]);
  const defaultAssetIds = liveReferenceAssets.map((asset) => asset.id).join("|");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [styleTemplateId, setStyleTemplateId] = useState<string>("");
  const [mockForceFail, setMockForceFail] = useState(false);
  const [uploadReferenceType, setUploadReferenceType] = useState<(typeof workbenchReferenceTypes)[number]["id"]>("full_body_front_photo");

  function handleRemovePickedReference(assetId: string) {
    setSelectedAssetIds((current) => current.filter((item) => item !== assetId));
    onDeleteReference(assetId);
  }

  useEffect(() => {
    const recommended = getRecommendedReferenceAssetIds(liveReferenceAssets, generationType);
    setSelectedAssetIds((current) => {
      const stillAvailable = current.filter((assetId) => liveReferenceAssets.some((asset) => asset.id === assetId));
      return stillAvailable.length > 0 ? stillAvailable : recommended;
    });
  }, [defaultAssetIds, generationType, liveReferenceAssets]);

  if (!open) {
    return null;
  }

  const selectedGeneration = generationTypes.find((item) => item.id === generationType) ?? generationTypes[0];
  const selectedStyleTemplate = roleStyleTemplates.find((item) => item.id === styleTemplateId) ?? null;
  const selectedModelIsReal = selectedModel.provider === "dmx-gemini" || selectedModel.provider === "dmx-gpt-image" || selectedModel.provider === "dmx-seedream";
  const generatedResultAssets = latestTask?.output_asset_ids?.length
    ? liveGeneratedAssets.filter((asset) => latestTask.output_asset_ids.includes(asset.id))
    : liveGeneratedAssets.filter((asset) => asset.generation_type === generationType).slice(0, 4);
  const preflightIssues = buildGenerationPreflightIssues({
    generationType,
    liveReferenceAssets,
    selectedAssetIds,
    selectedStyleTemplate,
  });
  const assembledPromptPreview = buildAssembledPromptPreview({
    generationLabel: selectedGeneration.label,
    generationType,
    prompt,
    negativePrompt,
    styleTemplate: selectedStyleTemplate,
    selectedAssetCount: selectedAssetIds.length,
  });
  const usesConfirmedPrompt = generationType === "four_view" || generationType === "character_lookdev";
  const promptPreviewTitle = usesConfirmedPrompt ? "最终送模 Prompt" : "任务上下文预览";
  const promptPreviewDescription = generationType === "four_view"
    ? "四视图会直接使用这里确认后的 Prompt 发起生图，后端会追加参考图配色保真契约。"
    : "角色定稿会直接使用这里确认后的 Prompt 发起生图，后端会追加参考图保真契约。";

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#020402]/70">
      <button type="button" aria-label="关闭生图工作台" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className="relative flex h-full w-[min(100vw,1320px)] flex-col border-l border-[#61451d] bg-[#0d100b] shadow-[-28px_0_90px_rgba(0,0,0,0.72)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(231,180,95,0.05),transparent_32%),radial-gradient(circle_at_74%_0%,rgba(79,189,168,0.09),transparent_34%)]" />
        <header className="relative border-b border-[#2e2518] bg-[#15160f] px-5 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.34em] text-[#d5a753]">Character Asset Generator</div>
              <h3 className="mt-2 text-2xl font-semibold text-[#fff5df]">角色资产生成台</h3>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-[#bfb196]">核心逻辑：参考图决定模型看什么，Prompt 决定模型做什么，生成结果先进候选区，人工采纳后才进入关键帧资产。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled className="rounded-full border border-[#45351f] bg-[#0a0b08] px-3 py-1.5 text-xs text-[#7f755f]">保存为模板</button>
              <button
                type="button"
                onClick={() => onCreateTask({ inputAssetIds: selectedAssetIds, styleTemplateId: styleTemplateId || null, mockForceFail })}
                disabled={creatingTask || selectedAssetIds.length === 0}
                className="rounded-full border border-[#856027] bg-[#2a2112] px-3 py-1.5 text-xs text-[#d9ba73] transition hover:border-[#d5a753] disabled:opacity-50"
              >
                {creatingTask ? "任务创建中" : "发起生成"}
              </button>
              <button type="button" onClick={onClose} className="rounded-full border border-[#5a4527] bg-[#0a0b08] px-3 py-1.5 text-xs text-[#e9dcc4] transition hover:border-[#d5a753]">关闭</button>
            </div>
          </div>
          <div className="mt-4">
            <ActiveGenerationProgress task={latestTask} creating={creatingTask} retrying={retryingTaskId !== null} cancelling={cancellingTaskId !== null} />
          </div>
        </header>

        <div className="relative grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[360px_minmax(0,1fr)_420px]">
          <section className="min-h-0 overflow-y-auto border-r border-[#2e2518] bg-[#0a0d09] p-4">
            <div className="text-xs font-semibold text-[#fff5df]">1. 生成目标</div>
            <p className="mt-1 text-[11px] leading-5 text-[#8f846f]">先确定这次要产出什么，再选择参考图。</p>
            <div className="mt-4 grid gap-2">
              {generationTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onGenerationTypeChange(item.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    item.id === generationType
                      ? "border-[#d5a753] bg-[#2b2414] shadow-[0_0_0_1px_rgba(213,167,83,0.22),0_12px_34px_rgba(0,0,0,0.38)]"
                      : "border-[#2f291d] bg-[#11140e] hover:border-[#7d5b2a]"
                  }`}
                >
                  <div className="text-sm font-medium text-[#fff5df]">{item.label}</div>
                  <p className="mt-1 text-[11px] leading-5 text-[#9e927c]">{item.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-[#2e2518] pt-4">
              <div className="text-xs font-semibold text-[#fff5df]">2. 参考图输入</div>
              <p className="mt-1 text-[11px] leading-5 text-[#8f846f]">按职责选择：脸谱锁妆容，真人照锁体态/服饰/道具。</p>
              <div className="mt-4 rounded-2xl border border-[#3b301f] bg-[#11140e] p-3">
                <div className="text-xs font-semibold text-[#fff5df]">本地上传参考图</div>
                <p className="mt-1 text-[10px] leading-4 text-[#8f846f]">上传后会进入角色参考图库，并自动勾选进本次 GenerateTask 输入快照。</p>
                <div className="mt-3 grid gap-2">
                  <select value={uploadReferenceType} onChange={(event) => setUploadReferenceType(event.target.value as (typeof workbenchReferenceTypes)[number]["id"])} className="field-input text-xs">
                    {workbenchReferenceTypes.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                  <label className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    uploadingType === uploadReferenceType
                      ? "border-stage-300/25 bg-stage-400/[0.08] text-stage-100"
                      : "border-[#5a4527] bg-[#2a2112] text-[#d9ba73] hover:border-[#d5a753]"
                  }`}>
                    {uploadingType === uploadReferenceType ? "上传中..." : "选择本地图片上传"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingType === uploadReferenceType}
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) return;
                        const asset = await onUploadReference(file, uploadReferenceType);
                        if (asset) {
                          setSelectedAssetIds((current) => Array.from(new Set([asset.id, ...current])));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <ReferencePickGroup
                  title="脸谱参考"
                  hint="建议必选，用来锁定英歌脸谱纹样。"
                  assets={liveReferenceAssets.filter((asset) => asset.reference_type?.startsWith("facepaint"))}
                  selectedAssetIds={selectedAssetIds}
                  onToggle={(assetId, checked) => setSelectedAssetIds((current) => checked ? Array.from(new Set([...current, assetId])) : current.filter((item) => item !== assetId))}
                />
                <ReferencePickGroup
                  title="真人妆照四面"
                  hint="角色定稿至少选 1 张；四视图建议四面都选。"
                  assets={liveReferenceAssets.filter((asset) => ["full_body_front_photo", "half_side_photo_1", "half_side_photo_2", "back_photo"].includes(asset.reference_type || ""))}
                  selectedAssetIds={selectedAssetIds}
                  onToggle={(assetId, checked) => setSelectedAssetIds((current) => checked ? Array.from(new Set([...current, assetId])) : current.filter((item) => item !== assetId))}
                />
                <ReferencePickGroup
                  title="角色定稿参考"
                  hint="从角色定稿候选手动纳入的参考图；四视图生成时可在这里勾选。"
                  assets={liveReferenceAssets.filter((asset) => asset.reference_type === "character_final_reference")}
                  selectedAssetIds={selectedAssetIds}
                  onToggle={(assetId, checked) => setSelectedAssetIds((current) => checked ? Array.from(new Set([...current, assetId])) : current.filter((item) => item !== assetId))}
                  onRemove={handleRemovePickedReference}
                />
                <ReferencePickGroup
                  title="其他补充参考"
                  hint="可选，用于补足道具、表情或已采纳资产。"
                  assets={liveReferenceAssets.filter((asset) => !asset.reference_type?.startsWith("facepaint") && !["full_body_front_photo", "half_side_photo_1", "half_side_photo_2", "back_photo", "character_final_reference"].includes(asset.reference_type || ""))}
                  selectedAssetIds={selectedAssetIds}
                  onToggle={(assetId, checked) => setSelectedAssetIds((current) => checked ? Array.from(new Set([...current, assetId])) : current.filter((item) => item !== assetId))}
                />
              </div>
            </div>
          </section>

          <section className="min-h-0 overflow-y-auto bg-[#0d100b] p-4">
            <div className="rounded-2xl border border-[#3b301f] bg-[#171811] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.32)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-stage-100">Current Target</div>
                  <h4 className="mt-2 text-xl font-semibold text-[#fff5df]">{selectedGeneration.label}</h4>
                  <p className="mt-1 text-xs leading-5 text-[#9e927c]">{selectedGeneration.desc}</p>
                </div>
                <div className="rounded-xl border border-[#4c3b22] bg-[#11140e] px-3 py-2 text-xs text-[#d8ccb3]">
                  {selectedModel.label}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Field label={generationType === "four_view" ? "3. 四视图最终 Prompt" : "3. 角色定稿最终 Prompt"}>
                {usesConfirmedPrompt ? (
                  <button
                    type="button"
                    onClick={() => onGeneratePromptDraft({ inputAssetIds: selectedAssetIds, styleTemplateId: styleTemplateId || null })}
                    disabled={generatingPrompt}
                    className="mb-3 rounded-xl border border-stage-300/25 bg-stage-400/[0.08] px-3 py-2 text-xs font-medium text-stage-100 transition hover:bg-stage-400/[0.16] disabled:opacity-50"
                  >
                    {generatingPrompt ? "Prompt 生成中..." : generationType === "four_view" ? "生成/优化四视图 Prompt" : "生成/优化定稿 Prompt"}
                  </button>
                ) : null}
                <textarea value={prompt} onChange={(event) => onPromptChange(event.target.value)} rows={12} className="field-input resize-y leading-6" />
              </Field>
            </div>

            <div className="mt-4 rounded-2xl border border-[#3b301f] bg-[#11140e] p-4">
              <div className="text-sm font-semibold text-[#fff5df]">{promptPreviewTitle}</div>
              <p className="mt-1 text-[11px] leading-5 text-[#8f846f]">{promptPreviewDescription}</p>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-[#332a1c] bg-black/25 p-3 text-[11px] leading-5 text-[#d8ccb3]">{assembledPromptPreview}</pre>
            </div>
          </section>

          <section className="min-h-0 overflow-y-auto border-l border-[#2e2518] bg-[#0a0d09] p-4">
            <ControlPanel title="模型与输出参数">
              <div className="grid gap-3">
                <Field label="生图模型">
                  <select value={model} onChange={(event) => onModelChange(event.target.value)} className="field-input">
                    {imageModels.map((item) => (
                      <option key={item.id} value={item.id} disabled={!item.enabled}>{item.label}{item.enabled ? "" : "（预留）"}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs leading-5 text-[#8f846f]">{selectedModel.hint} · Provider：{selectedModel.provider}</p>
                </Field>
                <Field label="比例 / 清晰度">
                  <div className="grid gap-2 md:grid-cols-2">
                    <select className="field-input" value={aspectRatio} onChange={(event) => onAspectRatioChange(event.target.value as (typeof outputAspectRatios)[number])}>
                      {outputAspectRatios.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <select className="field-input" value={imageSize} onChange={(event) => onImageSizeChange(event.target.value as (typeof outputImageSizes)[number])}>
                      {outputImageSizes.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#8f846f]">当前默认 1 张输出；GPT Image 2 会把比例/等级映射为具体 size，Nano Banana 2 透传给 imageConfig，Seedream 5.0 Lite 按文档映射为 2K/3K。</p>
                </Field>
              </div>
            </ControlPanel>

            <ControlPanel title="角色模板">
              <StyleTemplatePicker
                templates={roleStyleTemplates}
                selectedTemplateId={styleTemplateId}
                onSelect={setStyleTemplateId}
                onClear={() => setStyleTemplateId("")}
              />
            </ControlPanel>

            <div className="mt-4">
              <Field label="负面提示词">
                <textarea value={negativePrompt} onChange={(event) => onNegativePromptChange(event.target.value)} rows={7} className="field-input resize-y leading-6" />
              </Field>
            </div>

            <div className="mt-4 rounded-2xl border border-[#3b301f] bg-[#11140e] p-4">
              <div className="text-sm font-semibold text-[#fff5df]">生成前检查</div>
              <div className="mt-3 space-y-2">
                {preflightIssues.length > 0 ? preflightIssues.map((issue) => (
                  <div key={issue} className="rounded-xl border border-clay-300/20 bg-clay-500/[0.08] px-3 py-2 text-xs leading-5 text-[#ffd7c3]">{issue}</div>
                )) : (
                  <div className="rounded-xl border border-teal-300/20 bg-teal-400/[0.08] px-3 py-2 text-xs leading-5 text-teal-100">参考图、角色模板和输出参数已就绪。</div>
                )}
              </div>
              <label className="mt-3 flex items-center justify-between rounded-xl border border-[#332a1c] bg-[#0a0d09] px-3 py-2 text-xs text-[#d8ccb3]">
                <span>
                  <span className="block font-medium text-[#fff5df]">Mock 失败测试</span>
                  <span className="mt-1 block text-[10px] text-[#8f846f]">仅 mock provider 生效；真实模型失败会记录 provider 错误。</span>
                </span>
                <input type="checkbox" checked={mockForceFail} disabled={selectedModelIsReal} onChange={(event) => setMockForceFail(event.target.checked)} />
              </label>
              {latestTask ? (
                <div className="mt-3 space-y-2">
                  <CompactTaskProgress
                    task={latestTask}
                    retrying={retryingTaskId === latestTask.id}
                    cancelling={cancellingTaskId === latestTask.id}
                    onRetry={() => onRetryTask(latestTask.id)}
                    onCancel={() => onCancelTask(latestTask.id)}
                  />
                  <p className="text-xs leading-5 text-[#9e927c]">任务已落库，输入快照、参考图、角色模板和输出资产都已记录。</p>
                </div>
              ) : (
                <p className="mt-2 text-xs leading-5 text-[#9e927c]">点击发起生成后，会创建 GenerateTask。真实模型会调用 DMXAPI，结果上传 COS 后进入生成资产区。</p>
              )}
              <button
                type="button"
                onClick={() => onCreateTask({ inputAssetIds: selectedAssetIds, styleTemplateId: styleTemplateId || null, mockForceFail })}
                disabled={creatingTask || selectedAssetIds.length === 0}
                className="mt-4 w-full rounded-xl border border-[#856027] bg-[#2a2112] px-4 py-3 text-sm font-medium text-[#d9ba73] transition hover:border-[#d5a753] disabled:opacity-50"
              >
                {creatingTask ? "任务创建中..." : "发起生成任务"}
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[#3b301f] bg-[#11140e] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#fff5df]">本次生成结果</div>
                  <p className="mt-1 text-[11px] leading-5 text-[#8f846f]">结果可直接预览、写质量备注、采纳或标废。</p>
                </div>
                <span className="rounded-full border border-[#47371f] bg-[#0a0b08] px-2 py-1 text-[10px] text-[#8f846f]">{generatedResultAssets.length} 张</span>
              </div>
              <div className="mt-3 grid gap-3">
                {generatedResultAssets.length > 0 ? generatedResultAssets.map((asset) => (
                  <GeneratedAssetCard key={asset.id} asset={asset} onUpdateAsset={onUpdateGeneratedAsset} onPromoteAsset={onPromoteGeneratedAsset} />
                )) : (
                  <div className="rounded-xl border border-dashed border-[#e7b45f]/14 bg-black/20 p-4 text-xs leading-5 text-[#9e927c]">
                    生成完成后，候选图会先出现在这里。采纳后会同步进入下方生成资产区的“已采纳”筛选。
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#3b301f] bg-[#11140e] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#fff5df]">最近任务</div>
                  <p className="mt-1 text-[11px] leading-5 text-[#8f846f]">失败不覆盖，重试会创建新任务。</p>
                </div>
                <span className="rounded-full border border-[#47371f] bg-[#0a0b08] px-2 py-1 text-[10px] text-[#8f846f]">{tasks.length} 条</span>
              </div>
              <div className="mt-3 max-h-80 space-y-2 overflow-auto pr-1">
                {tasks.length > 0 ? tasks.map((task) => (
                  <GenerationTaskCard
                    key={task.id}
                    task={task}
                    retrying={retryingTaskId === task.id}
                    cancelling={cancellingTaskId === task.id}
                    onRetry={() => onRetryTask(task.id)}
                    onCancel={() => onCancelTask(task.id)}
                  />
                )) : (
                  <div className="rounded-xl border border-dashed border-[#e7b45f]/14 bg-black/20 p-4 text-xs leading-5 text-[#9e927c]">
                    暂无任务。发起生成后，这里会显示输入快照、状态和失败原因。
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <footer className="relative flex flex-col gap-3 border-t border-[#2e2518] bg-[#15160f] px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-xs leading-5 text-[#9e927c]">
            当前目标：<span className="text-[#fff5df]">{selectedGeneration.label}</span> · 模型：<span className="text-[#fff5df]">{selectedModel.label}</span> · 规格：<span className="text-[#fff5df]">{aspectRatio}/{imageSize}</span> · 参考图：<span className="text-[#fff5df]">{selectedAssetIds.length}</span> 张
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled className="rounded-xl border border-[#45351f] bg-[#0a0b08] px-4 py-2 text-xs text-[#7f755f]">复制提示词</button>
            <button type="button" disabled className="rounded-xl border border-[#45351f] bg-[#0a0b08] px-4 py-2 text-xs text-[#7f755f]">加入队列</button>
            <button
              type="button"
              onClick={() => onCreateTask({ inputAssetIds: selectedAssetIds, styleTemplateId: styleTemplateId || null, mockForceFail })}
              disabled={creatingTask || selectedAssetIds.length === 0}
              className="rounded-xl border border-[#856027] bg-[#2a2112] px-5 py-2 text-xs font-semibold text-[#d9ba73] transition hover:border-[#d5a753] disabled:opacity-50"
            >
              {creatingTask ? "任务创建中" : "发起生成"}
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function ControlPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#3b301f] bg-[#171811] p-4 shadow-[0_14px_36px_rgba(0,0,0,0.25)]">
      <div className="mb-3 text-sm font-semibold text-[#fff5df]">{title}</div>
      {children}
    </div>
  );
}

function ReferencePickGroup({
  title,
  hint,
  assets,
  selectedAssetIds,
  onToggle,
  onRemove,
}: {
  title: string;
  hint: string;
  assets: CharacterReferenceAsset[];
  selectedAssetIds: string[];
  onToggle: (assetId: string, checked: boolean) => void;
  onRemove?: (assetId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#3b301f] bg-[#11140e] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-[#fff5df]">{title}</div>
          <p className="mt-1 text-[10px] leading-4 text-[#8f846f]">{hint}</p>
        </div>
        <span className="rounded-full border border-[#47371f] bg-[#0a0b08] px-2 py-1 text-[10px] text-[#8f846f]">{assets.length}</span>
      </div>
      <div className="mt-3 space-y-2">
        {assets.length > 0 ? assets.map((asset) => {
          const checked = selectedAssetIds.includes(asset.id);
          return (
            <div key={asset.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${checked ? "border-stage-300/25 bg-stage-400/[0.08]" : "border-[#332a1c] bg-[#12150f]"}`}>
              <input
                type="checkbox"
                aria-label={`选择${asset.title || asset.filename}`}
                checked={checked}
                onChange={(event) => onToggle(asset.id, event.target.checked)}
              />
              {asset.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.url} alt={asset.title || asset.filename} className="h-11 w-11 rounded-lg object-cover" />
              ) : (
                <span className="h-11 w-11 rounded-lg bg-black/30" />
              )}
              <button type="button" onClick={() => onToggle(asset.id, !checked)} className="min-w-0 flex-1 cursor-pointer text-left">
                <span className="line-clamp-1 text-xs font-medium text-[#fff5df]">{asset.title || asset.filename}</span>
                <span className="mt-0.5 block text-[10px] text-[#8f846f]">{referenceTypeLabel(asset.reference_type)}</span>
              </button>
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(asset.id)}
                  className="shrink-0 rounded-full border border-[#5d332a] bg-[#2a1210] px-2 py-1 text-[10px] text-[#f0a89a] transition hover:border-[#f0a89a]"
                >
                  移除
                </button>
              ) : null}
            </div>
          );
        }) : (
          <div className="rounded-xl border border-dashed border-[#e7b45f]/14 bg-black/20 p-3 text-[11px] leading-5 text-[#9e927c]">
            暂无可用图片。
          </div>
        )}
      </div>
    </div>
  );
}

function StyleTemplatePicker({
  templates,
  selectedTemplateId,
  onSelect,
  onClear,
}: {
  templates: StyleTemplate[];
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
  onClear: () => void;
}) {
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs leading-5 text-[#8f846f]">角色生图只显示角色模板。场景模板会留给后续场景和关键帧背景，不参与角色定稿或四视图。</p>
          {selectedTemplate ? (
            <div className="mt-2 text-[11px] text-stage-100">当前绑定：<span className="font-semibold text-[#fff5df]">{selectedTemplate.name}</span></div>
          ) : null}
        </div>
        <a href="/style-templates" className="shrink-0 rounded-full border border-stage-300/25 bg-stage-400/[0.08] px-3 py-1.5 text-[11px] text-stage-100 transition hover:bg-stage-400/[0.16]">
          管理模板库
        </a>
      </div>

      {selectedTemplate ? (
        <div className="rounded-xl border border-stage-300/25 bg-stage-400/[0.08] p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#fff5df]">已选择模板</div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#bfb196]">{selectedTemplate.visual_summary || "暂无风格摘要。"}</p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 rounded-full border border-[#5a4527] bg-[#0a0b08] px-2.5 py-1 text-[10px] text-[#e9dcc4] transition hover:border-[#d5a753]"
            >
              清除
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-teal-300/25 bg-[#0e1914] p-3 text-xs leading-5 text-[#8f846f]">
          未绑定模板时会使用当前项目默认漫剧风格。建议选择已识别模板，减少风格抽卡。
        </div>
      )}

      <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
        {templates.length > 0 ? templates.map((template) => {
          const selected = template.id === selectedTemplateId;
          const analyzed = template.analysis_status === "analyzed";

          return (
            <article key={template.id} className={`overflow-hidden rounded-2xl border transition ${selected ? "border-[#d5a753] bg-[#2b2414] shadow-[0_0_0_1px_rgba(213,167,83,0.22)]" : "border-[#332a1c] bg-[#11140e] hover:border-[#7d5b2a]"}`}>
              <div className="grid grid-cols-[96px_minmax(0,1fr)]">
                {template.source_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={template.source_image_url} alt={template.name} className="h-full min-h-[136px] w-24 object-cover" />
                ) : (
                  <div className="flex h-full min-h-[136px] w-24 items-center justify-center bg-[radial-gradient(circle_at_50%_15%,rgba(231,180,95,0.22),transparent_44%),#0a0d09] text-[10px] uppercase tracking-[0.16em] text-[#6f624b]">
                    No Cover
                  </div>
                )}
                <div className="min-w-0 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-sm font-semibold text-[#fff5df]">{template.name}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${analyzed ? "border-teal-300/25 text-teal-100" : "border-clay-300/25 text-[#ffd7c3]"}`}>
                          识别：{template.analysis_status || "unknown"}
                        </span>
                        {template.style_category ? (
                          <span className="rounded-full border border-[#47371f] px-2 py-0.5 text-[10px] text-[#8f846f]">{template.style_category}</span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => selected ? onClear() : onSelect(template.id)}
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] transition ${selected ? "border-[#d5a753] bg-[#2a2112] text-[#d9ba73]" : "border-stage-300/25 bg-stage-400/[0.08] text-stage-100 hover:bg-stage-400/[0.16]"}`}
                    >
                      {selected ? "已选择" : "选择"}
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-[#9e927c]">{template.visual_summary || "暂无风格摘要。"}</p>
                  {selected ? (
                    <div className="mt-3 grid gap-2">
                      <MiniStyleField label="色彩" value={template.color_palette} />
                      <MiniStyleField label="光影" value={template.lighting_style} />
                      <MiniStyleField label="线条" value={template.line_style} />
                      <MiniStyleField label="人物" value={template.character_rendering} />
                    </div>
                  ) : null}
                  {!analyzed ? (
                    <p className="mt-2 text-[10px] leading-4 text-[#ffd7c3]">未完成 AI 识别，可以选择但不建议作为正式生成模板。</p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="rounded-xl border border-dashed border-[#e7b45f]/14 bg-black/20 p-4 text-xs leading-5 text-[#9e927c]">
            暂无角色模板。可以先继续生成，也可以从右上角进入模板库补充角色模板。
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStyleField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e7b45f]/10 bg-black/20 px-3 py-2">
      <div className="text-[10px] text-[#8f846f]">{label}</div>
      <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#d8ccb3]">{value || "未识别"}</div>
    </div>
  );
}

function buildAssembledPromptPreview({
  generationLabel,
  generationType,
  prompt,
  negativePrompt,
  styleTemplate,
  selectedAssetCount,
}: {
  generationLabel: string;
  generationType: string;
  prompt: string;
  negativePrompt: string;
  styleTemplate: StyleTemplate | null;
  selectedAssetCount: number;
}) {
  if (generationType === "four_view") {
    return [
      `任务：${generationLabel}`,
      `参考图：已选择 ${selectedAssetCount} 张，任务会写入 input_snapshot_json。`,
      "Prompt 模式：已确认四视图最终 Prompt；发起生图时后端会追加参考图配色保真契约，锁定服装、道具、头饰和脸谱的颜色来源。",
      prompt || "请先生成或填写四视图最终 Prompt。",
      `负面约束：${negativePrompt || "未填写"}`,
      "输出要求：生成结果先作为候选角色生成资产，不直接覆盖人工参考图库。",
    ].join("\n");
  }

  if (generationType === "character_lookdev") {
    return [
      `任务：${generationLabel}`,
      `参考图：已选择 ${selectedAssetCount} 张，任务会写入 input_snapshot_json。`,
      "Prompt 模式：已确认角色定稿最终 Prompt；发起生图时后端会追加参考图保真契约，锁定脸谱、服装、道具、头饰和体态来源。",
      prompt || "请先生成或填写角色定稿最终 Prompt。",
      `负面约束：${negativePrompt || "未填写"}`,
      "输出要求：生成结果先作为候选角色生成资产；满意后可手动纳入参考图库，再用于四视图生成。",
    ].join("\n");
  }

  const styleLines = styleTemplate
    ? [
        `角色模板：${styleTemplate.name}`,
        `识别状态：${styleTemplate.analysis_status}`,
        `视觉摘要：${styleTemplate.visual_summary || "未识别"}`,
        `线条特征：${styleTemplate.line_style || "未识别"}`,
        `色彩倾向：${styleTemplate.color_palette || "未识别"}`,
        `光影特征：${styleTemplate.lighting_style || "未识别"}`,
        `构图倾向：${styleTemplate.composition_style || "未识别"}`,
        `人物表现：${styleTemplate.character_rendering || "未识别"}`,
        `背景处理：${styleTemplate.background_rendering || "未识别"}`,
        `生图模板：${styleTemplate.image_prompt_template || "未识别"}`,
        `负面约束：${styleTemplate.negative_prompt || "未识别"}`,
      ]
    : ["角色模板：未绑定，使用当前项目默认漫剧风格。"];

  return [
    `任务：${generationLabel}`,
    "说明：以下是任务上下文摘要，不是最终送模 Prompt。",
    "后端创建 GenerateTask 时会追加角色一致性、参考图服装色彩保真、角色模板规则、任务目标和负面约束。",
    `参考图：已选择 ${selectedAssetCount} 张，任务会写入 input_snapshot_json。`,
    ...styleLines,
    `角色定稿 Prompt：${prompt || "保持角色脸谱、服饰、武器和英歌气质一致。"}`,
    "输出要求：生成结果先作为候选角色生成资产，不直接覆盖人工参考图库。",
  ].join("\n");
}

function getRecommendedReferenceAssetIds(assets: CharacterReferenceAsset[], generationType: string) {
  const facepaint = assets.filter((asset) => asset.reference_type?.startsWith("facepaint")).slice(0, 1);
  const realPhotoTypes = ["full_body_front_photo", "half_side_photo_1", "half_side_photo_2", "back_photo"];
  const realPhotos = realPhotoTypes
    .map((type) => assets.find((asset) => asset.reference_type === type))
    .filter((asset): asset is CharacterReferenceAsset => Boolean(asset));
  if (generationType === "character_lookdev") {
    const front = realPhotos.find((asset) => asset.reference_type === "full_body_front_photo") ?? realPhotos[0];
    return [...facepaint, ...(front ? [front] : [])].map((asset) => asset.id);
  }
  return [...facepaint, ...realPhotos].map((asset) => asset.id);
}

function buildGenerationPreflightIssues({
  generationType,
  liveReferenceAssets,
  selectedAssetIds,
  selectedStyleTemplate,
}: {
  generationType: string;
  liveReferenceAssets: CharacterReferenceAsset[];
  selectedAssetIds: string[];
  selectedStyleTemplate: StyleTemplate | null;
}) {
  const selectedAssets = liveReferenceAssets.filter((asset) => selectedAssetIds.includes(asset.id));
  const issues: string[] = [];
  if (!selectedAssets.some((asset) => asset.reference_type?.startsWith("facepaint"))) {
    issues.push("建议选择脸谱参考图，否则脸谱纹样容易漂移。");
  }
  if (generationType === "character_lookdev" && !selectedAssets.some((asset) => ["full_body_front_photo", "half_side_photo_1", "half_side_photo_2", "back_photo", "character_final_reference"].includes(asset.reference_type || ""))) {
    issues.push("角色定稿至少需要选择一张真人妆照、角色事实参考图或已纳入的定稿参考图。");
  }
  if (generationType === "four_view") {
    const required = ["full_body_front_photo", "half_side_photo_1", "half_side_photo_2", "back_photo"];
    const missing = required.filter((type) => !selectedAssets.some((asset) => asset.reference_type === type));
    if (missing.length > 0) {
      issues.push(`四视图建议补齐真人四面图，当前缺少 ${missing.length} 个角度。`);
    }
  }
  if (!selectedStyleTemplate) {
    issues.push("建议绑定已识别的角色模板，避免风格抽卡。");
  } else if (selectedStyleTemplate.analysis_status !== "analyzed") {
    issues.push("当前角色模板还未 AI 识别，建议先识别后再生成。");
  }
  return issues;
}

function referenceTypeLabel(referenceType: string | null) {
  const labels: Record<string, string> = {
    facepaint: "脸谱",
    facepaint_reference: "脸谱",
    full_body_front_photo: "真人全身正面",
    half_side_photo_1: "真人半侧身（1）",
    half_side_photo_2: "真人半侧身（2）",
    back_photo: "真人背后",
    character_final_reference: "角色定稿参考",
    generated_asset: "生成资产",
  };
  return labels[referenceType || ""] || referenceType || "参考图";
}

function isTerminalGenerationTask(task: GenerateTask) {
  return ["completed", "mock_completed", "failed", "cancelled"].includes(task.status);
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function CompactTaskProgress({
  task,
  retrying,
  cancelling,
  onRetry,
  onCancel,
}: {
  task: GenerateTask;
  retrying: boolean;
  cancelling: boolean;
  onRetry: () => void;
  onCancel: () => void;
}) {
  const failed = task.status === "failed";
  const cancelled = task.status === "cancelled";
  const completed = task.status === "mock_completed" || task.status === "completed";
  const cancellable = ["queued", "pending", "running"].includes(task.status);
  const progress = Math.max(0, Math.min(100, task.progress || 0));
  const statusLabel = cancelled ? "已终止" : failed ? "失败" : completed ? "完成" : task.status;

  return (
    <div className={`rounded-xl border p-3 ${failed || cancelled ? "border-clay-300/25 bg-clay-500/[0.1]" : "border-stage-300/20 bg-stage-400/[0.08]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${failed || cancelled ? "border-clay-300/25 text-[#ffd7c3]" : "border-stage-300/20 text-stage-100"}`}>
              status: {statusLabel}
            </span>
            <span className="rounded-full border border-[#47371f] px-2 py-0.5 text-[10px] text-[#8f846f]">progress: {progress}%</span>
          </div>
          <div className="mt-2 line-clamp-1 text-xs font-medium text-[#fff5df]">current_step: {task.current_step || "等待调度"}</div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {cancellable ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="rounded-full border border-[#8f3f32] bg-[#2a1210] px-2.5 py-1 text-[10px] text-[#f0a89a] transition hover:border-[#f0a89a] disabled:opacity-50"
            >
              {cancelling ? "终止中" : "强制终止"}
            </button>
          ) : null}
          {failed || cancelled ? (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="rounded-full border border-[#856027] bg-[#2a2112] px-2.5 py-1 text-[10px] text-[#d9ba73] transition hover:border-[#d5a753] disabled:opacity-50"
            >
              {retrying ? "重试中" : "重试"}
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
        <div className={`h-full ${failed || cancelled ? "bg-[#b96950]" : completed ? "bg-teal-300" : "bg-stage-300"}`} style={{ width: `${progress}%` }} />
      </div>
      {task.error_message ? (
        <p className="mt-2 rounded-lg border border-clay-300/15 bg-black/20 px-2.5 py-2 text-[11px] leading-5 text-[#ffd7c3]">{task.error_message}</p>
      ) : null}
    </div>
  );
}

function ActiveGenerationProgress({ task, creating, retrying, cancelling }: { task: GenerateTask | null; creating: boolean; retrying: boolean; cancelling: boolean }) {
  const [optimisticProgress, setOptimisticProgress] = useState(8);

  useEffect(() => {
    if (!creating && !retrying && !cancelling) {
      setOptimisticProgress(8);
      return;
    }
    const timer = window.setInterval(() => {
      setOptimisticProgress((current) => Math.min(current + (current < 48 ? 7 : current < 78 ? 3 : 1), 92));
    }, 520);
    return () => window.clearInterval(timer);
  }, [creating, retrying, cancelling]);

  const active = creating || retrying || cancelling;
  const failed = task?.status === "failed";
  const cancelled = task?.status === "cancelled";
  const completed = task?.status === "completed" || task?.status === "mock_completed";
  const running = Boolean(task && !failed && !cancelled && !completed);
  const progress = active ? optimisticProgress : Math.max(0, Math.min(100, task?.progress || 0));
  const title = active
    ? cancelling ? "正在终止生成任务" : retrying ? "正在创建重试任务" : "正在创建生成任务"
    : cancelled ? "最近任务已终止"
    : failed ? "最近任务失败"
    : completed ? "最近任务已完成"
    : running ? "后台任务执行中"
    : "等待发起生成任务";
  const subtitle = active
    ? cancelling ? "正在把任务标记为 cancelled，模型返回后不会保存候选资产。" : "正在创建 GenerateTask，创建成功后会立即进入后台队列。"
    : task
      ? `${task.model_name} · ${task.current_step || "等待调度"}`
      : "选择参考图和角色模板后，点击发起生成。";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${
      failed || cancelled
        ? "border-clay-300/25 bg-clay-500/[0.1]"
        : active
          ? "border-stage-300/30 bg-stage-400/[0.1] shadow-stage-glow"
          : running
            ? "border-stage-300/25 bg-stage-400/[0.08]"
          : "border-[#332a1c] bg-black/18"
    }`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#fff5df]">{title}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${
              failed || cancelled ? "border-clay-300/25 text-[#ffd7c3]" : active || running ? "border-stage-300/25 text-stage-100" : "border-[#47371f] text-[#8f846f]"
            }`}>
              {active ? "running" : task?.status || "idle"}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-[#9e927c]">{subtitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-semibold text-[#fff5df]">{progress}%</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">progress</div>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/45">
        <div
          className={`h-full transition-all duration-500 ${failed || cancelled ? "bg-[#b96950]" : completed ? "bg-teal-300" : "bg-stage-300"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {active || running ? (
        <div className="mt-2 grid grid-cols-4 gap-2 text-[10px] text-[#8f846f]">
          {["组装 Prompt", "读取参考图", "调用模型", "保存候选资产"].map((step, index) => (
            <span key={step} className={progress >= [12, 38, 62, 84][index] ? "text-stage-100" : ""}>{step}</span>
          ))}
        </div>
      ) : null}
      {!active && task?.error_message ? (
        <p className="mt-2 rounded-lg border border-clay-300/15 bg-black/20 px-2.5 py-2 text-[11px] leading-5 text-[#ffd7c3]">{task.error_message}</p>
      ) : null}
    </div>
  );
}

function GenerationTaskCard({
  task,
  retrying,
  cancelling,
  onRetry,
  onCancel,
}: {
  task: GenerateTask;
  retrying: boolean;
  cancelling: boolean;
  onRetry: () => void;
  onCancel: () => void;
}) {
  const failed = task.status === "failed";
  const cancelled = task.status === "cancelled";
  const completed = task.status === "mock_completed" || task.status === "completed";
  const cancellable = ["queued", "pending", "running"].includes(task.status);
  const generationLabel = task.generation_type === "four_view" ? "四视图" : task.generation_type === "character_lookdev" ? "角色定稿" : task.generation_type || "生成任务";
  const statusLabel = cancelled ? "已终止" : failed ? "失败" : completed ? "完成" : task.status;

  return (
    <article className={`rounded-xl border p-3 ${failed || cancelled ? "border-clay-300/25 bg-clay-500/[0.1]" : "border-[#332a1c] bg-[#0a0d09]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#fff5df]">{generationLabel}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${failed || cancelled ? "border-clay-300/25 text-[#ffd7c3]" : "border-stage-300/20 text-stage-100"}`}>
              {statusLabel}
            </span>
            {task.retry_of_task_id ? (
              <span className="rounded-full border border-[#47371f] px-2 py-0.5 text-[10px] text-[#8f846f]">重试任务</span>
            ) : null}
          </div>
          <div className="mt-1 line-clamp-1 text-[10px] text-[#8f846f]">{task.model_name} · {task.current_step} · {task.progress}%</div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {cancellable ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="rounded-full border border-[#8f3f32] bg-[#2a1210] px-2.5 py-1 text-[10px] text-[#f0a89a] transition hover:border-[#f0a89a] disabled:opacity-50"
            >
              {cancelling ? "终止中" : "强制终止"}
            </button>
          ) : null}
          {failed || cancelled ? (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="rounded-full border border-[#856027] bg-[#2a2112] px-2.5 py-1 text-[10px] text-[#d9ba73] transition hover:border-[#d5a753] disabled:opacity-50"
            >
              {retrying ? "重试中" : "重试"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
        <div className={`h-full ${failed || cancelled ? "bg-[#b96950]" : "bg-stage-300"}`} style={{ width: `${Math.max(0, Math.min(100, task.progress || 0))}%` }} />
      </div>

      {task.error_message ? <p className="mt-2 text-[11px] leading-5 text-[#ffd7c3]">{task.error_message}</p> : null}
      <div className="mt-2 grid gap-2 text-[10px] text-[#8f846f]">
        <div className="line-clamp-2">Prompt：{task.prompt_text || task.input_prompt || "未记录"}</div>
        <div>参考图：{task.input_asset_ids.length} 张 · 输出：{task.output_asset_ids.length} 个</div>
      </div>
    </article>
  );
}

function groupGenerationTypes() {
  return generationTypes.reduce<Record<string, typeof generationTypes[number][]>>((groups, item) => {
    groups[item.group] = groups[item.group] ?? [];
    groups[item.group].push(item);
    return groups;
  }, {});
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#8f846f]">{label}</div>
      {children}
    </label>
  );
}

function PromptBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="mb-3 rounded-xl border border-[#e7b45f]/10 bg-black/22 p-3 last:mb-0">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8f846f]">{label}</div>
      <p className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#d8ccb3]">{value || "未设置"}</p>
    </div>
  );
}
