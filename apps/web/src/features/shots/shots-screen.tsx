import { ModuleScreen } from "@/components/layout/module-screen";

export function ShotsScreen() {
  return (
    <ModuleScreen
      eyebrow="分镜"
      title="镜头拆解与画面排布"
      description="把剧本转成镜头单位，记录景别、构图、时长、动作和素材需求，是生成和剪辑的关键中间层。"
      stats={[
        { label: "镜头总数", value: "126", hint: "包含主线镜头、特写和补充镜头。" },
        { label: "待绘制", value: "21", hint: "这些镜头需要进一步确认构图或参考素材。" },
        { label: "可生成", value: "74", hint: "已补足信息，可以进入批量生成。" },
      ]}
      workflowTitle="分镜链路"
      workflowSteps={[
        "先根据剧本切分镜头，再定义节奏、机位和动作。",
        "为每个镜头挂上角色、道具和环境约束。",
        "确认后进入生成队列，形成可执行的制作单元。",
      ]}
      insights={[
        {
          title: "镜头是生成的最小单元",
          description: "后续可以把每个镜头连接到图像提示词、视频任务和素材版本。",
          tone: "cool",
        },
        {
          title: "适合做卡片式编排",
          description: "分镜页后续可扩展成列表、网格或时间线三种布局。",
        },
      ]}
    />
  );
}
