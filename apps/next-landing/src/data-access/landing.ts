import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/components/landing/data/static";
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
 * Live GitHub GraphQL can be wired later; fixtures keep the experiment offline-friendly.
 */
export async function getPinnedRepos(): Promise<GithubRepoNode[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-pinned-repos");
  return STATIC_PINNED_PROJECTS;
}

/**
 * Recently pushed public repos for topic filter / search.
 */
export async function getRecentRepos(): Promise<GithubRepoNode[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-recent-repos");
  return STATIC_RECENT_PROJECTS;
}
