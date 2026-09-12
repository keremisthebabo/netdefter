CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exam` text NOT NULL,
	`exam_type` text NOT NULL,
	`date` text NOT NULL,
	`subject` text NOT NULL,
	`topic` text NOT NULL,
	`question` text NOT NULL,
	`my_answer` text DEFAULT '' NOT NULL,
	`answer_key` text DEFAULT '' NOT NULL,
	`image_key` text,
	`mime` text,
	`analysis` text,
	`reviewed` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`analyzing_at` text
);
--> statement-breakpoint
CREATE INDEX `questions_user_date` ON `questions` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`month` text NOT NULL,
	`notes` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reports_user_month` ON `reports` (`user_id`,`month`);