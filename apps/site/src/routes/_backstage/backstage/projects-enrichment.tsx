import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_backstage/backstage/projects-enrichment")({
  beforeLoad: () => {
    throw redirect({ to: "/backstage/workflow" });
  },
});
