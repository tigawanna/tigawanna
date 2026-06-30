import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { backstageProjectDetailQueryOptions } from "@/data-access-layer/backstage/projects-query-options";
import { ClientOnly } from "@/components/wrappers/ClientOnly";
import { BackstageProjectDetailContent } from "@/routes/_backstage/backstage/-components/projects/BackstageProjectDetailContent";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { BackstageRepoPageFallback } from "../../../-components/shared/BackstageRepoPageFallback";

export const Route = createFileRoute("/_backstage/backstage/projects/$owner/$repo/")({
  beforeLoad: ({ context }) => {
    if (!isAdminUser(context.viewer)) {
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
    <ClientOnly fallback={<BackstageRepoPageFallback />}>
      <Suspense fallback={<BackstageRepoPageFallback />}>
        <BackstageProjectDetailContent repoFullName={repoFullName} />
      </Suspense>
    </ClientOnly>
  );
}
