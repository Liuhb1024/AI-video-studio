export type CharacterDetailLayer = {
  title: string;
  subtitle: string;
  summary: string;
  fields: Array<{ label: string; value: string }>;
};

export type CharacterAppearance = {
  id: string;
  title: string;
  status: "主外观" | "候选" | "需复核";
  description: string;
  palette: string[];
};

export type CharacterReferenceImage = {
  id: string;
  title: string;
  type: "脸谱" | "动作" | "服饰" | "错误示例";
  status: "已采纳" | "候选" | "避色";
};

export type FieldSource = {
  field: string;
  source: string;
  row: number;
  evidence: "明确记录" | "推断" | "未确认";
};

export type ConsistencyChecklistItem = {
  id: string;
  label: string;
  status: "通过" | "预警" | "缺失";
  note: string;
};

export const characterDetail = {
  id: "wusong",
  name: "武松",
  nickname: "行者",
  ranking: 14,
  star: "天伤星",
  liangshanRole: "步军头领",
  weapon: "哨棒 / 双刀",
  yinggeRole: "打面 · 先锋",
  facePrimaryColor: "#c93a32",
  facePattern: "红黑对称脸谱，额心朱砂印，眼尾飞锋，眉骨外扩。",
  colorSymbolism: "朱砂红象征血性、正义、破局与护身镇邪。",
  costumePattern: "短打行者装，黑红束带，肩部保留英歌槌与虎纹压纹。",
  visualToneKeywords: ["勇猛", "刚烈", "血性", "正气", "爆发力", "水墨烟尘"],
  positivePromptKeywords: [
    "英歌战舞",
    "Chinese opera face paint",
    "朱砂脸谱",
    "heroic warrior",
    "ink wash",
    "dynamic pose",
    "traditional armor",
    "chaoshan Yingge",
  ],
  forbiddenPromptKeywords: [
    "现代服饰",
    "3D 卡通",
    "写实照片",
    "低质模糊",
    "塑料质感",
    "西式盔甲",
    "过度血腥",
    "霓虹赛博",
  ],
  appearances: [
    {
      id: "appearance-main",
      title: "主外观 · 醉打蒋门神",
      status: "主外观",
      description: "红黑脸谱，短打行者装，哨棒横持，酒意压迫但眼神清醒。",
      palette: ["#c93a32", "#191515", "#e9c349"],
    },
    {
      id: "appearance-tiger",
      title: "候选 · 景阳冈打虎",
      status: "候选",
      description: "虎纹肩甲更重，动作更具扑击感，可用于过场素材。",
      palette: ["#a12d28", "#2a211c", "#d8b15d"],
    },
    {
      id: "appearance-error",
      title: "避色 · 现代写实偏差",
      status: "需复核",
      description: "过度写实照片质感，缺少英歌脸谱边界，不进入参考链路。",
      palette: ["#5b5b5b", "#222222", "#9b6a50"],
    },
  ] satisfies CharacterAppearance[],
  referenceImages: [
    { id: "ref-face", title: "脸谱主参考", type: "脸谱", status: "已采纳" },
    { id: "ref-action", title: "哨棒动作", type: "动作", status: "候选" },
    { id: "ref-costume", title: "行者短打", type: "服饰", status: "已采纳" },
    { id: "ref-error-modern", title: "现代写实偏差", type: "错误示例", status: "避色" },
  ] satisfies CharacterReferenceImage[],
  identityLayer: {
    title: "身份层",
    subtitle: "Identity Layer",
    summary: "武松，绰号行者，梁山第十四位，天伤星，步军头领。",
    fields: [
      { label: "姓名", value: "武松" },
      { label: "绰号", value: "行者" },
      { label: "排名", value: "第 14 位" },
      { label: "梁山职务", value: "步军头领" },
    ],
  },
  innerCoreLayer: {
    title: "内核层",
    subtitle: "Inner Core Layer",
    summary: "核心是以孤勇抗压迫，情绪触发点是痛快、刚烈、复仇与护义。",
    fields: [
      { label: "人格关键词", value: "勇猛 / 果敢 / 忠义" },
      { label: "内在冲突", value: "孤勇对抗权势，痛快背后仍有克制" },
      { label: "情绪触发", value: "不平、压迫、兄弟义气" },
    ],
  },
  culturalVisualLayer: {
    title: "文化视觉层",
    subtitle: "Cultural Visual Layer",
    summary: "红黑主色、朱砂额印、哨棒动作和短打行者装构成可复用视觉规范。",
    fields: [
      { label: "脸谱主色", value: "朱砂红 / 墨黑" },
      { label: "颜色象征", value: "血性、正义、破局、镇邪" },
      { label: "脸谱纹样", value: "红黑对称、眼尾飞锋、额心朱砂印" },
      { label: "服饰纹样", value: "短打行者装、黑红束带、虎纹压纹" },
      { label: "武器 / 英歌槌", value: "哨棒 / 双节棍式英歌槌规范" },
      { label: "材质关键词", value: "粗糙皮革、铁锈、汗水、烟尘、水墨颗粒" },
    ],
  },
  narrativeMaterialLayer: {
    title: "叙事素材层",
    subtitle: "Narrative Material Layer",
    summary: "以醉打蒋门神为短片核心，串联景阳冈打虎、行者身份和护义动机。",
    fields: [
      { label: "核心叙事原点", value: "醉打蒋门神" },
      { label: "人生关键经历", value: "景阳冈打虎、斗杀西门庆、醉打蒋门神" },
      { label: "情绪触发点", value: "替弱者出头、见不平则出手" },
      { label: "角色关系", value: "兄弟义气、江湖压迫者、被保护者" },
      { label: "场景种子", value: "酒楼、青石街、鼓点阵列、烟尘逆光" },
    ],
  },
  commercialCultureLayer: {
    title: "商业文化层",
    subtitle: "Commercial Culture Layer",
    summary: "适合开发勇气、护身、破局主题文创，转化为朱砂脸谱徽章和英歌槌纹样。",
    fields: [
      { label: "文创产品定位", value: "勇气护身、破局开运、英歌脸谱潮流配饰" },
      { label: "祈福 / 辟邪寓意", value: "镇邪、护身、破局、行义" },
      { label: "商品命名方向", value: "行者破局、朱砂护义、醉拳开山" },
      { label: "目标用户", value: "国潮文化爱好者、非遗文创用户、年轻短视频观众" },
      { label: "商业标签", value: "护身 / 勇气 / 热血 / 非遗潮流" },
    ],
  },
  fieldSources: [
    { field: "身份层", source: "英歌水浒角色基础信息.xlsx", row: 15, evidence: "明确记录" },
    { field: "脸谱主色", source: "视觉层字段 + 人工整理", row: 15, evidence: "推断" },
    { field: "商业文化层", source: "文创负责人备注", row: 15, evidence: "明确记录" },
    { field: "材质关键词", source: "Prompt 规范补充", row: 15, evidence: "推断" },
  ] satisfies FieldSource[],
  consistencyChecklist: [
    { id: "face-color", label: "脸谱主色一致", status: "通过", note: "主色锁定朱砂红与墨黑。" },
    { id: "weapon", label: "武器一致", status: "通过", note: "哨棒 / 双刀描述未冲突。" },
    { id: "costume", label: "服饰纹样一致", status: "通过", note: "短打行者装与英歌槌纹样一致。" },
    { id: "negative", label: "禁止词覆盖", status: "预警", note: "需继续防止现代写实和西式盔甲。" },
    { id: "material", label: "材质关键词", status: "通过", note: "烟尘、水墨、粗糙皮革已覆盖。" },
  ] satisfies ConsistencyChecklistItem[],
};
