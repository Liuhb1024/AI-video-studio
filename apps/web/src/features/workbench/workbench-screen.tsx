import { ModuleScreen } from "@/components/layout/module-screen";

export function WorkbenchScreen() {
  return (
    <ModuleScreen
      eyebrow="工作台"
      title="制作总控桌"
      description="把项目、剧本、镜头、角色、生成和成片串联在同一个工作面板里，方便制片和导演快速切换上下文。"
      stats={[
        { label: "待办聚合", value: "18", hint: "同步来自项目、剧本和素材库的待处理事项。" },
        { label: "高优先级", value: "06", hint: "对生产节奏影响最大的事项会在这里优先显示。" },
        { label: "协作成员", value: "09", hint: "编剧、分镜、生成和剪辑角色均可接入。" },
      ]}
      workflowTitle="工作台流程"
      workflowSteps={[
        "先看整体状态，找到当前最阻塞生产节奏的事项。",
        "打开对应模块，补齐镜头、角色或素材信息。",
        "把确认后的内容推回生成队列或成片交付链路。",
      ]}
      insights={[
        {
          title: "快速进入制作上下文",
          description: "工作台承担“今天先做什么”的入口，便于导演和制片一键跳转到目标模块。",
          tone: "warm",
        },
        {
          title: "统一待办源",
          description: "项目、剧本、分镜和素材的待办应在这里统一汇总，避免团队来回跳页面。",
          tone: "cool",
        },
      ]}
    />
  );
}
