import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { ClientOnly } from "@/components/wrappers/ClientOnly";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { BackstageRepoPageFallback } from "./-components/BackstageRepoPageFallback";

const BackstageProjectsContent = lazy(() =>
  import("./-components/BackstageProjectsContent").then((module) => ({
    default: module.BackstageProjectsContent,
  })),
);

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
    <ClientOnly fallback={<BackstageRepoPageFallback />}>
      <Suspense fallback={<BackstageRepoPageFallback />}>
        <BackstageProjectsContent />
      </Suspense>
    </ClientOnly>
  );
}
