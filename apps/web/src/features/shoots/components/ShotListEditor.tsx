import { useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Card";
import type { Composition, Equipment, Shot } from "@vlog/shared";

/** ショットリスト明細: 構図・機材・生活音・B-rollのチェック単位 (§2, §4)。 */
export function ShotListEditor({ shootId }: { shootId: string }) {
  const { list, create, update, remove } = useResource<Shot>("shots");
  const { list: compositions } = useResource<Composition>("compositions");
  const { list: equipment } = useResource<Equipment>("equipment");
  const [description, setDescription] = useState("");
  const [compositionId, setCompositionId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [isBroll, setIsBroll] = useState(false);
  const [soundNotes, setSoundNotes] = useState("");

  const shots = (list.data ?? []).filter((s) => s.shootId === shootId);

  function addShot() {
    if (!description.trim()) return;
    create.mutate(
      {
        shootId,
        order: shots.length,
        description,
        compositionId: compositionId || undefined,
        equipmentId: equipmentId || undefined,
        isBroll,
        soundNotes: soundNotes || undefined,
      },
      {
        onSuccess: () => {
          setDescription("");
          setSoundNotes("");
          setIsBroll(false);
        },
      },
    );
  }

  const compositionName = (id: string | null) => compositions.data?.find((c) => c.id === id)?.name;
  const equipmentName = (id: string | null) => equipment.data?.find((e) => e.id === id)?.name;

  return (
    <div className="border-ink/10 dark:border-cream/10 mt-3 space-y-2 border-t pt-3">
      {shots.length === 0 ? (
        <p className="text-ink/40 dark:text-cream/40 text-xs">ショットがまだありません。</p>
      ) : (
        <ul className="space-y-2">
          {shots.map((shot) => (
            <li
              key={shot.id}
              className="bg-ink/5 dark:bg-cream/5 flex items-start gap-2 rounded-lg p-2 text-sm"
            >
              <input
                type="checkbox"
                checked={shot.checked}
                onChange={(e) =>
                  update.mutate({ id: shot.id, body: { checked: e.target.checked } })
                }
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <p className={shot.checked ? "line-through opacity-50" : ""}>{shot.description}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {compositionName(shot.compositionId) && (
                    <Badge tone="moss">{compositionName(shot.compositionId)}</Badge>
                  )}
                  {equipmentName(shot.equipmentId) && (
                    <Badge tone="ink">{equipmentName(shot.equipmentId)}</Badge>
                  )}
                  {shot.isBroll && <Badge tone="ember">B-roll</Badge>}
                  {shot.soundNotes && <Badge tone="ink">♪ {shot.soundNotes}</Badge>}
                </div>
              </div>
              <button
                onClick={() => remove.mutate(shot.id)}
                className="text-ember text-xs"
                aria-label="ショット削除"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Input
          placeholder="ショット内容(例: 手元アップでドリップ)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="md:col-span-2"
        />
        <Select value={compositionId} onChange={(e) => setCompositionId(e.target.value)}>
          <option value="">構図の型を選択</option>
          {compositions.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
          <option value="">機材を選択</option>
          {equipment.data?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </Select>
        <Input
          placeholder="生活音メモ(例: 注ぐ音)"
          value={soundNotes}
          onChange={(e) => setSoundNotes(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isBroll} onChange={(e) => setIsBroll(e.target.checked)} />
          B-roll
        </label>
      </div>
      <Button variant="secondary" onClick={addShot}>
        + ショット追加
      </Button>
    </div>
  );
}
