export type MockSkill = {
  id: string;
  name: string;
  type: "script" | "storyboard" | "critic" | "production";
  agent: string;
  status: "启用" | "建议" | "预留";
  description: string;
};

export const skills: MockSkill[] = [
  { id: "skill-script", name: "人物介绍文案", type: "script", agent: "ScriptAgent", status: "启用", description: "基于角色圣经生成 30-60 秒人物旁白。" },
  { id: "skill-shot", name: "5-8 镜拆分", type: "storyboard", agent: "StoryboardAgent", status: "启用", description: "将文案拆为 Shot，并估算每镜时长。" },
  { id: "skill-consistency", name: "角色一致性检查", type: "critic", agent: "CriticAgent", status: "启用", description: "检查脸谱、武器、主色、禁止词是否偏离。" },
  { id: "skill-production", name: "生成工作台衔接", type: "production", agent: "ProductionAgent", status: "预留", description: "把 Shot / Panel 转入 Prompt 与生成任务。" },
];
