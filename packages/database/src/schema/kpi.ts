import { text, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";

/**
 * KPIスナップショット (§9): 日次/週次で記録する各プラットフォーム指標。
 * 登録者/フォロワー/再生/維持率/CTR/保存率/コメント率 を1レコードにまとめる。
 */
export const kpiSnapshots = sqliteTable("kpi_snapshots", {
  id: id(),
  platform: text("platform").notNull(), // youtube | instagram | tiktok
  capturedAt: integer("captured_at", { mode: "timestamp" }).notNull(),
  followers: integer("followers"), // 登録者 / フォロワー
  views: integer("views"),
  retentionRate: real("retention_rate"), // 維持率 (0-1)
  ctr: real("ctr"), // クリック率 (0-1)
  saveRate: real("save_rate"), // 保存率 (0-1, IG)
  commentRate: real("comment_rate"), // コメント率 (0-1)
  watchTimeMinutes: integer("watch_time_minutes"),
  postId: text("post_id"), // 個別投稿への紐付け(任意。null なら日次アカウント全体値)
  ...timestamps,
});

/** 週間目標 (Dashboard §「今週の目標」) */
export const weeklyGoals = sqliteTable("weekly_goals", {
  id: id(),
  weekStart: integer("week_start", { mode: "timestamp" }).notNull(),
  goal: text("goal").notNull(),
  achieved: integer("achieved", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});
