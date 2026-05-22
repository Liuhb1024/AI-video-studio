import { apiGet } from "./client";
import type { ApiCharacter, ApiCharacterBible } from "./types";

export function getCharacters() {
  return apiGet<ApiCharacter[]>("/api/v1/characters");
}

export function getCharacter(characterId: string) {
  return apiGet<ApiCharacter>(`/api/v1/characters/${characterId}`);
}

export function getCharacterBible(characterId: string) {
  return apiGet<ApiCharacterBible>(`/api/v1/characters/${characterId}/bible`);
}

