import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { listProjectRepos } from "@/modules/backstage/projects.functions";
import { removeProjectRepo } from "@/modules/backstage/projects.functions";
import { getTanstackQueryContext } from "@/lib/tanstack/query/query-provider";
import {
  attachTanstackDbCollectionLogging,
  withCollectionDeleteLogging,
  withCollectionQueryLogging,
} from "@/lib/tanstack/db/collection-logging";
import type { BackstageProject } from "@/types/backstage";
import { BasicIndex, createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

const { queryClient } = getTanstackQueryContext();
const COLLECTION_ID = "backstage-projects";

export const backstageProjectsCollection = createCollection(
  queryCollectionOptions({
    id: COLLECTION_ID,
    queryKey: [queryKeyPrefixes.backstage, "projects"],
    queryFn: withCollectionQueryLogging(COLLECTION_ID, () =>
      listProjectRepos({ data: { page: 1, perPage: 500 } }),
    ),
    select: (data) => data.items,
    queryClient,
    defaultIndexType: BasicIndex,
    getKey: (item: BackstageProject) => item.githubRepoId,
    onDelete: withCollectionDeleteLogging(COLLECTION_ID, async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          removeProjectRepo({ data: { repoFullName: mutation.original.repoFullName } }),
        ),
      );
      await backstageProjectsCollection.utils.refetch();
    }),
  }),
);

backstageProjectsCollection.createIndex((row) => row.repoFullName);
attachTanstackDbCollectionLogging(backstageProjectsCollection, COLLECTION_ID);
