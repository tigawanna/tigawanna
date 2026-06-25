import { db, repoEmbeddings, type RepoEmbeddingRow } from "@/lib/drizzle/client";
import type { GithubRepoNode } from "@/types/github";
import { repoToEmbeddingRecord } from "@/types/portfolio-search";
import { eq } from "drizzle-orm";

export async function listRepoEmbeddings() {
  return db.select().from(repoEmbeddings);
}

export async function countRepoEmbeddings() {
  const rows = await db.select({ id: repoEmbeddings.id }).from(repoEmbeddings);
  return rows.length;
}

export async function upsertRepoEmbeddings(records: ReturnType<typeof repoToEmbeddingRecord>[]) {
  for (const record of records) {
    await db
      .insert(repoEmbeddings)
      .values(record)
      .onConflictDoUpdate({
        target: repoEmbeddings.nameWithOwner,
        set: {
          name: record.name,
          description: record.description,
          tags: record.tags,
          url: record.url,
          homepageUrl: record.homepageUrl,
          openGraphImageUrl: record.openGraphImageUrl,
          pushedAt: record.pushedAt,
          isPrivate: record.isPrivate,
          searchText: record.searchText,
          embedding: record.embedding,
          embeddedAt: record.embeddedAt,
        },
      });
  }
}

export function embeddingRowToSearchSource(row: RepoEmbeddingRow) {
  return {
    nameWithOwner: row.nameWithOwner,
    name: row.name,
    description: row.description,
    tags: row.tags,
    url: row.url,
    homepageUrl: row.homepageUrl,
    openGraphImageUrl: row.openGraphImageUrl,
    pushedAt: row.pushedAt,
    isPrivate: row.isPrivate,
    searchText: row.searchText,
    embedding: row.embedding,
  };
}

export async function getRepoEmbeddingByOwner(nameWithOwner: string) {
  const [row] = await db
    .select()
    .from(repoEmbeddings)
    .where(eq(repoEmbeddings.nameWithOwner, nameWithOwner))
    .limit(1);

  return row ?? null;
}

export type RepoEmbeddingSource = ReturnType<typeof embeddingRowToSearchSource>;

export function githubRepoToSource(repo: GithubRepoNode, searchText: string, embedding: number[]) {
  const record = repoToEmbeddingRecord(repo, embedding);
  return embeddingRowToSearchSource({
    id: 0,
    ...record,
  });
}
