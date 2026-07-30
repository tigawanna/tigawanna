/** Queue for metadata list + upsert jobs. */
export const GITHUB_SYNC_QUEUE = "github-sync";

/** Queue for paced per-repo enrichment workflows. */
export const GITHUB_ENRICH_QUEUE = "github-enrich";

/** Stagger between enrich jobs enqueued by a metadata run (+5m × index). */
export const ENRICH_STAGGER_MS = 5 * 60_000;

/** Delay before retrying enrich after an explicit GitHub 429. */
export const ENRICH_429_DELAY_MS = 20 * 60_000;
