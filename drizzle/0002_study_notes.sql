CREATE TABLE `study_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`topic` text NOT NULL,
	`exam_type` text DEFAULT '' NOT NULL,
	`content` text NOT NULL,
	`prompt` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `study_notes_user_topic` ON `study_notes` (`user_id`,`subject`,`topic`);
