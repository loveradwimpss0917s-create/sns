import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";

/** シリーズ管理 (§2-1): 中庭のある暮らし / 土曜のエスプレッソ / 買ってよかったもの ... */
export const series = sqliteTable("series", {
  id: id(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"), // brand hex, defaults enforced client-side
  ...timestamps,
});

/** タグ (自由入力の検索/絞り込み用タグ) */
export const tags = sqliteTable("tags", {
  id: id(),
  name: text("name").notNull().unique(),
  ...timestamps,
});

/** 投稿管理 (§2): YouTube / Instagram / TikTok を横断する単一の投稿レコード。 */
export const posts = sqliteTable("posts", {
  id: id(),
  platform: text("platform").notNull(), // youtube | instagram | tiktok
  status: text("status").notNull().default("draft"), // draft | scheduled | published
  title: text("title").notNull(),
  body: text("body"), // 概要欄 / キャプション本文
  hashtags: text("hashtags"), // JSON string[]
  seriesId: text("series_id").references(() => series.id),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  thumbnailAssetId: text("thumbnail_asset_id"),
  durationSeconds: integer("duration_seconds"),
  url: text("url"), // 公開後の実URL(将来の自動投稿連携で埋まる)
  notes: text("notes"),
  ...timestamps,
});

export const postTags = sqliteTable("post_tags", {
  postId: text("post_id")
    .notNull()
    .references(() => posts.id),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id),
});
