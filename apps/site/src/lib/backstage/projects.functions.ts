import { requireAdminSession } from "@/lib/admin-auth/require-admin";
import { extractRepoTags, fetchRecentReposFromGithub } from "@/lib/github/fetch-repos";
import { deleteGithubRepo, setGithubRepoVisibility } from "@/lib/github/repo-admin";
import { getDb } from "@/lib/get-db";
import { fetchReposByFullNames } from "@/lib/project-enrichment/github-client";
import { createRunRecord, importRepoSnapshot } from "@/lib/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/lib/project-enrichment/types";
import { getServerEnv } from "@/lib/server-env";
import type { GithubRepoNode } from "@/types/github";
import type { BackstageGithubRepo, BackstageGithubReposResponse } from "@/types/backstage";
import { enrichProjectsWorkflow } from "@/workflows/project-enrichment";
import { eq, projectRepos } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { start } from "workflow/api";
import { z } from "zod";

function mapRepoNode(repo: GithubRepoNode): BackstageGithubRepo {
  return {
    id: repo.nameWithOwner,
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    description: repo.description ?? null,
    homepageUrl: repo.homepageUrl ?? null,
    url: repo.url,
    openGraphImageUrl: repo.openGraphImageUrl ?? null,
    pushedAt: repo.pushedAt,
    isPrivate: repo.isPrivate,
    isFork: repo.isFork ?? false,
    isArchived: repo.isArchived ?? false,
    stargazerCount: repo.stargazerCount ?? 0,
    forkCount: repo.forkCount ?? 0,
    topics: extractRepoTags(repo),
  };
}

async function removeProjectRepoRecord(fullName: string) {
  const db = getDb();
  await db.delete(projectRepos).where(eq(projectRepos.repoFullName, fullName));
}

function requirePat() {
  const pat = getServerEnv().GH_PAT;
  if (!pat) {
    throw new Error("GH_PAT is not configured");
  }
  return pat;
}

const repoFullNameSchema = z.string().regex(/^[^/]+\/[^/]+$/);

export const listGithubReposForBackstage = createServerFn({ method: "GET" }).handler(
  async (): Promise<BackstageGithubReposResponse> => {
    await requireAdminSession();
    const result = await fetchRecentReposFromGithub();
    const nodes = (result.data?.viewer.repositories.nodes ?? []).filter(
      (repo): repo is GithubRepoNode => repo != null,
    );

    return {
      repos: nodes.map(mapRepoNode),
      errors: result.errors.map((error) => error.message),
    };
  },
);

const importProjectRepoInputSchema = z.object({
  repoFullName: repoFullNameSchema,
  runEnrichment: z.boolean().optional(),
});

export const importProjectRepo = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof importProjectRepoInputSchema>) =>
    importProjectRepoInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdminSession();
    const pat = requirePat();

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

export const removeProjectRepo = createServerFn({ method: "POST" })
  .validator((input: { repoFullName: string }) => ({
    repoFullName: repoFullNameSchema.parse(input.repoFullName),
  }))
  .handler(async ({ data }) => {
    await requireAdminSession();
    await removeProjectRepoRecord(data.repoFullName);
    return { ok: true as const };
  });

export const deleteGithubRepoForBackstage = createServerFn({ method: "POST" })
  .validator((input: { repoFullName: string }) => ({
    repoFullName: repoFullNameSchema.parse(input.repoFullName),
  }))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const pat = requirePat();
    await deleteGithubRepo(pat, data.repoFullName);
    await removeProjectRepoRecord(data.repoFullName);
    return { ok: true as const };
  });

export const setGithubRepoVisibilityForBackstage = createServerFn({ method: "POST" })
  .validator((input: { repoFullName: string; visibility: "public" | "private" }) => ({
    repoFullName: repoFullNameSchema.parse(input.repoFullName),
    visibility: z.enum(["public", "private"]).parse(input.visibility),
  }))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const pat = requirePat();
    await setGithubRepoVisibility(pat, data.repoFullName, data.visibility);
    return { ok: true as const, visibility: data.visibility };
  });
