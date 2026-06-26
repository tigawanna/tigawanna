import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { backstageProjectsQueryOptions } from "@/data-access-layer/backstage/projects-query-options";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export const Route = createFileRoute("/_backstage/backstage/projects")({
  beforeLoad: ({ context }) => {
    if (!isAdminUser(context.viewer)) {
      throw redirect({ to: "/backstage" });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(backstageProjectsQueryOptions),
  component: BackstageProjectsPage,
});

function attendanceLabel(attendance: string) {
  return attendance.replaceAll("_", " ");
}

function BackstageProjectsPage() {
  const { data: projects } = useSuspenseQuery(backstageProjectsQueryOptions);

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
              <div
                key={project.githubRepoId}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
                data-test="project-row"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={`https://github.com/${project.repoFullName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                  >
                    {project.repoFullName}
                  </a>
                  <p className="text-base-content/60 mt-1 text-sm">
                    {project.currentDescription || "(no description)"}
                  </p>
                  {project.currentTopics.length > 0 ? (
                    <p className="text-base-content/45 mt-1 text-xs">
                      {project.currentTopics.join(" · ")}
                    </p>
                  ) : null}
                  <p className="text-base-content/40 mt-2 text-xs">
                    {attendanceLabel(project.attendance)} · synced{" "}
                    {format(new Date(project.lastGithubSyncAt), "PP")}
                  </p>
                </div>
                {project.currentHomepage ? (
                  <a
                    href={project.currentHomepage}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    Homepage
                  </a>
                ) : null}
              </div>
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
