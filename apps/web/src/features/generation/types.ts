export type GenerateTask = {
  id: string;
  task_type: string;
  project_id: string | null;
  shot_id: string | null;
  character_id: string | null;
  generation_type: string | null;
  model_provider: string | null;
  model_name: string;
  model_version: string | null;
  parameters: Record<string, unknown> | null;
  params_json: Record<string, unknown> | null;
  input_asset_ids: string[];
  style_template_id: string | null;
  prompt_template_id: string | null;
  prompt_version: string | null;
  prompt_text: string;
  negative_prompt: string;
  input_snapshot_json: Record<string, unknown> | null;
  input_prompt: string;
  raw_response: Record<string, unknown> | null;
  output_asset_id: string | null;
  output_asset_ids: string[];
  current_step: string;
  progress: number;
  error_code: string | null;
  error_message: string | null;
  retry_of_task_id: string | null;
  cost_json: Record<string, unknown> | null;
  estimated_cost: number | null;
  status: string;
};

export type CharacterImageTaskPayload = {
  character_id: string;
  generation_type: "four_view" | "style_transfer" | "character_lookdev";
  model_name: string;
  model_provider?: string | null;
  model_version?: string | null;
  input_asset_ids: string[];
  style_template_id?: string | null;
  prompt_text: string;
  negative_prompt: string;
  params_json?: Record<string, unknown> | null;
};

export type CharacterImagePromptDraftPayload = {
  character_id: string;
  generation_type: "four_view" | "character_lookdev";
  style_template_id?: string | null;
  input_asset_ids?: string[];
  prompt_text?: string;
  negative_prompt?: string;
  model_name?: string;
  model_provider?: string | null;
  model_version?: string | null;
  temperature?: number;
};

export type CharacterImagePromptDraft = {
  character_id: string;
  generation_type: "four_view" | "character_lookdev";
  style_template_id: string | null;
  model_provider: string | null;
  model_name: string;
  model_version: string | null;
  prompt_text: string;
  negative_prompt: string;
  checklist: Record<string, boolean>;
  raw_response: Record<string, unknown> | null;
};
