import type { FailureReasonCode } from "./failureReasons";

export type AssetStatus = "candidate" | "accepted" | "rejected";

export type MockImageAsset = {
  id: string;
  shotId: string;
  panelId: string;
  promptId: string;
  model: string;
  status: AssetStatus;
  thumbnail: string;
  cost: number;
  consistencyScore: number;
  failureReasons: FailureReasonCode[];
  createdAt: string;
};

export const imageAssets: MockImageAsset[] = [
  { id: "img-02-a-01", shotId: "shot-02", panelId: "panel-02-a", promptId: "prompt-img-01", model: "gpt-image-2", status: "accepted", thumbnail: "正红脸谱首帧", cost: 0.86, consistencyScore: 94, failureReasons: [], createdAt: "2026-05-18 21:21" },
  { id: "img-02-a-02", shotId: "shot-02", panelId: "panel-02-a", promptId: "prompt-img-01", model: "nano banana", status: "candidate", thumbnail: "虎影烟尘候选", cost: 0.42, consistencyScore: 87, failureReasons: [], createdAt: "2026-05-18 21:25" },
  { id: "img-03-a-01", shotId: "shot-03", panelId: "panel-03-a", promptId: "prompt-img-01", model: "gpt-image-2", status: "rejected", thumbnail: "酒楼街面失败", cost: 0.82, consistencyScore: 61, failureReasons: ["face_pattern_wrong", "style_drift"], createdAt: "2026-05-18 20:49" },
  { id: "img-05-a-01", shotId: "shot-05", panelId: "panel-05-a", promptId: "prompt-img-01", model: "gpt-image-2", status: "accepted", thumbnail: "额心朱砂特写", cost: 0.91, consistencyScore: 96, failureReasons: [], createdAt: "2026-05-18 22:08" },
  { id: "img-06-a-01", shotId: "shot-06", panelId: "panel-06-a", promptId: "prompt-img-01", model: "nano banana", status: "candidate", thumbnail: "鼓阵落印候选", cost: 0.38, consistencyScore: 82, failureReasons: [], createdAt: "2026-05-18 22:17" },
];
