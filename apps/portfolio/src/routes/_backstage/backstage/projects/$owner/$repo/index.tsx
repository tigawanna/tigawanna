import { ClientOnly } from "@/components/wrappers/ClientOnly";
import { backstageProjectDetailQueryOptions } from "@/data-access-layer/backstage/projects/projects-query-options";
import { BackstageProjectDetailContent } from "@/routes/_backstage/backstage/-components/projects/BackstageProjectDetailContent";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { BackstagePending } from "../../../-components/shared/BackstagePending";

export const Route = createFileRoute("/_backstage/backstage/projects/$owner/$repo/")({
  beforeLoad: ({ context }) => {
    if (context.viewer?.role !== "admin") {
      throw redirect({ to: "/backstage" });
    }
  },
  loader: async ({ context, params }) => {
    const repoFullName = `${params.owner}/${params.repo}`;

    try {
      await context.queryClient.ensureQueryData(backstageProjectDetailQueryOptions(repoFullName));
    } catch {
      throw redirect({ to: "/backstage/projects" });
    }
  },
  component: BackstageProjectDetailPage,
});

function BackstageProjectDetailPage() {
  const { owner, repo } = Route.useParams();
  const repoFullName = `${owner}/${repo}`;

  return (
    <ClientOnly fallback={<BackstagePending />}>
      <Suspense fallback={<BackstagePending />}>
        <BackstageProjectDetailContent repoFullName={repoFullName} />
      </Suspense>
    </ClientOnly>
  );
}
