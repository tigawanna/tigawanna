/** Queue for metadata list + upsert jobs. */
export const GITHUB_SYNC_QUEUE = "github-sync";

/**
 * Queue for rare manual enrichment workflows (not cron'd / not bulk-enqueued).
 */
export const GITHUB_ENRICH_QUEUE = "github-enrich";

/** Delay before retrying enrich after an explicit GitHub 429. */
export const ENRICH_429_DELAY_MS = 20 * 60_000;
