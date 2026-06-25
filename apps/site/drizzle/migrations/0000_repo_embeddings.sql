CREATE TABLE IF NOT EXISTS `repo_embeddings` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name_with_owner` text NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `tags` text NOT NULL,
  `url` text NOT NULL,
  `homepage_url` text,
  `open_graph_image_url` text,
  `pushed_at` text,
  `is_private` integer DEFAULT false NOT NULL,
  `search_text` text NOT NULL,
  `embedding` text NOT NULL,
  `embedded_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `repo_embeddings_name_with_owner_unique` ON `repo_embeddings` (`name_with_owner`);
