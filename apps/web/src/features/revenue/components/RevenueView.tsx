import { useMemo, useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import type { RevenueEntry, RevenueSource } from "@vlog/shared";
import { REVENUE_SOURCES } from "@vlog/shared";

const SOURCE_LABELS: Record<RevenueSource, string> = {
  amazon: "Amazon",
  rakuten: "楽天",
  sponsorship: "案件",
  lut_sale: "LUT販売",
  preset_sale: "プリセット販売",
  ad_revenue: "広告",
};

function yen(n: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

export function RevenueView() {
  const { list, create, remove } = useResource<RevenueEntry>("revenue-entries");
  const [source, setSource] = useState<RevenueSource>("amazon");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const totals = useMemo(() => {
    const bySource: Record<string, number> = {};
    let total = 0;
    for (const e of list.data ?? []) {
      bySource[e.source] = (bySource[e.source] ?? 0) + e.amountJpy;
      total += e.amountJpy;
    }
    return { bySource, total };
  }, [list.data]);

  return (
    <div className="space-y-4">
      <div>
        <p className="kicker">Revenue</p>
        <h1 className="mt-1 text-2xl font-medium">収益管理</h1>
        <p className="text-ink/60 dark:text-cream/60 mt-1 text-sm">
          Amazon・楽天・案件・LUT/プリセット販売・広告収益(§7)。広告収益は「おまけ」、本命は3本柱です。
        </p>
      </div>

      <Card kicker="Total" title={yen(totals.total)}>
        <div className="flex flex-wrap gap-2">
          {REVENUE_SOURCES.map((s) => (
            <Badge key={s} tone="moss">
              {SOURCE_LABELS[s]}: {yen(totals.bySource[s] ?? 0)}
            </Badge>
          ))}
        </div>
      </Card>

      <Card kicker="New" title="収益を記録">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <Label>種別</Label>
            <Select value={source} onChange={(e) => setSource(e.target.value as RevenueSource)}>
              {REVENUE_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>金額(円)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>メモ</Label>
            <Input value={memo} onChange={(e) => setMemo(e.target.value)} />
          </div>
        </div>
        <Button
          className="mt-3"
          onClick={() => {
            if (!amount) return;
            create.mutate(
              {
                source,
                amountJpy: Number(amount),
                occurredAt: new Date().toISOString(),
                memo: memo || undefined,
              },
              {
                onSuccess: () => {
                  setAmount("");
                  setMemo("");
                },
              },
            );
          }}
        >
          記録する
        </Button>
      </Card>

      {list.isLoading ? (
        <SkeletonCard />
      ) : (
        <Card kicker="History" title="収益履歴">
          <ul className="space-y-2 text-sm">
            {list.data?.map((e) => (
              <li
                key={e.id}
                className="bg-ink/5 dark:bg-cream/5 flex items-center justify-between rounded-lg p-2"
              >
                <div className="flex items-center gap-2">
                  <Badge tone="ember">{SOURCE_LABELS[e.source]}</Badge>
                  <span>{new Date(e.occurredAt).toLocaleDateString("ja-JP")}</span>
                  {e.memo && <span className="text-ink/50 dark:text-cream/50">{e.memo}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{yen(e.amountJpy)}</span>
                  <button onClick={() => remove.mutate(e.id)} className="text-ember text-xs">
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
