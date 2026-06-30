import { backstageGithubReposCollection } from "@/data-access-layer/backstage/backstage-github-repos-collection";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/backstage-projects-collection";
import { deleteGithubRepoForBackstage } from "@/modules/backstage/github-repos.functions";
import { importProjectRepo } from "@/modules/backstage/projects.functions";
import { logTanstackDbCollection } from "@/lib/tanstack/db/collection-logging";
import { unwrapUnknownError } from "@/utils/errors";
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
  logTanstackDbCollection("backstage-projects", "mutation:remove:start", { githubRepoId });
  const tx = backstageProjectsCollection.delete(githubRepoId);
  await tx.isPersisted.promise;
  logTanstackDbCollection("backstage-projects", "mutation:remove:persisted", { githubRepoId });
}

export async function setBackstageRepoVisibility(
  nameWithOwner: string,
  visibility: "public" | "private",
) {
  logTanstackDbCollection("backstage-github-repos", "mutation:visibility:start", {
    nameWithOwner,
    visibility,
  });
  const tx = backstageGithubReposCollection.update(nameWithOwner, (draft) => {
    draft.isPrivate = visibility === "private";
  });
  await tx.isPersisted.promise;
  logTanstackDbCollection("backstage-github-repos", "mutation:visibility:persisted", {
    nameWithOwner,
    visibility,
  });
}

export type DeleteBackstageGithubRepoOptions = {
  overridePat?: string;
};

/**
 * Deletes a GitHub repository and removes it from backstage collections.
 *
 * @param nameWithOwner - GitHub `owner/repo` identifier.
 * @param options - Optional override PAT for admin-privileged deletion.
 */
export async function deleteBackstageGithubRepo(
  nameWithOwner: string,
  options?: DeleteBackstageGithubRepoOptions,
) {
  logTanstackDbCollection("backstage-github-repos", "mutation:delete:start", {
    nameWithOwner,
    hasOverridePat: Boolean(options?.overridePat),
  });

  if (options?.overridePat) {
    try {
      await deleteGithubRepoForBackstage({
        data: { repoFullName: nameWithOwner, overridePat: options.overridePat },
      });
      await Promise.all([
        backstageGithubReposCollection.utils.refetch(),
        backstageProjectsCollection.utils.refetch(),
      ]);
      logTanstackDbCollection("backstage-github-repos", "mutation:delete:override-complete", {
        nameWithOwner,
      });
    } catch (err: unknown) {
      throw unwrapUnknownError(err);
    }
    return;
  }

  try {
    const tx = backstageGithubReposCollection.delete(nameWithOwner);
    await tx.isPersisted.promise;
    logTanstackDbCollection("backstage-github-repos", "mutation:delete:persisted", {
      nameWithOwner,
    });
  } catch (err: unknown) {
    throw unwrapUnknownError(err);
  }
}
