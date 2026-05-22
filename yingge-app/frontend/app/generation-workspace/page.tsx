import { ConsistencyInspector } from "@/components/generation/ConsistencyInspector";
import { GenerationPipelineSummary } from "@/components/generation/GenerationPipelineSummary";
import { ImageGenerationPanel } from "@/components/generation/ImageGenerationPanel";
import { PromptEditor } from "@/components/generation/PromptEditor";
import { ShotList } from "@/components/generation/ShotList";
import { TTSGenerationPanel } from "@/components/generation/TTSGenerationPanel";
import { VideoGenerationPanel } from "@/components/generation/VideoGenerationPanel";
import { AppShell } from "@/components/layout/AppShell";

export default function GenerationWorkspacePage() {
  return (
    <AppShell
      title="提示词与生成工作台"
      eyebrow="Prompt & Generation Workspace"
      subtitle="为分镜生成图片 Prompt、视频 Prompt、TTS，并管理生图、生视频和音频生成任务。"
      inspectorType="consistency"
      inspectorTitle="一致性检查"
      inspectorDescription="角色、场景、英歌动作、Prompt 来源和失败原因复盘。"
      currentStage="生成工作台"
      modelStatus="warning"
      rightInspector={<ConsistencyInspector />}
    >
      <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-5">
        <ShotList />
        <div className="min-w-0 space-y-4">
          <GenerationPipelineSummary />
          <PromptEditor />
          <ImageGenerationPanel />
          <VideoGenerationPanel />
          <TTSGenerationPanel />
        </div>
      </div>
    </AppShell>
  );
}
