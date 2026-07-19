import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";

/** アセット管理 (§2 Assets): 動画/写真/LUT/プリセット/サムネ/BGM の R2 参照台帳。 */
export const assets = sqliteTable("assets", {
  id: id(),
  kind: text("kind").notNull(), // video | photo | lut | preset | thumbnail | bgm | se
  r2Key: text("r2_key").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  width: integer("width"),
  height: integer("height"),
  durationSeconds: integer("duration_seconds"),
  postId: text("post_id"),
  shootId: text("shoot_id"),
  ...timestamps,
});
