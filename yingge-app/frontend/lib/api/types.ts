export type ApiProjectStatus = "draft" | "active" | "archived" | "completed";
export type ApiTaskStatus =
  | "pending"
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";
export type ApiTaskType = "image" | "video" | "tts" | "subtitle" | "prompt_optimize";
export type ApiAssetType = "image" | "video" | "audio" | "subtitle";
export type ApiAssetStatus = "candidate" | "accepted" | "rejected" | "archived";
export type ApiCostRecordType = "estimated" | "actual" | "adjustment";

export type ApiProject = {
  id: string;
  name: string;
  description?: string | null;
  status: ApiProjectStatus;
  current_character_id?: string | null;
  platform?: string | null;
  duration_seconds?: number | null;
  aspect_ratio?: string | null;
  metadata_?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type ApiCharacter = {
  id: string;
  name: string;
  nickname?: string | null;
  ranking?: number | null;
  star?: string | null;
  liangshan_role?: string | null;
  weapon?: string | null;
  yingge_role?: string | null;
  face_primary_color?: string | null;
  face_pattern?: string | null;
  color_symbolism?: string | null;
  source?: string | null;
  metadata_?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type ApiCharacterBible = {
  id: string;
  character_id: string;
  identity_layer?: Record<string, unknown> | null;
  inner_core_layer?: Record<string, unknown> | null;
  cultural_visual_layer?: Record<string, unknown> | null;
  narrative_material_layer?: Record<string, unknown> | null;
  commercial_culture_layer?: Record<string, unknown> | null;
  positive_prompt_keywords?: Record<string, unknown> | null;
  forbidden_prompt_keywords?: Record<string, unknown> | null;
  consistency_checklist?: Record<string, unknown> | null;
  field_sources?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type ApiGenerationTask = {
  id: string;
  project_id?: string | null;
  shot_id?: string | null;
  panel_id?: string | null;
  prompt_id?: string | null;
  type: ApiTaskType;
  status: ApiTaskStatus;
  provider?: string | null;
  model?: string | null;
  mode?: string | null;
  progress: number;
  estimated_cost?: string | number | null;
  actual_cost?: string | number | null;
  failure_reason?: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
};

export type ApiAsset = {
  id: string;
  project_id?: string | null;
  shot_id?: string | null;
  panel_id?: string | null;
  prompt_id?: string | null;
  task_id?: string | null;
  type: ApiAssetType;
  status: ApiAssetStatus;
  uri?: string | null;
  thumbnail_uri?: string | null;
  model?: string | null;
  provider?: string | null;
  cost?: string | number | null;
  consistency_score?: string | number | null;
  failure_reasons?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type ApiCostRecord = {
  id: string;
  project_id?: string | null;
  task_id?: string | null;
  asset_id?: string | null;
  provider?: string | null;
  model?: string | null;
  type: ApiCostRecordType;
  amount: string | number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type ApiExportPlan = {
  id: string;
  project_id: string;
  status: "draft" | "ready" | "exported";
  title?: string | null;
  timeline?: Record<string, unknown> | null;
  selected_asset_ids?: Record<string, unknown> | null;
  output_format?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

