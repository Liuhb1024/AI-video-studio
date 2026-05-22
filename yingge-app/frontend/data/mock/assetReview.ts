import { audioAssets } from "./audioAssets";
import { imageAssets } from "./imageAssets";
import { subtitleAssets } from "./subtitleAssets";
import { videoAssets } from "./videoAssets";

export const assetReviewSummary = {
  acceptedCount: 45,
  candidateCount: 18,
  rejectedCount: 12,
  totalCost: 28547.65,
  readiness: 92,
  previewAssetId: "vid-02-a-02",
  rejectionStats: [
    ["角色不一致", 5],
    ["脸谱纹样错误", 3],
    ["颜色错误", 2],
    ["场景不匹配", 1],
    ["英歌动作不准确", 1],
  ],
  modelFailureModes: [
    ["Seedance 2.0 PRO", "英歌动作细节生成不稳定，脸部纹理有漂移。", "问题较多"],
    ["gpt-image-2", "复杂构图时脸饰细节丢失。", "中等问题"],
    ["MiniMax TTS 2.0", "语音情绪表现良好。", "稳定"],
  ],
};

export const reviewAssetGroups = [
  {
    shotId: "shot-01",
    imageAssets: imageAssets.slice(0, 2),
    videoAssets: videoAssets.slice(0, 1),
    audioAssets: audioAssets.slice(0, 1),
    subtitleAssets: subtitleAssets.slice(0, 1),
  },
  {
    shotId: "shot-02",
    imageAssets: imageAssets.slice(0, 2),
    videoAssets: videoAssets.slice(0, 2),
    audioAssets: audioAssets.slice(1, 2),
    subtitleAssets: subtitleAssets.slice(1, 2),
  },
  {
    shotId: "shot-03",
    imageAssets: imageAssets.slice(2, 3),
    videoAssets: videoAssets.slice(2, 3),
    audioAssets: audioAssets.slice(2, 3),
    subtitleAssets: subtitleAssets.slice(2, 3),
  },
];
