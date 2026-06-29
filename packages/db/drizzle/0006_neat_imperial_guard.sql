ALTER TABLE `admin_login_challenges` ADD `attempt_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `admin_login_challenges` ADD `request_ip` text;--> statement-breakpoint
CREATE INDEX `admin_login_challenges_request_ip_idx` ON `admin_login_challenges` (`request_ip`);