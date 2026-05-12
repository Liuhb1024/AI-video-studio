import type { Character, CharacterImportResult, CharacterListResult, CharacterReferenceAsset } from "@/features/characters/types";

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

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function requestForm<T>(path: string, formData: FormData, method = "POST"): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload && typeof payload.detail === "string" ? payload.detail : `Request failed: ${response.status}`;
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export function listCharacters(query?: string): Promise<Character[]> {
  const search = query ? `?query=${encodeURIComponent(query)}` : "";
  return request<Character[]>(`/characters/${search}`);
}

export function listCharactersPaginated(params: {
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<CharacterListResult> {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("page_size", String(params.pageSize));
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<CharacterListResult>(`/characters/paginated${suffix}`);
}

export function getCharacter(characterId: string): Promise<Character> {
  return request<Character>(`/characters/${characterId}`);
}

export function createCharacter(payload: Partial<Character> & { name: string }): Promise<Character> {
  return request<Character>("/characters/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function importYinggeBible(filePath: string): Promise<CharacterImportResult> {
  return request<CharacterImportResult>("/characters/import-yingge-bible", {
    method: "POST",
    body: JSON.stringify({ file_path: filePath }),
  });
}

export function listCharacterReferences(characterId: string, params?: { referenceType?: string; includeDeleted?: boolean }): Promise<CharacterReferenceAsset[]> {
  const search = new URLSearchParams();
  if (params?.referenceType) search.set("reference_type", params.referenceType);
  if (params?.includeDeleted) search.set("include_deleted", "true");
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<CharacterReferenceAsset[]>(`/characters/${characterId}/references${suffix}`);
}

export function listCharacterGeneratedAssets(characterId: string, params?: { generationType?: string; includeDeleted?: boolean }): Promise<CharacterReferenceAsset[]> {
  const search = new URLSearchParams();
  if (params?.generationType) search.set("generation_type", params.generationType);
  if (params?.includeDeleted) search.set("include_deleted", "true");
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<CharacterReferenceAsset[]>(`/characters/${characterId}/generated-assets${suffix}`);
}

export function updateCharacterGeneratedAsset(
  characterId: string,
  assetId: string,
  payload: Partial<Pick<CharacterReferenceAsset, "accepted_for_keyframe" | "status" | "quality_note" | "title" | "note">>,
): Promise<CharacterReferenceAsset> {
  return request<CharacterReferenceAsset>(`/characters/${characterId}/generated-assets/${assetId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function promoteCharacterGeneratedAssetToReference(
  characterId: string,
  assetId: string,
): Promise<CharacterReferenceAsset> {
  return request<CharacterReferenceAsset>(`/characters/${characterId}/generated-assets/${assetId}/promote-to-reference`, {
    method: "POST",
  });
}

export function uploadCharacterReference(params: {
  characterId: string;
  file: File;
  referenceType: string;
  title?: string;
  note?: string;
  styleBoard?: string;
  isPrimary?: boolean;
}): Promise<CharacterReferenceAsset> {
  const formData = new FormData();
  formData.set("file", params.file);
  formData.set("reference_type", params.referenceType);
  if (params.title) formData.set("title", params.title);
  if (params.note) formData.set("note", params.note);
  if (params.styleBoard) formData.set("style_board", params.styleBoard);
  formData.set("is_primary", String(Boolean(params.isPrimary)));
  return requestForm<CharacterReferenceAsset>(`/characters/${params.characterId}/references`, formData);
}

export function updateCharacterReference(
  characterId: string,
  assetId: string,
  payload: Partial<Pick<CharacterReferenceAsset, "title" | "note" | "style_board" | "is_primary">>,
): Promise<CharacterReferenceAsset> {
  return request<CharacterReferenceAsset>(`/characters/${characterId}/references/${assetId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCharacterReference(characterId: string, assetId: string): Promise<void> {
  return request<void>(`/characters/${characterId}/references/${assetId}`, {
    method: "DELETE",
  });
}

export function replaceCharacterReferenceFile(params: {
  characterId: string;
  assetId: string;
  file: File;
  title?: string;
  note?: string;
}): Promise<CharacterReferenceAsset> {
  const formData = new FormData();
  formData.set("file", params.file);
  if (params.title) formData.set("title", params.title);
  if (params.note) formData.set("note", params.note);
  return requestForm<CharacterReferenceAsset>(`/characters/${params.characterId}/references/${params.assetId}/file`, formData, "PUT");
}

export function restoreCharacterReference(characterId: string, assetId: string): Promise<CharacterReferenceAsset> {
  return request<CharacterReferenceAsset>(`/characters/${characterId}/references/${assetId}/restore`, {
    method: "POST",
  });
}
