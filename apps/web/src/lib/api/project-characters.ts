import type { ProjectCharacter, ProjectCharacterCreatePayload, ProjectCharacterUpdatePayload } from "@/features/projects/types";

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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function listProjectCharacters(projectId: string): Promise<ProjectCharacter[]> {
  return request<ProjectCharacter[]>(`/projects/${projectId}/characters`);
}

export function createProjectCharacter(projectId: string, payload: ProjectCharacterCreatePayload): Promise<ProjectCharacter> {
  return request<ProjectCharacter>(`/projects/${projectId}/characters`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProjectCharacter(projectId: string, projectCharacterId: string, payload: ProjectCharacterUpdatePayload): Promise<ProjectCharacter> {
  return request<ProjectCharacter>(`/projects/${projectId}/characters/${projectCharacterId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteProjectCharacter(projectId: string, projectCharacterId: string): Promise<void> {
  return request<void>(`/projects/${projectId}/characters/${projectCharacterId}`, {
    method: "DELETE",
  });
}
