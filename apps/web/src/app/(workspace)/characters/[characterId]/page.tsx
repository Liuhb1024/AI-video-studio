import { CharacterDetailScreen } from "@/features/characters/character-detail-screen";

type CharacterDetailPageProps = {
  params: Promise<{
    characterId: string;
  }>;
};

export default async function CharacterDetailPage({ params }: CharacterDetailPageProps) {
  const { characterId } = await params;
  return <CharacterDetailScreen characterId={characterId} />;
}
