import { useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import type { KpiSnapshot, Platform, WeeklyGoal } from "@vlog/shared";
import { PLATFORM_LABELS, PLATFORMS } from "@vlog/shared";

function pct(n: number | null) {
  return n === null || n === undefined ? "—" : `${(n * 100).toFixed(1)}%`;
}

function emptyForm() {
  return {
    platform: "youtube" as Platform,
    followers: "",
    views: "",
    retentionRate: "",
    ctr: "",
    saveRate: "",
    commentRate: "",
  };
}

export function KpiView() {
  const { list, create } = useResource<KpiSnapshot>("kpi-snapshots");
  const {
    list: goals,
    create: createGoal,
    update: updateGoal,
  } = useResource<WeeklyGoal>("weekly-goals");
  const [form, setForm] = useState(emptyForm());
  const [goalText, setGoalText] = useState("");

  function submit() {
    create.mutate(
      {
        platform: form.platform,
        capturedAt: new Date().toISOString(),
        followers: form.followers ? Number(form.followers) : undefined,
        views: form.views ? Number(form.views) : undefined,
        retentionRate: form.retentionRate ? Number(form.retentionRate) / 100 : undefined,
        ctr: form.ctr ? Number(form.ctr) / 100 : undefined,
        saveRate: form.saveRate ? Number(form.saveRate) / 100 : undefined,
        commentRate: form.commentRate ? Number(form.commentRate) / 100 : undefined,
      },
      { onSuccess: () => setForm(emptyForm()) },
    );
  }

  const latestGoal = goals.data?.[0];

  return (
    <div className="space-y-4">
      <div>
        <p className="kicker">KPI</p>
        <h1 className="mt-1 text-2xl font-medium">KPI管理</h1>
        <p className="text-ink/60 dark:text-cream/60 mt-1 text-sm">
          登録者・フォロワー・再生・維持率・CTR・保存率・コメント率(§9)。
        </p>
      </div>

      <Card kicker="今週の目標" title={latestGoal?.goal ?? "未設定"}>
        <div className="flex gap-2">
          <Input
            placeholder="例: 保存率2%以上"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => {
              if (!goalText.trim()) return;
              createGoal.mutate(
                { weekStart: new Date().toISOString(), goal: goalText },
                { onSuccess: () => setGoalText("") },
              );
            }}
          >
            今週の目標を設定
          </Button>
        </div>
        {latestGoal && (
          <Button
            variant="ghost"
            className="mt-2 text-xs"
            onClick={() =>
              updateGoal.mutate({ id: latestGoal.id, body: { achieved: !latestGoal.achieved } })
            }
          >
            {latestGoal.achieved ? "✓ 達成済み" : "未達成としてマーク解除"}
          </Button>
        )}
      </Card>

      <Card kicker="New" title="スナップショットを記録">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Label>プラットフォーム</Label>
            <Select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>登録者/フォロワー</Label>
            <Input
              type="number"
              value={form.followers}
              onChange={(e) => setForm({ ...form, followers: e.target.value })}
            />
          </div>
          <div>
            <Label>再生数</Label>
            <Input
              type="number"
              value={form.views}
              onChange={(e) => setForm({ ...form, views: e.target.value })}
            />
          </div>
          <div>
            <Label>維持率 (%)</Label>
            <Input
              type="number"
              value={form.retentionRate}
              onChange={(e) => setForm({ ...form, retentionRate: e.target.value })}
            />
          </div>
          <div>
            <Label>CTR (%)</Label>
            <Input
              type="number"
              value={form.ctr}
              onChange={(e) => setForm({ ...form, ctr: e.target.value })}
            />
          </div>
          <div>
            <Label>保存率 (%)</Label>
            <Input
              type="number"
              value={form.saveRate}
              onChange={(e) => setForm({ ...form, saveRate: e.target.value })}
            />
          </div>
          <div>
            <Label>コメント率 (%)</Label>
            <Input
              type="number"
              value={form.commentRate}
              onChange={(e) => setForm({ ...form, commentRate: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-3" onClick={submit}>
          記録する
        </Button>
      </Card>

      {list.isLoading ? (
        <SkeletonCard />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const rows = (list.data ?? []).filter((k) => k.platform === platform).slice(0, 6);
            return (
              <Card
                key={platform}
                kicker={PLATFORM_LABELS[platform]}
                title={`${rows.length}件の記録`}
              >
                <ul className="space-y-2 text-sm">
                  {rows.map((r) => (
                    <li key={r.id} className="bg-ink/5 dark:bg-cream/5 rounded-lg p-2">
                      <div className="flex justify-between">
                        <span>{new Date(r.capturedAt).toLocaleDateString("ja-JP")}</span>
                        <Badge tone="moss">{r.followers?.toLocaleString() ?? "—"}</Badge>
                      </div>
                      <div className="text-ink/50 dark:text-cream/50 mt-1 flex flex-wrap gap-1 text-xs">
                        <span>維持率 {pct(r.retentionRate)}</span>
                        <span>CTR {pct(r.ctr)}</span>
                        <span>保存 {pct(r.saveRate)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
