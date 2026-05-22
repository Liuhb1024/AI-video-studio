export type GenerationTaskType = "image" | "video" | "tts";
export type GenerationTaskStatus = "queued" | "processing" | "completed" | "failed";

export type MockGenerationTask = {
  id: string;
  type: GenerationTaskType;
  provider: string;
  model: string;
  mode: string;
  status: GenerationTaskStatus;
  shotId: string;
  panelId: string;
  promptId: string;
  progress: number;
  estimatedCost: number;
  actualCost: number;
  startedAt: string;
  finishedAt: string;
  failureReason: string;
  retryCount: number;
};

export const generationTasks: MockGenerationTask[] = [
  { id: "task-img-021", type: "image", provider: "OpenAI", model: "gpt-image-2", mode: "参考图生图", status: "completed", shotId: "shot-02", panelId: "panel-02-a", promptId: "prompt-img-01", progress: 100, estimatedCost: 0.8, actualCost: 0.86, startedAt: "21:20", finishedAt: "21:21", failureReason: "", retryCount: 1 },
  { id: "task-video-021", type: "video", provider: "Seedance", model: "Seedance 2.0 PRO", mode: "首帧视频", status: "processing", shotId: "shot-02", panelId: "panel-02-a", promptId: "prompt-video-01", progress: 65, estimatedCost: 1.42, actualCost: 0, startedAt: "21:31", finishedAt: "", failureReason: "", retryCount: 0 },
  { id: "task-tts-021", type: "tts", provider: "MiniMax", model: "MiniMax TTS 2.0", mode: "旁白合成", status: "completed", shotId: "shot-02", panelId: "panel-02-a", promptId: "prompt-tts-01", progress: 100, estimatedCost: 0.12, actualCost: 0.11, startedAt: "21:42", finishedAt: "21:42", failureReason: "", retryCount: 0 },
  { id: "task-video-031", type: "video", provider: "Seedance", model: "Seedance 2.0 PRO", mode: "图生视频", status: "failed", shotId: "shot-03", panelId: "panel-03-a", promptId: "prompt-video-01", progress: 100, estimatedCost: 1.42, actualCost: 1.38, startedAt: "20:58", finishedAt: "21:03", failureReason: "脸谱纹样错误，动作过强。", retryCount: 2 },
  { id: "task-img-052", type: "image", provider: "Nano Banana", model: "nano banana", mode: "多候选", status: "queued", shotId: "shot-05", panelId: "panel-05-b", promptId: "prompt-img-01", progress: 0, estimatedCost: 0.42, actualCost: 0, startedAt: "", finishedAt: "", failureReason: "", retryCount: 0 },
];
