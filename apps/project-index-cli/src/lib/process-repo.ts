import type { CliEnv } from "../env.js";
import { inferMissingMetadata, normalizeTopics } from "./enrich.js";
import { embedDocument, getEmbeddingModelId } from "./embed-service.js";
import {
  applyGithubMetadata,
  fetchRepoExtraction,
  hasDescription,
  hasTopics,
  summarizePackageJson,
} from "./github.js";
import {
  describeSkipReason,
  formatDbError,
  getStoredProjectEmbedding,
  shouldSkipRepo,
  upsertProjectEmbedding,
} from "./persist.js";
import type {
  GithubRepoSnapshot,
  ProcessRepoResult,
  SourceEmbedding,
  SourceEmbeddingKind,
} from "./types.js";
import type { createCliDb } from "./persist.js";

export type ProcessRepoOptions = {
  force: boolean;
  applyGithub: boolean;
  dryRun: boolean;
  skipLlm: boolean;
  skipEmbed: boolean;
};

function buildSummaryEmbedText(
  repo: GithubRepoSnapshot,
  description: string,
  topics: string[],
) {
  const parts = [
    repo.name,
    repo.nameWithOwner,
    description,
    topics.length > 0 ? `Topics: ${topics.join(", ")}` : null,
  ].filter((part): part is string => Boolean(part && part.length > 0));

  return parts.join(". ");
}

async function embedSource(
  env: CliEnv,
  repoFullName: string,
  kind: SourceEmbeddingKind,
  label: string,
  text: string,
  skipEmbed: boolean,
): Promise<SourceEmbedding | null> {
  const trimmed = text.trim();
  if (!trimmed) {
    console.log(`[embed] ${repoFullName} — skipping empty ${kind}/${label}`);
    return null;
  }

  if (skipEmbed) {
    console.log(`[embed] ${repoFullName} — skip-embed: would embed ${kind}/${label} (${trimmed.length} chars)`);
    return { kind, label, text: trimmed, embedding: [] };
  }

  const embedding = await embedDocument(env, trimmed, `${repoFullName} ${kind}/${label}`);
  return { kind, label, text: trimmed, embedding };
}

export async function processRepo(
  env: CliEnv,
  db: ReturnType<typeof createCliDb>,
  repo: GithubRepoSnapshot,
  options: ProcessRepoOptions,
): Promise<ProcessRepoResult> {
  console.log(`[check] ${repo.nameWithOwner} — looking up existing DB row…`);
  let stored;
  try {
    stored = await getStoredProjectEmbedding(db, repo.id);
  } catch (err: unknown) {
    const message = formatDbError(err);
    console.error(`[error] ${repo.nameWithOwner}: ${message}`);
    return { status: "failed", repoFullName: repo.nameWithOwner, error: message };
  }

  const skipReason = describeSkipReason(repo, stored);
  if (shouldSkipRepo(repo, stored, options.force)) {
    console.log(`[skip] ${repo.nameWithOwner} — ${skipReason}`);
    return { status: "skipped", reason: skipReason ?? "complete", repoFullName: repo.nameWithOwner };
  }

  if (options.force) {
    console.log(`[check] ${repo.nameWithOwner} — --force set, re-processing`);
  } else if (skipReason) {
    console.log(`[check] ${repo.nameWithOwner} — not fully indexed (${skipReason})`);
  } else {
    console.log(`[check] ${repo.nameWithOwner} — no existing index, processing fresh`);
  }

  console.log(
    `[check] ${repo.nameWithOwner} — GitHub state: description=${hasDescription(repo) ? "yes" : "no"}, tags=${repo.topics.length > 0 ? repo.topics.join(", ") : "none"}`,
  );

  try {
    const extraction = await fetchRepoExtraction(env.ghPat, repo);

    const needsDescription = !hasDescription(repo);
    const needsTopics = !hasTopics(repo);
    let llmUsed = false;
    let inferredDescription: string | null = null;
    let inferredTopics: string[] | null = null;
    let finalDescription = repo.description?.trim() ?? "";
    let finalTopics = [...repo.topics];

    if (!needsDescription && !needsTopics) {
      console.log(`[llm] ${repo.nameWithOwner} — metadata complete, skipping OpenRouter`);
    } else if ((needsDescription || needsTopics) && !options.skipLlm) {
      const inferred = await inferMissingMetadata(
        env,
        repo,
        extraction,
        needsDescription,
        needsTopics,
      );
      llmUsed = true;

      if (needsDescription) {
        inferredDescription = inferred.description;
        finalDescription = inferred.description;
      }

      if (needsTopics) {
        inferredTopics = normalizeTopics(inferred.topics);
        finalTopics = inferredTopics;
      }
    } else if (needsDescription || needsTopics) {
      console.log(
        `[warn] ${repo.nameWithOwner} — missing ${needsDescription ? "description" : ""}${needsDescription && needsTopics ? " and " : ""}${needsTopics ? "tags" : ""} but --skip-llm is set`,
      );
    }

    if (options.applyGithub && (inferredDescription || inferredTopics)) {
      if (options.dryRun) {
        console.log(
          `[dry-run] would apply GitHub metadata for ${repo.nameWithOwner}: description="${finalDescription.slice(0, 80)}…", tags=[${finalTopics.join(", ")}]`,
        );
      } else {
        await applyGithubMetadata(env.ghPat, repo.nameWithOwner, {
          description: finalDescription,
          topics: finalTopics,
        });
      }
    } else if (options.applyGithub) {
      console.log(`[github] ${repo.nameWithOwner} — nothing to apply (metadata already on GitHub)`);
    }

    console.log(`[embed] ${repo.nameWithOwner} — building source embeddings…`);
    const sourceEmbeddings: SourceEmbedding[] = [];

    if (extraction.readme) {
      const readmeEmbedding = await embedSource(
        env,
        repo.nameWithOwner,
        "readme",
        extraction.readmePath ?? "README.md",
        extraction.readme,
        options.skipEmbed,
      );
      if (readmeEmbedding) {
        sourceEmbeddings.push(readmeEmbedding);
      }
    } else {
      console.log(`[embed] ${repo.nameWithOwner} — no readme to embed`);
    }

    for (const chunk of extraction.packageJsonChunks) {
      const text = summarizePackageJson(chunk.path, chunk.content);
      const packageEmbedding = await embedSource(
        env,
        repo.nameWithOwner,
        "package-json",
        chunk.path,
        text,
        options.skipEmbed,
      );
      if (packageEmbedding) {
        sourceEmbeddings.push(packageEmbedding);
      }
    }

    if (finalTopics.length > 0) {
      const tagsText = `Topics: ${finalTopics.join(", ")}`;
      const tagsEmbedding = await embedSource(
        env,
        repo.nameWithOwner,
        "tags",
        "tags",
        tagsText,
        options.skipEmbed,
      );
      if (tagsEmbedding) {
        sourceEmbeddings.push(tagsEmbedding);
      }
    } else {
      console.log(`[embed] ${repo.nameWithOwner} — no tags to embed`);
    }

    const summaryText = buildSummaryEmbedText(repo, finalDescription, finalTopics);
    console.log(`[embed] ${repo.nameWithOwner} — embedding summary (${summaryText.length} chars)`);
    const summaryEmbedding = options.skipEmbed
      ? []
      : await embedDocument(env, summaryText, `${repo.nameWithOwner} summary`);

    sourceEmbeddings.push({
      kind: "summary",
      label: "summary",
      text: summaryText,
      embedding: summaryEmbedding,
    });

    console.log(
      `[embed] ${repo.nameWithOwner} — ${sourceEmbeddings.length} total sources (${sourceEmbeddings.map((s) => s.label).join(", ")})`,
    );

    if (options.dryRun) {
      console.log(
        `[dry-run] ${repo.nameWithOwner} — would save ${sourceEmbeddings.length} sources, llm=${llmUsed}`,
      );
      return {
        status: "processed",
        repoFullName: repo.nameWithOwner,
        sourceCount: sourceEmbeddings.length,
        llmUsed,
      };
    }

    await upsertProjectEmbedding(db, {
      githubRepoId: repo.id,
      repoFullName: repo.nameWithOwner,
      repoUrl: repo.url,
      name: repo.name,
      description: finalDescription || repo.description,
      topics: finalTopics,
      embedText: summaryText,
      summaryEmbedding,
      sourceEmbeddings,
      inferredDescription,
      inferredTopics,
      modelId: getEmbeddingModelId(),
    });

    return {
      status: "processed",
      repoFullName: repo.nameWithOwner,
      sourceCount: sourceEmbeddings.length,
      llmUsed,
    };
  } catch (err: unknown) {
    const message = formatDbError(err);
    console.error(`[error] ${repo.nameWithOwner}: ${message}`);
    return { status: "failed", repoFullName: repo.nameWithOwner, error: message };
  }
}
