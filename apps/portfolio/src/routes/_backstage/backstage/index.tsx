import { backstageDashboardCountsQueryOptions } from "@/data-access-layer/backstage/shared-query-options";
import { BackstageHomeContent } from "@/routes/_backstage/backstage/-components/home/BackstageHomeContent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_backstage/backstage/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(backstageDashboardCountsQueryOptions),
  component: BackstageHomePage,
});

function BackstageHomePage() {
  return <BackstageHomeContent />;
}
