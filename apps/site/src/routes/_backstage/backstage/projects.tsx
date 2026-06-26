import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_backstage/backstage/projects")({
  beforeLoad: ({ context }) => {
    if (!isAdminUser(context.viewer)) {
      throw redirect({ to: "/backstage" });
    }
  },
  component: BackstageProjectsPage,
});

function BackstageProjectsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6" data-test="backstage-projects">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Featured projects</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          Drag-and-drop ordering will land here. For now, pinned repos still come from static data.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            D1-backed project ordering is wired up in the schema. UI controls are next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base-content/60 text-sm">
            The featured_projects table is ready. You can seed rows manually until the reorder UI
            ships.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
