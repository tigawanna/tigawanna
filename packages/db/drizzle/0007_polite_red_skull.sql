ALTER TABLE `project_enrichment_runs` ADD `processed_repo_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `project_repos` ADD `enriched_summary` text;--> statement-breakpoint
ALTER TABLE `project_repos` ADD `enriched_at` integer;--> statement-breakpoint
ALTER TABLE `project_repos` ADD `enriched_by_ai` integer DEFAULT false NOT NULL;