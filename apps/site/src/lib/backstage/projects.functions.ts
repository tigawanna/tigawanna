import { requireAdminSession } from "@/lib/admin-auth/require-admin";
import { getServerEnv } from "@/lib/server-env";
import { fetchRecentRepos, fetchReposByFullNames } from "@/lib/project-enrichment/github-client";
import { createRunRecord, importRepoSnapshot } from "@/lib/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/lib/project-enrichment/types";
import { enrichProjectsWorkflow } from "@/workflows/project-enrichment";
import { createServerFn } from "@tanstack/react-start";
import { start } from "workflow/api";
import { z } from "zod";

export const listGithubReposForBackstage = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const pat = getServerEnv().GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }
  return fetchRecentRepos(pat, 100);
});

const importProjectRepoInputSchema = z.object({
  repoFullName: z.string().regex(/^[^/]+\/[^/]+$/),
  runEnrichment: z.boolean().optional(),
});

export const importProjectRepo = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof importProjectRepoInputSchema>) =>
    importProjectRepoInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const pat = getServerEnv().GH_PAT;
    if (!pat) {
      throw new Error("GH_PAT is not configured");
    }

    const repos = await fetchReposByFullNames(pat, [data.repoFullName]);
    const repo = repos[0];
    if (!repo) {
      throw new Error("Repo not found or is private");
    }

    await importRepoSnapshot(repo);

    if (data.runEnrichment) {
      const runId = await createRunRecord("manual", [data.repoFullName]);
      const params: EnrichmentRunParams = {
        runId,
        trigger: "manual",
        limit: 1,
        repos: [data.repoFullName],
        force: true,
      };
      await start(enrichProjectsWorkflow, [params]);
      return { imported: true as const, runId };
    }

    return { imported: true as const, runId: null };
  });
