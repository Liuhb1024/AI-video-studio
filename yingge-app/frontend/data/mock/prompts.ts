import type { FailureReasonCode } from "./failureReasons";

export type PromptType = "image" | "video" | "negative" | "tts";

export type MockPrompt = {
  id: string;
  shotId: string;
  panelId: string;
  type: PromptType;
  version: string;
  content: string;
  positiveKeywords: string[];
  negativeKeywords: string[];
  sourceFields: string[];
  qualityChecklist: { label: string; passed: boolean }[];
  updatedAt: string;
};

const checklist = [
  { label: "角色一致性", passed: true },
  { label: "脸谱主色", passed: true },
  { label: "英歌动作", passed: true },
  { label: "场景绑定", passed: true },
];

export const prompts: MockPrompt[] = [
  {
    id: "prompt-img-01",
    shotId: "shot-02",
    panelId: "panel-02-a",
    type: "image",
    version: "v2.1",
    content: "武松与虎影在景阳冈山林烟尘中对峙，红黑脸谱半露，正红额心朱砂印，哨棒压低，国风水墨与游戏 CG 质感，强烈鼓点节奏，9:16 竖屏构图。",
    positiveKeywords: ["正红脸谱", "哨棒", "景阳冈", "国风水墨", "英歌鼓点"],
    negativeKeywords: ["现代服饰", "长枪", "写实照片脸", "西式盔甲", "logo"],
    sourceFields: ["文化视觉层.脸谱主色", "叙事素材层.景阳冈", "身份层.武器", "PromptKeywordSet.禁止词"],
    qualityChecklist: checklist,
    updatedAt: "2026-05-18 21:20",
  },
  {
    id: "prompt-video-01",
    shotId: "shot-02",
    panelId: "panel-02-a",
    type: "video",
    version: "v2.1",
    content: "武松在景阳冈山林中向前踏步，虎影从烟尘后压近，镜头低机位环绕，哨棒随鼓点短促横扫，保持脸谱正红和眼尾飞锋，动作爆发但不血腥。",
    positiveKeywords: ["低机位环绕", "短促横扫", "鼓点踩拍", "烟尘", "首帧稳定"],
    negativeKeywords: ["动作拖影", "脸谱变形", "武器变长", "血腥", "水印"],
    sourceFields: ["Shot.镜头语言", "Panel.运动", "角色圣经.英歌槌设定", "上一轮拒绝原因"],
    qualityChecklist: checklist,
    updatedAt: "2026-05-18 21:31",
  },
  {
    id: "prompt-neg-01",
    shotId: "shot-02",
    panelId: "panel-02-a",
    type: "negative",
    version: "v2.1",
    content: "low quality, blurry, deformed, bad anatomy, text, watermark, modern clothes, extra limbs, distorted face, wrong face paint, spear, western armor",
    positiveKeywords: [],
    negativeKeywords: ["bad anatomy", "watermark", "modern clothes", "wrong face paint", "spear"],
    sourceFields: ["FailureReasonPanel", "PromptAgent 复盘", "角色禁止词"],
    qualityChecklist: [
      { label: "覆盖人体错误", passed: true },
      { label: "覆盖现代服饰", passed: true },
      { label: "覆盖脸谱错误", passed: true },
      { label: "覆盖水印文字", passed: true },
    ],
    updatedAt: "2026-05-18 21:34",
  },
  {
    id: "prompt-tts-01",
    shotId: "shot-02",
    panelId: "panel-02-a",
    type: "tts",
    version: "v2.1",
    content: "他，景阳冈上赤手空拳，打虎英雄，天下闻名。",
    positiveKeywords: ["男声", "英雄叙事", "低沉", "有鼓点感"],
    negativeKeywords: ["过度播音腔", "语速过快", "情绪平淡"],
    sourceFields: ["Script.narration", "Shot.duration", "MiniMax TTS voice preset"],
    qualityChecklist: [
      { label: "时长匹配", passed: true },
      { label: "语气匹配", passed: true },
      { label: "字幕可切分", passed: true },
      { label: "音色已选", passed: true },
    ],
    updatedAt: "2026-05-18 21:42",
  },
];

export const promptFailurePatch: Record<FailureReasonCode, string> = {
  character_inconsistent: "强化“武松、行者、正红脸谱、哨棒”作为每段 Prompt 的主体约束。",
  face_pattern_wrong: "增加“眼尾飞锋清晰、额心朱砂印稳定、禁止随机脸谱”的负向约束。",
  color_wrong: "把正红、黑灰、云纹写入正向词，并禁止蓝紫霓虹和现代金属色。",
  scene_mismatch: "在视频 Prompt 首句固定镜头场景，避免模型切换到无关城市或宫殿。",
  style_drift: "加入“国风水墨、电影感、非游戏商城、非写实照片”的风格边界。",
  yingge_motion_wrong: "补充“英歌槌、鼓点踩拍、短促顿挫、阵势稳定”。",
  motion_too_strong: "降低 motion strength，并要求主体脸谱稳定可识别。",
  motion_too_weak: "提高动作节拍词，加入“踏步、横扫、甩槌、鼓点推进”。",
  bad_anatomy: "增加 bad anatomy、extra limbs、distorted hands。",
  duration_mismatch: "在 Prompt 中写入 5 秒首帧视频，并锁定 9:16。",
  model_error: "保持 Prompt 不变，重试同模型或切换 Provider。"
};
