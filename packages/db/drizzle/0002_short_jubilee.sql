CREATE TABLE `project_enrichment_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`trigger` text NOT NULL,
	`target_repos` text,
	`status` text NOT NULL,
	`repos_synced` integer DEFAULT 0 NOT NULL,
	`repos_skipped` integer DEFAULT 0 NOT NULL,
	`repos_enriched` integer DEFAULT 0 NOT NULL,
	`error` text,
	`started_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`finished_at` integer
);
--> statement-breakpoint
CREATE INDEX `project_enrichment_runs_status_idx` ON `project_enrichment_runs` (`status`);--> statement-breakpoint
CREATE INDEX `project_enrichment_runs_started_at_idx` ON `project_enrichment_runs` (`started_at`);--> statement-breakpoint
CREATE TABLE `project_enrichment_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`github_repo_id` text NOT NULL,
	`status` text NOT NULL,
	`suggested_description` text,
	`suggested_homepage` text,
	`suggested_topics` text DEFAULT '[]' NOT NULL,
	`suggested_preview_image_key` text,
	`analysis_summary` text,
	`apply_error` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`reviewed_at` integer,
	`applied_at` integer,
	FOREIGN KEY (`run_id`) REFERENCES `project_enrichment_runs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`github_repo_id`) REFERENCES `project_repos`(`github_repo_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_enrichment_suggestions_status_idx` ON `project_enrichment_suggestions` (`status`);--> statement-breakpoint
CREATE INDEX `project_enrichment_suggestions_github_repo_id_idx` ON `project_enrichment_suggestions` (`github_repo_id`);--> statement-breakpoint
CREATE INDEX `project_enrichment_suggestions_run_id_idx` ON `project_enrichment_suggestions` (`run_id`);--> statement-breakpoint
CREATE TABLE `project_repos` (
	`github_repo_id` text PRIMARY KEY NOT NULL,
	`repo_full_name` text NOT NULL,
	`current_description` text,
	`current_topics` text DEFAULT '[]' NOT NULL,
	`current_homepage` text,
	`current_og_image_url` text,
	`has_custom_social_preview` integer DEFAULT false NOT NULL,
	`attendance` text NOT NULL,
	`last_github_sync_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`last_applied_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_repos_repo_full_name_unique` ON `project_repos` (`repo_full_name`);--> statement-breakpoint
CREATE INDEX `project_repos_attendance_idx` ON `project_repos` (`attendance`);--> statement-breakpoint
CREATE INDEX `project_repos_repo_full_name_idx` ON `project_repos` (`repo_full_name`);