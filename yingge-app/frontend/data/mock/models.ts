export type MockModelHealth = "healthy" | "warning" | "error" | "idle";

export type MockModel = {
  provider: string;
  modelName: string;
  capabilities: string[];
  health: MockModelHealth;
  costHint: string;
  supportedModes: string[];
};

export const models: MockModel[] = [
  {
    provider: "OpenAI",
    modelName: "gpt-image-2",
    capabilities: ["生图", "参考图", "角色定妆"],
    health: "healthy",
    costHint: "单张约 ¥0.80 起",
    supportedModes: ["文生图", "参考图生成"],
  },
  {
    provider: "Nano Banana",
    modelName: "nano banana",
    capabilities: ["生图", "风格探索", "候选抽卡"],
    health: "healthy",
    costHint: "适合低成本候选",
    supportedModes: ["文生图", "多候选"],
  },
  {
    provider: "Seedance",
    modelName: "Seedance 2.0",
    capabilities: ["生视频", "首帧", "首尾帧"],
    health: "warning",
    costHint: "单镜约 ¥18-36",
    supportedModes: ["图生视频", "首帧生视频", "首尾帧"],
  },
  {
    provider: "MiniMax",
    modelName: "MiniMax TTS",
    capabilities: ["TTS", "旁白", "角色对白"],
    health: "healthy",
    costHint: "按字符计费",
    supportedModes: ["旁白合成", "对白合成"],
  },
];
