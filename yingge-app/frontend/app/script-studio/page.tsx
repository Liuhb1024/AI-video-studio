import { AgentInspector } from "@/components/script/AgentInspector";
import { ProductionStepRail } from "@/components/script/ProductionStepRail";
import { ScriptAnalysisPanel } from "@/components/script/ScriptAnalysisPanel";
import { ScriptEditor } from "@/components/script/ScriptEditor";
import { StoryboardTimeline } from "@/components/script/StoryboardTimeline";
import { AppShell } from "@/components/layout/AppShell";
import { currentScript } from "@/data/mock/scripts";

export default function ScriptStudioPage() {
  return (
    <AppShell
      title="剧本分镜工作台"
      eyebrow="Script & Storyboard Studio"
      subtitle="基于角色圣经生成或导入 30-60 秒人物介绍文案，并拆分为可进入 Prompt 与生成工作台的 Shot / Panel。"
      inspectorType="agent"
      inspectorTitle="Agent 运行"
      inspectorDescription="ScriptAgent、StoryboardAgent、CriticAgent 的静态运行轨迹与建议。"
      currentStage="剧本分镜"
      rightInspector={<AgentInspector />}
    >
      <div className="grid grid-cols-[200px_minmax(0,1fr)] gap-5">
        <ProductionStepRail />
        <div className="min-w-0 space-y-5">
          <ScriptEditor script={currentScript} />
          <ScriptAnalysisPanel script={currentScript} />
          <StoryboardTimeline />
        </div>
      </div>
    </AppShell>
  );
}
