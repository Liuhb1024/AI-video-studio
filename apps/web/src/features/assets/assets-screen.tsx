import { ModuleScreen } from "@/components/layout/module-screen";

export function AssetsScreen() {
  return (
    <ModuleScreen
      eyebrow="素材库"
      title="素材沉淀与版本归档"
      description="管理原始素材、参考图、生成结果和导出文件，让资产可以被检索、追溯和复用。"
      stats={[
        { label: "素材总量", value: "1.2k", hint: "包含原始素材、生成结果和交付文件。" },
        { label: "待归档", value: "19", hint: "尚未补齐标签或来源关系的素材。" },
        { label: "可复用", value: "73%", hint: "已关联到项目或角色的高价值素材占比。" },
      ]}
      workflowTitle="素材链路"
      workflowSteps={[
        "导入素材时必须记录来源、归属项目和版本。",
        "生成结果自动回收并打标签，方便后续复用。",
        "成片导出后将交付包同步归档，留存最终版本。",
      ]}
      insights={[
        {
          title: "资料追溯",
          description: "素材库要解决的不是只存文件，而是让每个素材都能追到来源和使用范围。",
          tone: "warm",
        },
        {
          title: "与生成联动",
          description: "生成结果、参考图和剪辑输出都应该统一在这里闭环。",
        },
      ]}
    />
  );
}
