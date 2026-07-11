import { requireBackstageSession } from "@/lib/better-auth/session.server";
import { getDb } from "@/lib/db/get-db";
import { contactMessages, count, eq, journalEntries, projectRepos } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";

/** Aggregate counts for the backstage home dashboard. */
export type BackstageDashboardCounts = {
  messages: number;
  projects: number;
  projectsComplete: number;
  journalEntries: number;
  journalPinned: number;
};

/**
 * Returns SQL `COUNT(*)` aggregates for backstage home stats.
 *
 * Prefer this over loading full list queries just to call `.length` / `.filter`.
 */
export const getBackstageDashboardCounts = createServerFn({ method: "GET" }).handler(
  async (): Promise<BackstageDashboardCounts> => {
    await requireBackstageSession();
    const db = getDb();

    const [
      [{ count: messages }],
      [{ count: projects }],
      [{ count: projectsComplete }],
      [{ count: journalEntryCount }],
      [{ count: journalPinned }],
    ] = await Promise.all([
      db.select({ count: count() }).from(contactMessages),
      db.select({ count: count() }).from(projectRepos),
      db
        .select({ count: count() })
        .from(projectRepos)
        .where(eq(projectRepos.attendance, "complete")),
      db.select({ count: count() }).from(journalEntries),
      db.select({ count: count() }).from(journalEntries).where(eq(journalEntries.pinned, true)),
    ]);

    return {
      messages,
      projects,
      projectsComplete,
      journalEntries: journalEntryCount,
      journalPinned,
    };
  },
);
