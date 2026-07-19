import { sql } from "drizzle-orm";
import { text, integer } from "drizzle-orm/sqlite-core";

/** Common columns shared by every table. */
export const id = () => text("id").primaryKey();

export const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
};

/** Platforms supported by the control room (§2, §6 of the design doc). */
export const PLATFORMS = ["youtube", "instagram", "tiktok"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** Post lifecycle states (§2, "投稿一覧: 下書き/公開済み/予約"). */
export const POST_STATUSES = ["draft", "scheduled", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
