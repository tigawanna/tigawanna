import { getDb } from "@/lib/db/get-db.server";
import type { SpelunkPayload } from "@repo/github";
import { and, eq, projectEnrichmentSuggestions, projectRepoArtifacts } from "@repo/db";

/**
 * Loads the latest spelunk row + parsed payload for a repo, or null if missing.
 */
export async function loadRepoArtifacts(githubRepoId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(projectRepoArtifacts)
    .where(eq(projectRepoArtifacts.githubRepoId, githubRepoId))
    .limit(1);
  const row = rows[0];
  if (!row) {
    return null;
  }
  return {
    generation: row.generation,
    payload: JSON.parse(row.payload) as SpelunkPayload,
  };
}

/**
 * Returns true when the repo already has a pending_review suggestion.
 */
export async function hasPendingSuggestion(githubRepoId: string) {
  const db = getDb();
  const rows = await db
    .select({ id: projectEnrichmentSuggestions.id })
    .from(projectEnrichmentSuggestions)
    .where(
      and(
        eq(projectEnrichmentSuggestions.githubRepoId, githubRepoId),
        eq(projectEnrichmentSuggestions.status, "pending_review"),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
