import { Hono } from "hono";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { createDb, kpiSnapshots, posts, revenueEntries, weeklyGoals } from "@vlog/database";
import type { Env } from "../../env";

/** Dashboard集計 (§Dashboard: 今日やること/投稿予定/KPI/週間進捗/収益/今週の目標/AI提案) */
export const dashboardRoutes = new Hono<{ Bindings: Env }>();

dashboardRoutes.get("/summary", async (c) => {
  const db = createDb(c.env.DB);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const upcomingPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.status, "scheduled"))
    .orderBy(posts.scheduledAt)
    .limit(5)
    .all();

  const latestKpi = await db
    .select()
    .from(kpiSnapshots)
    .orderBy(desc(kpiSnapshots.capturedAt))
    .limit(9)
    .all();

  const weekRevenue = await db
    .select({ total: sql<number>`coalesce(sum(${revenueEntries.amountJpy}), 0)` })
    .from(revenueEntries)
    .where(gte(revenueEntries.occurredAt, weekAgo))
    .get();

  const currentGoal = await db
    .select()
    .from(weeklyGoals)
    .orderBy(desc(weeklyGoals.weekStart))
    .limit(1)
    .get();

  const publishedThisWeek = await db
    .select({ total: sql<number>`count(*)` })
    .from(posts)
    .where(and(eq(posts.status, "published"), gte(posts.publishedAt, weekAgo)))
    .get();

  return c.json({
    data: {
      upcomingPosts,
      latestKpi,
      weekRevenueJpy: weekRevenue?.total ?? 0,
      currentGoal: currentGoal ?? null,
      publishedThisWeek: publishedThisWeek?.total ?? 0,
    },
  });
});
