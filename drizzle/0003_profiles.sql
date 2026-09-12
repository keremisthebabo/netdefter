CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`grade` text DEFAULT '10' NOT NULL,
	`target` text DEFAULT '' NOT NULL,
	`exam_year` integer DEFAULT 2028 NOT NULL,
	`exam_date` text DEFAULT '2028-06-17' NOT NULL,
	`motto` text DEFAULT '' NOT NULL,
	`daily_goal` integer DEFAULT 0 NOT NULL,
	`school` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
