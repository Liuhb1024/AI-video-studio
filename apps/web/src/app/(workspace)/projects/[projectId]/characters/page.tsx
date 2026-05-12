import { ProjectCharactersScreen } from "@/features/projects/project-characters-screen";

type ProjectCharactersPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectCharactersPage({ params }: ProjectCharactersPageProps) {
  const { projectId } = await params;
  return <ProjectCharactersScreen projectId={projectId} />;
}
