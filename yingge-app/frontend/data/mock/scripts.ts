export type MockScript = {
  id: string;
  projectId: string;
  characterId: string;
  title: string;
  platform: string;
  duration: string;
  aspectRatio: string;
  tone: string;
  version: string;
  status: "已保存" | "草稿" | "待复核";
  narration: string[];
  hook: string;
  ending: string;
  keywords: string[];
  agentNotes: Array<{ agent: string; note: string; status: "通过" | "建议" | "风险" }>;
};

export const currentScript: MockScript = {
  id: "script-wusong-v21",
  projectId: "project-wusong-hero",
  characterId: "wusong",
  title: "武松英歌角色介绍短片",
  platform: "抖音 / TikTok",
  duration: "45 秒",
  aspectRatio: "9:16 竖屏",
  tone: "英雄诗 / 国风叙事",
  version: "v2.1",
  status: "已保存",
  hook: "在水泊梁山的烽烟中，有一人，名震四方，威震八方。",
  ending: "他不是传说的背影，而是潮汕英歌鼓点里仍在前冲的热血化身。",
  keywords: ["武松", "行者", "醉打蒋门神", "朱砂脸谱", "英歌战舞", "护义破局"],
  narration: [
    "在水泊梁山的烽烟中，有一人，名震四方，威震八方。",
    "他，景阳冈上赤手空拳，打虎英雄，天下闻名。",
    "他，醉打蒋门神，为兄弟出头，快意恩仇。",
    "他，行者武松，不守常规，不畏强权，忠义双全。",
    "他在英歌的鼓点中重生，脸谱如战神降临，槌影翻飞，气吞山河。",
    "武松，不只是传奇，更是潮汕英歌传承的热血化身。",
  ],
  agentNotes: [
    { agent: "ScriptAgent", note: "旁白节奏良好，45 秒内可完成叙事闭环。", status: "通过" },
    { agent: "StoryboardAgent", note: "建议拆成 6 镜，保持每镜 5-9 秒。", status: "建议" },
    { agent: "CriticAgent", note: "第 3 镜醉打动作需避免过度血腥。", status: "风险" },
  ],
};
