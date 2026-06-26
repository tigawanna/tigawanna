CREATE TABLE `admin_login_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_login_challenges_expires_at_idx` ON `admin_login_challenges` (`expires_at`);--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact` text,
	`message` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`telegram_sent` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_messages_created_at_idx` ON `contact_messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `featured_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`repo_name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `featured_projects_repo_name_unique` ON `featured_projects` (`repo_name`);--> statement-breakpoint
CREATE INDEX `featured_projects_sort_order_idx` ON `featured_projects` (`sort_order`);