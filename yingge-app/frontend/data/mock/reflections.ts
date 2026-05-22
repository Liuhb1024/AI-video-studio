export type MockReflection = {
  id: string;
  targetType: "character" | "script" | "shot" | "panel";
  targetId: string;
  severity: "info" | "warning" | "error";
  source: string;
  message: string;
  suggestion: string;
};

export const reflections: MockReflection[] = [
  {
    id: "ref-character-01",
    targetType: "character",
    targetId: "wusong",
    severity: "warning",
    source: "CriticAgent",
    message: "武松容易被生成成写实照片或现代武侠装。",
    suggestion: "在禁止提示词中加强现代服饰、写实照片、西式盔甲限制。",
  },
  {
    id: "ref-shot-03",
    targetType: "shot",
    targetId: "shot-03",
    severity: "warning",
    source: "StoryboardAgent",
    message: "醉打蒋门神段落动作强，但需要避免血腥表达。",
    suggestion: "画面以压迫感、退步、烟尘和鼓点表现冲突。",
  },
  {
    id: "ref-panel-03-b",
    targetType: "panel",
    targetId: "panel-03-b",
    severity: "error",
    source: "GenerationTask",
    message: "上一轮视频候选中武器形态偏离哨棒设定。",
    suggestion: "将“哨棒横扫”固定为短棍/双节棍式英歌槌，不使用长枪。",
  },
  {
    id: "ref-script-01",
    targetType: "script",
    targetId: "script-wusong-v21",
    severity: "info",
    source: "ScriptAgent",
    message: "旁白节奏适合 45 秒竖屏短片。",
    suggestion: "保留开头钩子，结尾加英歌非遗传承落点。",
  },
];
