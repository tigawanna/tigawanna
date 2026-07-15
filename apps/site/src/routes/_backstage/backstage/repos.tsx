import { ClientOnly } from "@/components/wrappers/ClientOnly";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { z } from "zod";
import { BackstegReposPending } from "./-components/repos/BackstageReposContent";

export const backstageReposSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  q: z.string().optional(),
  sortBy: z.enum(["nameWithOwner", "name", "pushedAt", "stargazerCount", "forkCount"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  visibility: z.enum(["all", "public", "private"]).optional(),
  archived: z.enum(["all", "active", "archived"]).optional(),
});

export type BackstageReposSearch = z.infer<typeof backstageReposSearchSchema>;

const BackstageReposContent = lazy(() =>
  import("./-components/repos/BackstageReposContent").then((module) => ({
    default: module.BackstageReposContent,
  })),
);

export const Route = createFileRoute("/_backstage/backstage/repos")({
  validateSearch: (search) => backstageReposSearchSchema.parse(search),
  beforeLoad: ({ context }) => {
    if (context.viewer?.role !== "admin") {
      throw redirect({ to: "/backstage" });
    }
  },
  component: BackstageReposPage,
});

function BackstageReposPage() {
  return (
    <ClientOnly fallback={<BackstegReposPending />}>
      <Suspense fallback={<BackstegReposPending />}>
        <BackstageReposContent />
      </Suspense>
    </ClientOnly>
  );
}
