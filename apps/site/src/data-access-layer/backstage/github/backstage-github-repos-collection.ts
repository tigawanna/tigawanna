import { backstageProjectsCollection } from "@/data-access-layer/backstage/projects/backstage-projects-collection";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import {
  attachTanstackDbCollectionLogging,
  withCollectionDeleteLogging,
  withCollectionQueryLogging,
  withCollectionUpdateLogging,
} from "@/lib/tanstack/db/collection-logging";
import { getTanstackQueryContext } from "@/lib/tanstack/query/query-provider";
import {
  deleteGithubRepoForBackstage,
  listGithubReposForBackstage,
  setGithubRepoVisibilityForBackstage,
} from "@/modules/backstage/github-repos.functions";
import type { BackstageGithubRepo } from "@/types/backstage";
import { unwrapUnknownError } from "@/utils/errors";
import { BasicIndex, createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

const { queryClient } = getTanstackQueryContext();
const COLLECTION_ID = "backstage-github-repos";

export const backstageGithubReposCollection = createCollection(
  queryCollectionOptions({
    id: COLLECTION_ID,
    queryKey: [queryKeyPrefixes.backstage, "github-repos"],
    queryFn: withCollectionQueryLogging(COLLECTION_ID, () => listGithubReposForBackstage()),
    select: (data) => data.repos,
    queryClient,
    defaultIndexType: BasicIndex,
    getKey: (item: BackstageGithubRepo) => item.nameWithOwner,
    onUpdate: withCollectionUpdateLogging(COLLECTION_ID, async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) => {
          const visibility = mutation.modified.isPrivate ? "private" : "public";
          return setGithubRepoVisibilityForBackstage({
            data: { repoFullName: mutation.original.nameWithOwner, visibility },
          });
        }),
      );
      await backstageGithubReposCollection.utils.refetch();
    }),
    onDelete: withCollectionDeleteLogging(COLLECTION_ID, async ({ transaction }) => {
      try {
        await Promise.all(
          transaction.mutations.map((mutation) =>
            deleteGithubRepoForBackstage({ data: { repoFullName: String(mutation.key) } }),
          ),
        );
        await Promise.all([
          backstageGithubReposCollection.utils.refetch(),
          backstageProjectsCollection.utils.refetch(),
        ]);
      } catch (err: unknown) {
        throw unwrapUnknownError(err);
      }
    }),
  }),
);

backstageGithubReposCollection.createIndex((row) => row.nameWithOwner);
attachTanstackDbCollectionLogging(backstageGithubReposCollection, COLLECTION_ID);
