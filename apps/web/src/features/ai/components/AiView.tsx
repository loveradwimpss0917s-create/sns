import { useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea } from "@/components/ui/Input";
import { useAiGenerate, useAiGenerations } from "../hooks/useAiGenerate";
import type { AiKind } from "@vlog/shared";
import { AI_KINDS } from "@vlog/shared";

const KIND_LABELS: Record<AiKind, string> = {
  planning: "企画生成",
  title: "タイトル生成",
  description: "概要欄生成",
  ig_caption: "Instagram本文",
  tiktok_caption: "TikTok本文",
  hashtags: "ハッシュタグ",
  seo: "SEO",
  analysis: "分析",
  improvement: "改善提案",
};

export function AiView() {
  const [kind, setKind] = useState<AiKind>("planning");
  const [context, setContext] = useState("");
  const generate = useAiGenerate();
  const generations = useAiGenerations();

  return (
    <div className="space-y-4">
      <div>
        <p className="kicker">AI</p>
        <h1 className="mt-1 text-2xl font-medium">AIアシスタント</h1>
        <p className="text-ink/60 dark:text-cream/60 mt-1 text-sm">
          企画・タイトル・概要欄・IG/TikTok本文・ハッシュタグ・SEO・分析・改善提案(§8)。
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_1fr]">
          <div>
            <Label>種類</Label>
            <Select value={kind} onChange={(e) => setKind(e.target.value as AiKind)}>
              {AI_KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>コンテキスト(撮影メモ・状況・数値など)</Label>
            <Textarea rows={4} value={context} onChange={(e) => setContext(e.target.value)} />
          </div>
        </div>
        <Button
          className="mt-3"
          disabled={generate.isPending || !context.trim()}
          onClick={() => generate.mutate({ kind, context })}
        >
          {generate.isPending ? "生成中..." : "生成する"}
        </Button>
        {generate.data && (
          <div className="bg-ink/5 dark:bg-cream/5 mt-4 whitespace-pre-wrap rounded-lg p-4 text-sm">
            {generate.data.result}
          </div>
        )}
      </Card>

      <Card kicker="History" title="生成履歴">
        <div className="space-y-2">
          {generations.data?.length ? (
            generations.data.map((g) => (
              <details key={g.id} className="bg-ink/5 dark:bg-cream/5 rounded-lg p-3 text-sm">
                <summary className="flex cursor-pointer items-center gap-2">
                  <Badge tone="moss">{KIND_LABELS[g.kind]}</Badge>
                  <span className="text-ink/60 dark:text-cream/60 truncate">
                    {g.prompt.slice(0, 60)}
                  </span>
                </summary>
                <p className="mt-2 whitespace-pre-wrap">{g.result}</p>
              </details>
            ))
          ) : (
            <p className="text-ink/40 dark:text-cream/40 text-sm">まだ生成履歴はありません。</p>
          )}
        </div>
      </Card>
    </div>
  );
}
