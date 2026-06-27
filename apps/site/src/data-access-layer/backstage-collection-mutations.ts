import { backstageGithubReposCollection } from "@/data-access-layer/backstage-github-repos-collection";
import { backstageProjectsCollection } from "@/data-access-layer/backstage-projects-collection";
import { importProjectRepo } from "@/modules/backstage/projects.functions";
import { createOptimisticAction } from "@tanstack/db";

export type ImportBackstageProjectInput = {
  repoFullName: string;
  runEnrichment: boolean;
};

export const importBackstageProject = createOptimisticAction<ImportBackstageProjectInput>({
  onMutate: () => {},
  mutationFn: async (input) => {
    await importProjectRepo({ data: input });
    await Promise.all([
      backstageProjectsCollection.utils.refetch(),
      backstageGithubReposCollection.utils.refetch(),
    ]);
  },
});

export async function removeBackstageProject(githubRepoId: string) {
  const tx = backstageProjectsCollection.delete(githubRepoId);
  await tx.isPersisted.promise;
}

export async function setBackstageRepoVisibility(
  nameWithOwner: string,
  visibility: "public" | "private",
) {
  const tx = backstageGithubReposCollection.update(nameWithOwner, (draft) => {
    draft.isPrivate = visibility === "private";
  });
  await tx.isPersisted.promise;
}

export async function deleteBackstageGithubRepo(nameWithOwner: string) {
  const tx = backstageGithubReposCollection.delete(nameWithOwner);
  await tx.isPersisted.promise;
}
