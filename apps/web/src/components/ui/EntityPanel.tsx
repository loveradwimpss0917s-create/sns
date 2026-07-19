import { useState } from "react";
import { useResource } from "@/lib/use-resource";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";

type FieldType = "text" | "number" | "checkbox" | "select";

export interface EntityField {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

/**
 * Generic "list + inline create form" panel for simple master-data entities
 * (LUTs, edit templates, subtitle styles, audio assets, ...). Cuts down on
 * near-identical CRUD screens across the Editing/KPI/Revenue features.
 */
export function EntityPanel<T extends { id: string; name?: string }>({
  resource,
  title,
  fields,
  renderBadges,
}: {
  resource: string;
  title: string;
  fields: EntityField[];
  renderBadges?: (item: T) => string[];
}) {
  const { list, create, remove } = useResource<T>(resource);
  const [form, setForm] = useState<Record<string, string | boolean>>({});

  function submit() {
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const v = form[f.key];
      if (v === undefined || v === "") continue;
      body[f.key] = f.type === "number" ? Number(v) : v;
    }
    if (!body.name) return;
    create.mutate(body as Partial<T>, { onSuccess: () => setForm({}) });
  }

  return (
    <Card kicker={title} title={`${list.data?.length ?? 0}件`}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.type === "text" && f.key === "name" ? "md:col-span-2" : ""}>
            <Label>{f.label}</Label>
            {f.type === "select" ? (
              <Select
                value={(form[f.key] as string) ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              >
                <option value="">未選択</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : f.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={Boolean(form[f.key])}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
              />
            ) : (
              <Input
                type={f.type === "number" ? "number" : "text"}
                placeholder={f.placeholder}
                value={(form[f.key] as string) ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
      <Button variant="secondary" className="mt-3" onClick={submit}>
        + 追加
      </Button>

      <div className="border-ink/10 dark:border-cream/10 mt-4 space-y-2 border-t pt-3">
        {list.isLoading ? (
          <SkeletonCard />
        ) : (
          list.data?.map((item) => (
            <div
              key={item.id}
              className="bg-ink/5 dark:bg-cream/5 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{item.name}</span>
                {renderBadges?.(item).map((b, i) => (
                  <Badge key={i} tone="ink">
                    {b}
                  </Badge>
                ))}
              </div>
              <button onClick={() => remove.mutate(item.id)} className="text-ember text-xs">
                削除
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
