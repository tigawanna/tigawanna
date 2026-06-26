import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { ClientOnly } from "@/components/wrappers/ClientOnly";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { z } from "zod";
import { BackstageRepoPageFallback } from "./-components/BackstageRepoPageFallback";

export const backstageReposSearchSchema = z.object({
  sq: z.string().optional(),
  sortBy: z.enum(["nameWithOwner", "name", "pushedAt", "stargazerCount", "forkCount"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  tracked: z.enum(["all", "tracked", "untracked"]).optional(),
  visibility: z.enum(["all", "public", "private"]).optional(),
  archived: z.enum(["all", "active", "archived"]).optional(),
});

export type BackstageReposSearch = z.infer<typeof backstageReposSearchSchema>;

const BackstageReposContent = lazy(() =>
  import("./-components/BackstageReposContent").then((module) => ({
    default: module.BackstageReposContent,
  })),
);

export const Route = createFileRoute("/_backstage/backstage/repos")({
  validateSearch: (search) => backstageReposSearchSchema.parse(search),
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
