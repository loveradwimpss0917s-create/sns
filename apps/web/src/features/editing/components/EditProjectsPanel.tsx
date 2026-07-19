import { useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import type {
  AudioAsset,
  EditProject,
  EditStatus,
  EditTemplate,
  Lut,
  Post,
  SubtitleStyle,
} from "@vlog/shared";
import { EDIT_STATUSES } from "@vlog/shared";

const STATUS_LABELS: Record<EditStatus, string> = {
  not_started: "未着手",
  editing: "編集中",
  rendering: "書き出し中",
  done: "完成",
};

/** 編集プロジェクト: 1本の投稿に対する編集進捗 (§5)。 */
export function EditProjectsPanel() {
  const { list, create, update } = useResource<EditProject>("edit-projects");
  const { list: posts } = useResource<Post>("posts");
  const { list: templates } = useResource<EditTemplate>("edit-templates");
  const { list: luts } = useResource<Lut>("luts");
  const { list: styles } = useResource<SubtitleStyle>("subtitle-styles");
  const { list: audio } = useResource<AudioAsset>("audio-assets");

  const [postId, setPostId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [lutId, setLutId] = useState("");
  const [subtitleStyleId, setSubtitleStyleId] = useState("");
  const [bgmAssetId, setBgmAssetId] = useState("");

  const nameOf = (
    arr: { id: string; name?: string; title?: string }[] | undefined,
    id: string | null,
  ) => arr?.find((x) => x.id === id)?.name ?? arr?.find((x) => x.id === id)?.title;

  return (
    <Card kicker="Edit Projects" title="編集プロジェクト">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <div className="md:col-span-3">
          <Label>投稿</Label>
          <Select value={postId} onChange={(e) => setPostId(e.target.value)}>
            <option value="">選択してください</option>
            {posts.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>テンプレート</Label>
          <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            <option value="">未選択</option>
            {templates.data?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>LUT</Label>
          <Select value={lutId} onChange={(e) => setLutId(e.target.value)}>
            <option value="">未選択</option>
            {luts.data?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>字幕スタイル</Label>
          <Select value={subtitleStyleId} onChange={(e) => setSubtitleStyleId(e.target.value)}>
            <option value="">未選択</option>
            {styles.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:col-span-3">
          <Label>BGM</Label>
          <Select value={bgmAssetId} onChange={(e) => setBgmAssetId(e.target.value)}>
            <option value="">未選択</option>
            {audio.data
              ?.filter((a) => a.kind === "bgm")
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </Select>
        </div>
      </div>
      <Button
        variant="secondary"
        className="mt-3"
        onClick={() => {
          if (!postId) return;
          create.mutate({
            postId,
            templateId: templateId || undefined,
            lutId: lutId || undefined,
            subtitleStyleId: subtitleStyleId || undefined,
            bgmAssetId: bgmAssetId || undefined,
          });
        }}
      >
        + 編集プロジェクト作成
      </Button>

      <div className="border-ink/10 dark:border-cream/10 mt-4 space-y-2 border-t pt-3">
        {list.isLoading ? (
          <SkeletonCard />
        ) : (
          list.data?.map((proj) => (
            <div key={proj.id} className="bg-ink/5 dark:bg-cream/5 rounded-lg px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {nameOf(posts.data, proj.postId) ?? proj.postId}
                </span>
                <Select
                  value={proj.status}
                  onChange={(e) =>
                    update.mutate({ id: proj.id, body: { status: e.target.value as EditStatus } })
                  }
                  className="!w-auto !py-1"
                >
                  {EDIT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {nameOf(luts.data, proj.lutId) && (
                  <Badge tone="moss">LUT: {nameOf(luts.data, proj.lutId)}</Badge>
                )}
                {nameOf(templates.data, proj.templateId) && (
                  <Badge tone="ink">{nameOf(templates.data, proj.templateId)}</Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
