import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { ClientOnly } from "@/components/wrappers/ClientOnly";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { z } from "zod";
import { BackstageRepoPageFallback } from "../-components/shared/BackstageRepoPageFallback";

export const backstageProjectsSearchSchema = z.object({
  sq: z.string().optional(),
  sortBy: z
    .enum(["repoFullName", "lastGithubSyncAt", "createdAt", "updatedAt", "attendance"])
    .optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  visibility: z.enum(["all", "public", "private", "unknown"]).optional(),
});

export type BackstageProjectsSearch = z.infer<typeof backstageProjectsSearchSchema>;

// const BackstageProjectsContent = lazy(() =>
//   import("../-components/projects/BackstageProjectsContent").then((module) => ({
//     default: module.BackstageProjectsContent,
//   })),
// );
const BackstageProjects = lazy(() =>
  import("../-components/projects/BackstageProjects").then((module) => ({
    default: module.BackstageProjects,
  })),
);

export const Route = createFileRoute("/_backstage/backstage/projects/")({
  validateSearch: (search) => backstageProjectsSearchSchema.parse(search),
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
        <BackstageProjects />
      </Suspense>
    </ClientOnly>
  );
}
