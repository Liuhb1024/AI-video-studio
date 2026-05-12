import type { StyleTemplate, StyleTemplateAnalysisTaskDetail, StyleTemplateAnalysisTaskListItem, StyleTemplatePayload } from "@/features/style-templates/types";

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

export function listStyleTemplates(params?: { query?: string; styleCategory?: string }): Promise<StyleTemplate[]> {
  const search = new URLSearchParams();
  if (params?.query) search.set("query", params.query);
  if (params?.styleCategory) search.set("style_category", params.styleCategory);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<StyleTemplate[]>(`/style-templates/${suffix}`);
}

export function createStyleTemplate(payload: StyleTemplatePayload): Promise<StyleTemplate> {
  return request<StyleTemplate>("/style-templates/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createStyleTemplateFromImage(params: {
  file: File;
  name: string;
  styleCategory?: string | null;
}): Promise<StyleTemplate> {
  const form = new FormData();
  form.append("file", params.file);
  form.append("name", params.name);
  if (params.styleCategory) {
    form.append("style_category", params.styleCategory);
  }

  const response = await fetch(`${API_BASE_URL}/style-templates/from-image`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload && typeof payload.detail === "string" ? payload.detail : `Request failed: ${response.status}`;
    throw new Error(detail);
  }

  return response.json() as Promise<StyleTemplate>;
}

export function updateStyleTemplate(templateId: string, payload: Partial<StyleTemplatePayload>): Promise<StyleTemplate> {
  return request<StyleTemplate>(`/style-templates/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function analyzeStyleTemplate(templateId: string, payload: { model_name?: string; temperature?: number } = {}): Promise<StyleTemplate> {
  return request<StyleTemplate>(`/style-templates/${templateId}/analyze`, {
    method: "POST",
    body: JSON.stringify({
      model_name: payload.model_name ?? "gpt-5.4-nano",
      temperature: payload.temperature ?? 1.0,
    }),
  });
}

export function listStyleTemplateAnalysisTasks(templateId: string): Promise<StyleTemplateAnalysisTaskListItem[]> {
  return request<StyleTemplateAnalysisTaskListItem[]>(`/style-templates/${templateId}/analysis-tasks`);
}

export function getStyleTemplateAnalysisTask(templateId: string, taskId: string): Promise<StyleTemplateAnalysisTaskDetail> {
  return request<StyleTemplateAnalysisTaskDetail>(`/style-templates/${templateId}/analysis-tasks/${taskId}`);
}

export function deleteStyleTemplate(templateId: string): Promise<void> {
  return request<void>(`/style-templates/${templateId}`, {
    method: "DELETE",
  });
}
