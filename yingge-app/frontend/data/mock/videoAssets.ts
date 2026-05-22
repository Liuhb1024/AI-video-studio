import type { FailureReasonCode } from "./failureReasons";
import type { AssetStatus } from "./imageAssets";

export type MockVideoAsset = {
  id: string;
  shotId: string;
  panelId: string;
  promptId: string;
  model: string;
  mode: string;
  status: AssetStatus;
  duration: string;
  aspectRatio: string;
  resolution: string;
  thumbnail: string;
  cost: number;
  motionStrength: number;
  consistencyScore: number;
  failureReasons: FailureReasonCode[];
  createdAt: string;
};

export const videoAssets: MockVideoAsset[] = [
  { id: "vid-02-a-01", shotId: "shot-02", panelId: "panel-02-a", promptId: "prompt-video-01", model: "Seedance 2.0 PRO", mode: "首帧视频", status: "candidate", duration: "00:05", aspectRatio: "9:16", resolution: "1080P", thumbnail: "武松低机位环绕", cost: 1.38, motionStrength: 0.75, consistencyScore: 91, failureReasons: [], createdAt: "2026-05-18 21:36" },
  { id: "vid-02-a-02", shotId: "shot-02", panelId: "panel-02-a", promptId: "prompt-video-01", model: "Seedance 2.0 PRO", mode: "首尾帧视频", status: "accepted", duration: "00:05", aspectRatio: "9:16", resolution: "1080P", thumbnail: "虎影压近已采纳", cost: 1.42, motionStrength: 0.68, consistencyScore: 94, failureReasons: [], createdAt: "2026-05-18 21:44" },
  { id: "vid-03-a-01", shotId: "shot-03", panelId: "panel-03-a", promptId: "prompt-video-01", model: "Seedance 2.0 PRO", mode: "图生视频", status: "rejected", duration: "00:05", aspectRatio: "9:16", resolution: "1080P", thumbnail: "哨棒横扫失败", cost: 1.38, motionStrength: 0.88, consistencyScore: 58, failureReasons: ["face_pattern_wrong", "motion_too_strong"], createdAt: "2026-05-18 21:03" },
  { id: "vid-05-a-01", shotId: "shot-05", panelId: "panel-05-a", promptId: "prompt-video-01", model: "Seedance 2.0 PRO", mode: "首帧视频", status: "candidate", duration: "00:05", aspectRatio: "9:16", resolution: "1080P", thumbnail: "槌影翻飞候选", cost: 1.46, motionStrength: 0.72, consistencyScore: 89, failureReasons: [], createdAt: "2026-05-18 22:22" },
];
