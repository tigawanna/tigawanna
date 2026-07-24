/**
 * Journal-facing data access — thin re-exports from the unified blogs collection.
 *
 * Journals are `blogs` docs with `kind: "journal"`. Prefer importing from
 * `@/data-access/blogs` for new code.
 */
export {
  getLandingTilPreviews,
  getPublishedJournalsPage,
  getJournalBySlug,
  getJournalStaticParams,
  JOURNALS_PER_PAGE,
} from "./blogs";
