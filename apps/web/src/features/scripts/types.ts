export type ScriptGenerationSettings = {
  story_seed: string;
  duration_seconds: number;
  platform: string;
  aspect_ratio: string;
  story_structure: string;
  opening_style: string;
  ending_style: string;
  genre: string;
  tone: string;
  dialogue_density: string;
  action_density: string;
  narration_ratio: string;
  yingge_intensity: string;
  cultural_expression: string;
  tradition_modern_mix: string;
  visual_symbols: string[];
  taboos: string[];
};

export type Script = {
  id: string;
  project_id: string;
  title: string;
  content: string;
  generation_settings: Record<string, unknown> | null;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
};

export type GeneratedScene = {
  id: string;
  script_id: string;
  order_index: number;
  title: string;
  summary: string | null;
  raw_text: string;
};

export type ScriptGenerationResult = {
  script: Script;
  scenes: GeneratedScene[];
  settings: ScriptGenerationSettings;
};

export type ScriptVersionResult = {
  script: Script;
  scenes: GeneratedScene[];
};
