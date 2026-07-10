export type EnrichmentRunParams = {
  runId: string;
  trigger: "initial" | "scheduled" | "manual";
  limit?: number;
  repos?: string[];
  force?: boolean;
  /** Collect GitHub artifacts into DB. Defaults to true. */
  runSpelunk?: boolean;
  /** Enrich from DB artifacts via OpenRouter. Defaults to true. */
  runEnrichment?: boolean;
};
