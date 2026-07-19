/**
 * Cloudflare bindings shared by the Pages Functions API and the standalone
 * report worker. Kept in one place so wrangler.toml / astro.config bindings
 * stay in sync with the TypeScript surface.
 */
export interface Env {
  DB: D1Database;
  ASSETS_BUCKET: R2Bucket;
  CACHE: KVNamespace;
  AI: Ai;
  /** Reserved for future YouTube/Instagram/TikTok/LLM API keys (see docs/Roadmap.md). */
  [key: string]: unknown;
}
