import { backstageGithubReposCollection } from "@/data-access-layer/backstage/github/backstage-github-repos-collection";
import { backstageProjectsCollection } from "@/data-access-layer/backstage/projects/backstage-projects-collection";
import { logTanstackDbCollection } from "@/lib/tanstack/db/collection-logging";
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
 * @param input - Repo full name and workflow flags.
 */
export async function importBackstageProject(input: ImportBackstageProjectInput) {
  logTanstackDbCollection("backstage-projects", "mutation:import:start", {
    repoFullName: input.repoFullName,
    runEnrichment: input.runEnrichment,
  });

  try {
    const result = await importProjectRepo({ data: input });
    await Promise.all([
      backstageProjectsCollection.utils.refetch(),
      backstageGithubReposCollection.utils.refetch(),
    ]);
    logTanstackDbCollection("backstage-projects", "mutation:import:complete", {
      repoFullName: input.repoFullName,
      runId: result.runId,
    });
    return result;
  } catch (err: unknown) {
    throw unwrapUnknownError(err);
  }
}

/**
 * Bulk-imports repos and starts one shared enrichment workflow.
 */
export async function bulkImportBackstageProjects(input: BulkImportBackstageProjectsInput) {
  logTanstackDbCollection("backstage-projects", "mutation:bulk-import:start", {
    repoCount: input.repoFullNames.length,
    forceEnrichment: input.forceEnrichment,
  });

  try {
    const result = await importAllProjectRepos({ data: input });
    await Promise.all([
      backstageProjectsCollection.utils.refetch(),
      backstageGithubReposCollection.utils.refetch(),
    ]);
    logTanstackDbCollection("backstage-projects", "mutation:bulk-import:complete", {
      repoCount: result.importedCount,
      runId: result.runId,
    });
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
