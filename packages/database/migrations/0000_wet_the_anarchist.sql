CREATE TABLE `post_tags` (
	`post_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`hashtags` text,
	`series_id` text,
	`scheduled_at` integer,
	`published_at` integer,
	`thumbnail_asset_id` text,
	`duration_seconds` integer,
	`url` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `series` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `compositions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`settings_preset` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shoots` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`post_id` text,
	`location_id` text,
	`scheduled_at` integer,
	`status` text DEFAULT 'planned' NOT NULL,
	`weather` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shots` (
	`id` text PRIMARY KEY NOT NULL,
	`shoot_id` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`description` text NOT NULL,
	`composition_id` text,
	`equipment_id` text,
	`is_broll` integer DEFAULT false NOT NULL,
	`sound_notes` text,
	`checked` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`shoot_id`) REFERENCES `shoots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`composition_id`) REFERENCES `compositions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audio_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`license` text,
	`asset_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `edit_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`template_id` text,
	`lut_id` text,
	`subtitle_style_id` text,
	`bgm_asset_id` text,
	`export_preset` text,
	`status` text DEFAULT 'not_started' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `edit_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lut_id`) REFERENCES `luts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subtitle_style_id`) REFERENCES `subtitle_styles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bgm_asset_id`) REFERENCES `audio_assets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `edit_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`structure` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `luts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`base_emulation` text,
	`asset_id` text,
	`is_for_sale` integer DEFAULT false NOT NULL,
	`price_jpy` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subtitle_styles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`font_ja` text DEFAULT 'Noto Serif JP Light',
	`font_en` text DEFAULT 'Cormorant',
	`color_hex` text DEFAULT '#EFE6D8',
	`position_percent` integer DEFAULT 15,
	`bilingual` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`r2_key` text NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text,
	`size_bytes` integer,
	`width` integer,
	`height` integer,
	`duration_seconds` integer,
	`post_id` text,
	`shoot_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kpi_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`captured_at` integer NOT NULL,
	`followers` integer,
	`views` integer,
	`retention_rate` real,
	`ctr` real,
	`save_rate` real,
	`comment_rate` real,
	`watch_time_minutes` integer,
	`post_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weekly_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`week_start` integer NOT NULL,
	`goal` text NOT NULL,
	`achieved` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `revenue_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`amount_jpy` integer NOT NULL,
	`occurred_at` integer NOT NULL,
	`post_id` text,
	`memo` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ai_generations` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`provider` text DEFAULT 'workers-ai' NOT NULL,
	`prompt` text NOT NULL,
	`result` text NOT NULL,
	`post_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
