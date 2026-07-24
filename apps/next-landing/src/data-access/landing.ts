import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  STATIC_PINNED_PROJECTS,
  STATIC_RECENT_PROJECTS,
  STATIC_LESSONS,
  toLessonPreviewItem,
} from "@/components/landing/data/static";
import type { GithubRepoNode } from "@/components/landing/types/github";
import type { LessonPreviewItem } from "@/components/landing/types/lessons";

/**
 * Landing lesson cards — static fixtures until Payload blog lands.
 */
export async function getLandingLessonPreviews(): Promise<LessonPreviewItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-lessons");
  return STATIC_LESSONS.slice(0, 8).map(toLessonPreviewItem);
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
