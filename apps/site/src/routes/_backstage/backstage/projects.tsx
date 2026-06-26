import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import {
  backstageGithubReposQueryOptions,
  backstageProjectsQueryOptions,
} from "@/data-access-layer/backstage/projects-query-options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BackstageProjectRow } from "./-components/BackstageProjectRow";

export const Route = createFileRoute("/_backstage/backstage/projects")({
  beforeLoad: ({ context }) => {
    if (!isAdminUser(context.viewer)) {
      throw redirect({ to: "/backstage" });
    }
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(backstageProjectsQueryOptions),
      context.queryClient.ensureQueryData(backstageGithubReposQueryOptions),
    ]),
  component: BackstageProjectsPage,
});

function BackstageProjectsPage() {
  const { data: projects } = useSuspenseQuery(backstageProjectsQueryOptions);
  const { data: githubData } = useSuspenseQuery(backstageGithubReposQueryOptions);

  const visibilityByRepo = new Map(
    githubData.repos.map((repo) => [repo.nameWithOwner, repo.isPrivate] as const),
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-projects">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-base-content/60 mt-2 text-sm">
            Repos imported into the database. Import more from{" "}
            <Link to="/backstage/repos" className="link link-hover">
              Repos
            </Link>{" "}
            or run enrichment from{" "}
            <Link to="/backstage/workflow" className="link link-hover">
              Workflow
            </Link>
            .
          </p>
        </div>
        <Link to="/backstage/repos" className="btn btn-primary btn-sm">
          Import repos
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>Import repos from GitHub to start tracking them here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/backstage/repos" className="btn btn-primary btn-sm">
              Browse GitHub repos
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All projects</CardTitle>
            <CardDescription>{projects.length} repos in the database</CardDescription>
          </CardHeader>
          <CardContent className="divide-base-content/10 divide-y rounded-lg border border-base-content/10 p-0">
            {projects.map((project) => (
              <BackstageProjectRow
                key={project.githubRepoId}
                project={project}
                isPrivate={visibilityByRepo.get(project.repoFullName) ?? null}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Featured ordering</CardTitle>
          <CardDescription>
            Drag-and-drop ordering will land here. Pinned repos on the site still come from GitHub
            until this UI ships.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base-content/60 text-sm">
            The featured_projects table is ready in SQLite. Seed rows manually until reorder
            controls are available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
