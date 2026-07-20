import { useRef, useState } from "react";
import { toast } from "sonner";
import { useResource } from "@/lib/use-resource";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import type { Lut } from "@vlog/shared";

async function uploadCubeFile(file: File): Promise<string> {
  const res = await fetch(`/api/assets/upload?kind=lut&fileName=${encodeURIComponent(file.name)}`, {
    method: "POST",
    headers: { "content-type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error(await res.text());
  const { data } = (await res.json()) as { data: { id: string } };
  return data.id;
}

/**
 * LUT管理(§5-2/§11-6)。ジェネリックな EntityPanel では .cube ファイルを紐づけられず
 * 「動画編集」タブのLUTドロップダウンが常に空になる(assetId未設定のLUTは選択不可のため)
 * ので、作成時・既存LUTへの追加どちらでも .cube アップロードができる専用パネル。
 */
export function LutsPanel() {
  const { list, create, update, remove } = useResource<Lut>("luts");
  const [name, setName] = useState("");
  const [baseEmulation, setBaseEmulation] = useState("");
  const [isForSale, setIsForSale] = useState(false);
  const [priceJpy, setPriceJpy] = useState("");
  const [cubeFile, setCubeFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [attachingId, setAttachingId] = useState<string | null>(null);
  const newFileInput = useRef<HTMLInputElement>(null);

  async function submit() {
    if (!name) return;
    setCreating(true);
    try {
      const assetId = cubeFile ? await uploadCubeFile(cubeFile) : undefined;
      create.mutate(
        {
          name,
          baseEmulation: baseEmulation || undefined,
          isForSale,
          priceJpy: priceJpy ? Number(priceJpy) : undefined,
          assetId,
        } as Partial<Lut>,
        {
          onSuccess: () => {
            setName("");
            setBaseEmulation("");
            setIsForSale(false);
            setPriceJpy("");
            setCubeFile(null);
            if (newFileInput.current) newFileInput.current.value = "";
          },
        },
      );
    } catch (err) {
      toast.error(`.cubeアップロードに失敗しました: ${(err as Error).message}`);
    } finally {
      setCreating(false);
    }
  }

  async function attachCube(lutId: string, file: File) {
    setAttachingId(lutId);
    try {
      const assetId = await uploadCubeFile(file);
      update.mutate({ id: lutId, body: { assetId } as Partial<Lut> });
    } catch (err) {
      toast.error(`.cubeアップロードに失敗しました: ${(err as Error).message}`);
    } finally {
      setAttachingId(null);
    }
  }

  return (
    <Card
      kicker="LUT管理(自作フィルムエミュレーション, §5-2/§11-6)"
      title={`${list.data?.length ?? 0}件`}
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>名前</Label>
          <Input
            placeholder="例: Portra 400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label>ベース</Label>
          <Input
            placeholder="例: Kodak Portra"
            value={baseEmulation}
            onChange={(e) => setBaseEmulation(e.target.value)}
          />
        </div>
        <div>
          <Label>価格(円・販売する場合)</Label>
          <Input type="number" value={priceJpy} onChange={(e) => setPriceJpy(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isForSale}
            onChange={(e) => setIsForSale(e.target.checked)}
          />
          <Label>販売する</Label>
        </div>
        <div>
          <Label>.cubeファイル(任意・後から追加も可)</Label>
          <input
            ref={newFileInput}
            type="file"
            accept=".cube"
            onChange={(e) => setCubeFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
      </div>
      <Button variant="secondary" className="mt-3" onClick={submit} disabled={creating}>
        {creating ? "追加中..." : "+ 追加"}
      </Button>

      <div className="border-ink/10 dark:border-cream/10 mt-4 space-y-2 border-t pt-3">
        {list.isLoading ? (
          <SkeletonCard />
        ) : (
          list.data?.map((lut) => (
            <div key={lut.id} className="bg-ink/5 dark:bg-cream/5 rounded-lg px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{lut.name}</span>
                  {lut.baseEmulation && <Badge tone="ink">{lut.baseEmulation}</Badge>}
                  {lut.isForSale && <Badge tone="ink">¥{lut.priceJpy ?? 0}</Badge>}
                  <Badge tone={lut.assetId ? "moss" : "ember"}>
                    {lut.assetId ? ".cube登録済み" : ".cube未登録(書き出しに使えません)"}
                  </Badge>
                </div>
                <button onClick={() => remove.mutate(lut.id)} className="text-ember text-xs">
                  削除
                </button>
              </div>
              {!lut.assetId && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="file"
                    accept=".cube"
                    disabled={attachingId === lut.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) attachCube(lut.id, file);
                      e.target.value = "";
                    }}
                    className="text-xs"
                  />
                  {attachingId === lut.id && (
                    <span className="text-ink/40 dark:text-cream/40 text-xs">
                      アップロード中...
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
