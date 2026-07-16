/** How backstage resolved enrichment for display. */
export type BackstageEnrichmentSource = "ai_suggestion" | "ai_record" | "metadata";

/** Brief description of a workspace package inside a monorepo. */
export type MonorepoPackageDescription = {
  path: string;
  name: string;
  description: string;
};

/** Project attendance lifecycle states mirrored from the database schema. */
export type ProjectAttendance = "complete" | "needs_enrichment" | "pending_review" | "applied";

/** Enrichment suggestion review states mirrored from the database schema. */
export type ProjectEnrichmentSuggestionStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "applied"
  | "superseded";

/** Enrichment suggestion surfaced on the backstage project detail page. */
export type BackstageProjectEnrichment = {
  source: BackstageEnrichmentSource;
  isAiEnriched: boolean;
  suggestionId: string | null;
  status: ProjectEnrichmentSuggestionStatus | "complete";
  suggestedDescription: string | null;
  suggestedTopics: string[];
  suggestedHomepage: string | null;
  briefSummary: string | null;
  monorepoPackages: MonorepoPackageDescription[];
  confidence: {
    description: number;
    topics: number;
    homepage: number;
  } | null;
  enrichedAt: Date;
  applyError: string | null;
};

/** Indexed embedding metadata for a backstage project. */
export type BackstageProjectEmbedding = {
  modelId: string;
  embeddedAt: Date;
  sourceCount: number;
};

/** Backstage-facing project row with parsed topic tags. */
export type BackstageProject = {
  githubRepoId: string;
  repoFullName: string;
  currentDescription: string | null;
  currentTopics: string[];
  currentHomepage: string | null;
  currentOgImageUrl: string | null;
  hasCustomSocialPreview: boolean;
  attendance: ProjectAttendance;
  enrichedSummary: string | null;
  enrichedAt: Date | null;
  enrichedByAi: boolean;
  /** True when a `pending_review` enrichment suggestion exists for this repo. */
  needsEnrichmentReview: boolean;
  lastGithubSyncAt: Date;
  lastAppliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Full backstage project detail payload. */
export type BackstageProjectDetail = {
  project: BackstageProject;
  github: {
    description: string | null;
    homepageUrl: string | null;
    topics: string[];
  } | null;
  enrichment: BackstageProjectEnrichment | null;
  embedding: BackstageProjectEmbedding | null;
  readmeHtml: string | null;
};

/** Minimal `project_repos` row shape required for backstage mapping. */
export type ProjectRepoRowInput = {
  githubRepoId: string;
  repoFullName: string;
  currentDescription: string | null;
  currentTopics: string;
  currentHomepage: string | null;
  currentOgImageUrl: string | null;
  hasCustomSocialPreview: boolean;
  attendance: ProjectAttendance;
  enrichedSummary: string | null;
  enrichedAt: Date | null;
  enrichedByAi: boolean;
  lastGithubSyncAt: Date;
  lastAppliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Minimal enrichment suggestion row shape for display resolution. */
export type EnrichmentSuggestionInput = {
  id: string;
  status: ProjectEnrichmentSuggestionStatus;
  suggestedDescription: string | null;
  suggestedTopics: string;
  suggestedHomepage: string | null;
  analysisSummary: string | null;
  createdAt: Date;
  applyError: string | null;
};

/** Embedding hints used when resolving metadata-only enrichment display. */
export type EmbeddingEnrichmentHints = {
  embedText: string | null;
  inferredDescription: string | null;
  embeddedAt: Date;
  sourceCount: number;
};

/**
 * Parses a JSON-encoded topic list stored on `project_repos.current_topics`.
 *
 * @param raw - Serialized topics column value.
 * @returns Parsed topic strings, or an empty array when invalid.
 */
export function parseTopics(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((topic): topic is string => typeof topic === "string");
  } catch {
    return [];
  }
}

/**
 * Counts stored source embedding chunks from serialized JSON.
 *
 * @param raw - Serialized source embeddings column value.
 */
export function countSourceEmbeddings(raw: string | null | undefined) {
  if (!raw) {
    return 0;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Parses monorepo package descriptions stored on enrichment analysis metadata.
 *
 * @param raw - Raw `monorepoPackages` value from analysis metadata.
 */
export function parseMonorepoPackages(raw: unknown): MonorepoPackageDescription[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const { path, name, description } = entry as Record<string, unknown>;
    if (
      typeof path !== "string" ||
      typeof name !== "string" ||
      typeof description !== "string" ||
      path.trim().length === 0 ||
      name.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return [];
    }

    return [{ path: path.trim(), name: name.trim(), description: description.trim() }];
  });
}

/**
 * Parses enrichment analysis metadata stored on suggestions.
 *
 * @param raw - Serialized analysis summary column value.
 */
export function parseAnalysisSummary(raw: string | null | undefined) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {
      reasoning?: string;
      monorepoPackages?: unknown;
      confidence?: {
        description?: number;
        topics?: number;
        homepage?: number;
      };
    };

    const confidence =
      parsed.confidence &&
      typeof parsed.confidence.description === "number" &&
      typeof parsed.confidence.topics === "number" &&
      typeof parsed.confidence.homepage === "number"
        ? {
            description: parsed.confidence.description,
            topics: parsed.confidence.topics,
            homepage: parsed.confidence.homepage,
          }
        : null;

    return {
      briefSummary: typeof parsed.reasoning === "string" ? parsed.reasoning : null,
      monorepoPackages: parseMonorepoPackages(parsed.monorepoPackages),
      confidence,
    };
  } catch {
    return null;
  }
}

/**
 * Returns true when a project has both a non-empty description and at least one tag.
 *
 * @param project - Backstage project with parsed metadata fields.
 */
export function hasCompleteProjectMetadata(project: BackstageProject) {
  return (project.currentDescription?.trim().length ?? 0) > 0 && project.currentTopics.length > 0;
}

/**
 * Maps a `project_repos` row to the backstage project shape with parsed topics.
 *
 * @param row - Raw database row.
 * @param options - Optional flags derived from related enrichment rows.
 */
export function mapProjectRepoRow(
  row: ProjectRepoRowInput,
  options?: { needsEnrichmentReview?: boolean },
): BackstageProject {
  return {
    githubRepoId: row.githubRepoId,
    repoFullName: row.repoFullName,
    currentDescription: row.currentDescription,
    currentTopics: parseTopics(row.currentTopics),
    currentHomepage: row.currentHomepage,
    currentOgImageUrl: row.currentOgImageUrl,
    hasCustomSocialPreview: row.hasCustomSocialPreview,
    attendance: row.attendance,
    enrichedSummary: row.enrichedSummary,
    enrichedAt: row.enrichedAt,
    enrichedByAi: row.enrichedByAi,
    needsEnrichmentReview: options?.needsEnrichmentReview ?? false,
    lastGithubSyncAt: row.lastGithubSyncAt,
    lastAppliedAt: row.lastAppliedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Resolves enrichment display data from suggestions, AI records, or stored metadata.
 *
 * Priority: latest AI suggestion → persisted AI enrichment record → description/tags or
 * indexed vectors (metadata-complete path).
 *
 * @param project - Mapped backstage project row.
 * @param suggestionRow - Latest or pending enrichment suggestion, if any.
 * @param embedding - Embedding hints for metadata-only enrichment display.
 */
export function resolveProjectEnrichment(
  project: BackstageProject,
  suggestionRow: EnrichmentSuggestionInput | undefined,
  embedding: EmbeddingEnrichmentHints | null,
): BackstageProjectEnrichment | null {
  if (suggestionRow) {
    const analysis = parseAnalysisSummary(suggestionRow.analysisSummary);

    return {
      source: "ai_suggestion",
      isAiEnriched: true,
      suggestionId: suggestionRow.id,
      status: suggestionRow.status,
      suggestedDescription: suggestionRow.suggestedDescription,
      suggestedTopics: parseTopics(suggestionRow.suggestedTopics),
      suggestedHomepage: suggestionRow.suggestedHomepage,
      briefSummary: analysis?.briefSummary ?? project.enrichedSummary,
      monorepoPackages: analysis?.monorepoPackages ?? [],
      confidence: analysis?.confidence ?? null,
      enrichedAt: project.enrichedAt ?? suggestionRow.createdAt,
      applyError: suggestionRow.applyError,
    };
  }

  if (project.enrichedByAi && project.enrichedSummary) {
    return {
      source: "ai_record",
      isAiEnriched: true,
      suggestionId: null,
      status: project.attendance === "pending_review" ? "pending_review" : "complete",
      suggestedDescription: project.currentDescription,
      suggestedTopics: project.currentTopics,
      suggestedHomepage: project.currentHomepage,
      briefSummary: project.enrichedSummary,
      monorepoPackages: [],
      confidence: null,
      enrichedAt: project.enrichedAt ?? project.updatedAt,
      applyError: null,
    };
  }

  const metadataComplete = hasCompleteProjectMetadata(project);
  const hasVectors = embedding != null && embedding.sourceCount > 0;

  if (!metadataComplete && !hasVectors) {
    return null;
  }

  const briefSummary =
    project.enrichedSummary?.trim() ||
    embedding?.inferredDescription?.trim() ||
    embedding?.embedText?.trim() ||
    project.currentDescription?.trim() ||
    null;

  return {
    source: "metadata",
    isAiEnriched: false,
    suggestionId: null,
    status: "complete",
    suggestedDescription: project.currentDescription,
    suggestedTopics: project.currentTopics,
    suggestedHomepage: project.currentHomepage,
    briefSummary,
    monorepoPackages: [],
    confidence: null,
    enrichedAt: project.enrichedAt ?? embedding?.embeddedAt ?? project.lastGithubSyncAt,
    applyError: null,
  };
}
