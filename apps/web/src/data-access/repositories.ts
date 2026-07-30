import "server-only";

import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/components/landing/data/static";
import type { GithubRepoNode } from "@/components/landing/types/github";
import type { ProjectPackageTab } from "@/components/projects/ProjectReadmeTabs";
import { markdownToReadmeLexical } from "@/modules/github/repo-readme";
import type { Repository } from "@/payload-types";

export type ProjectDetailDoc = {
  project: GithubRepoNode;
  isMonorepo: boolean;
  monorepoKind: Repository["monorepoKind"];
  /** Single-repo README (non-monorepo or root-only). */
  readme: DefaultTypedEditorState | null;
  /** Monorepo package tabs (includes root). Empty when not a monorepo. */
  packages: ProjectPackageTab[];
};

/**
 * Maps a Payload repository document into the project-card shape.
 */
export function toGithubRepoNode(doc: Repository): GithubRepoNode {
  return {
    name: doc.name,
    nameWithOwner: doc.nameWithOwner,
    url: doc.url,
    homepageUrl: doc.homepageUrl ?? "",
    openGraphImageUrl: doc.openGraphImageUrl ?? "",
    description: doc.description ?? undefined,
    descriptionHTML: doc.descriptionHTML ?? "",
    pushedAt: doc.pushedAt,
    isPrivate: Boolean(doc.isPrivate),
    isFork: Boolean(doc.isFork),
    isArchived: Boolean(doc.isArchived),
    stargazerCount: doc.stargazerCount ?? undefined,
    forkCount: doc.forkCount ?? undefined,
    category: doc.category ?? null,
    repositoryTopics: {
      nodes: (doc.topics ?? [])
        .map((row) => row.tag)
        .filter((tag): tag is string => Boolean(tag))
        .map((tag) => ({ topic: { name: tag } })),
    },
  };
}

/**
 * Loads all cached repositories from Payload, newest push first.
 */
async function findCachedRepositories(): Promise<Repository[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "repositories",
    limit: 100,
    depth: 0,
    sort: "-pushedAt",
    overrideAccess: true,
  });
  return result.docs;
}

/**
 * Featured (pinned) repos from the CMS cache.
 */
export async function getCachedPinnedRepos(): Promise<GithubRepoNode[]> {
  "use cache";
  // GitHub custom social-preview URLs are signed and expire in ~5 minutes.
  cacheLife("minutes");
  cacheTag("landing-pinned-repos");

  try {
    const docs = await findCachedRepositories();
    const featured = docs.filter((doc) => doc.featured).map(toGithubRepoNode);
    if (featured.length > 0) return featured;
  } catch {
    // CMS unavailable — fall through
  }

  return STATIC_PINNED_PROJECTS;
}

/**
 * Recent repos from the CMS cache (all synced rows).
 */
export async function getCachedRecentRepos(): Promise<GithubRepoNode[]> {
  "use cache";
  // GitHub custom social-preview URLs are signed and expire in ~5 minutes.
  cacheLife("minutes");
  cacheTag("landing-recent-repos");

  try {
    const docs = await findCachedRepositories();
    if (docs.length > 0) return docs.map(toGithubRepoNode);
  } catch {
    // CMS unavailable — fall through
  }

  return STATIC_RECENT_PROJECTS;
}

/**
 * Finds a repo in the static fixture lists by `owner/repo`.
 */
function findStaticRepoByName(nameWithOwner: string): GithubRepoNode | null {
  const all = [...STATIC_PINNED_PROJECTS, ...STATIC_RECENT_PROJECTS];
  return all.find((item) => item.nameWithOwner === nameWithOwner) ?? null;
}

/**
 * Loads one public repository for `/project/[owner]/[repo]`.
 * Prefers Payload cache; falls back to static fixtures when CMS is empty/unavailable.
 */
export async function getCachedRepositoryByName(
  owner: string,
  repo: string,
): Promise<GithubRepoNode | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("landing-recent-repos");
  cacheTag("landing-pinned-repos");

  const nameWithOwner = `${owner}/${repo}`;
  cacheTag(`repository_${nameWithOwner}`);

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "repositories",
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: true,
      where: {
        and: [{ nameWithOwner: { equals: nameWithOwner } }, { isPrivate: { equals: false } }],
      },
    });

    const doc = result.docs[0];
    if (doc) return toGithubRepoNode(doc);
  } catch (err: unknown) {
    console.error("[repositories] Payload detail query failed; using static fallback", err);
  }

  const fallback = findStaticRepoByName(nameWithOwner);
  if (fallback && !fallback.isPrivate) return fallback;
  return null;
}

/**
 * Builds Lexical tabs from cached Payload package rows.
 */
async function packagesToTabs(
  doc: Repository,
  owner: string,
  repo: string,
): Promise<ProjectPackageTab[]> {
  const branch = doc.defaultBranch?.trim() || "main";
  const rows = doc.packages ?? [];

  const tabs: ProjectPackageTab[] = [];
  for (const row of rows) {
    const dir = row.path?.trim() || ".";
    const label = row.name?.trim() || dir;
    const isRoot = dir === "." || row.kind === "root";
    // Root README is stored on the parent `readmeMarkdown` field to avoid Turso row bloat.
    const markdown = (
      isRoot
        ? row.readmeMarkdown?.trim() || doc.readmeMarkdown?.trim() || ""
        : row.readmeMarkdown?.trim() || ""
    ).trim();
    const content = markdown
      ? await markdownToReadmeLexical(markdown, owner, repo, branch, dir)
      : null;
    tabs.push({
      value: isRoot ? "root" : dir,
      label,
      content,
    });
  }
  return tabs;
}

/**
 * Project detail payload: metadata + READMEs from Payload (no live GitHub fetch).
 */
export async function getCachedProjectDetail(
  owner: string,
  repo: string,
): Promise<ProjectDetailDoc | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-recent-repos");
  cacheTag("landing-pinned-repos");

  const nameWithOwner = `${owner}/${repo}`;
  cacheTag(`repository_${nameWithOwner}`);
  cacheTag(`repository-readme_${owner}/${repo}`);

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "repositories",
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: true,
      where: {
        and: [{ nameWithOwner: { equals: nameWithOwner } }, { isPrivate: { equals: false } }],
      },
    });

    const doc = result.docs[0];
    if (!doc) {
      const fallback = findStaticRepoByName(nameWithOwner);
      if (!fallback || fallback.isPrivate) return null;
      return {
        project: fallback,
        isMonorepo: false,
        monorepoKind: null,
        readme: null,
        packages: [],
      };
    }

    const project = toGithubRepoNode(doc);
    const branch = doc.defaultBranch?.trim() || "main";
    const isMonorepo = Boolean(doc.isMonorepo) && (doc.packages?.length ?? 0) > 1;

    if (isMonorepo) {
      return {
        project,
        isMonorepo: true,
        monorepoKind: doc.monorepoKind ?? null,
        readme: null,
        packages: await packagesToTabs(doc, owner, repo),
      };
    }

    const rootMarkdown =
      doc.readmeMarkdown?.trim() ||
      doc.packages
        ?.find((pkg) => pkg.path === "." || pkg.kind === "root")
        ?.readmeMarkdown?.trim() ||
      "";

    return {
      project,
      isMonorepo: false,
      monorepoKind: doc.monorepoKind ?? null,
      readme: rootMarkdown
        ? await markdownToReadmeLexical(rootMarkdown, owner, repo, branch, ".")
        : null,
      packages: [],
    };
  } catch (err: unknown) {
    console.error("[repositories] Project detail query failed", err);
    return null;
  }
}

/**
 * @deprecated Prefer {@link getCachedProjectDetail} — kept for older imports.
 */
export async function getCachedRepoReadmeLexical(
  owner: string,
  repo: string,
): Promise<DefaultTypedEditorState | null> {
  const detail = await getCachedProjectDetail(owner, repo);
  if (!detail) return null;
  if (detail.readme) return detail.readme;
  return detail.packages.find((pkg) => pkg.content)?.content ?? null;
}

/**
 * Static params for project detail routes (Payload first, then fixtures).
 */
export async function getRepositoryStaticParams(): Promise<Array<{ owner: string; repo: string }>> {
  "use cache";
  cacheLife("hours");
  cacheTag("landing-recent-repos");

  const toParams = (nameWithOwner: string) => {
    const [owner, repo] = nameWithOwner.split("/");
    if (!owner || !repo) return null;
    return { owner, repo };
  };

  try {
    const docs = await findCachedRepositories();
    const fromCms = docs
      .filter((doc) => !doc.isPrivate)
      .map((doc) => toParams(doc.nameWithOwner))
      .filter((entry): entry is { owner: string; repo: string } => entry !== null);
    if (fromCms.length > 0) return fromCms;
  } catch (err: unknown) {
    console.error("[repositories] Payload static params query failed", err);
  }

  const all = [...STATIC_PINNED_PROJECTS, ...STATIC_RECENT_PROJECTS];
  return all
    .filter((item) => !item.isPrivate)
    .map((item) => toParams(item.nameWithOwner))
    .filter((entry): entry is { owner: string; repo: string } => entry !== null);
}
