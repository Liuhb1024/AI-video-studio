export type FailureReasonCode =
  | "character_inconsistent"
  | "face_pattern_wrong"
  | "color_wrong"
  | "scene_mismatch"
  | "style_drift"
  | "yingge_motion_wrong"
  | "motion_too_strong"
  | "motion_too_weak"
  | "bad_anatomy"
  | "duration_mismatch"
  | "model_error";

export type MockFailureReason = {
  code: FailureReasonCode;
  label: string;
  description: string;
  severity: "warning" | "error" | "processing";
};

export const failureReasons: MockFailureReason[] = [
  { code: "character_inconsistent", label: "角色不一致", description: "脸型、气质或武器偏离武松角色圣经。", severity: "error" },
  { code: "face_pattern_wrong", label: "脸谱纹样错误", description: "眼尾飞锋、朱砂印或红黑关系不稳定。", severity: "error" },
  { code: "color_wrong", label: "颜色错误", description: "脸谱主色或服饰主色偏离正红、黑灰、云纹设定。", severity: "warning" },
  { code: "scene_mismatch", label: "场景不匹配", description: "生成场景与镜头绑定的梁山、景阳冈或鼓阵不一致。", severity: "warning" },
  { code: "style_drift", label: "风格漂移", description: "画面变成普通武侠、写实照片或游戏商城风。", severity: "warning" },
  { code: "yingge_motion_wrong", label: "英歌动作错误", description: "鼓点、步法、槌法和阵势不符合英歌语境。", severity: "error" },
  { code: "motion_too_strong", label: "运动过强", description: "镜头晃动过大，主体无法稳定识别。", severity: "warning" },
  { code: "motion_too_weak", label: "运动过弱", description: "视频缺少鼓点和动作爆发力。", severity: "processing" },
  { code: "bad_anatomy", label: "人体结构异常", description: "手部、肩背、武器握持或肢体比例异常。", severity: "error" },
  { code: "duration_mismatch", label: "时长不符", description: "候选视频与分镜预设时长不一致。", severity: "warning" },
  { code: "model_error", label: "模型错误", description: "Provider 任务失败、超时或返回不可用素材。", severity: "error" },
];
