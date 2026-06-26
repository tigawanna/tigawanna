import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { ClientOnly } from "@/components/wrappers/ClientOnly";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { BackstageRepoPageFallback } from "./-components/BackstageRepoPageFallback";

const BackstageReposContent = lazy(() =>
  import("./-components/BackstageReposContent").then((module) => ({
    default: module.BackstageReposContent,
  })),
);

export const Route = createFileRoute("/_backstage/backstage/repos")({
  beforeLoad: ({ context }) => {
    if (!isAdminUser(context.viewer)) {
      throw redirect({ to: "/backstage" });
    }
  },
  component: BackstageReposPage,
});

function BackstageReposPage() {
  return (
    <ClientOnly fallback={<BackstageRepoPageFallback />}>
      <Suspense fallback={<BackstageRepoPageFallback />}>
        <BackstageReposContent />
      </Suspense>
    </ClientOnly>
  );
}
