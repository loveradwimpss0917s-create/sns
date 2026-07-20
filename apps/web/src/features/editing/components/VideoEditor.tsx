import { useMemo, useRef, useState } from "react";
import { fetchFile } from "@ffmpeg/util";
import { toast } from "sonner";
import { useResource } from "@/lib/use-resource";
import { getFFmpeg } from "@/lib/ffmpeg";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import type { Asset, EditProject, Lut, SubtitleStyle } from "@vlog/shared";

/** Google Fonts mirror on GitHub — a single CJK-capable face used for all
 * burned-in captions. Fetched lazily only when a video has subtitle cues,
 * since it's a multi-MB download the editor doesn't need otherwise. */
const CAPTION_FONT_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/kosugi/Kosugi-Regular.ttf";

type Source =
  { kind: "file"; file: File; label: string } | { kind: "url"; url: string; label: string };

interface Cue {
  id: string;
  start: number;
  end: number;
  ja: string;
  en: string;
}

/** Escapes text for embedding inside a single-quoted ffmpeg filtergraph value. */
function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "’")
    .replace(/,/g, "\\,")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/;/g, "\\;");
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1);
  return `${m}:${s.padStart(4, "0")}`;
}

/**
 * In-browser video editor (ffmpeg.wasm): trim, apply a self-made LUT, burn in
 * bilingual captions, export MP4 — the §5 "撮って出し→LUT→字幕→書き出し"
 * workflow, without leaving the app. Runs entirely client-side; there is no
 * server-side video processing in a Cloudflare Worker.
 */
export function VideoEditor() {
  const { list: assets } = useResource<Asset>("assets");
  const { list: luts } = useResource<Lut>("luts");
  const { list: subtitleStyles } = useResource<SubtitleStyle>("subtitle-styles");
  const { list: editProjects, update: updateEditProject } =
    useResource<EditProject>("edit-projects");

  const [source, setSource] = useState<Source | null>(null);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [lutId, setLutId] = useState("");
  const [subtitleStyleId, setSubtitleStyleId] = useState("");
  const [resolution, setResolution] = useState<"original" | "1080" | "720">("720");
  const [cues, setCues] = useState<Cue[]>([]);
  const [editProjectId, setEditProjectId] = useState("");

  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [loadingFfmpeg, setLoadingFfmpeg] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultURL, setResultURL] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const videoAssets = useMemo(
    () => (assets.data ?? []).filter((a) => a.kind === "video"),
    [assets.data],
  );
  const previewURL = source
    ? source.kind === "file"
      ? URL.createObjectURL(source.file)
      : source.url
    : null;

  function pickLocalFile(file: File) {
    setSource({ kind: "file", file, label: file.name });
    setResultURL(null);
    setResultBlob(null);
  }

  function pickExistingAsset(assetId: string) {
    const asset = videoAssets.find((a) => a.id === assetId);
    if (!asset) return;
    setSource({ kind: "url", url: `/api/assets/${asset.id}/download`, label: asset.fileName });
    setResultURL(null);
    setResultBlob(null);
  }

  function onLoadedMetadata() {
    const d = videoRef.current?.duration ?? 0;
    setDuration(d);
    setTrimEnd(d);
  }

  function addCue() {
    const start = videoRef.current?.currentTime ?? 0;
    setCues((c) => [
      ...c,
      {
        id: crypto.randomUUID(),
        start: Number(start.toFixed(1)),
        end: Number((start + 3).toFixed(1)),
        ja: "",
        en: "",
      },
    ]);
  }

  function updateCue(id: string, patch: Partial<Cue>) {
    setCues((c) => c.map((cue) => (cue.id === id ? { ...cue, ...patch } : cue)));
  }

  function removeCue(id: string) {
    setCues((c) => c.filter((cue) => cue.id !== id));
  }

  async function ensureFfmpeg() {
    if (ffmpegReady) return getFFmpeg();
    setLoadingFfmpeg(true);
    try {
      const ffmpeg = await getFFmpeg();
      setFfmpegReady(true);
      return ffmpeg;
    } finally {
      setLoadingFfmpeg(false);
    }
  }

  async function handleExport() {
    if (!source) {
      toast.error("動画を選択してください");
      return;
    }
    setProcessing(true);
    setProgress(0);
    setResultURL(null);
    setResultBlob(null);
    try {
      const ffmpeg = await ensureFfmpeg();
      const offProgress = ({ progress: p }: { progress: number }) =>
        setProgress(Math.round(Math.max(0, Math.min(1, p)) * 100));
      ffmpeg.on("progress", offProgress);

      const inputBytes = await fetchFile(source.kind === "file" ? source.file : source.url);
      await ffmpeg.writeFile("input.mp4", inputBytes);

      const trimming = trimStart > 0 || trimEnd < duration - 0.05;
      const needsFilters = Boolean(lutId) || resolution !== "original" || cues.length > 0;

      if (!needsFilters) {
        // Fast path: pure cut, no re-encode.
        const args = [
          "-ss",
          String(trimStart),
          "-to",
          String(trimEnd),
          "-i",
          "input.mp4",
          "-c",
          "copy",
          "output.mp4",
        ];
        await ffmpeg.exec(trimming ? args : ["-i", "input.mp4", "-c", "copy", "output.mp4"]);
      } else {
        let label = "0:v";
        const chain: string[] = [];

        if (lutId) {
          const lut = luts.data?.find((l) => l.id === lutId);
          if (lut?.assetId) {
            const lutBytes = await fetchFile(`/api/assets/${lut.assetId}/download`);
            await ffmpeg.writeFile("lut.cube", lutBytes);
            chain.push(`[${label}]lut3d=lut.cube[v_lut]`);
            label = "v_lut";
          }
        }

        if (resolution !== "original") {
          chain.push(`[${label}]scale=-2:${resolution}[v_scaled]`);
          label = "v_scaled";
        }

        if (cues.length > 0) {
          const fontBytes = await fetchFile(CAPTION_FONT_URL);
          await ffmpeg.writeFile("caption.ttf", fontBytes);
          const style = subtitleStyles.data?.find((s) => s.id === subtitleStyleId);
          const color = (style?.colorHex ?? "#EFE6D8").replace("#", "0x");
          const positionPercent = style?.positionPercent ?? 15;
          const bilingual = style?.bilingual ?? true;
          cues.forEach((cue, i) => {
            const text = bilingual && cue.en ? `${cue.ja}\n${cue.en}` : cue.ja;
            const outLabel = `v_cap${i}`;
            chain.push(
              `[${label}]drawtext=fontfile=caption.ttf:text='${escapeDrawtext(text)}':fontcolor=${color}@0.9:fontsize=32:` +
                `x=(w-text_w)/2:y=h-(h*${positionPercent}/100)-text_h:enable='between(t\\,${cue.start}\\,${cue.end})'[${outLabel}]`,
            );
            label = outLabel;
          });
        }

        if (trimming) {
          chain.push(`[${label}]trim=start=${trimStart}:end=${trimEnd},setpts=PTS-STARTPTS[vout]`);
        } else {
          chain.push(`[${label}]null[vout]`);
        }

        const videoArgs = [
          "-i",
          "input.mp4",
          "-filter_complex",
          chain.join(";"),
          "-map",
          "[vout]",
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-crf",
          "23",
        ];

        try {
          const audioFilter = trimming
            ? `[0:a]atrim=start=${trimStart}:end=${trimEnd},asetpts=PTS-STARTPTS[aout]`
            : null;
          const args = audioFilter
            ? [
                "-i",
                "input.mp4",
                "-filter_complex",
                `${chain.join(";")};${audioFilter}`,
                "-map",
                "[vout]",
                "-map",
                "[aout]",
                "-c:v",
                "libx264",
                "-preset",
                "ultrafast",
                "-crf",
                "23",
                "-c:a",
                "aac",
                "-movflags",
                "+faststart",
                "output.mp4",
              ]
            : [...videoArgs, "-an", "-movflags", "+faststart", "output.mp4"];
          await ffmpeg.exec(args);
        } catch {
          // Source has no audio stream (or another audio-path failure) — retry video-only.
          await ffmpeg.exec([...videoArgs, "-an", "-movflags", "+faststart", "output.mp4"]);
        }
      }

      const data = await ffmpeg.readFile("output.mp4");
      const bytes = data as Uint8Array;
      const blob = new Blob([bytes.slice().buffer], { type: "video/mp4" });
      setResultBlob(blob);
      setResultURL(URL.createObjectURL(blob));
      ffmpeg.off("progress", offProgress);
      toast.success("書き出しが完了しました");

      if (editProjectId) {
        updateEditProject.mutate({ id: editProjectId, body: { status: "done" } });
      }
    } catch (err) {
      toast.error(`書き出しに失敗しました: ${(err as Error).message}`);
    } finally {
      setProcessing(false);
    }
  }

  async function saveToAssets() {
    if (!resultBlob) return;
    setSaving(true);
    try {
      const fileName = `edited-${Date.now()}.mp4`;
      const res = await fetch(
        `/api/assets/upload?kind=video&fileName=${encodeURIComponent(fileName)}`,
        {
          method: "POST",
          headers: { "content-type": "video/mp4" },
          body: resultBlob,
        },
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success("アセットに保存しました");
    } catch (err) {
      toast.error(`保存に失敗しました: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card kicker="Video Editor" title="動画編集(ブラウザ内・オフライン処理)">
        <p className="text-ink/60 dark:text-cream/60 text-sm">
          撮って出し → LUTでカラーグレーディング → トリム → 日英字幕焼き込み →
          MP4書き出し、をこの画面だけで行えます。
          処理は端末のブラウザ内で完結します(サーバーには送信されません)。長尺・高解像度の素材はモバイル端末では時間がかかるため、
          ショート/リール尺(15〜60秒)向けです。ロング尺の本編編集は引き続きCapCutを推奨します。
        </p>
      </Card>

      <Card kicker="Source" title="1. 動画を選ぶ">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label>端末から選択</Label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) pickLocalFile(file);
              }}
              className="text-sm"
            />
          </div>
          <div>
            <Label>既存のアセットから選択</Label>
            <Select
              onChange={(e) => e.target.value && pickExistingAsset(e.target.value)}
              defaultValue=""
            >
              <option value="">選択してください</option>
              {videoAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fileName}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {previewURL && (
          <div className="mt-4">
            <video
              ref={videoRef}
              src={previewURL}
              controls
              onLoadedMetadata={onLoadedMetadata}
              className="max-h-80 w-full rounded-xl bg-black"
            />
          </div>
        )}
      </Card>

      {source && (
        <>
          <Card kicker="Trim" title="2. トリム(切り出し範囲)">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div>
                <Label>開始 (秒)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  max={duration}
                  value={trimStart}
                  onChange={(e) => setTrimStart(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>終了 (秒)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  max={duration}
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(Number(e.target.value))}
                />
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  setTrimStart(Number((videoRef.current?.currentTime ?? 0).toFixed(1)))
                }
              >
                現在位置を開始点に
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  setTrimEnd(Number((videoRef.current?.currentTime ?? duration).toFixed(1)))
                }
              >
                現在位置を終了点に
              </Button>
            </div>
            <p className="text-ink/40 dark:text-cream/40 mt-2 text-xs">
              {fmt(trimStart)} 〜 {fmt(trimEnd)} / 全長 {fmt(duration)}
            </p>
          </Card>

          <Card kicker="LUT" title="3. カラーグレーディング">
            <Select value={lutId} onChange={(e) => setLutId(e.target.value)}>
              <option value="">なし(撮って出し)</option>
              {luts.data
                ?.filter((l) => l.assetId)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
            </Select>
            {luts.data?.some((l) => !l.assetId) && (
              <p className="text-ink/40 dark:text-cream/40 mt-2 text-xs">
                ※
                .cubeファイルが未アップロードのLUTは選択できません(アセット管理からアップロードしてください)。
              </p>
            )}
          </Card>

          <Card kicker="Captions" title="4. 字幕(日英併記)">
            <div className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label>字幕スタイル</Label>
                <Select
                  value={subtitleStyleId}
                  onChange={(e) => setSubtitleStyleId(e.target.value)}
                >
                  <option value="">標準(クリーム・下から15%)</option>
                  {subtitleStyles.data?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>書き出し解像度</Label>
                <Select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as typeof resolution)}
                >
                  <option value="original">元のまま</option>
                  <option value="1080">1080p</option>
                  <option value="720">720p(モバイル推奨)</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              {cues.map((cue) => (
                <div
                  key={cue.id}
                  className="bg-ink/5 dark:bg-cream/5 grid grid-cols-1 gap-2 rounded-lg p-3 md:grid-cols-[80px_80px_1fr_1fr_auto]"
                >
                  <Input
                    type="number"
                    step="0.1"
                    value={cue.start}
                    onChange={(e) => updateCue(cue.id, { start: Number(e.target.value) })}
                    aria-label="開始秒"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    value={cue.end}
                    onChange={(e) => updateCue(cue.id, { end: Number(e.target.value) })}
                    aria-label="終了秒"
                  />
                  <Input
                    placeholder="日本語(体言止め推奨)"
                    value={cue.ja}
                    onChange={(e) => updateCue(cue.id, { ja: e.target.value })}
                  />
                  <Input
                    placeholder="English"
                    value={cue.en}
                    onChange={(e) => updateCue(cue.id, { en: e.target.value })}
                  />
                  <button
                    onClick={() => removeCue(cue.id)}
                    className="text-ember text-xs"
                    aria-label="字幕を削除"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-3" onClick={addCue}>
              + 現在位置に字幕を追加
            </Button>
          </Card>

          <Card kicker="Export" title="5. 書き出し">
            <div className="mb-3">
              <Label>編集プロジェクトに紐づける(任意)</Label>
              <Select value={editProjectId} onChange={(e) => setEditProjectId(e.target.value)}>
                <option value="">なし</option>
                {editProjects.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleExport} disabled={processing || loadingFfmpeg}>
                {loadingFfmpeg
                  ? "初回読み込み中..."
                  : processing
                    ? `書き出し中... ${progress}%`
                    : "書き出す"}
              </Button>
              {processing && (
                <div className="bg-ink/10 dark:bg-cream/10 h-2 w-40 overflow-hidden rounded-full">
                  <div
                    className="bg-ember h-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {resultURL && (
              <div className="mt-4 space-y-3">
                <video src={resultURL} controls className="max-h-80 w-full rounded-xl bg-black" />
                <div className="flex flex-wrap gap-2">
                  <a href={resultURL} download="edited.mp4">
                    <Button variant="secondary">ダウンロード</Button>
                  </a>
                  <Button variant="secondary" onClick={saveToAssets} disabled={saving}>
                    {saving ? "保存中..." : "アセットに保存"}
                  </Button>
                  <Badge tone="moss">MP4</Badge>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
