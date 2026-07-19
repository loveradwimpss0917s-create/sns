import { Hono } from "hono";
import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { assets, createDb } from "@vlog/database";
import { assetInputSchema } from "@vlog/shared";
import type { Env } from "../../env";

/** アセット管理 (§2 Assets): R2への直接アップロード + D1台帳。 */
export const assetsRoutes = new Hono<{ Bindings: Env }>();

assetsRoutes.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(assets).orderBy(desc(assets.createdAt)).all();
  return c.json({ data: rows });
});

/** バイナリを直接 R2 に受け取り、D1へメタデータを記録する (presign不要のシンプル経路)。 */
assetsRoutes.post("/upload", async (c) => {
  const kind = c.req.query("kind") ?? "photo";
  const fileName = c.req.query("fileName") ?? `${nanoid()}.bin`;
  const r2Key = `${kind}/${nanoid()}-${fileName}`;
  const body = await c.req.arrayBuffer();

  await c.env.ASSETS_BUCKET.put(r2Key, body, {
    httpMetadata: { contentType: c.req.header("content-type") ?? "application/octet-stream" },
  });

  const parsed = assetInputSchema.safeParse({
    kind,
    r2Key,
    fileName,
    mimeType: c.req.header("content-type") ?? undefined,
    sizeBytes: body.byteLength,
  });
  if (!parsed.success) {
    return c.json({ error: "invalid_input", details: parsed.error.flatten() }, 400);
  }

  const db = createDb(c.env.DB);
  const id = nanoid();
  await db
    .insert(assets)
    .values({ id, ...parsed.data })
    .run();

  return c.json({ data: { id, ...parsed.data } }, 201);
});

assetsRoutes.get("/:id/download", async (c) => {
  const db = createDb(c.env.DB);
  const row = await db
    .select()
    .from(assets)
    .where(eq(assets.id, c.req.param("id")))
    .get();
  if (!row) return c.json({ error: "not_found" }, 404);
  const object = await c.env.ASSETS_BUCKET.get(row.r2Key);
  if (!object) return c.json({ error: "not_found_in_storage" }, 404);
  return new Response(object.body, {
    headers: { "content-type": row.mimeType ?? "application/octet-stream" },
  });
});

assetsRoutes.delete("/:id", async (c) => {
  const db = createDb(c.env.DB);
  const row = await db
    .select()
    .from(assets)
    .where(eq(assets.id, c.req.param("id")))
    .get();
  if (row) await c.env.ASSETS_BUCKET.delete(row.r2Key);
  await db
    .delete(assets)
    .where(eq(assets.id, c.req.param("id")))
    .run();
  return c.body(null, 204);
});
