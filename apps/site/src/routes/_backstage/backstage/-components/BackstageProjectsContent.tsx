import {
  backstageGithubReposCollection,
  backstageProjectsCollection,
} from "@/data-access-layer/backstage/collections";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { eq } from "@tanstack/db";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { BackstageProjectRow } from "./BackstageProjectRow";

export function BackstageProjectsContent() {
  const { data: projects } = useLiveSuspenseQuery((q) =>
    q
      .from({ projects: backstageProjectsCollection })
      .leftJoin({ github: backstageGithubReposCollection }, ({ projects, github }) =>
        eq(projects.repoFullName, github.nameWithOwner),
      )
      .select(({ projects, github }) => ({
        project: projects,
        isPrivate: github == null ? null : github.isPrivate,
      })),
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6" data-test="backstage-projects">
      <Card data-test="backstage-projects-debug">
        <CardHeader>
          <CardTitle>Live query results (experiment)</CardTitle>
          <CardDescription>Raw rows from the inline join query.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-base-200 max-h-96 overflow-auto rounded-lg p-4 text-xs">
            {JSON.stringify(projects, null, 2)}
          </pre>
        </CardContent>
      </Card>
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
            {projects.map((row) => (
              <BackstageProjectRow
                key={row.project.githubRepoId}
                project={row.project}
                isPrivate={row.isPrivate ?? null}
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
