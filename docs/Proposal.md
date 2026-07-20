# Proposal — gaps in the design doc, and the calls made to keep building

`SNSブランド設計書.md` is a brand/content strategy document, not a software spec — it
describes _what the business needs_ (Dashboard, 投稿管理, 撮影管理, ...) but doesn't
specify database shapes, API contracts, or auth models. Per the task instructions,
anything not explicitly decided by the design doc is recorded here as a proposal
rather than silently invented and buried in code. Everything below was implemented
using the "Recommended" option unless stated otherwise — flag if you want a
different choice and it's a small change.

## 1. Data model shape (implemented as proposed)

The design doc names features (§Dashboard, §投稿管理, ...) but not tables/fields. I
modeled 19 tables (see `docs/Database.md`) directly from the feature list under
"実装する機能" in the task, cross-referenced against every §-numbered detail in the
design doc (e.g. `shots.soundNotes` exists because §4-5 calls out "生活音の別撮り";
`luts.isForSale`/`priceJpy` exist because §7 describes LUT sales as a revenue
stream). **No design-doc content was skipped**, but the _exact column names and
types_ are my proposal, not a spec — reasonable to revisit once real usage reveals
which fields actually get filled in vs. ignored.

## 2. AI provider for the MVP: Cloudflare Workers AI, not Claude/OpenAI/Gemini

§8-1 assigns roles to Claude (Fable), Claude (Sonnet/API), and ChatGPT. None of
those are usable inside a Cloudflare Worker without an API key you'd need to
provision and pay for separately (Anthropic/OpenAI/Google API keys are not part of
the "必須条件"/"技術スタック" lists, which only name **Cloudflare AI**). I built the
`/api/ai/generate` endpoint against Cloudflare Workers AI
(`@cf/meta/llama-3.1-8b-instruct`) so the feature works out of the box on the
required stack, and recorded `provider` on every `ai_generations` row so swapping in
Claude/OpenAI/Gemini later (tracked in `docs/Roadmap.md`) is additive, not a
rewrite.

**Ask**: if you already have an Anthropic API key you want used from day one instead
of Workers AI, say so and I'll wire the provider abstraction now rather than later.

## 3. Auth / multi-user: none in the MVP

The brief says both "対象ユーザーは私1人です。個人利用を前提にしてください" and,
separately, "将来的にユーザー追加できる設計" — i.e. build for one user now, but don't
paint yourself into a corner. I took this literally: **no login screen, no
`userId` anywhere today**, but the schema/API are structured so adding a `userId`
column + an auth middleware is additive (see `docs/Roadmap.md` §Multi-user). I did
not implement any auth (not even a basic password gate) because the brief never
asks for one for the single-user case, and Cloudflare Access (zero-config
IP/email-based gating in front of Pages, no app code needed) is the natural fit
whenever you do want to lock the deployed URL down — that's a Cloudflare dashboard
setting, not something this repo needs to implement.

## 4. Platform publishing automation: out of scope for this MVP, by design-doc's own admission

§将来追加予定 explicitly lists "YouTube API / Instagram API / TikTok API / ... /
自動投稿" as _future_ work, separate from the "実装する機能" list this MVP covers. I
did not build OAuth flows or posting integrations — `posts.status` moves between
draft/scheduled/published by your own hand in the UI, and `posts.url` is a plain
text field you fill in once you've actually published somewhere. Building real
platform integrations requires you to register developer apps with Google/Meta/
TikTok (each has its own review process, and TikTok's Content Posting API is
invite-gated) — that's a prerequisite outside this repo's control, tracked in
`docs/Roadmap.md`.

## 5. CapCut integration: metadata tracking only, no file automation; in-app editing covers short-form

§5 describes a CapCut-based editing workflow in detail (LUTs, templates, subtitle
style, BGM/SE, export settings). CapCut has no public API and its `.dra` project
file format is undocumented, so `edit_projects` tracks _what you intend to use_
(which LUT, which template, which subtitle style) and _status_ — it does not open
CapCut or manipulate its files. This matches what's achievable without reverse-
engineering a closed format; flagged here in case a CapCut automation path becomes
available later.

To make the app practically usable without leaving it, the Editing feature's
"動画編集" tab now runs a real, entirely client-side (ffmpeg.wasm) editing
pipeline: pick a video (local file or an existing R2 asset) → trim → apply a
self-made LUT (`.cube`, via `lut3d`) → burn in bilingual JA/EN captions
(`drawtext`, with a lazily-fetched Kosugi CJK font) → export MP4, then
download or save the result back to Assets. All processing happens in the
browser (no server-side video work in a Cloudflare Worker), so it's scoped to
short-form clips (15–60s) that a phone/laptop can encode in reasonable time —
long-form main-channel edits are still CapCut's job.

## 6. Brand icons/thumbnails: placeholder SVGs

The design doc specifies exact brand colors (§1-5) but no logo/icon artwork. The PWA
manifest icons (`apps/web/public/icons/*.svg`) are a minimal circle-in-square glyph
using the 3 brand colors — a placeholder, not a designed mark. Swap these for real
artwork whenever you have it; nothing else in the app depends on their content.

## 7. KPI/revenue data entry: manual today

§9 describes KPI targets (retention, CTR, save rate, ...) but the actual numbers
only exist inside YouTube Studio / Instagram Insights / TikTok Analytics, none of
which this MVP calls. `kpi-snapshots`/`revenue-entries` are manual-entry forms
today — accurate once you've entered a number, but not automatically pulled. This
is the same "future API integration" gap as #4 above, not a separate decision.
