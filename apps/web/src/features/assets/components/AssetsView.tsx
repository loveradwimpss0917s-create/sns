import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import type { Asset, AssetKind } from "@vlog/shared";
import { ASSET_KINDS } from "@vlog/shared";

const KIND_LABELS: Record<AssetKind, string> = {
  video: "動画",
  photo: "写真",
  lut: "LUT",
  preset: "プリセット",
  thumbnail: "サムネ",
  bgm: "BGM",
  se: "SE",
};

function bytes(n: number | null) {
  if (!n) return "";
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}

export function AssetsView() {
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<AssetKind>("photo");
  const [filter, setFilter] = useState<AssetKind | "all">("all");
  const fileInput = useRef<HTMLInputElement>(null);

  const list = useQuery({
    queryKey: ["assets"],
    queryFn: () =>
      fetch("/api/assets")
        .then((r) => r.json() as Promise<{ data: Asset[] }>)
        .then((r) => r.data),
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const res = await fetch(
        `/api/assets/upload?kind=${kind}&fileName=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          headers: { "content-type": file.type || "application/octet-stream" },
          body: file,
        },
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("アップロードしました");
    },
    onError: (err) => toast.error(`アップロード失敗: ${(err as Error).message}`),
  });

  const remove = useMutation({
    mutationFn: (id: string) => fetch(`/api/assets/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });

  const filtered = (list.data ?? []).filter((a) => filter === "all" || a.kind === filter);

  return (
    <div className="space-y-4">
      <div>
        <p className="kicker">Assets</p>
        <h1 className="mt-1 text-2xl font-medium">アセット管理</h1>
        <p className="text-ink/60 dark:text-cream/60 mt-1 text-sm">
          動画・写真・LUT・プリセット・サムネ・BGMをR2に保管します。
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as AssetKind)}
            className="!w-auto"
          >
            {ASSET_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </Select>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload.mutate(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="secondary"
            onClick={() => fileInput.current?.click()}
            disabled={upload.isPending}
          >
            {upload.isPending ? "アップロード中..." : "ファイルを選択してアップロード"}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter("all")}>
            <Badge tone={filter === "all" ? "ember" : "ink"}>すべて</Badge>
          </button>
          {ASSET_KINDS.map((k) => (
            <button key={k} onClick={() => setFilter(k)}>
              <Badge tone={filter === k ? "ember" : "ink"}>{KIND_LABELS[k]}</Badge>
            </button>
          ))}
        </div>
      </Card>

      {list.isLoading ? (
        <SkeletonCard />
      ) : filtered.length === 0 ? (
        <p className="text-ink/40 dark:text-cream/40 py-12 text-center text-sm">
          アセットがありません。
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {filtered.map((a) => (
            <div key={a.id} className="film-card space-y-1 !p-3">
              <Badge tone="moss">{KIND_LABELS[a.kind]}</Badge>
              <p className="truncate text-sm font-medium">{a.fileName}</p>
              <p className="text-ink/40 dark:text-cream/40 text-xs">{bytes(a.sizeBytes)}</p>
              <div className="flex gap-2 pt-1">
                <a
                  href={`/api/assets/${a.id}/download`}
                  className="text-ember text-xs hover:underline"
                >
                  開く
                </a>
                <button
                  onClick={() => remove.mutate(a.id)}
                  className="text-ink/40 hover:text-ember dark:text-cream/40 text-xs"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
