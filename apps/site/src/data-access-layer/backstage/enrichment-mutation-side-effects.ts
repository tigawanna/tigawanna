import { refetchBackstageProjectCollections } from "@/data-access-layer/backstage/backstage-collection-mutations";
import { queryKeyPrefixes } from "@/data-access-layer/query-keys";

type QueryKeyPrefix = (typeof queryKeyPrefixes)[keyof typeof queryKeyPrefixes];
type BackstageEnrichmentInvalidatesKey = [QueryKeyPrefix, ...(readonly unknown[])];

/** Query keys invalidated after enrichment approve/reject mutations. */
export const backstageEnrichmentMutationInvalidates: BackstageEnrichmentInvalidatesKey[] = [
  [queryKeyPrefixes.backstage, "github-repos"],
  [queryKeyPrefixes.backstage, "projects"],
  [queryKeyPrefixes.backstage, "project-enrichment"],
];

/**
 * Builds invalidation keys for enrichment mutations that affect one project detail view.
 */
export function backstageEnrichmentMutationInvalidatesForRepo(
  repoFullName: string,
): BackstageEnrichmentInvalidatesKey[] {
  return [
    ...backstageEnrichmentMutationInvalidates,
    [queryKeyPrefixes.backstage, "projects", "detail", repoFullName],
  ];
}

/**
 * Refetches TanStack DB collections after enrichment mutations so list badges update.
 */
export async function afterBackstageEnrichmentMutation() {
  await refetchBackstageProjectCollections();
}
