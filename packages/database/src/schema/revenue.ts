import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";

/** 収益 (§2, §7): Amazon / 楽天 / 案件 / LUT販売 / プリセット販売 / 広告 */
export const revenueEntries = sqliteTable("revenue_entries", {
  id: id(),
  source: text("source").notNull(), // amazon | rakuten | sponsorship | lut_sale | preset_sale | ad_revenue
  amountJpy: integer("amount_jpy").notNull(),
  occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull(),
  postId: text("post_id"), // 起因した投稿(任意)
  memo: text("memo"),
  ...timestamps,
});
