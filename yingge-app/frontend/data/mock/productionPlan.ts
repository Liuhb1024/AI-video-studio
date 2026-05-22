export type ProductionTimelineItem = {
  shotId: string;
  shotNo: number;
  title: string;
  timeRange: string;
  imageStatus: "已采纳" | "候选" | "缺失";
  videoStatus: "已采纳" | "候选" | "缺失";
  audioStatus: "已采纳" | "候选" | "缺失";
  subtitleStatus: "已采纳" | "需微调" | "缺失";
};

export const productionTimeline: ProductionTimelineItem[] = [
  { shotId: "shot-01", shotNo: 1, title: "水泊风云起", timeRange: "00:00-00:05", imageStatus: "已采纳", videoStatus: "已采纳", audioStatus: "已采纳", subtitleStatus: "已采纳" },
  { shotId: "shot-02", shotNo: 2, title: "景阳冈打虎", timeRange: "00:05-00:12", imageStatus: "已采纳", videoStatus: "已采纳", audioStatus: "已采纳", subtitleStatus: "已采纳" },
  { shotId: "shot-03", shotNo: 3, title: "醉打蒋门神", timeRange: "00:12-00:20", imageStatus: "候选", videoStatus: "候选", audioStatus: "候选", subtitleStatus: "需微调" },
  { shotId: "shot-04", shotNo: 4, title: "行者武松", timeRange: "00:20-00:27", imageStatus: "已采纳", videoStatus: "候选", audioStatus: "已采纳", subtitleStatus: "已采纳" },
  { shotId: "shot-05", shotNo: 5, title: "英歌重生", timeRange: "00:27-00:36", imageStatus: "已采纳", videoStatus: "候选", audioStatus: "缺失", subtitleStatus: "缺失" },
  { shotId: "shot-06", shotNo: 6, title: "热血化身", timeRange: "00:36-00:45", imageStatus: "候选", videoStatus: "缺失", audioStatus: "缺失", subtitleStatus: "缺失" },
];

export const productionPlan = {
  title: "武松英雄角色介绍短片",
  totalDuration: "0:45",
  shotCount: 6,
  readiness: 92,
  exportItems: ["脚本文案", "分镜表", "图片 Prompt", "视频 Prompt", "TTS 文案", "采纳素材清单", "失败原因复盘"],
};
