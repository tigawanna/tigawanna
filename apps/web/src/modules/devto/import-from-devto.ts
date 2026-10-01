import type { Payload } from "payload";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import {
  bustBlogCaches,
  createDevtoSyncContext,
  ensureSeries,
  fetchArticleDetail,
  importPlannedArticle,
  listPublishedArticles,
  loadBlogIndex,
  needsImport,
  planArticle,
  type ImportArticleOutcome,
} from "@/modules/devto/devto-sync";
import { toOverviewRow, type DevtoOverviewRow } from "@/modules/devto/overview";

/** Parallel workers for the bulk CLI import. */
const CONCURRENCY = 5;

export type ImportFromDevtoFailure = {
  slug: string;
  error: string;
};

export type ImportFromDevtoResult = {
  username: string;
  /** Published articles listed on Dev.to. */
  expected: number;
  /** Already up to date. */
  skipped: number;
  created: number;
  updated: number;
  canonicalUpdated: number;
  seriesCreated: number;
  failed: ImportFromDevtoFailure[];
};

export type ImportDevtoArticleResult = ImportArticleOutcome & {
  /** Fresh admin row for this article after the import. */
  row: DevtoOverviewRow;
};

/**
 * Imports (or re-imports) a single published Dev.to article — the admin page's unit of work,
 * small enough to never hit a serverless timeout.
 */
export async function importDevtoArticle(
  payload: Payload,
  articleId: number,
): Promise<ImportDevtoArticleResult> {
  const ctx = createDevtoSyncContext(payload);
  const [editorConfig, detail, index] = await Promise.all([
    getContentEditorConfig(payload.config),
    fetchArticleDetail(ctx, articleId),
    loadBlogIndex(payload),
  ]);

  if (detail.collection_id !== null) await ensureSeries(ctx, [detail.collection_id], index);
  const outcome = await importPlannedArticle(ctx, planArticle(ctx, detail, index), {
    editorConfig,
    index,
    detail,
  });
  bustBlogCaches();

  const fresh = await loadBlogIndex(payload);
  const article = { ...detail, canonical_url: outcome.canonicalUrl };
  return { ...outcome, row: toOverviewRow(ctx, planArticle(ctx, article, fresh), fresh) };
}

/**
 * Bulk import for CLI / seed: every published article that's missing, edited since its
 * last sync, unlinked from its series, or has an outdated canonical (all when `force`).
 */
export async function importPostsFromDevto(
  payload: Payload,
  options: { force?: boolean } = {},
): Promise<ImportFromDevtoResult> {
  const ctx = createDevtoSyncContext(payload);
  const [editorConfig, listed, index] = await Promise.all([
    getContentEditorConfig(payload.config),
    listPublishedArticles(ctx),
    loadBlogIndex(payload),
  ]);

  const pending = listed
    .map((article) => planArticle(ctx, article, index))
    .filter((plan) => options.force || needsImport(plan));
  payload.logger.info(
    `Dev.to @${ctx.username}: ${listed.length} listed, ${pending.length} to import.`,
  );

  const seriesCreated = await ensureSeries(
    ctx,
    pending.flatMap((plan) => (plan.article.collection_id ? [plan.article.collection_id] : [])),
    index,
  );

  let created = 0;
  let updated = 0;
  let canonicalUpdated = 0;
  const failed: ImportFromDevtoFailure[] = [];
  let next = 0;

  const worker = async () => {
    while (next < pending.length) {
      const plan = pending[next];
      next += 1;
      try {
        const outcome = await importPlannedArticle(ctx, plan, { editorConfig, index });
        if (outcome.action === "created") created += 1;
        else updated += 1;
        if (outcome.canonical === "updated") canonicalUpdated += 1;
        if (outcome.canonicalError) {
          failed.push({ slug: plan.slug, error: `canonical_url: ${outcome.canonicalError}` });
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err);
        failed.push({ slug: plan.slug, error });
        payload.logger.error(`  failed ${plan.slug}: ${error}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker));

  if (created + updated + seriesCreated > 0) bustBlogCaches();

  return {
    username: ctx.username,
    expected: listed.length,
    skipped: listed.length - pending.length,
    created,
    updated,
    canonicalUpdated,
    seriesCreated,
    failed,
  };
}
