import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projectAttendanceValues = [
  "complete",
  "needs_enrichment",
  "pending_review",
  "applied",
] as const;

export type ProjectAttendance = (typeof projectAttendanceValues)[number];

export const projectEnrichmentRunTriggerValues = ["initial", "scheduled", "manual"] as const;

export type ProjectEnrichmentRunTrigger = (typeof projectEnrichmentRunTriggerValues)[number];

export const projectEnrichmentRunStatusValues = ["running", "completed", "failed"] as const;

export type ProjectEnrichmentRunStatus = (typeof projectEnrichmentRunStatusValues)[number];

export const projectEnrichmentSuggestionStatusValues = [
  "pending_review",
  "approved",
  "rejected",
  "applied",
  "superseded",
] as const;

export type ProjectEnrichmentSuggestionStatus =
  (typeof projectEnrichmentSuggestionStatusValues)[number];

export const projectEnrichmentRuns = sqliteTable(
  "project_enrichment_runs",
  {
    id: text("id").primaryKey(),
    trigger: text("trigger").notNull().$type<ProjectEnrichmentRunTrigger>(),
    targetRepos: text("target_repos"),
    status: text("status").notNull().$type<ProjectEnrichmentRunStatus>(),
    reposSynced: integer("repos_synced").notNull().default(0),
    reposSkipped: integer("repos_skipped").notNull().default(0),
    reposEnriched: integer("repos_enriched").notNull().default(0),
    processedRepoCount: integer("processed_repo_count").notNull().default(0),
    error: text("error"),
    startedAt: integer("started_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("project_enrichment_runs_status_idx").on(table.status),
    index("project_enrichment_runs_started_at_idx").on(table.startedAt),
  ],
);

export const projectRepos = sqliteTable(
  "project_repos",
  {
    githubRepoId: text("github_repo_id").primaryKey(),
    repoFullName: text("repo_full_name").notNull().unique(),
    currentDescription: text("current_description"),
    currentTopics: text("current_topics").notNull().default("[]"),
    currentHomepage: text("current_homepage"),
    currentOgImageUrl: text("current_og_image_url"),
    hasCustomSocialPreview: integer("has_custom_social_preview", { mode: "boolean" })
      .notNull()
      .default(false),
    attendance: text("attendance").notNull().$type<ProjectAttendance>(),
    enrichedSummary: text("enriched_summary"),
    enrichedAt: integer("enriched_at", { mode: "timestamp_ms" }),
    enrichedByAi: integer("enriched_by_ai", { mode: "boolean" }).notNull().default(false),
    lastGithubSyncAt: integer("last_github_sync_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    lastAppliedAt: integer("last_applied_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("project_repos_attendance_idx").on(table.attendance),
    index("project_repos_repo_full_name_idx").on(table.repoFullName),
  ],
);

export const projectEnrichmentSuggestions = sqliteTable(
  "project_enrichment_suggestions",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => projectEnrichmentRuns.id, { onDelete: "cascade" }),
    githubRepoId: text("github_repo_id")
      .notNull()
      .references(() => projectRepos.githubRepoId, { onDelete: "cascade" }),
    status: text("status").notNull().$type<ProjectEnrichmentSuggestionStatus>(),
    suggestedDescription: text("suggested_description"),
    suggestedHomepage: text("suggested_homepage"),
    suggestedTopics: text("suggested_topics").notNull().default("[]"),
    suggestedPreviewImageKey: text("suggested_preview_image_key"),
    analysisSummary: text("analysis_summary"),
    applyError: text("apply_error"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
    appliedAt: integer("applied_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("project_enrichment_suggestions_status_idx").on(table.status),
    index("project_enrichment_suggestions_github_repo_id_idx").on(table.githubRepoId),
    index("project_enrichment_suggestions_run_id_idx").on(table.runId),
  ],
);

export type ProjectEnrichmentRunRow = typeof projectEnrichmentRuns.$inferSelect;
export type ProjectRepoRow = typeof projectRepos.$inferSelect;
export type ProjectEnrichmentSuggestionRow = typeof projectEnrichmentSuggestions.$inferSelect;
