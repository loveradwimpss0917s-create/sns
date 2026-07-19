import { Hono } from "hono";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { AnyZodObject } from "zod";
import type { Env } from "../env";
import { createDb } from "@vlog/database";

/**
 * Mounts standard list/get/create/update/delete routes for a Drizzle table.
 * Every feature (posts, shoots, shots, assets, kpi, revenue, ...) is a thin
 * instantiation of this factory — see src/api/app.ts.
 *
 * Drizzle's per-table generics don't specialize well through a shared helper,
 * so the table/column plumbing below is intentionally loosely typed; the
 * public contract (`schema`, the JSON request/response shape) stays type-safe
 * via the zod schema from @vlog/shared.
 */
export function crudRoutes(
  table: SQLiteTable,
  schema: AnyZodObject,
  options?: { orderByColumn?: string },
) {
  const app = new Hono<{ Bindings: Env }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = table as unknown as Record<string, any>;
  const idColumn = columns.id;

  app.get("/", async (c) => {
    const db = createDb(c.env.DB);
    const orderCol = options?.orderByColumn ? columns[options.orderByColumn] : idColumn;
    const rows = await db.select().from(table).orderBy(desc(orderCol)).all();
    return c.json({ data: rows });
  });

  app.get("/:id", async (c) => {
    const db = createDb(c.env.DB);
    const row = await db
      .select()
      .from(table)
      .where(eq(idColumn, c.req.param("id")))
      .get();
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json({ data: row });
  });

  app.post("/", async (c) => {
    const body = await c.req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "invalid_input", details: parsed.error.flatten() }, 400);
    }
    const db = createDb(c.env.DB);
    const id = nanoid();
    await db
      .insert(table)
      .values({ id, ...parsed.data })
      .run();
    return c.json({ data: { id, ...parsed.data } }, 201);
  });

  app.patch("/:id", async (c) => {
    const body = await c.req.json();
    const parsed = schema.partial().safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "invalid_input", details: parsed.error.flatten() }, 400);
    }
    const db = createDb(c.env.DB);
    await db
      .update(table)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(idColumn, c.req.param("id")))
      .run();
    return c.json({ data: { id: c.req.param("id"), ...parsed.data } });
  });

  app.delete("/:id", async (c) => {
    const db = createDb(c.env.DB);
    await db
      .delete(table)
      .where(eq(idColumn, c.req.param("id")))
      .run();
    return c.body(null, 204);
  });

  return app;
}
