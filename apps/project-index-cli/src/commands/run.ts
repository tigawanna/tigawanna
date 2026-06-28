import type { CliEnv } from "../env.js";
import { unloadGemmaEmbedding } from "../lib/embed-service.js";
import { fetchRecentRepos, fetchReposByFullNames } from "../lib/github.js";
import { assertProjectEmbeddingsSchema, createCliDb, pingDatabase } from "../lib/persist.js";
import { processRepo } from "../lib/process-repo.js";
import type { RunSummary } from "../lib/types.js";

export type RunCommandOptions = {
  limit: number;
  count?: number;
  repos: string[];
  force: boolean;
  applyGithub: boolean;
  dryRun: boolean;
  skipLlm: boolean;
  skipEmbed: boolean;
};

export async function runIndexCommand(env: CliEnv, options: RunCommandOptions): Promise<RunSummary> {
  console.log("[db] connecting to Turso…");
  const db = createCliDb(env);
  await pingDatabase(db);
  console.log("[db] connected");
  await assertProjectEmbeddingsSchema(db);
  console.log("[db] schema ok");

  if (options.repos.length > 0) {
    console.log(`[github] fetching ${options.repos.length} repo(s) by name…`);
    for (const fullName of options.repos) {
      console.log(`[github]   → ${fullName}`);
    }
  } else {
    console.log(`[github] fetching ${options.limit} most recently pushed public repos…`);
  }

  let candidates =
    options.repos.length > 0
      ? await fetchReposByFullNames(env.ghPat, options.repos)
      : await fetchRecentRepos(env.ghPat, options.limit);

  console.log(`[github] received ${candidates.length} public repo(s)`);

  if (options.count != null && options.count > 0) {
    console.log(`[run] trimming candidate list to first ${options.count}`);
    candidates = candidates.slice(0, options.count);
  }

  console.log(`[run] ${candidates.length} repositories queued:`);
  for (const [index, repo] of candidates.entries()) {
    const tags = repo.topics.length > 0 ? repo.topics.join(", ") : "(no tags)";
    const desc = repo.description?.trim() ? repo.description.trim().slice(0, 60) : "(no description)";
    console.log(`[run]   ${index + 1}. ${repo.nameWithOwner} — ${desc} · ${tags}`);
  }

  const summary: RunSummary = {
    total: candidates.length,
    processed: 0,
    skipped: 0,
    failed: 0,
  };

  try {
    for (const [index, repo] of candidates.entries()) {
      console.log("");
      console.log(`[repo] ── ${index + 1}/${candidates.length}: ${repo.nameWithOwner} ──`);
      const result = await processRepo(env, db, repo, {
        force: options.force,
        applyGithub: options.applyGithub,
        dryRun: options.dryRun,
        skipLlm: options.skipLlm,
        skipEmbed: options.skipEmbed,
      });

      if (result.status === "processed") {
        summary.processed += 1;
        console.log(
          `[repo] ✓ processed ${repo.nameWithOwner} (${result.sourceCount} sources${result.llmUsed ? ", LLM used" : ""})`,
        );
      } else if (result.status === "skipped") {
        summary.skipped += 1;
        console.log(`[repo] ○ skipped ${repo.nameWithOwner} (${result.reason})`);
      } else {
        summary.failed += 1;
        console.log(`[repo] ✗ failed ${repo.nameWithOwner}`);
      }
    }
  } finally {
    if (!options.skipEmbed) {
      console.log("[embed] unloading Gemma model…");
      await unloadGemmaEmbedding();
      console.log("[embed] model unloaded");
    } else {
      console.log("[embed] skip-embed set — model was never loaded");
    }
  }

  console.log("");
  console.log(
    `[summary] total=${summary.total} processed=${summary.processed} skipped=${summary.skipped} failed=${summary.failed}`,
  );

  return summary;
}
