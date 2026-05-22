export type MockPanel = {
  id: string;
  shotId: string;
  panelNo: number;
  imageDescription: string;
  camera: string;
  motion: string;
  promptStatus: "已生成" | "待生成" | "需复核";
  keyframeStatus: "已采纳" | "候选" | "缺失";
  videoStatus: "未生成" | "生成中" | "候选" | "需重试";
};

export const panels: MockPanel[] = [
  { id: "panel-01-a", shotId: "shot-01", panelNo: 1, imageDescription: "梁山水泊远景，烟尘压低天光。", camera: "低机位远景", motion: "缓慢推近", promptStatus: "已生成", keyframeStatus: "候选", videoStatus: "未生成" },
  { id: "panel-01-b", shotId: "shot-01", panelNo: 2, imageDescription: "旗帜与鼓阵掠过，武松剪影出现。", camera: "侧向跟拍", motion: "旗帜扫过转场", promptStatus: "已生成", keyframeStatus: "已采纳", videoStatus: "候选" },
  { id: "panel-02-a", shotId: "shot-02", panelNo: 1, imageDescription: "武松与虎影对峙，红黑脸谱半露。", camera: "中景仰拍", motion: "环绕", promptStatus: "已生成", keyframeStatus: "已采纳", videoStatus: "候选" },
  { id: "panel-02-b", shotId: "shot-02", panelNo: 2, imageDescription: "拳势定格，尘土向外爆开。", camera: "近景特写", motion: "冲击定格", promptStatus: "已生成", keyframeStatus: "候选", videoStatus: "未生成" },
  { id: "panel-03-a", shotId: "shot-03", panelNo: 1, imageDescription: "酒楼青石街，武松半醉站定。", camera: "广角中景", motion: "轻微晃动", promptStatus: "需复核", keyframeStatus: "候选", videoStatus: "需重试" },
  { id: "panel-03-b", shotId: "shot-03", panelNo: 2, imageDescription: "哨棒横扫，动作带英歌鼓点。", camera: "横移跟拍", motion: "快速横扫", promptStatus: "需复核", keyframeStatus: "缺失", videoStatus: "需重试" },
  { id: "panel-03-c", shotId: "shot-03", panelNo: 3, imageDescription: "对手后退，避免血腥，只表现压迫。", camera: "斜侧中景", motion: "后撤", promptStatus: "待生成", keyframeStatus: "缺失", videoStatus: "未生成" },
  { id: "panel-04-a", shotId: "shot-04", panelNo: 1, imageDescription: "行者装穿过鼓阵，脸谱红黑稳定。", camera: "背后跟拍", motion: "穿阵", promptStatus: "已生成", keyframeStatus: "已采纳", videoStatus: "候选" },
  { id: "panel-04-b", shotId: "shot-04", panelNo: 2, imageDescription: "回眸定身，眼尾飞锋清晰。", camera: "正面特写", motion: "停顿", promptStatus: "已生成", keyframeStatus: "候选", videoStatus: "未生成" },
  { id: "panel-05-a", shotId: "shot-05", panelNo: 1, imageDescription: "脸谱特写，额心朱砂印发亮。", camera: "极近特写", motion: "推近", promptStatus: "已生成", keyframeStatus: "已采纳", videoStatus: "生成中" },
  { id: "panel-05-b", shotId: "shot-05", panelNo: 2, imageDescription: "英歌槌翻飞，红黑烟尘爆开。", camera: "动态中景", motion: "甩槌", promptStatus: "已生成", keyframeStatus: "候选", videoStatus: "未生成" },
  { id: "panel-06-a", shotId: "shot-06", panelNo: 1, imageDescription: "鼓阵中心定格，水墨化为脸谱印。", camera: "缓慢升格", motion: "落印", promptStatus: "已生成", keyframeStatus: "候选", videoStatus: "未生成" },
  { id: "panel-06-b", shotId: "shot-06", panelNo: 2, imageDescription: "朱砂印记收尾，项目标题浮现。", camera: "正面收束", motion: "淡出", promptStatus: "已生成", keyframeStatus: "候选", videoStatus: "未生成" },
];
