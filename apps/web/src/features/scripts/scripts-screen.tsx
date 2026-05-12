import { ModuleScreen } from "@/components/layout/module-screen";

export function ScriptsScreen() {
  return (
    <ModuleScreen
      eyebrow="剧本"
      title="剧本与对白管理"
      description="承接大纲、场景、对白与版本历史，保证剧本内容可以被分镜、角色和生成模块稳定引用。"
      stats={[
        { label: "版本数", value: "05", hint: "保留关键修改节点，方便回看与对比。" },
        { label: "待审片段", value: "11", hint: "分布在 4 个场景和 2 个角色对白段。" },
        { label: "已锁定", value: "68%", hint: "已经进入分镜或生成环节的文本占比。" },
      ]}
      workflowTitle="剧本流转"
      workflowSteps={[
        "先确定故事结构，再拆成场景和镜头可执行的文本单元。",
        "对白修改后同步角色卡，避免口吻与设定冲突。",
        "定稿版本推送到分镜与生成模块作为上游基准。",
      ]}
      insights={[
        {
          title: "版本控制是关键",
          description: "剧本页后续应支持版本对比、批注、回溯和关键段落引用。",
          tone: "warm",
        },
        {
          title: "面向生产的文本结构",
          description: "不是只看阅读体验，而是要让每一段文本都能映射到制作任务。",
        },
      ]}
    />
  );
}
