import { characters } from "@/data/mock/characters";
import { CharacterCard, type CharacterCardData } from "./CharacterCard";

type CharacterGridProps = {
  characters?: CharacterCardData[];
};

export function CharacterGrid({
  characters: characterItems = characters,
}: CharacterGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {characterItems.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </div>
  );
}
