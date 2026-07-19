import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./common";

/**
 * AI生成履歴 (§8): 企画/タイトル/概要欄/IG本文/TikTok本文/ハッシュタグ/SEO/分析/改善提案。
 * どのプロバイダで生成したか記録し、将来 Claude/OpenAI/Gemini API を差し替え可能にする (§Roadmap)。
 */
export const aiGenerations = sqliteTable("ai_generations", {
  id: id(),
  kind: text("kind").notNull(), // planning | title | description | ig_caption | tiktok_caption | hashtags | seo | analysis | improvement
  provider: text("provider").notNull().default("workers-ai"), // workers-ai | claude | openai | gemini
  prompt: text("prompt").notNull(),
  result: text("result").notNull(),
  postId: text("post_id"),
  ...timestamps,
});
