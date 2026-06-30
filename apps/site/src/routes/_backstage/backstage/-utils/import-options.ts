/** Workflow flags shared by single and bulk project import. */
export type ImportWorkflowOptions = {
  runEnrichment: boolean;
  forceEnrichment: boolean;
  runEmbedding: boolean;
  skipEmbeddingIfComplete: boolean;
  forceEmbedding: boolean;
};

/** Options passed when importing one GitHub repo into backstage projects. */
export type ImportProjectOptions = ImportWorkflowOptions & {
  repoFullName: string;
};

/** Options passed when bulk-importing multiple repos. */
export type BulkImportProjectOptions = ImportWorkflowOptions & {
  repoFullNames: string[];
};

/** Default workflow flags for a single-repo import (always re-enrich). */
export function defaultSingleImportWorkflowOptions(
  serverEmbeddingAvailable: boolean,
): ImportWorkflowOptions {
  return {
    runEnrichment: true,
    forceEnrichment: true,
    runEmbedding: serverEmbeddingAvailable,
    skipEmbeddingIfComplete: true,
    forceEmbedding: false,
  };
}

/** Default workflow flags for bulk import (skip complete repos unless forced). */
export function defaultBulkImportWorkflowOptions(
  serverEmbeddingAvailable: boolean,
): ImportWorkflowOptions {
  return {
    runEnrichment: true,
    forceEnrichment: false,
    runEmbedding: serverEmbeddingAvailable,
    skipEmbeddingIfComplete: true,
    forceEmbedding: false,
  };
}
