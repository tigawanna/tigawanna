import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_backstage/backstage/")({
  component: BackstageHomePage,
});

function BackstageHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6" data-test="backstage-admin-home">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Backstage</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          Manage contact messages, journal entries, imported projects, and enrichment workflows.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>Contact form submissions saved to D1.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/backstage/messages" className="btn btn-primary btn-sm">
              View messages
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Repos imported into the database.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link to="/backstage/projects" className="btn btn-primary btn-sm">
              View projects
            </Link>
            <Link to="/backstage/repos" className="btn btn-ghost btn-sm">
              Import repos
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Journal</CardTitle>
            <CardDescription>
              Today-I-learned entries for the landing page and /lessons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/backstage/journal" className="btn btn-primary btn-sm">
              Manage journal
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
            <CardDescription>Enrichment runs and metadata review.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/backstage/workflow" className="btn btn-primary btn-sm">
              Open workflow
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
