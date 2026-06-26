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
          Manage contact messages and featured project ordering.
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
            <CardDescription>Control which repos appear first on the landing page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/backstage/projects" className="btn btn-primary btn-sm">
              Manage projects
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
