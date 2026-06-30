/** Options passed when importing a GitHub repo into backstage projects. */
export type ImportProjectOptions = {
  repoFullName: string;
  runEnrichment: boolean;
  runEmbedding: boolean;
  skipEmbeddingIfComplete: boolean;
  forceEmbedding: boolean;
};
