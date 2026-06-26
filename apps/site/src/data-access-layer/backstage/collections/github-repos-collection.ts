import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import {
  deleteGithubRepoForBackstage,
  listGithubReposForBackstage,
  setGithubRepoVisibilityForBackstage,
} from "@/lib/backstage/projects.functions";
import type { BackstageGithubRepo } from "@/types/backstage";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { backstageProjectsCollection } from "./projects-collection";

import { getTanstackQueryContext } from "@/lib/tanstack/query/query-provider";
const { queryClient } = getTanstackQueryContext();

export const backstageGithubReposCollection = createCollection(
  queryCollectionOptions({
    id: "backstage-github-repos",
    queryKey: [queryKeyPrefixes.backstage, "github-repos"],
    queryFn: () => listGithubReposForBackstage(),
    select: (data) => data.repos,
    queryClient,
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
