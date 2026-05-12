export type Shot = {
  id: string;
  project_id: string;
  script_id: string | null;
  scene_id: string | null;
  shot_no: string;
  order_index: number;
  story_beat: string | null;
  description: string;
  characters: string[];
  setting: string | null;
  emotion: string | null;
  action: string | null;
  expression: string | null;
  props: string[];
  shot_size: string | null;
  camera_angle: string | null;
  composition: string | null;
  camera_movement: string | null;
  lighting: string | null;
  transition_in: string | null;
  transition_out: string | null;
  edit_point: string | null;
  duration_seconds: number | null;
  image_prompt: string | null;
  video_prompt: string | null;
  negative_prompt: string | null;
  reference_asset_ids: string[];
  continuity_constraints: string[];
  generation_risk: string | null;
  simplify_strategy: string | null;
  readiness: string;
  extra_metadata: Record<string, unknown>;
  status: string;
};

export type ShotUpdatePayload = Partial<
  Pick<
    Shot,
    | "shot_no"
    | "story_beat"
    | "description"
    | "characters"
    | "setting"
    | "emotion"
    | "action"
    | "expression"
    | "props"
    | "shot_size"
    | "camera_angle"
    | "composition"
    | "camera_movement"
    | "lighting"
    | "transition_in"
    | "transition_out"
    | "edit_point"
    | "duration_seconds"
    | "image_prompt"
    | "video_prompt"
    | "negative_prompt"
    | "reference_asset_ids"
    | "continuity_constraints"
    | "generation_risk"
    | "simplify_strategy"
    | "readiness"
    | "status"
  >
>;
