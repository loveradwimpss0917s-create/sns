# Roadmap

This MVP covers every feature area listed in the brief's "実装する機能" section as a
working, D1/R2/KV/AI-backed CRUD tool. The brief also explicitly lists a "将来追加予定"
(future work) section — this file tracks that work as concrete, sequenced items so
it can become GitHub Issues (see the repo's Issues tab) without re-deriving scope
from scratch each time.

## Near-term (unblocks daily use)

- [x] **Seed data** — `scripts/seed.ts` inserts the 6 default compositions (§4-4),
      the 3 default equipment presets (§4-1〜4-3), and the standard subtitle style
      (§5-3: Noto Serif JP Light, #EFE6D8, 15% from bottom) against a running
      `dev:full` server. Run via `pnpm db:seed`.
- [ ] **Multiplication-table content generator** (§3-4) — a dedicated UI (or an
      `/ai` "kind: idea_matrix") that randomly combines the 6 locations × 6 actions ×
      6 weather/time buckets described in §3-4 into concrete shoot proposals, wired
      into the AI planning flow instead of leaving it as free-text context.
- [ ] **Weekly report surfacing** — the `report-worker`'s cron already writes
      `weekly-report:latest` to KV; the Dashboard doesn't read it yet. Add a
      `GET /api/dashboard/weekly-report` route that reads that KV key.

## AI Provider Abstraction

`packages/workers/src/api/routes/ai.ts` hard-codes Cloudflare Workers AI
(`@cf/meta/llama-3.1-8b-instruct`). `ai_generations.provider` already records which
provider produced a result, anticipating this:

- [ ] Extract an `AiProvider` interface (`generate(prompt, systemPrompt): Promise<string>`)
      and one implementation per provider: `workers-ai` (current), `claude` (Anthropic
      Messages API), `openai`, `gemini`.
- [ ] Provider choice per-request (query param or per-`AiKind` config) instead of a
      single hard-coded model — planning/analysis likely benefit from a stronger model
      than title/hashtag generation.
- [ ] Secrets: `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` as Cloudflare
      Pages secrets, read via `c.env` — never commit them, never log them.

## Platform integrations (§将来追加予定)

- [ ] **YouTube Data API** — OAuth flow, `posts.url`/`publishedAt` sync from real
      YouTube uploads, and eventually scheduled auto-publish for `status: "scheduled"`
      posts.
- [ ] **Instagram Graph API** — same shape for Reels/feed posts; note Meta's app
      review requirements are non-trivial for a personal-use app and may mean staying
      manual longer than YouTube.
- [ ] **TikTok API** — content posting API access is invite-gated; track eligibility
      before committing engineering time here.
- [ ] **Auto-post** — once at least one platform API is wired up, a scheduled Worker
      (same pattern as `report-worker/`) that polls `posts` where
      `status = "scheduled" AND scheduledAt <= now()` and publishes them.
- [ ] **Auto-analysis** — extend `report-worker` to call the AI provider abstraction
      above with the week's KPI snapshots and write the result into `ai_generations`
      with `kind: "analysis"`, so the Monday-morning "何が伸びたか" question is answered
      before you open the dashboard.
- [ ] **Auto-report** — a scheduled email/notification (Cloudflare Email Workers or
      a simple webhook) summarizing the week, generated from the same data.

## Multi-user (explicitly out of scope today per the brief, but designed for)

- [ ] `users` table (id, email, createdAt) + a `sessions` table or Cloudflare Access
      integration.
- [ ] Add a nullable `userId` column to every table that currently has none, backfill
      the single existing user, then make it `NOT NULL`.
- [ ] Scope every query in `packages/workers/src/api/crud.ts` and the hand-written
      routes by `userId` from the authenticated session — this is the one place the
      generic CRUD factory will need a real signature change (an `auth` middleware
      injecting `c.get("userId")`, plus a `where(eq(table.userId, userId))` clause
      added to every query).
- [ ] Decide on billing/plan tiers if this ever goes beyond friends-and-family.

## Nice-to-haves noted but not committed to

- Thumbnail generation/compositing tools (the brief's LUT/preset assets could feed
  a "preview my thumbnail in brand colors" tool).
- CapCut project file (`.dra`) parsing to auto-populate `edit_projects` fields
  instead of manual entry — CapCut's project format isn't officially documented,
  so this is speculative.
