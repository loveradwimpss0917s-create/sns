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
