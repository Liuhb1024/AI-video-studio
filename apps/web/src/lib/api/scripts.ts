import type { Script, ScriptGenerationResult, ScriptGenerationSettings, ScriptVersionResult } from "@/features/scripts/types";

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

export function listProjectScripts(projectId: string): Promise<Script[]> {
  return request<Script[]>(`/projects/${projectId}/scripts/`);
}

export function generateProjectScript(projectId: string, payload: ScriptGenerationSettings): Promise<ScriptGenerationResult> {
  return request<ScriptGenerationResult>(`/projects/${projectId}/scripts/generate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProjectScriptVersion(projectId: string, scriptId: string): Promise<ScriptVersionResult> {
  return request<ScriptVersionResult>(`/projects/${projectId}/scripts/${scriptId}`);
}

export async function deleteProjectScriptVersion(projectId: string, scriptId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/scripts/${scriptId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload && typeof payload.detail === "string" ? payload.detail : `Request failed: ${response.status}`;
    throw new Error(detail);
  }
}
