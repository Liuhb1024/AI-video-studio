import { ModuleScreen } from "@/components/layout/module-screen";

export function GenerationScreen() {
  return (
    <ModuleScreen
      eyebrow="生成"
      title="图像、视频与音频生成中心"
      description="将剧本、分镜、角色设定和参考素材转成可执行生成任务，统一排队、结果回收和版本追踪。"
      stats={[
        { label: "生成队列", value: "07", hint: "当前有 7 个任务等待或正在处理。" },
        { label: "成功率", value: "91%", hint: "最近一次批次生成的可用结果占比。" },
        { label: "回收素材", value: "23", hint: "生成结果已自动沉淀到素材库的数量。" },
      ]}
      workflowTitle="生成链路"
      workflowSteps={[
        "从镜头或角色页发起任务，带上约束、参考图和输出规格。",
        "任务完成后回收结果，绑定回原始镜头或项目。",
        "对不合格结果进行重试、变体生成或人工修正。",
      ]}
      insights={[
        {
          title: "任务编排优先于按钮",
          description: "后续生成页重点应放在批量任务、队列状态和结果追踪，而不是单次点击生成。",
          tone: "cool",
        },
        {
          title: "统一回收",
          description: "所有生成结果都应自动落回素材库，并保留来源和参数。",
        },
      ]}
    />
  );
}
