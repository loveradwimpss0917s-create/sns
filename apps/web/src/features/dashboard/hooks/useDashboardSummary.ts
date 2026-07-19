import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { KpiSnapshot, Post, WeeklyGoal } from "@vlog/shared";

export interface DashboardSummary {
  upcomingPosts: Post[];
  latestKpi: KpiSnapshot[];
  weekRevenueJpy: number;
  currentGoal: WeeklyGoal | null;
  publishedThisWeek: number;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.raw<{ data: DashboardSummary }>("/dashboard/summary").then((r) => r.data),
  });
}

export interface WeeklyReport {
  generatedAt: string;
  snapshots: KpiSnapshot[];
}

/** Cron-generated weekly KPI rollup (§9-3) — null until report-worker's first run. */
export function useWeeklyReport() {
  return useQuery({
    queryKey: ["dashboard", "weekly-report"],
    queryFn: () =>
      api.raw<{ data: WeeklyReport | null }>("/dashboard/weekly-report").then((r) => r.data),
  });
}
