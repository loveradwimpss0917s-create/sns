import { useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ReferenceManager } from "./ReferenceManager";
import { ShotListEditor } from "./ShotListEditor";
import type { Location, Shoot, ShootStatus } from "@vlog/shared";

const STATUS_LABELS: Record<ShootStatus, string> = {
  planned: "予定",
  in_progress: "撮影中",
  done: "完了",
};

export function ShootsView() {
  const { list, create, update } = useResource<Shoot>("shoots");
  const { list: locations } = useResource<Location>("locations");
  const [showReferences, setShowReferences] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [locationId, setLocationId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [weather, setWeather] = useState("");

  function submit() {
    if (!title.trim()) return;
    create.mutate(
      {
        title,
        locationId: locationId || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        weather: weather || undefined,
      },
      { onSuccess: () => setTitle("") },
    );
  }

  const locationName = (id: string | null) => locations.data?.find((l) => l.id === id)?.name;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Shoots</p>
          <h1 className="mt-1 text-2xl font-medium">撮影管理</h1>
        </div>
        <Button variant="secondary" onClick={() => setShowReferences((v) => !v)}>
          {showReferences ? "閉じる" : "場所・機材・構図"}
        </Button>
      </div>

      {showReferences && (
        <Card>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ReferenceManager resource="locations" label="場所管理" placeholder="例: 中庭" />
            <ReferenceManager resource="equipment" label="機材管理" placeholder="例: α7C" />
            <ReferenceManager
              resource="compositions"
              label="構図の型"
              placeholder="例: 定点マスター"
            />
          </div>
        </Card>
      )}

      <Card kicker="New" title="撮影を計画する(週2回・各90分, §3-1)">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label>タイトル</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>場所</Label>
            <Select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">未選択</option>
              {locations.data?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>日時</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div>
            <Label>天気</Label>
            <Input
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="例: 雨"
            />
          </div>
        </div>
        <Button className="mt-4" onClick={submit}>
          撮影を追加
        </Button>
      </Card>

      {list.isLoading ? (
        <SkeletonCard />
      ) : (
        <div className="space-y-3">
          {list.data?.map((shoot) => (
            <Card key={shoot.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{shoot.title}</h3>
                    <Badge tone={shoot.status === "done" ? "moss" : "ember"}>
                      {STATUS_LABELS[shoot.status]}
                    </Badge>
                  </div>
                  <p className="text-ink/50 dark:text-cream/50 mt-1 text-xs">
                    {locationName(shoot.locationId) ?? "場所未設定"}
                    {shoot.scheduledAt &&
                      ` ・ ${new Date(shoot.scheduledAt).toLocaleString("ja-JP")}`}
                    {shoot.weather && ` ・ ${shoot.weather}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {shoot.status !== "done" && (
                    <Button
                      variant="secondary"
                      className="!px-3 !py-1 text-xs"
                      onClick={() =>
                        update.mutate({
                          id: shoot.id,
                          body: { status: shoot.status === "planned" ? "in_progress" : "done" },
                        })
                      }
                    >
                      {shoot.status === "planned" ? "撮影開始" : "完了にする"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="!px-3 !py-1 text-xs"
                    onClick={() => setExpanded(expanded === shoot.id ? null : shoot.id)}
                  >
                    {expanded === shoot.id ? "閉じる" : "ショットリスト"}
                  </Button>
                </div>
              </div>
              {expanded === shoot.id && <ShotListEditor shootId={shoot.id} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
