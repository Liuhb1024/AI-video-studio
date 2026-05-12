import type { CharacterImagePromptDraft, CharacterImagePromptDraftPayload, CharacterImageTaskPayload, GenerateTask } from "@/features/generation/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload && typeof payload.detail === "string" ? payload.detail : `Request failed: ${response.status}`;
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export function createCharacterImageTask(payload: CharacterImageTaskPayload): Promise<GenerateTask> {
  return request<GenerateTask>("/generation/character-image-tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createCharacterImagePromptDraft(payload: CharacterImagePromptDraftPayload): Promise<CharacterImagePromptDraft> {
  return request<CharacterImagePromptDraft>("/generation/character-image-prompt-drafts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listCharacterImageTasks(characterId: string): Promise<GenerateTask[]> {
  return request<GenerateTask[]>(`/generation/character-image-tasks?character_id=${encodeURIComponent(characterId)}`);
}

export function getCharacterImageTask(taskId: string): Promise<GenerateTask> {
  return request<GenerateTask>(`/generation/character-image-tasks/${encodeURIComponent(taskId)}`);
}

export function retryCharacterImageTask(taskId: string): Promise<GenerateTask> {
  return request<GenerateTask>(`/generation/character-image-tasks/${encodeURIComponent(taskId)}/retry`, {
    method: "POST",
  });
}

export function cancelCharacterImageTask(taskId: string): Promise<GenerateTask> {
  return request<GenerateTask>(`/generation/character-image-tasks/${encodeURIComponent(taskId)}/cancel`, {
    method: "POST",
  });
}
