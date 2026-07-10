import type { SpelunkPayload } from "@repo/github";
import { formatEnrichPrompt } from "./enrich-prompt-format.js";
import type { EnrichRepoContext } from "./types.js";

/**
 * Returns package.json artifacts from a spelunk payload (root + workspaces).
 */
export function getPackageJsonArtifacts(payload: SpelunkPayload) {
  return payload.artifacts.filter((artifact) => artifact.kind === "package.json");
}

/**
 * Returns the root package.json parsed object when present.
 */
export function getRootPackageParsed(payload: SpelunkPayload) {
  return (
    (payload.artifacts.find((a) => a.path === "package.json")?.parsed as
      | Record<string, unknown>
      | undefined) ?? null
  );
}

/**
 * Workspace package.json artifacts (excludes repo root).
 */
export function getWorkspacePackageArtifacts(payload: SpelunkPayload) {
  return getPackageJsonArtifacts(payload).filter((a) => a.path !== "package.json");
}

/**
 * True when spelunk found nested workspace package.json files.
 */
export function isMonorepoPayload(payload: SpelunkPayload) {
  return getWorkspacePackageArtifacts(payload).length > 0;
}

/**
 * Builds the enrichment user prompt from repo metadata + spelunk payload.
 */
export function buildEnrichPrompt(repo: EnrichRepoContext, payload: SpelunkPayload) {
  const packageJson = getRootPackageParsed(payload);
  const workspacePackages = getWorkspacePackageArtifacts(payload);

  const dependencies =
    packageJson && typeof packageJson.dependencies === "object"
      ? Object.keys(packageJson.dependencies as Record<string, string>)
      : [];
  const devDependencies =
    packageJson && typeof packageJson.devDependencies === "object"
      ? Object.keys(packageJson.devDependencies as Record<string, string>)
      : [];

  return formatEnrichPrompt({
    repo,
    isMonorepo: workspacePackages.length > 0,
    workspacePackages,
    packageHomepage: typeof packageJson?.homepage === "string" ? packageJson.homepage : "",
    topLevelFiles: payload.filePaths
      .filter((path) => !path.includes("/"))
      .slice(0, 40)
      .join(", "),
    dependencies,
    devDependencies,
    otherArtifacts: payload.artifacts
      .filter((a) => a.kind !== "package.json")
      .map((a) => a.summary)
      .join("\n\n"),
  });
}
