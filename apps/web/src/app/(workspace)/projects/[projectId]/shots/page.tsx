import { ProjectShotsScreen } from "@/features/shots/project-shots-screen";

type ProjectShotsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectShotsPage({ params }: ProjectShotsPageProps) {
  const { projectId } = await params;
  return <ProjectShotsScreen projectId={projectId} />;
}
