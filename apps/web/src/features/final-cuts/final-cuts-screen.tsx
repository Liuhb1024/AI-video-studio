import { ModuleScreen } from "@/components/layout/module-screen";

export function FinalCutsScreen() {
  return (
    <ModuleScreen
      eyebrow="成片"
      title="粗剪、精剪与交付包"
      description="管理最终剪辑阶段的版本、导出和交付状态，把作品从生产状态切换到发布状态。"
      stats={[
        { label: "待导出", value: "04", hint: "四个交付包等待最终检查。" },
        { label: "剪辑版本", value: "09", hint: "保留粗剪、精剪和对比版本。" },
        { label: "已交付", value: "15", hint: "本月已完成的正式交付数量。" },
      ]}
      workflowTitle="成片链路"
      workflowSteps={[
        "先锁定最终剪辑版本，再执行导出规范校验。",
        "导出完成后回收文件并写入交付记录。",
        "交付后保留可追溯的素材和参数快照。",
      ]}
      insights={[
        {
          title: "交付前最后一道门",
          description: "这里会承接剪辑规范、字幕、封面、格式和分发信息的检查。",
          tone: "cool",
        },
        {
          title: "版本留痕",
          description: "每一次导出都应该能快速回查到对应项目和镜头范围。",
        },
      ]}
    />
  );
}
