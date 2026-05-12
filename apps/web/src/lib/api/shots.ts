import type { Shot, ShotUpdatePayload } from "@/features/shots/types";

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

export function listProjectShots(projectId: string, scriptId?: string): Promise<Shot[]> {
  const query = scriptId ? `?script_id=${encodeURIComponent(scriptId)}` : "";
  return request<Shot[]>(`/projects/${projectId}/shots${query}`);
}

export function generateProjectShots(projectId: string, scriptId: string): Promise<{ shots: Shot[] }> {
  return request<{ shots: Shot[] }>(`/projects/${projectId}/shots/generate-from-script`, {
    method: "POST",
    body: JSON.stringify({ script_id: scriptId }),
  });
}

export function updateProjectShot(projectId: string, shotId: string, payload: ShotUpdatePayload): Promise<Shot> {
  return request<Shot>(`/projects/${projectId}/shots/${shotId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function reorderProjectShots(projectId: string, shotIds: string[]): Promise<Shot[]> {
  return request<Shot[]>(`/projects/${projectId}/shots/reorder`, {
    method: "POST",
    body: JSON.stringify({ shot_ids: shotIds }),
  });
}

export async function deleteProjectShot(projectId: string, shotId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/shots/${shotId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload && typeof payload.detail === "string" ? payload.detail : `Request failed: ${response.status}`;
    throw new Error(detail);
  }
}
