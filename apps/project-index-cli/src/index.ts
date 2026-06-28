#!/usr/bin/env node

import { Command } from "commander";
import { runIndexCommand } from "./commands/run.js";
import { getCliEnv, loadEnv, logEnvSummary } from "./env.js";

const program = new Command();

program
  .name("tigawanna-index")
  .description("Index GitHub repositories locally — extract, enrich, embed, persist")
  .version("0.0.1");

program
  .command("run")
  .description("Fetch repos, infer missing metadata, embed sources, and save to Turso")
  .option("--limit <number>", "Fetch this many recent public repos from GitHub", "100")
  .option("--count <number>", "Process only the first N repos from the candidate list")
  .option("--repo <fullName>", "Process specific owner/name repos (repeatable)", collect, [])
  .option("--force", "Re-process repos even when embeddings and metadata already exist", false)
  .option("--apply-github", "Push inferred description and tags to GitHub", false)
  .option("--dry-run", "Run extraction and inference without writing to the database", false)
  .option("--skip-llm", "Skip OpenRouter calls even when description or tags are missing", false)
  .option("--skip-embed", "Skip Gemma embedding (useful for testing extraction/LLM)", false)
  .action(async (options) => {
    const envPath = loadEnv();
    if (envPath) {
      console.log(`[env] loaded ${envPath}`);
    }

    const env = getCliEnv();
    const limit = Number.parseInt(String(options.limit), 10);
    const count =
      options.count != null ? Number.parseInt(String(options.count), 10) : undefined;

    if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
      throw new Error("--limit must be between 1 and 100");
    }

    if (count != null && (!Number.isFinite(count) || count < 1)) {
      throw new Error("--count must be a positive number");
    }

    const runOptions = {
      limit,
      count,
      repos: options.repo as string[],
      force: Boolean(options.force),
      applyGithub: Boolean(options.applyGithub),
      dryRun: Boolean(options.dryRun),
      skipLlm: Boolean(options.skipLlm),
      skipEmbed: Boolean(options.skipEmbed),
    };

    console.log("[config] run options:", {
      limit: runOptions.limit,
      count: runOptions.count ?? "all fetched",
      repos: runOptions.repos.length > 0 ? runOptions.repos : "recent from GitHub",
      force: runOptions.force,
      applyGithub: runOptions.applyGithub,
      dryRun: runOptions.dryRun,
      skipLlm: runOptions.skipLlm,
      skipEmbed: runOptions.skipEmbed,
    });

    logEnvSummary(env);

    const summary = await runIndexCommand(env, runOptions);

    if (summary.failed > 0) {
      process.exitCode = 1;
    }
  });

function collect(value: string, previous: string[]) {
  return [...previous, value];
}

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
