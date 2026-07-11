import { ClientOnly } from "@/components/wrappers/ClientOnly";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { z } from "zod";
import { BackstageRepoPageFallback } from "../-components/shared/BackstageRepoPageFallback";

export const backstageProjectsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  sq: z.string().optional(),
  sortBy: z
    .enum(["repoFullName", "lastGithubSyncAt", "attendance", "updatedAt", "createdAt"])
    .optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export type BackstageProjectsSearch = z.infer<typeof backstageProjectsSearchSchema>;

const BackstageProjectsContent = lazy(() =>
  import("../-components/projects/BackstageProjectsContent").then((module) => ({
    default: module.BackstageProjectsContent,
  })),
);

export const Route = createFileRoute("/_backstage/backstage/projects/")({
  validateSearch: (search) => backstageProjectsSearchSchema.parse(search),
  beforeLoad: ({ context }) => {
    if (context.viewer?.role !== "admin") {
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
