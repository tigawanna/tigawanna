import { backstageGithubReposCollection } from "@/data-access-layer/backstage/github/backstage-github-repos-collection";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/projects/backstage-projects-collection";
import { deleteGithubRepoForBackstage } from "@/modules/backstage/github-repos.functions";
import { importAllProjectRepos, importProjectRepo } from "@/modules/backstage/projects.functions";
import { unwrapUnknownError } from "@/utils/errors";

export type ImportBackstageProjectInput = {
  repoFullName: string;
  runEnrichment: boolean;
  forceEnrichment: boolean;
};

export type BulkImportBackstageProjectsInput = {
  repoFullNames: string[];
  runEnrichment: boolean;
  forceEnrichment: boolean;
};

/**
 * Imports a single GitHub repo into backstage projects and refetches collections.
 *
 * @param input - Repo full name and enrichment flags.
 */
export async function importBackstageProject(input: ImportBackstageProjectInput) {
  try {
    const result = await importProjectRepo({ data: input });
    await Promise.all([
      backstageProjectsCollection.utils.refetch(),
      backstageGithubReposCollection.utils.refetch(),
    ]);
    return result;
  } catch (err: unknown) {
    throw unwrapUnknownError(err);
  }
}

/**
 * Bulk-imports repos and optionally runs one shared enrichment pass.
 */
export async function bulkImportBackstageProjects(input: BulkImportBackstageProjectsInput) {
  try {
    const result = await importAllProjectRepos({ data: input });
    await Promise.all([
      backstageProjectsCollection.utils.refetch(),
      backstageGithubReposCollection.utils.refetch(),
    ]);
    return result;
  } catch (err: unknown) {
    throw unwrapUnknownError(err);
  }
}

/**
 * Refetches TanStack DB collections backed by backstage project and GitHub repo queries.
 */
export async function refetchBackstageProjectCollections() {
  await Promise.all([
    backstageProjectsCollection.utils.refetch(),
    backstageGithubReposCollection.utils.refetch(),
  ]);
}

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
  if (options?.overridePat) {
    try {
      await deleteGithubRepoForBackstage({
        data: { repoFullName: nameWithOwner, overridePat: options.overridePat },
      });
      await Promise.all([
        backstageGithubReposCollection.utils.refetch(),
        backstageProjectsCollection.utils.refetch(),
      ]);
    } catch (err: unknown) {
      throw unwrapUnknownError(err);
    }
    return;
  }

  try {
    const tx = backstageGithubReposCollection.delete(nameWithOwner);
    await tx.isPersisted.promise;
  } catch (err: unknown) {
    throw unwrapUnknownError(err);
  }
}
