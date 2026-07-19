import { desc, gte } from "drizzle-orm";
import { createDb, kpiSnapshots } from "@vlog/database";
import type { Env } from "../../src/env";

/**
 * 週次自動レポートWorker (§8-3 "Vlog管制室PWA" / §9 KPI 自動分析の下地).
 * Cron Trigger (毎週日曜) で起動し、直近7日分のKPIスナップショットを
 * KV にキャッシュしておくことで、ダッシュボードの「今週の目標」「AI提案」を
 * 高速表示できるようにする。将来: ここから Claude API を呼んで自動分析コメントを生成する
 * (docs/Roadmap.md の "自動分析" 参照)。
 */
export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(generateWeeklyReport(env));
  },
  async fetch(): Promise<Response> {
    return new Response("report-worker: use the scheduled trigger, not HTTP", { status: 404 });
  },
};

export async function generateWeeklyReport(env: Env): Promise<void> {
  const db = createDb(env.DB);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await db
    .select()
    .from(kpiSnapshots)
    .where(gte(kpiSnapshots.capturedAt, weekAgo))
    .orderBy(desc(kpiSnapshots.capturedAt))
    .all();

  await env.CACHE.put(
    "weekly-report:latest",
    JSON.stringify({ generatedAt: new Date().toISOString(), snapshots: rows }),
    { expirationTtl: 60 * 60 * 24 * 14 },
  );
}
