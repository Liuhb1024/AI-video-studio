export type MockCost = {
  id: string;
  label: string;
  apiType: "text" | "image" | "video" | "tts" | "agent" | "export";
  model: string;
  amount: number;
  percent: number;
};

export const costs: MockCost[] = [
  { id: "cost-video", label: "生视频", apiType: "video", model: "Seedance 2.0", amount: 68.4, percent: 53 },
  { id: "cost-image", label: "生图", apiType: "image", model: "gpt-image-2 / nano banana", amount: 31.2, percent: 24 },
  { id: "cost-tts", label: "TTS", apiType: "tts", model: "MiniMax TTS", amount: 12.8, percent: 10 },
  { id: "cost-agent", label: "Agent", apiType: "agent", model: "ScriptAgent / CriticAgent", amount: 9.6, percent: 8 },
  { id: "cost-text", label: "文本", apiType: "text", model: "多模型配置", amount: 6.4, percent: 5 },
];

export const costSummary = {
  today: 12.8,
  month: 128.4,
  nextEstimated: 3.2,
  budgetUsedPercent: 32,
};
