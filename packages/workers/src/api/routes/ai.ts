import { Hono } from "hono";
import { nanoid } from "nanoid";
import { desc } from "drizzle-orm";
import { createDb } from "@vlog/database";
import { aiGenerations } from "@vlog/database";
import { aiGenerationRequestSchema } from "@vlog/shared";
import type { Env } from "../../env";

const PROMPT_PREFIX: Record<string, string> = {
  planning:
    "掛け算表(場所×行為×天気)から企画を5本、各ショットリスト8カット、想定フック付きで提案して。",
  title: "感情+具体型のYouTubeタイトルを日本語+英語サブタイトルで10案出して。",
  description: "概要欄(詩的要約1行→英訳→チャプター→機材リスト→LUT案内→SNSリンク)を生成して。",
  ig_caption: "Instagram用キャプションを1行目で完結する詩+英語1行で生成して。",
  tiktok_caption: "TikTok用の冒頭フックテキスト(疑問・数字・逆説)を5案生成して。",
  hashtags: "動画内容に合うハッシュタグをYouTube/Instagram/TikTok別に生成して。",
  seo: "検索流入を狙ったタイトル・タグ・説明文のSEO改善案を出して。",
  analysis: "先週の数値から伸びた要因・落ちた要因を分析して。",
  improvement: "来週やめること1つ・増やすこと1つを提案して。",
};

/**
 * AI企画/タイトル/概要欄/分析エンドポイント (§8, §11-6).
 * 既定は Cloudflare Workers AI。Claude/OpenAI/Gemini への切り替えは
 * docs/Roadmap.md の "AI Provider Abstraction" を参照。
 */
export const aiRoutes = new Hono<{ Bindings: Env }>();

aiRoutes.get("/generations", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db
    .select()
    .from(aiGenerations)
    .orderBy(desc(aiGenerations.createdAt))
    .limit(30)
    .all();
  return c.json({ data: rows });
});

aiRoutes.post("/generate", async (c) => {
  const body = await c.req.json();
  const parsed = aiGenerationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_input", details: parsed.error.flatten() }, 400);
  }
  const { kind, context, postId } = parsed.data;
  const prompt = `${PROMPT_PREFIX[kind] ?? ""}\n\n---\n${context}`;

  let result: string;
  try {
    const aiResponse = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content:
            "あなたは「顔出し・声出しゼロ」の暮らしVlogチャンネルの制作アシスタントです。詩的で余白のある、体言止め中心の日本語で答えてください。",
        },
        { role: "user", content: prompt },
      ],
    });
    result =
      typeof aiResponse === "object" && aiResponse !== null && "response" in aiResponse
        ? String((aiResponse as { response: unknown }).response)
        : String(aiResponse);
  } catch (err) {
    result = `[AI generation unavailable in this environment: ${(err as Error).message}]`;
  }

  const db = createDb(c.env.DB);
  const id = nanoid();
  await db
    .insert(aiGenerations)
    .values({ id, kind, provider: "workers-ai", prompt, result, postId })
    .run();

  return c.json({ data: { id, kind, provider: "workers-ai", prompt, result, postId } });
});
