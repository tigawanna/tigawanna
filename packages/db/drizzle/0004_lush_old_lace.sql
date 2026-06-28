CREATE TABLE `project_embeddings` (
	`github_repo_id` text PRIMARY KEY NOT NULL,
	`repo_full_name` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`topics` text DEFAULT '[]' NOT NULL,
	`embed_text` text NOT NULL,
	`embedding` text NOT NULL,
	`model_id` text DEFAULT 'embeddinggemma-300m' NOT NULL,
	`embedded_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_embeddings_repo_full_name_unique` ON `project_embeddings` (`repo_full_name`);--> statement-breakpoint
CREATE INDEX `project_embeddings_repo_full_name_idx` ON `project_embeddings` (`repo_full_name`);--> statement-breakpoint
CREATE INDEX `project_embeddings_embedded_at_idx` ON `project_embeddings` (`embedded_at`);