import { projects } from "@/data/mock/projects";
import { ProjectCard, type DashboardProject } from "./ProjectCard";

function mapMockProject(project: (typeof projects)[number]): DashboardProject {
  return {
    ...project,
    title: project.title,
    stage: project.stage,
  };
}

type ProjectGridProps = {
  projects?: DashboardProject[];
};

export function ProjectGrid({ projects: projectItems }: ProjectGridProps) {
  const displayProjects = projectItems ?? projects.map(mapMockProject);

  return (
    <div className="grid grid-cols-2 gap-4">
      {displayProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
