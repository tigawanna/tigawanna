export type EnrichmentRunParams = {
  runId: string;
  trigger: "initial" | "scheduled" | "manual";
  limit?: number;
  repos?: string[];
  force?: boolean;
  runEnrichment?: boolean;
  runEmbedding?: boolean;
  skipEmbeddingIfComplete?: boolean;
  forceEmbedding?: boolean;
};
