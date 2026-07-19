import { useMemo, useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import type { Platform, Post, PostStatus, Series } from "@vlog/shared";
import { PLATFORM_LABELS, PLATFORMS, POST_STATUSES } from "@vlog/shared";

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "下書き",
  scheduled: "予約",
  published: "公開済み",
};

function emptyForm() {
  return { platform: "youtube" as Platform, title: "", body: "", seriesId: "", hashtags: "" };
}

export function PostsView() {
  const { list, create, remove, update } = useResource<Post>("posts");
  const { list: seriesList, create: createSeries } = useResource<Series>("series");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [seriesName, setSeriesName] = useState("");

  const filtered = useMemo(() => {
    if (!list.data) return [];
    return list.data.filter((p) => {
      if (platformFilter !== "all" && p.platform !== platformFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [list.data, platformFilter, statusFilter, search]);

  function submit() {
    if (!form.title.trim()) return;
    create.mutate(
      {
        platform: form.platform,
        title: form.title,
        body: form.body || undefined,
        seriesId: form.seriesId || undefined,
        hashtags: form.hashtags
          .split(/[,\s]+/)
          .map((h) => h.trim())
          .filter(Boolean),
      },
      { onSuccess: () => setForm(emptyForm()) },
    );
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Posts</p>
          <h1 className="mt-1 text-2xl font-medium">投稿管理</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowSeriesForm((v) => !v)}>
            シリーズ管理
          </Button>
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? "閉じる" : "+ 新規投稿"}
          </Button>
        </div>
      </div>

      {showSeriesForm && (
        <Card kicker="シリーズ" title="シリーズ管理">
          <div className="flex flex-wrap gap-2">
            {seriesList.data?.map((s) => (
              <Badge key={s.id} tone="moss">
                {s.name}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="例: 中庭のある暮らし"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (!seriesName.trim()) return;
                createSeries.mutate({ name: seriesName }, { onSuccess: () => setSeriesName("") });
              }}
            >
              追加
            </Button>
          </div>
        </Card>
      )}

      {showForm && (
        <Card kicker="New" title="新規投稿">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
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
              <Label>シリーズ</Label>
              <Select
                value={form.seriesId}
                onChange={(e) => setForm({ ...form, seriesId: e.target.value })}
              >
                <option value="">なし</option>
                {seriesList.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>タイトル</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>概要欄 / キャプション</Label>
              <Textarea
                rows={4}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>ハッシュタグ(スペース区切り)</Label>
              <Input
                value={form.hashtags}
                onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={submit} disabled={create.isPending}>
            下書き保存
          </Button>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap gap-2">
          <Select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as Platform | "all")}
          >
            <option value="all">すべてのプラットフォーム</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PostStatus | "all")}
          >
            <option value="all">すべてのステータス</option>
            {POST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Input
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </Card>

      {list.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-ink/40 dark:text-cream/40 py-12 text-center text-sm">
          投稿がありません。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => (
            <Card key={post.id}>
              <div className="mb-2 flex items-center gap-2">
                <Badge tone="ember">{PLATFORM_LABELS[post.platform]}</Badge>
                <Badge tone="ink">{STATUS_LABELS[post.status]}</Badge>
              </div>
              <h3 className="font-medium">{post.title}</h3>
              {post.body && (
                <p className="text-ink/60 dark:text-cream/60 mt-1 line-clamp-2 text-sm">
                  {post.body}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                {post.status !== "published" && (
                  <Button
                    variant="secondary"
                    className="!px-3 !py-1 text-xs"
                    onClick={() =>
                      update.mutate({
                        id: post.id,
                        body: { status: post.status === "draft" ? "scheduled" : "published" },
                      })
                    }
                  >
                    {post.status === "draft" ? "予約に進める" : "公開済みにする"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-ember !px-3 !py-1 text-xs"
                  onClick={() => remove.mutate(post.id)}
                >
                  削除
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
