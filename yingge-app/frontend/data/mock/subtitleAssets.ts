export type MockSubtitleAsset = {
  id: string;
  shotId: string;
  text: string;
  status: "candidate" | "accepted" | "rejected";
  timingStatus: "已对齐" | "需微调" | "未生成";
};

export const subtitleAssets: MockSubtitleAsset[] = [
  { id: "sub-01", shotId: "shot-01", text: "在水泊梁山的烽烟中，有一人，名震四方。", status: "accepted", timingStatus: "已对齐" },
  { id: "sub-02", shotId: "shot-02", text: "他，景阳冈上赤手空拳，打虎英雄，天下闻名。", status: "accepted", timingStatus: "已对齐" },
  { id: "sub-03", shotId: "shot-03", text: "他，醉打蒋门神，为兄弟出头，快意恩仇。", status: "candidate", timingStatus: "需微调" },
];
