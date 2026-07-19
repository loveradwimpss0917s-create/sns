import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";
import { posts } from "./content";

/** LUT管理 (§5-2): 自作フィルムエミュレーション(.cube)資産。最大の資産 (§11-6)。 */
export const luts = sqliteTable("luts", {
  id: id(),
  name: text("name").notNull(), // 例: Portra, PRO 400H, Gold
  baseEmulation: text("base_emulation"),
  assetId: text("asset_id"), // R2上の .cube ファイル参照 (assets.id)
  isForSale: integer("is_for_sale", { mode: "boolean" }).notNull().default(false),
  priceJpy: integer("price_jpy"),
  notes: text("notes"),
  ...timestamps,
});

/** CapCut編集テンプレート (§5-1): マスターテンプレート */
export const editTemplates = sqliteTable("edit_templates", {
  id: id(),
  name: text("name").notNull(),
  structure: text("structure"), // JSON: コールドオープン/定点/本編/山/締め の尺設計
  ...timestamps,
});

/** 字幕プリセット (§5-3): フォント/色/位置/日英併記ルール */
export const subtitleStyles = sqliteTable("subtitle_styles", {
  id: id(),
  name: text("name").notNull(),
  fontJa: text("font_ja").default("Noto Serif JP Light"),
  fontEn: text("font_en").default("Cormorant"),
  colorHex: text("color_hex").default("#EFE6D8"),
  positionPercent: integer("position_percent").default(15),
  bilingual: integer("bilingual", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

/** BGM/SEライブラリ (§4-5, §5-4): ライセンス管理必須 (Artlist/Epidemic等) */
export const audioAssets = sqliteTable("audio_assets", {
  id: id(),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // bgm | se | ambient
  license: text("license"), // 例: Artlist buy-out, Epidemic subscription
  assetId: text("asset_id"),
  ...timestamps,
});

/** 編集プロジェクト: 1本の投稿に対する編集進捗と書き出し設定 (§5) */
export const editProjects = sqliteTable("edit_projects", {
  id: id(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id),
  templateId: text("template_id").references(() => editTemplates.id),
  lutId: text("lut_id").references(() => luts.id),
  subtitleStyleId: text("subtitle_style_id").references(() => subtitleStyles.id),
  bgmAssetId: text("bgm_asset_id").references(() => audioAssets.id),
  exportPreset: text("export_preset"), // 4K23.98 / 4K60 等
  status: text("status").notNull().default("not_started"), // not_started | editing | rendering | done
  ...timestamps,
});
