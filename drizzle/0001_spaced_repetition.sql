ALTER TABLE `questions` ADD `mistake_type` text DEFAULT 'yanlış' NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `review_stage` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `next_review` text;--> statement-breakpoint
ALTER TABLE `questions` ADD `review_log` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
CREATE INDEX `questions_user_next_review` ON `questions` (`user_id`,`next_review`);--> statement-breakpoint
ALTER TABLE `reports` ADD `goals` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
CREATE TABLE `exams` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`exam_type` text NOT NULL,
	`date` text NOT NULL,
	`net` real NOT NULL,
	`correct` integer,
	`wrong` integer,
	`blank` integer,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `exams_user_date` ON `exams` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `video_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`topic` text NOT NULL,
	`videos` text DEFAULT '[]' NOT NULL,
	`rejected` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `video_cache_user_topic` ON `video_cache` (`user_id`,`subject`,`topic`);
