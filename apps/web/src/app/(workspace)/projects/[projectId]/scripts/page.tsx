import { ProjectScriptScreen } from "@/features/scripts/project-script-screen";

type ProjectScriptsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectScriptsPage({ params }: ProjectScriptsPageProps) {
  const { projectId } = await params;
  return <ProjectScriptScreen projectId={projectId} />;
}
