import {
  collectArtifacts,
  createGitHubClient,
  type GithubRepoNode,
  type GithubRepoSnapshot,
  type MonorepoKind,
  type RepoPackageUnit,
} from "@repo/github";
import type { Payload } from "payload";

import type { Repository } from "@/payload-types";
import { topicNames, type RepoAccessOptions } from "./upsert-repo-metadata";

/** Soft cap for Turso/libSQL row payloads — large READMEs were timing out inserts. */
const MAX_STORED_README_CHARS = 6_000;

/** Nested package README cap (root README lives on `readmeMarkdown` only). */
const MAX_NESTED_README_CHARS = 4_000;

/**
 * Truncates README text for Payload storage (Turso-friendly payload size).
 *
 * @param markdown - Full README markdown.
 * @param maxChars - Maximum characters to keep.
 */
function truncateStoredReadme(markdown: string, maxChars = MAX_STORED_README_CHARS): string {
  const trimmed = markdown.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trimEnd()}\n\n…(truncated)`;
}

/**
 * Decides whether a repo needs GitHub enrichment (spelunk / README) after metadata sync.
 *
 * Skip when the incoming `pushedAt` is not newer than `lastEnrichedAt`.
 * Missing stored row or missing `lastEnrichedAt` → enrich.
 *
 * @param stored - Existing Payload fields (or null if not upserted yet).
 * @param incoming - Fresh GitHub timestamps.
 */
export function shouldEnrichRepo(
  stored: { lastEnrichedAt?: string | null; pushedAt?: string | null } | null | undefined,
  incoming: { pushedAt: string },
): boolean {
  if (!stored) return true;
  if (!stored.lastEnrichedAt) return true;

  const incomingMs = Date.parse(incoming.pushedAt);
  const enrichedMs = Date.parse(stored.lastEnrichedAt);
  if (Number.isNaN(incomingMs) || Number.isNaN(enrichedMs)) return true;

  return incomingMs > enrichedMs;
}

/** Enrichment fields ready to write to Payload. */
export type EnrichmentFields = {
  defaultBranch: string;
  isMonorepo: boolean;
  monorepoKind: MonorepoKind | null;
  readmeMarkdown: string;
  packages: Array<{
    name: string;
    path: string;
    kind: RepoPackageUnit["kind"];
    description: string;
    readmePath: string;
    readmeMarkdown: string;
  }>;
};

/**
 * Maps a GitHub repo node into a spelunk snapshot (needs default branch).
 *
 * @param repo - GitHub GraphQL node.
 */
export function toRepoSnapshot(repo: GithubRepoNode): GithubRepoSnapshot {
  return {
    id: repo.nameWithOwner,
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    description: repo.description ?? null,
    homepageUrl: repo.homepageUrl || null,
    openGraphImageUrl: repo.openGraphImageUrl || null,
    topics: topicNames(repo),
    defaultBranch: repo.defaultBranchRef?.name?.trim() || "main",
  };
}

/**
 * Maps spelunk package units into Payload array rows.
 * Root README lives on `readmeMarkdown` only — avoid duplicating huge blobs in the array.
 *
 * @param units - Spelunk package units.
 */
export function toPackageRows(units: RepoPackageUnit[]) {
  return units.map((unit) => ({
    name: unit.name,
    path: unit.path,
    kind: unit.kind,
    description: (unit.description ?? "").slice(0, 500),
    readmePath: unit.readmePath ?? "",
    readmeMarkdown:
      unit.path === "." || unit.kind === "root"
        ? ""
        : truncateStoredReadme(unit.readme ?? "", MAX_NESTED_README_CHARS),
  }));
}

/**
 * Runs `collectArtifacts` and maps the result into truncated Payload enrichment fields.
 *
 * @param client - Authenticated GitHub client.
 * @param repo - GitHub repo node (needs `defaultBranchRef` when available).
 */
export async function mapEnrichmentFields(
  client: ReturnType<typeof createGitHubClient>,
  repo: GithubRepoNode,
): Promise<EnrichmentFields> {
  const snapshot = toRepoSnapshot(repo);
  const spelunk = await collectArtifacts(client, snapshot);

  return {
    defaultBranch: snapshot.defaultBranch,
    isMonorepo: spelunk.monorepo.isMonorepo,
    monorepoKind: spelunk.monorepo.kind,
    readmeMarkdown: truncateStoredReadme(spelunk.readme ?? ""),
    packages: toPackageRows(spelunk.packages),
  };
}

/**
 * Payload `data` patch for enrichment fields + `lastEnrichedAt`.
 *
 * @param fields - Mapped enrichment.
 * @param enrichedAt - ISO timestamp (defaults to now).
 */
export function toEnrichmentPayloadData(
  fields: EnrichmentFields,
  enrichedAt: string = new Date().toISOString(),
) {
  return {
    defaultBranch: fields.defaultBranch,
    isMonorepo: fields.isMonorepo,
    monorepoKind: fields.monorepoKind,
    readmeMarkdown: fields.readmeMarkdown,
    packages: fields.packages,
    lastEnrichedAt: enrichedAt,
  };
}

export type WriteRepoEnrichmentArgs = {
  payload: Payload;
  docId: number | string;
  fields: EnrichmentFields;
  enrichedAt?: string;
  access?: RepoAccessOptions;
};

/**
 * Writes enrichment fields onto an existing repository document.
 *
 * @param args - Payload doc id + mapped enrichment.
 */
export async function writeRepoEnrichment(args: WriteRepoEnrichmentArgs): Promise<Repository> {
  const flags = {
    user: args.access?.user ?? undefined,
    overrideAccess: !args.access?.user,
  };

  return args.payload.update({
    collection: "repositories",
    id: args.docId,
    data: toEnrichmentPayloadData(args.fields, args.enrichedAt),
    context: { disableRevalidate: true },
    ...flags,
  });
}
