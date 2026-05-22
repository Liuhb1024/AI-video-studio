export type MockTaskType = "image" | "video" | "tts" | "agent" | "export";
export type MockTaskStatus = "queued" | "processing" | "completed" | "failed";

export type MockTask = {
  id: string;
  type: MockTaskType;
  provider: string;
  model: string;
  status: MockTaskStatus;
  projectId: string;
  shotId: string;
  panelId: string;
  cost: number;
  startedAt: string;
  finishedAt?: string;
  failureReason?: string;
  title: string;
};

export const tasks: MockTask[] = [
  {
    id: "task-001",
    type: "video",
    provider: "Seedance",
    model: "Seedance 2.0",
    status: "processing",
    projectId: "project-wusong-hero",
    shotId: "shot-05",
    panelId: "panel-05-a",
    cost: 32.8,
    startedAt: "14:22",
    title: "武松醉打蒋门神 · 第 5 镜",
  },
  {
    id: "task-002",
    type: "image",
    provider: "OpenAI",
    model: "gpt-image-2",
    status: "completed",
    projectId: "project-linchong-night",
    shotId: "shot-02",
    panelId: "panel-02-a",
    cost: 8.6,
    startedAt: "13:48",
    finishedAt: "13:50",
    title: "林冲夜奔 · 场景概念图",
  },
  {
    id: "task-003",
    type: "tts",
    provider: "MiniMax",
    model: "MiniMax TTS",
    status: "completed",
    projectId: "project-luzhishen-willow",
    shotId: "shot-01",
    panelId: "panel-01-a",
    cost: 2.4,
    startedAt: "12:31",
    finishedAt: "12:32",
    title: "鲁智深 · 旁白合成",
  },
  {
    id: "task-004",
    type: "video",
    provider: "Seedance",
    model: "Seedance 2.0",
    status: "failed",
    projectId: "project-yangzhi-blade",
    shotId: "shot-03",
    panelId: "panel-03-b",
    cost: 18.2,
    startedAt: "11:05",
    finishedAt: "11:08",
    failureReason: "角色脸谱偏离，武器形态错误",
    title: "杨志押纲 · 第 3 镜重试",
  },
  {
    id: "task-005",
    type: "agent",
    provider: "Internal",
    model: "CriticAgent",
    status: "queued",
    projectId: "project-wusong-hero",
    shotId: "shot-06",
    panelId: "panel-06-a",
    cost: 0.6,
    startedAt: "待执行",
    title: "武松项目 · 一致性复核",
  },
];
