/** Enrichment flags shared by single and bulk project import. */
export type ImportEnrichmentOptions = {
  runEnrichment: boolean;
  forceEnrichment: boolean;
};

/** Options passed when importing one GitHub repo into backstage projects. */
export type ImportProjectOptions = ImportEnrichmentOptions & {
  repoFullName: string;
};

/** Options passed when bulk-importing multiple repos. */
export type BulkImportProjectOptions = ImportEnrichmentOptions & {
  repoFullNames: string[];
};

/** Default enrichment flags for a single-repo import (always re-enrich). */
export function defaultSingleImportEnrichmentOptions(): ImportEnrichmentOptions {
  return {
    runEnrichment: true,
    forceEnrichment: true,
  };
}

/** Default enrichment flags for bulk import (skip complete repos unless forced). */
export function defaultBulkImportEnrichmentOptions(): ImportEnrichmentOptions {
  return {
    runEnrichment: true,
    forceEnrichment: false,
  };
}
