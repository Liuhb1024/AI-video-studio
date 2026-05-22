export type ProjectStage =
  | "剧本生成"
  | "分镜确认"
  | "素材生成"
  | "素材审核"
  | "已完成"
  | "需复核";

export type MockProject = {
  id: string;
  title: string;
  characterId: string;
  characterName: string;
  yinggeRole: string;
  stage: ProjectStage;
  shotCount: number;
  panelCount: number;
  acceptedImageCount: number;
  acceptedVideoCount: number;
  failedTaskCount: number;
  runningTaskCount: number;
  totalCost: number;
  updatedAt: string;
  readiness: number;
  coverImage: string;
  tags: string[];
};

export const projects: MockProject[] = [
  {
    id: "project-wusong-hero",
    title: "武松醉打蒋门神",
    characterId: "wusong",
    characterName: "武松",
    yinggeRole: "打面 · 先锋",
    stage: "素材生成",
    shotCount: 6,
    panelCount: 8,
    acceptedImageCount: 18,
    acceptedVideoCount: 4,
    failedTaskCount: 2,
    runningTaskCount: 3,
    totalCost: 1245.6,
    updatedAt: "2026-05-19 14:30",
    readiness: 68,
    coverImage: "cinnabar",
    tags: ["人物介绍", "抖音竖屏", "动作气势"],
  },
  {
    id: "project-linchong-night",
    title: "林冲夜奔雪夜",
    characterId: "linchong",
    characterName: "林冲",
    yinggeRole: "打面 · 二番",
    stage: "分镜确认",
    shotCount: 6,
    panelCount: 6,
    acceptedImageCount: 12,
    acceptedVideoCount: 2,
    failedTaskCount: 1,
    runningTaskCount: 2,
    totalCost: 2156.8,
    updatedAt: "2026-05-19 12:15",
    readiness: 54,
    coverImage: "bluegray",
    tags: ["人物介绍", "雪夜场景", "克制悲壮"],
  },
  {
    id: "project-luzhishen-willow",
    title: "鲁智深倒拔垂杨柳",
    characterId: "luzhishen",
    characterName: "鲁智深",
    yinggeRole: "打面 · 力量",
    stage: "素材审核",
    shotCount: 8,
    panelCount: 8,
    acceptedImageCount: 24,
    acceptedVideoCount: 6,
    failedTaskCount: 0,
    runningTaskCount: 1,
    totalCost: 3245.2,
    updatedAt: "2026-05-18 18:45",
    readiness: 82,
    coverImage: "gold",
    tags: ["人物介绍", "力量感", "成片审核"],
  },
  {
    id: "project-li-kui-tiger",
    title: "李逵沂岭杀四虎",
    characterId: "likui",
    characterName: "李逵",
    yinggeRole: "打面 · 四番",
    stage: "已完成",
    shotCount: 7,
    panelCount: 8,
    acceptedImageCount: 20,
    acceptedVideoCount: 7,
    failedTaskCount: 0,
    runningTaskCount: 0,
    totalCost: 2845.3,
    updatedAt: "2026-05-18 22:10",
    readiness: 100,
    coverImage: "jade",
    tags: ["人物介绍", "已导出", "海外版待翻译"],
  },
  {
    id: "project-huarong-arrow",
    title: "花荣神射雁门",
    characterId: "huarong",
    characterName: "花荣",
    yinggeRole: "打面 · 射手",
    stage: "剧本生成",
    shotCount: 5,
    panelCount: 5,
    acceptedImageCount: 6,
    acceptedVideoCount: 1,
    failedTaskCount: 0,
    runningTaskCount: 1,
    totalCost: 856.4,
    updatedAt: "2026-05-17 09:20",
    readiness: 34,
    coverImage: "ink",
    tags: ["人物介绍", "弓箭", "脚本草稿"],
  },
  {
    id: "project-yangzhi-blade",
    title: "杨志青面兽押纲",
    characterId: "yangzhi",
    characterName: "杨志",
    yinggeRole: "打面 · 七番",
    stage: "需复核",
    shotCount: 5,
    panelCount: 6,
    acceptedImageCount: 5,
    acceptedVideoCount: 0,
    failedTaskCount: 3,
    runningTaskCount: 0,
    totalCost: 456.2,
    updatedAt: "2026-05-16 11:30",
    readiness: 28,
    coverImage: "error",
    tags: ["角色偏差", "需重试", "负向词优化"],
  },
];

export const dashboardStats = {
  activeProjects: 4,
  importedCharacters: 45,
  runningTasks: 7,
  acceptedVideos: 20,
  failedTasks: 6,
  monthlyCost: 128.4,
};
