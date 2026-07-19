import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useResource } from "@/lib/use-resource";
import { api } from "@/lib/api-client";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import type { Shoot } from "@vlog/shared";
import { PLATFORM_LABELS } from "@vlog/shared";

function yen(n: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

export function DashboardView() {
  const { data, isLoading } = useDashboardSummary();
  const { list: shootsList } = useResource<Shoot>("shoots");
  const queryClient = useQueryClient();
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const todayShoots = useMemo(() => {
    if (!shootsList.data) return [];
    const today = new Date().toDateString();
    return shootsList.data.filter(
      (s) => s.scheduledAt && new Date(s.scheduledAt).toDateString() === today,
    );
  }, [shootsList.data]);

  const suggest = useMutation({
    mutationFn: () =>
      api.raw<{ data: { result: string } }>("/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          kind: "improvement",
          context: `今週の公開数:${data?.publishedThisWeek ?? 0}本、今週の収益:${data?.weekRevenueJpy ?? 0}円、目標:${data?.currentGoal?.goal ?? "未設定"}`,
        }),
      }),
    onSuccess: (r) => {
      setSuggestion(r.data.result);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("AI提案を生成しました");
    },
    onError: (err) => toast.error(`生成に失敗しました: ${(err as Error).message}`),
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="kicker">Today</p>
        <h1 className="mt-1 text-2xl font-medium">今日も、いい光でした。</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card kicker="今日やること" title={`${todayShoots.length}件の撮影`}>
          {todayShoots.length === 0 ? (
            <p className="text-ink/50 dark:text-cream/50 text-sm">今日の撮影予定はありません。</p>
          ) : (
            <ul className="space-y-2">
              {todayShoots.map((s) => (
                <li key={s.id} className="text-sm">
                  <span className="font-medium">{s.title}</span>
                  {s.weather && (
                    <span className="text-ink/50 dark:text-cream/50 ml-2">({s.weather})</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <a href="/shoots" className="text-ember mt-3 inline-block text-xs hover:underline">
            撮影管理へ →
          </a>
        </Card>

        <Card kicker="投稿予定" title={`${data.upcomingPosts.length}件`}>
          {data.upcomingPosts.length === 0 ? (
            <p className="text-ink/50 dark:text-cream/50 text-sm">予約中の投稿はありません。</p>
          ) : (
            <ul className="space-y-2">
              {data.upcomingPosts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{p.title}</span>
                  <Badge tone="moss">{PLATFORM_LABELS[p.platform]}</Badge>
                </li>
              ))}
            </ul>
          )}
          <a href="/posts" className="text-ember mt-3 inline-block text-xs hover:underline">
            投稿管理へ →
          </a>
        </Card>

        <Card kicker="週間進捗" title={`公開 ${data.publishedThisWeek} 本 / 週`}>
          <p className="text-ink/60 dark:text-cream/60 text-sm">
            YouTubeロング週1・ショート週3・IGリール週4・TikTok週5〜7 が目安です(§3-1)。
          </p>
        </Card>

        <Card kicker="収益(過去7日)" title={yen(data.weekRevenueJpy)}>
          <a href="/revenue" className="text-ember mt-1 inline-block text-xs hover:underline">
            収益管理へ →
          </a>
        </Card>

        <Card kicker="今週の目標" title={data.currentGoal?.goal ?? "未設定"}>
          {data.currentGoal ? (
            <Badge tone={data.currentGoal.achieved ? "moss" : "ember"}>
              {data.currentGoal.achieved ? "達成" : "進行中"}
            </Badge>
          ) : (
            <p className="text-ink/50 dark:text-cream/50 text-sm">
              KPIページから設定してください。
            </p>
          )}
        </Card>

        <Card kicker="AI提案" title="来週やめる/増やすこと">
          <p className="text-ink/70 dark:text-cream/70 min-h-10 whitespace-pre-wrap text-sm">
            {suggestion ?? "ボタンを押すとAIが提案します。"}
          </p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => suggest.mutate()}
            disabled={suggest.isPending}
          >
            {suggest.isPending ? "考え中..." : "AI提案を生成"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
