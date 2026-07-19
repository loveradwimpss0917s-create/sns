import { useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** 場所管理 / 機材管理 / 構図の型 のような "名前だけ持つマスタ" 共通UI (§4)。 */
export function ReferenceManager({
  resource,
  label,
  placeholder,
}: {
  resource: string;
  label: string;
  placeholder: string;
}) {
  const { list, create, remove } = useResource<{ id: string; name: string }>(resource);
  const [name, setName] = useState("");

  return (
    <div>
      <p className="kicker">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {list.data?.map((item) => (
          <button key={item.id} onClick={() => remove.mutate(item.id)} title="クリックで削除">
            <Badge tone="ink">{item.name} ×</Badge>
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input placeholder={placeholder} value={name} onChange={(e) => setName(e.target.value)} />
        <Button
          variant="secondary"
          onClick={() => {
            if (!name.trim()) return;
            create.mutate({ name }, { onSuccess: () => setName("") });
          }}
        >
          追加
        </Button>
      </div>
    </div>
  );
}
