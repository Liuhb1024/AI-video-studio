export type ShotStatus = "一致" | "优秀" | "预警";

export type MockShot = {
  id: string;
  scriptId: string;
  shotNo: number;
  title: string;
  duration: string;
  narrationSegment: string;
  visualDescription: string;
  action: string;
  emotion: string;
  cameraMovement: string;
  scene: string;
  boundCharacterId: string;
  consistencyStatus: ShotStatus;
  promptStatus: "已生成" | "待生成" | "需复核";
  panelCount: number;
};

export const shots: MockShot[] = [
  {
    id: "shot-01",
    scriptId: "script-wusong-v21",
    shotNo: 1,
    title: "水泊风云起",
    duration: "00:05",
    narrationSegment: "在水泊梁山的烽烟中，有一人，名震四方。",
    visualDescription: "远景，水泊梁山全景，烟尘与鼓点同步推进。",
    action: "镜头缓慢推进，旗帜猎猎。",
    emotion: "肃穆、开场压迫感",
    cameraMovement: "低机位推近",
    scene: "梁山水泊",
    boundCharacterId: "wusong",
    consistencyStatus: "优秀",
    promptStatus: "已生成",
    panelCount: 2,
  },
  {
    id: "shot-02",
    scriptId: "script-wusong-v21",
    shotNo: 2,
    title: "景阳冈打虎",
    duration: "00:07",
    narrationSegment: "他，景阳冈上赤手空拳，打虎英雄，天下闻名。",
    visualDescription: "武松与虎影在山林烟尘中对峙，动作夸张但不血腥。",
    action: "转身、踏步、挥臂定格。",
    emotion: "爆发、勇猛",
    cameraMovement: "环绕跟拍",
    scene: "景阳冈山林",
    boundCharacterId: "wusong",
    consistencyStatus: "一致",
    promptStatus: "已生成",
    panelCount: 2,
  },
  {
    id: "shot-03",
    scriptId: "script-wusong-v21",
    shotNo: 3,
    title: "醉打蒋门神",
    duration: "00:08",
    narrationSegment: "他，醉打蒋门神，为兄弟出头，快意恩仇。",
    visualDescription: "酒楼前青石街，武松半醉却目光清醒，哨棒横扫。",
    action: "哨棒横扫、脚步顿挫。",
    emotion: "痛快、压迫",
    cameraMovement: "快速横移",
    scene: "青石街酒楼",
    boundCharacterId: "wusong",
    consistencyStatus: "预警",
    promptStatus: "需复核",
    panelCount: 3,
  },
  {
    id: "shot-04",
    scriptId: "script-wusong-v21",
    shotNo: 4,
    title: "行者武松",
    duration: "00:07",
    narrationSegment: "他，行者武松，不守常规，不畏强权，忠义双全。",
    visualDescription: "武松披行者装穿过鼓阵，脸谱红黑分明。",
    action: "穿阵、回眸、定身。",
    emotion: "克制、坚定",
    cameraMovement: "背后跟拍转正面",
    scene: "英歌鼓阵",
    boundCharacterId: "wusong",
    consistencyStatus: "一致",
    promptStatus: "已生成",
    panelCount: 2,
  },
  {
    id: "shot-05",
    scriptId: "script-wusong-v21",
    shotNo: 5,
    title: "英歌重生",
    duration: "00:09",
    narrationSegment: "他在英歌的鼓点中重生，脸谱如战神降临。",
    visualDescription: "武松脸谱特写，英歌槌翻飞，红黑烟尘爆开。",
    action: "槌影翻飞、鼓点踩拍。",
    emotion: "热血、昂扬",
    cameraMovement: "特写推近后拉远",
    scene: "英歌阵列",
    boundCharacterId: "wusong",
    consistencyStatus: "优秀",
    promptStatus: "已生成",
    panelCount: 2,
  },
  {
    id: "shot-06",
    scriptId: "script-wusong-v21",
    shotNo: 6,
    title: "热血化身",
    duration: "00:09",
    narrationSegment: "武松，不只是传奇，更是潮汕英歌传承的热血化身。",
    visualDescription: "武松站在鼓阵中心，身后水墨化为英歌脸谱印记。",
    action: "定格、抬槌、落印。",
    emotion: "收束、庄重",
    cameraMovement: "缓慢升格",
    scene: "朱砂印记舞台",
    boundCharacterId: "wusong",
    consistencyStatus: "优秀",
    promptStatus: "已生成",
    panelCount: 2,
  },
];
