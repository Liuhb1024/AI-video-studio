export type StyleTemplate = {
  id: string;
  name: string;
  source_asset_id: string | null;
  cover_asset_id: string | null;
  source_image_url: string | null;
  style_category: string | null;
  visual_summary: string;
  line_style: string;
  color_palette: string;
  lighting_style: string;
  composition_style: string;
  character_rendering: string;
  background_rendering: string;
  texture_keywords: string;
  yingge_adaptation: string;
  image_prompt_template: string;
  video_prompt_template: string;
  negative_prompt: string;
  analysis_model: string | null;
  analysis_version: string | null;
  analysis_status: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type StyleTemplatePayload = {
  name: string;
  source_image_url?: string | null;
  style_category?: string | null;
  visual_summary?: string;
  line_style?: string;
  color_palette?: string;
  lighting_style?: string;
  composition_style?: string;
  character_rendering?: string;
  background_rendering?: string;
  texture_keywords?: string;
  yingge_adaptation?: string;
  image_prompt_template?: string;
  video_prompt_template?: string;
  negative_prompt?: string;
  analysis_status?: string;
  status?: string;
};

export type StyleTemplateAnalysisTaskListItem = {
  id: string;
  status: string;
  model_provider: string | null;
  model_name: string;
  model_version: string | null;
  params_json: Record<string, unknown> | null;
  current_step: string;
  progress: number;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type StyleTemplateAnalysisTaskDetail = StyleTemplateAnalysisTaskListItem & {
  task_type: string;
  style_template_id: string | null;
  parameters: Record<string, unknown> | null;
  input_asset_ids: string[];
  prompt_template_id: string | null;
  prompt_version: string | null;
  prompt_text: string;
  input_prompt: string;
  negative_prompt: string;
  input_snapshot_json: Record<string, unknown> | null;
  raw_response: Record<string, unknown> | null;
  retry_of_task_id: string | null;
  cost_json: Record<string, unknown> | null;
  estimated_cost: number | null;
};
