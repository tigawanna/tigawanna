import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_backstage/backstage/projects/$owner/")({
  beforeLoad: () => {
    throw redirect({ to: "/backstage/projects" });
  },
});
