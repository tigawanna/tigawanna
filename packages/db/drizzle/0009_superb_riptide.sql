CREATE TABLE `project_enrichment_outputs` (
	`github_repo_id` text PRIMARY KEY NOT NULL,
	`source_generation` integer NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`github_repo_id`) REFERENCES `project_repos`(`github_repo_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_enrichment_outputs_source_generation_idx` ON `project_enrichment_outputs` (`source_generation`);--> statement-breakpoint
CREATE INDEX `project_enrichment_outputs_created_at_idx` ON `project_enrichment_outputs` (`created_at`);--> statement-breakpoint
CREATE TABLE `project_repo_artifacts` (
	`github_repo_id` text PRIMARY KEY NOT NULL,
	`repo_full_name` text NOT NULL,
	`generation` integer DEFAULT 1 NOT NULL,
	`collector_version` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`github_repo_id`) REFERENCES `project_repos`(`github_repo_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_repo_artifacts_repo_full_name_unique` ON `project_repo_artifacts` (`repo_full_name`);--> statement-breakpoint
CREATE INDEX `project_repo_artifacts_repo_full_name_idx` ON `project_repo_artifacts` (`repo_full_name`);--> statement-breakpoint
CREATE INDEX `project_repo_artifacts_collector_version_idx` ON `project_repo_artifacts` (`collector_version`);--> statement-breakpoint
CREATE INDEX `project_repo_artifacts_created_at_idx` ON `project_repo_artifacts` (`created_at`);--> statement-breakpoint
ALTER TABLE `project_embeddings` ADD `source_generation` integer;--> statement-breakpoint
ALTER TABLE `project_embeddings` ADD `source_enrichment_at` integer;--> statement-breakpoint
CREATE INDEX `project_embeddings_source_generation_idx` ON `project_embeddings` (`source_generation`);