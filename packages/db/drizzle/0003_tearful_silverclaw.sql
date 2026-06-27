CREATE TABLE `journal_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`markdown` text DEFAULT '' NOT NULL,
	`richtext` text DEFAULT '' NOT NULL,
	`gist` text,
	`type` text DEFAULT 'TIL' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`pin_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `journal_entries_pinned_pin_order_idx` ON `journal_entries` (`pinned`,`pin_order`);--> statement-breakpoint
CREATE INDEX `journal_entries_created_at_idx` ON `journal_entries` (`created_at`);