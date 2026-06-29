import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { backstageGithubReposCollection } from "@/data-access-layer/backstage/backstage-github-repos-collection";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { FolderCodeIcon, Loader } from "lucide-react";

export function ProjectsList() {
  const { data, isLoading } = useLiveQuery((q) =>
    q
      .from({ github: backstageGithubReposCollection })
      .leftJoin({ projects: backstageGithubReposCollection }, ({ github, projects }) =>
        eq(github.nameWithOwner, projects.nameWithOwner),
      )
      .select(({ github, projects }) => ({
        github,
        projects,
      })),
  );
  if (isLoading)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );
  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCodeIcon />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any projects yet. Get started by creating your first project.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button>Create Project</Button>
          <Button variant="outline">Import Project</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {data.map((project) => (
        <div
          key={project.github.nameWithOwner}
          className="w-full h-full flex flex-col items-center justify-center"
        >
          <h2>{project.github.nameWithOwner}</h2>
          <p>{project.github.description}</p>
        </div>
      ))}
    </div>
  );
}
