import { getDb } from "@/lib/db/get-db.server";
import { contactMessages, count, eq, journalEntries, projectRepos } from "@repo/db";

/** Aggregate counts for the backstage home dashboard. */
export type BackstageDashboardCounts = {
  messages: number;
  projects: number;
  projectsComplete: number;
  journalEntries: number;
  journalPinned: number;
};

export async function loadBackstageDashboardCounts(): Promise<BackstageDashboardCounts> {
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
    db.select({ count: count() }).from(projectRepos).where(eq(projectRepos.attendance, "complete")),
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
}
