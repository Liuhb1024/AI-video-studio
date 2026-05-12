export type ProjectStage = "preparing" | "scripting" | "storyboarding" | "generating" | "archived";

export type Project = {
  id: string;
  name: string;
  summary: string | null;
  ip_name: string | null;
  genre: string | null;
  visual_style: string | null;
  stage: ProjectStage | string;
  cover_asset_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectCreatePayload = {
  name: string;
  summary?: string;
  ip_name?: string;
  genre?: string;
  visual_style?: string;
  stage: ProjectStage;
};

export type ProjectCharacterStatus = "draft" | "selected" | "needs_reference" | "ready" | string;

export type ProjectCharacterSummary = {
  id: string;
  name: string;
  alias: string | null;
  yingge_role: string | null;
  weapons: string | null;
  weapon: string | null;
  reference_asset_id: string | null;
  reference_asset_ids: string[];
  reference_asset_count: number;
  generated_asset_count: number;
  image_consistency_prompt: string | null;
  status: string;
};

export type ProjectCharacter = {
  id: string;
  project_id: string;
  character_id: string;
  role_in_project: string | null;
  usage_note: string | null;
  status: ProjectCharacterStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  character: ProjectCharacterSummary;
};

export type ProjectCharacterCreatePayload = {
  character_id: string;
  role_in_project?: string | null;
  usage_note?: string | null;
  status?: ProjectCharacterStatus;
  sort_order?: number;
};

export type ProjectCharacterUpdatePayload = Partial<Pick<ProjectCharacter, "role_in_project" | "usage_note" | "status" | "sort_order">>;
