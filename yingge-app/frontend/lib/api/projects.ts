import { apiGet } from "./client";
import type {
  ApiAsset,
  ApiCostRecord,
  ApiExportPlan,
  ApiGenerationTask,
  ApiProject,
} from "./types";

export function getProjects() {
  return apiGet<ApiProject[]>("/api/v1/projects");
}

export function getProject(projectId: string) {
  return apiGet<ApiProject>(`/api/v1/projects/${projectId}`);
}

export function getProjectTasks(projectId: string) {
  return apiGet<ApiGenerationTask[]>(`/api/v1/projects/${projectId}/tasks`);
}

export function getProjectAssets(projectId: string) {
  return apiGet<ApiAsset[]>(`/api/v1/projects/${projectId}/assets`);
}

export function getProjectCosts(projectId: string) {
  return apiGet<ApiCostRecord[]>(`/api/v1/projects/${projectId}/costs`);
}

export function getProjectExportPlan(projectId: string) {
  return apiGet<ApiExportPlan>(`/api/v1/projects/${projectId}/export-plan`);
}

