export type MockCharacter = {
  id: string;
  name: string;
  nickname: string;
  ranking: number;
  star: string;
  liangshanRole: string;
  weapon: string;
  yinggeRole: string;
  facePrimaryColor: string;
  facePattern: string;
  personalityTags: string[];
  positivePromptKeywords: string[];
  forbiddenPromptKeywords: string[];
  appearanceCount: number;
  referenceAssetCount: number;
  fieldCompleteness: number;
  excelSourceRow: number;
  visualProfile: string;
  narrativeProfile: string;
  commercialProfile: string;
};

export const characters: MockCharacter[] = [
  {
    id: "wusong",
    name: "武松",
    nickname: "行者",
    ranking: 14,
    star: "天伤星",
    liangshanRole: "步军头领",
    weapon: "哨棒 / 双刀",
    yinggeRole: "打面 · 先锋",
    facePrimaryColor: "#c93a32",
    facePattern: "红黑对称脸谱，额心朱砂印，眼尾飞锋",
    personalityTags: ["勇猛", "果敢", "忠义"],
    positivePromptKeywords: ["英歌战舞", "水墨质感", "脸谱符号", "成套刚烈"],
    forbiddenPromptKeywords: ["现代服饰", "写实照片", "低质模糊", "3D 卡通"],
    appearanceCount: 3,
    referenceAssetCount: 12,
    fieldCompleteness: 96,
    excelSourceRow: 15,
    visualProfile: "红黑主色，短打行者装，哨棒动作，强调贴地爆发与酒意中的压迫感。",
    narrativeProfile: "从景阳冈打虎到醉打蒋门神，核心是以孤勇抗压迫，情绪触发点是痛快、刚烈、复仇。",
    commercialProfile: "适合开发护身、勇气、破局主题文创，可转化为朱砂脸谱徽章和英歌槌纹样。",
  },
  {
    id: "linchong",
    name: "林冲",
    nickname: "豹子头",
    ranking: 6,
    star: "天雄星",
    liangshanRole: "马军五虎将",
    weapon: "丈八蛇矛",
    yinggeRole: "打面 · 二番",
    facePrimaryColor: "#1f5fbf",
    facePattern: "蓝黑冷面，豹纹额饰，眉骨锋利",
    personalityTags: ["隐忍", "忠义", "悲壮"],
    positivePromptKeywords: ["雪夜", "长枪", "压抑怒火", "冷蓝水墨"],
    forbiddenPromptKeywords: ["轻浮表情", "喜剧姿态", "霓虹赛博", "欧式铠甲"],
    appearanceCount: 2,
    referenceAssetCount: 9,
    fieldCompleteness: 92,
    excelSourceRow: 16,
    visualProfile: "冷蓝与黑灰为主，雪夜逆光，枪身斜切构图，动作克制但有爆发前张力。",
    narrativeProfile: "核心叙事是逼上梁山，情绪触发点是忍无可忍后的决绝。",
    commercialProfile: "适合沉淀忍耐、破局、寒夜孤胆主题，文创方向偏冷色金属徽章。",
  },
  {
    id: "luzhishen",
    name: "鲁智深",
    nickname: "花和尚",
    ranking: 13,
    star: "天孤星",
    liangshanRole: "步军头领",
    weapon: "禅杖",
    yinggeRole: "打面 · 力量",
    facePrimaryColor: "#d8d8d2",
    facePattern: "白底黑金粗线，眉眼厚重，额部佛纹",
    personalityTags: ["粗豪", "豪侠", "慈悲"],
    positivePromptKeywords: ["禅杖", "倒拔垂杨柳", "豪侠", "厚重水墨"],
    forbiddenPromptKeywords: ["瘦弱体态", "邪恶和尚", "塑料质感", "过度搞笑"],
    appearanceCount: 2,
    referenceAssetCount: 10,
    fieldCompleteness: 95,
    excelSourceRow: 17,
    visualProfile: "白黑金主色，禅杖与袈裟元素并重，体型厚重，动作大开大合。",
    narrativeProfile: "核心是路见不平与野性慈悲，适合用单人力量场面建立记忆点。",
    commercialProfile: "适合义气、护佑、力量主题文创，可延展为禅杖和柳叶纹样。",
  },
  {
    id: "likui",
    name: "李逵",
    nickname: "黑旋风",
    ranking: 22,
    star: "天杀星",
    liangshanRole: "步军头领",
    weapon: "双板斧",
    yinggeRole: "打面 · 四番",
    facePrimaryColor: "#0c0c0c",
    facePattern: "黑底红白碎纹，双眼圆睁，脸谱边缘粗粝",
    personalityTags: ["直率", "凶猛", "赤诚"],
    positivePromptKeywords: ["黑旋风", "双斧", "狂放动作", "尘土飞扬"],
    forbiddenPromptKeywords: ["精致贵族", "瘦削", "表情温柔", "过度写实血腥"],
    appearanceCount: 3,
    referenceAssetCount: 8,
    fieldCompleteness: 88,
    excelSourceRow: 18,
    visualProfile: "黑红强对比，双斧和旋风式肢体动作，强调蛮勇但避免血腥。",
    narrativeProfile: "核心是赤诚与失控边界，适合表现冲阵、护主和野性爆发。",
    commercialProfile: "适合勇猛、镇邪、街头潮流款文创，但需控制暴力表达。",
  },
  {
    id: "guansheng",
    name: "关胜",
    nickname: "大刀",
    ranking: 5,
    star: "天勇星",
    liangshanRole: "马军五虎将",
    weapon: "青龙偃月刀",
    yinggeRole: "打面 · 五番",
    facePrimaryColor: "#5c8f3f",
    facePattern: "绿金脸谱，长髯剪影，眉眼威严",
    personalityTags: ["忠诚", "仁义", "威严"],
    positivePromptKeywords: ["大刀", "青绿金", "将军气", "英歌阵势"],
    forbiddenPromptKeywords: ["轻佻", "科幻盔甲", "卡通比例", "杂乱背景"],
    appearanceCount: 2,
    referenceAssetCount: 7,
    fieldCompleteness: 93,
    excelSourceRow: 19,
    visualProfile: "青绿金主色，长刀斜向构图，适合阵列中心和威严站姿。",
    narrativeProfile: "核心是名门武将与忠义选择，情绪基调稳重庄严。",
    commercialProfile: "适合忠义、守护、将军纹章等文创。",
  },
  {
    id: "huarong",
    name: "花荣",
    nickname: "小李广",
    ranking: 9,
    star: "天英星",
    liangshanRole: "马军八骠骑",
    weapon: "弓箭",
    yinggeRole: "打面 · 射手",
    facePrimaryColor: "#d9bf45",
    facePattern: "金白细线，眼尾如箭羽，脸谱更轻灵",
    personalityTags: ["机智", "义气", "精准"],
    positivePromptKeywords: ["弓箭", "箭羽", "轻盈身法", "金色高光"],
    forbiddenPromptKeywords: ["笨重武器", "近战斧头", "现代弓赛服", "低清晰度"],
    appearanceCount: 2,
    referenceAssetCount: 6,
    fieldCompleteness: 90,
    excelSourceRow: 20,
    visualProfile: "金白主色，弓箭线条细长，动作重视拉弓瞬间和视线方向。",
    narrativeProfile: "核心是精准与义气，适合表现一箭定局的短视频记忆点。",
    commercialProfile: "适合目标、命中、守护主题文创。",
  },
];

export const selectedCharacter = characters[0];
