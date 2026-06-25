import { createEmbeddings } from "@/lib/embeddings/openai";
import { buildRepoSearchText, fetchRecentReposForIndexing } from "@/lib/github/fetch-repos";
import { countRepoEmbeddings, upsertRepoEmbeddings } from "@/lib/portfolio/repo-embeddings-store";
import { repoToEmbeddingRecord } from "@/types/portfolio-search";

export type SyncRepoEmbeddingsResult = {
  indexed: number;
  skippedPrivate: number;
  totalInDatabase: number;
};

export async function syncRepoEmbeddings() {
  const repos = await fetchRecentReposForIndexing();
  const searchTexts = repos.map((repo) => buildRepoSearchText(repo));
  const embeddings = await createEmbeddings(searchTexts);

  const records = repos.map((repo, index) => {
    const embedding = embeddings[index];
    if (!embedding) {
      throw new Error(`Missing embedding for repository ${repo.nameWithOwner}`);
    }
    return repoToEmbeddingRecord(repo, embedding);
  });

  await upsertRepoEmbeddings(records);

  return {
    indexed: records.length,
    skippedPrivate: 0,
    totalInDatabase: await countRepoEmbeddings(),
  } satisfies SyncRepoEmbeddingsResult;
}
