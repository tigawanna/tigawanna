ALTER TABLE `project_embeddings` ADD `repo_url` text DEFAULT 'https://github.com/unknown' NOT NULL;--> statement-breakpoint
UPDATE `project_embeddings` SET `repo_url` = 'https://github.com/' || `repo_full_name`;--> statement-breakpoint
ALTER TABLE `project_embeddings` ADD `source_embeddings` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_embeddings` ADD `inferred_description` text;--> statement-breakpoint
ALTER TABLE `project_embeddings` ADD `inferred_topics` text;
