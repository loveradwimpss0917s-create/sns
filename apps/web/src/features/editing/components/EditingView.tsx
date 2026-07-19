import { Tabs } from "@/components/ui/Tabs";
import { EntityPanel } from "@/components/ui/EntityPanel";
import { EditProjectsPanel } from "./EditProjectsPanel";
import type { AudioAsset, Lut, SubtitleStyle } from "@vlog/shared";

export function EditingView() {
  return (
    <div className="space-y-4">
      <div>
        <p className="kicker">Editing</p>
        <h1 className="mt-1 text-2xl font-medium">編集管理</h1>
        <p className="text-ink/60 dark:text-cream/60 mt-1 text-sm">
          CapCutでの編集進捗・LUT・テンプレート・字幕・BGM/SEを一元管理します(§5)。
        </p>
      </div>

      <Tabs
        tabs={[
          { label: "編集プロジェクト", content: <EditProjectsPanel /> },
          {
            label: "LUT",
            content: (
              <EntityPanel<Lut>
                resource="luts"
                title="LUT管理(自作フィルムエミュレーション, §5-2/§11-6)"
                fields={[
                  { key: "name", label: "名前", type: "text", placeholder: "例: Portra 400" },
                  {
                    key: "baseEmulation",
                    label: "ベース",
                    type: "text",
                    placeholder: "例: Kodak Portra",
                  },
                  { key: "isForSale", label: "販売する", type: "checkbox" },
                  { key: "priceJpy", label: "価格(円)", type: "number" },
                ]}
                renderBadges={(l) =>
                  [l.baseEmulation ?? "", l.isForSale ? `¥${l.priceJpy ?? 0}` : ""].filter(Boolean)
                }
              />
            ),
          },
          {
            label: "テンプレート",
            content: (
              <EntityPanel
                resource="edit-templates"
                title="CapCutマスターテンプレート(§5-1)"
                fields={[
                  { key: "name", label: "名前", type: "text", placeholder: "例: 標準10分ロング" },
                  {
                    key: "structure",
                    label: "構成メモ",
                    type: "text",
                    placeholder: "コールドオープン→定点→本編→山→締め",
                  },
                ]}
              />
            ),
          },
          {
            label: "字幕",
            content: (
              <EntityPanel<SubtitleStyle>
                resource="subtitle-styles"
                title="字幕スタイル(§5-3)"
                fields={[
                  { key: "name", label: "名前", type: "text", placeholder: "例: 標準クリーム" },
                  { key: "colorHex", label: "カラー", type: "text", placeholder: "#EFE6D8" },
                  {
                    key: "positionPercent",
                    label: "位置(下から%)",
                    type: "number",
                    placeholder: "15",
                  },
                ]}
                renderBadges={(s) =>
                  [s.colorHex ?? "", s.bilingual ? "日英併記" : ""].filter(Boolean)
                }
              />
            ),
          },
          {
            label: "BGM / SE",
            content: (
              <EntityPanel<AudioAsset>
                resource="audio-assets"
                title="BGM/SEライブラリ(§4-5・§5-4: ライセンス必須)"
                fields={[
                  { key: "name", label: "名前", type: "text", placeholder: "例: 雨の午後" },
                  {
                    key: "kind",
                    label: "種類",
                    type: "select",
                    options: [
                      { value: "bgm", label: "BGM" },
                      { value: "se", label: "SE" },
                      { value: "ambient", label: "環境音" },
                    ],
                  },
                  {
                    key: "license",
                    label: "ライセンス",
                    type: "text",
                    placeholder: "例: Artlist buy-out",
                  },
                ]}
                renderBadges={(a) => [a.kind, a.license ?? ""].filter(Boolean)}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
