export type EnrichmentRunParams = {
  runId: string;
  trigger: "initial" | "scheduled" | "manual";
  limit?: number;
  repos?: string[];
  force?: boolean;
};
