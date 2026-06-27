import { backstageProjectsCollection } from "@/data-access-layer/backstage-projects-collection";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import {
  deleteGithubRepoForBackstage,
  listGithubReposForBackstage,
  setGithubRepoVisibilityForBackstage,
} from "@/modules/backstage/projects.functions";
import { getTanstackQueryContext } from "@/lib/tanstack/query/query-provider";
import type { BackstageGithubRepo } from "@/types/backstage";
import { BasicIndex, createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

const { queryClient } = getTanstackQueryContext();

export const backstageGithubReposCollection = createCollection(
  queryCollectionOptions({
    id: "backstage-github-repos",
    queryKey: [queryKeyPrefixes.backstage, "github-repos"],
    queryFn: () => listGithubReposForBackstage(),
    select: (data) => data.repos,
    queryClient,
    defaultIndexType: BasicIndex,
    getKey: (item: BackstageGithubRepo) => item.nameWithOwner,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) => {
          const visibility = mutation.modified.isPrivate ? "private" : "public";
          return setGithubRepoVisibilityForBackstage({
            data: { repoFullName: mutation.original.nameWithOwner, visibility },
          });
        }),
      );
      await backstageGithubReposCollection.utils.refetch();
    },
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          deleteGithubRepoForBackstage({ data: { repoFullName: String(mutation.key) } }),
        ),
      );
      await Promise.all([
        backstageGithubReposCollection.utils.refetch(),
        backstageProjectsCollection.utils.refetch(),
      ]);
    },
  }),
);

backstageGithubReposCollection.createIndex((row) => row.nameWithOwner);
