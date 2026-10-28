CREATE TABLE `study_plans` (
	`user_id` text PRIMARY KEY NOT NULL,
	`config` text NOT NULL,
	`done` text DEFAULT '{}' NOT NULL,
	`off_days` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
