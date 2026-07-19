import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";
import { posts } from "./content";

/** 場所管理 (§4): 中庭 / キッチン / リビング / 寝室 / 車 / 近所 */
export const locations = sqliteTable("locations", {
  id: id(),
  name: text("name").notNull(),
  notes: text("notes"),
  ...timestamps,
});

/** 機材管理 (§4-1/4-2/4-3): iPhone+Blackmagic / α7C など */
export const equipment = sqliteTable("equipment", {
  id: id(),
  name: text("name").notNull(),
  category: text("category"), // camera | lens | mic | nd | tripod | other
  settingsPreset: text("settings_preset"), // JSON: fps/shutter/iso/wb/lens 等 (§4-2, §4-3)
  ...timestamps,
});

/** 構図の型 (§4-4): 定点マスター/真俯瞰/手元アップ/窓越し/床レベル/歩きインサート */
export const compositions = sqliteTable("compositions", {
  id: id(),
  name: text("name").notNull(),
  description: text("description"),
  ...timestamps,
});

/** 撮影セッション: 1回の撮影(週2回・各90分, §3-1)に紐づくショットリスト親レコード */
export const shoots = sqliteTable("shoots", {
  id: id(),
  title: text("title").notNull(),
  postId: text("post_id").references(() => posts.id),
  locationId: text("location_id").references(() => locations.id),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  status: text("status").notNull().default("planned"), // planned | in_progress | done
  weather: text("weather"),
  notes: text("notes"),
  ...timestamps,
});

/** ショットリスト明細: 構図・機材・生活音・B-rollのチェック単位 (§2, §4) */
export const shots = sqliteTable("shots", {
  id: id(),
  shootId: text("shoot_id")
    .notNull()
    .references(() => shoots.id),
  order: integer("order").notNull().default(0),
  description: text("description").notNull(),
  compositionId: text("composition_id").references(() => compositions.id),
  equipmentId: text("equipment_id").references(() => equipment.id),
  isBroll: integer("is_broll", { mode: "boolean" }).notNull().default(false),
  soundNotes: text("sound_notes"), // 生活音メモ (注ぐ音/雨音 等, §4-5)
  checked: integer("checked", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});
