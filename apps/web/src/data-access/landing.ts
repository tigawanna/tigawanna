import "server-only";

import { getCachedPinnedRepos, getCachedRecentRepos } from "./repositories";
import type { GithubRepoNode } from "@/components/landing/types/github";
import type { JournalPreviewItem } from "@/types/journals";
import { getLandingTilPreviews } from "./journals";

/**
 * Landing journal / TIL cards — Payload-backed with static fixture fallback.
 */
export async function getLandingJournalPreviews(): Promise<JournalPreviewItem[]> {
  return getLandingTilPreviews();
}

/** @deprecated Prefer {@link getLandingJournalPreviews} */
export async function getLandingLessonPreviews(): Promise<JournalPreviewItem[]> {
  return getLandingTilPreviews();
}

/**
 * Pinned GitHub repos for the projects section.
 * Served from the Payload repositories cache (synced via cron / admin pull).
 */
export async function getPinnedRepos(): Promise<GithubRepoNode[]> {
  return getCachedPinnedRepos();
}

/**
 * Recently pushed public repos for topic filter / search.
 * Served from the Payload repositories cache (synced via cron / admin pull).
 */
export async function getRecentRepos(): Promise<GithubRepoNode[]> {
  return getCachedRecentRepos();
}
