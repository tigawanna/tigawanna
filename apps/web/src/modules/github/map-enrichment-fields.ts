import {
  collectArtifacts,
  createGitHubClient,
  type GithubRepoSnapshot,
  type MonorepoKind,
  type RepoPackageUnit,
} from "@repo/github";

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
  stored: { lastEnrichedAt?: string | null } | null | undefined,
  incoming: { pushedAt: string },
): boolean {
  if (!stored?.lastEnrichedAt) return true;

  const incomingMs = Date.parse(incoming.pushedAt);
  const enrichedMs = Date.parse(stored.lastEnrichedAt);
  if (Number.isNaN(incomingMs) || Number.isNaN(enrichedMs)) return true;

  return incomingMs > enrichedMs;
}

/** Enrichment fields ready to write to Payload (JSON-serializable for jobs). */
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

const PACKAGE_KINDS = new Set<RepoPackageUnit["kind"]>(["root", "app", "package", "other"]);
const MONOREPO_KINDS = new Set<MonorepoKind>([
  "turbo",
  "pnpm",
  "npm",
  "yarn",
  "lerna",
  "nx",
  "nested",
]);

/**
 * True when `value` is a known `RepoPackageUnit["kind"]`.
 *
 * @param value - Candidate kind string.
 */
function isPackageKind(value: string): value is RepoPackageUnit["kind"] {
  return PACKAGE_KINDS.has(value as RepoPackageUnit["kind"]);
}

/**
 * True when `value` is a known `MonorepoKind`.
 *
 * @param value - Candidate kind string.
 */
function isMonorepoKind(value: string): value is MonorepoKind {
  return MONOREPO_KINDS.has(value as MonorepoKind);
}

/**
 * Narrows unknown job JSON into `EnrichmentFields`, or throws.
 *
 * @param value - Task/workflow JSON payload.
 */
export function parseEnrichmentFields(value: unknown): EnrichmentFields {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid enrichment payload: expected an object");
  }

  const record = value as Record<string, unknown>;
  const defaultBranch = record.defaultBranch;
  const isMonorepo = record.isMonorepo;
  const monorepoKind = record.monorepoKind;
  const readmeMarkdown = record.readmeMarkdown;
  const packages = record.packages;

  if (typeof defaultBranch !== "string" || defaultBranch.trim().length === 0) {
    throw new Error("Invalid enrichment payload: defaultBranch");
  }
  if (typeof isMonorepo !== "boolean") {
    throw new Error("Invalid enrichment payload: isMonorepo");
  }
  if (monorepoKind !== null && monorepoKind !== undefined) {
    if (typeof monorepoKind !== "string" || !isMonorepoKind(monorepoKind)) {
      throw new Error("Invalid enrichment payload: monorepoKind");
    }
  }
  if (typeof readmeMarkdown !== "string") {
    throw new Error("Invalid enrichment payload: readmeMarkdown");
  }
  if (!Array.isArray(packages)) {
    throw new Error("Invalid enrichment payload: packages");
  }

  const parsedPackages: EnrichmentFields["packages"] = packages.map((unit, index) => {
    if (!unit || typeof unit !== "object" || Array.isArray(unit)) {
      throw new Error(`Invalid enrichment payload: packages[${index}]`);
    }
    const row = unit as Record<string, unknown>;
    const kind = row.kind;
    if (typeof kind !== "string" || !isPackageKind(kind)) {
      throw new Error(`Invalid enrichment payload: packages[${index}].kind`);
    }
    if (typeof row.name !== "string") {
      throw new Error(`Invalid enrichment payload: packages[${index}].name`);
    }
    if (typeof row.path !== "string") {
      throw new Error(`Invalid enrichment payload: packages[${index}].path`);
    }
    if (typeof row.description !== "string") {
      throw new Error(`Invalid enrichment payload: packages[${index}].description`);
    }
    if (typeof row.readmePath !== "string") {
      throw new Error(`Invalid enrichment payload: packages[${index}].readmePath`);
    }
    if (typeof row.readmeMarkdown !== "string") {
      throw new Error(`Invalid enrichment payload: packages[${index}].readmeMarkdown`);
    }

    return {
      name: row.name,
      path: row.path,
      kind,
      description: row.description,
      readmePath: row.readmePath,
      readmeMarkdown: row.readmeMarkdown,
    };
  });

  return {
    defaultBranch,
    isMonorepo,
    monorepoKind:
      typeof monorepoKind === "string" && isMonorepoKind(monorepoKind) ? monorepoKind : null,
    readmeMarkdown,
    packages: parsedPackages,
  };
}

/**
 * Maps spelunk package units into Payload array rows.
 * Root README lives on `readmeMarkdown` only — avoid duplicating huge blobs in the array.
 *
 * @param units - Spelunk package units.
 */
function toPackageRows(units: RepoPackageUnit[]): EnrichmentFields["packages"] {
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
 * @param snapshot - Repo snapshot (needs `defaultBranch` + `nameWithOwner`).
 */
export async function mapEnrichmentFields(
  client: ReturnType<typeof createGitHubClient>,
  snapshot: GithubRepoSnapshot,
): Promise<EnrichmentFields> {
  const spelunk = await collectArtifacts(client, snapshot);

  return {
    defaultBranch: snapshot.defaultBranch,
    isMonorepo: spelunk.monorepo.isMonorepo,
    monorepoKind: spelunk.monorepo.kind,
    readmeMarkdown: truncateStoredReadme(spelunk.readme ?? ""),
    packages: toPackageRows(spelunk.packages),
  };
}
