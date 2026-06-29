import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listProjectRepos } from "@/modules/backstage/projects.functions";
import { removeProjectRepo } from "@/modules/backstage/projects.functions";
import { getTanstackQueryContext } from "@/lib/tanstack/query/query-provider";
import type { BackstageProject } from "@/types/backstage";
import { BasicIndex, createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

const { queryClient } = getTanstackQueryContext();

export const backstageProjectsCollection = createCollection(
  queryCollectionOptions({
    id: "backstage-projects",
    queryKey: [queryKeyPrefixes.backstage, "projects"],
    queryFn: () => listProjectRepos(),
    queryClient,
    defaultIndexType: BasicIndex,
    getKey: (item: BackstageProject) => item.githubRepoId,
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          removeProjectRepo({ data: { repoFullName: mutation.original.repoFullName } }),
        ),
      );
      await backstageProjectsCollection.utils.refetch();
    },
  }),
);

backstageProjectsCollection.createIndex((row) => row.repoFullName);
