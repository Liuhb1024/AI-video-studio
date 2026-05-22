export type MockAgentRun = {
  agentName: string;
  status: "completed" | "reviewing" | "processing" | "idle" | "warning";
  lastRunAt: string;
  relatedProject: string;
  summary: string;
};

export const agentRuns: MockAgentRun[] = [
  {
    agentName: "ScriptAgent",
    status: "completed",
    lastRunAt: "14:08",
    relatedProject: "武松醉打蒋门神",
    summary: "已生成 48 秒人物介绍文案，情绪节奏通过。",
  },
  {
    agentName: "StoryboardAgent",
    status: "reviewing",
    lastRunAt: "13:56",
    relatedProject: "林冲夜奔雪夜",
    summary: "分镜数量符合 6 镜，雪夜场景需要补充环境一致性。",
  },
  {
    agentName: "CriticAgent",
    status: "warning",
    lastRunAt: "11:12",
    relatedProject: "杨志青面兽押纲",
    summary: "检测到脸谱主色与武器描述偏离，需要加入禁止提示词。",
  },
  {
    agentName: "ProductionAgent",
    status: "idle",
    lastRunAt: "10:40",
    relatedProject: "李逵沂岭杀四虎",
    summary: "成片方案已准备，可进入人工剪辑。",
  },
];
