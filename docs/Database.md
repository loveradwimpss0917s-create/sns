# Database

Cloudflare D1 (SQLite), modeled with Drizzle ORM in `packages/database/src/schema/`.
Every table maps to a section of the design doc; see the inline `/** */` comments in
each schema file for the exact §-reference.

## ER overview

```
series ─┐
        ├─< posts >─┬─< post_tags >─ tags
        │           ├─< shoots >─< shots >─ compositions
        │           │                    └─ equipment
        │           ├─< edit_projects >─ edit_templates
        │           │                 ├─ luts
        │           │                 ├─ subtitle_styles
        │           │                 └─ audio_assets
        │           ├─< kpi_snapshots (optional postId)
        │           ├─< revenue_entries (optional postId)
        │           └─< ai_generations (optional postId)
shoots ─< locations (locationId)
assets  (standalone R2 ledger, optionally tagged with postId/shootId)
weekly_goals (standalone, dashboard-only)
```

## Tables

| Table                | File         | Purpose                                                                                  |
| -------------------- | ------------ | ---------------------------------------------------------------------------------------- |
| `series`             | `content.ts` | 投稿シリーズ (§2-1: 中庭のある暮らし, 土曜のエスプレッソ, ...)                           |
| `tags` / `post_tags` | `content.ts` | Free-form post tagging/search                                                            |
| `posts`              | `content.ts` | Cross-platform post record: platform, status, title, body, hashtags, schedule            |
| `locations`          | `shoots.ts`  | 場所管理 (§4: 中庭/キッチン/リビング/...)                                                |
| `equipment`          | `shoots.ts`  | 機材管理 (§4-1〜4-3: iPhone+Blackmagic, α7C, settings presets)                           |
| `compositions`       | `shoots.ts`  | 構図の型 (§4-4: 定点マスター, 真俯瞰, ...)                                               |
| `shoots`             | `shoots.ts`  | A single shoot session (§3-1: 週2回・各90分)                                             |
| `shots`              | `shoots.ts`  | Shot list line items: composition, equipment, sound notes, B-roll flag, checked          |
| `luts`               | `editing.ts` | 自作フィルムLUT資産 (§5-2, §11-6 "最大の資産")                                           |
| `edit_templates`     | `editing.ts` | CapCutマスターテンプレート (§5-1)                                                        |
| `subtitle_styles`    | `editing.ts` | 字幕デザイン (§5-3: フォント/色/位置/日英併記)                                           |
| `audio_assets`       | `editing.ts` | BGM/SEライブラリ + ライセンス管理 (§4-5, §5-4)                                           |
| `edit_projects`      | `editing.ts` | Per-post editing progress + template/LUT/subtitle/BGM/export selection                   |
| `assets`             | `assets.ts`  | R2 object ledger: video/photo/lut/preset/thumbnail/bgm/se                                |
| `kpi_snapshots`      | `kpi.ts`     | Per-platform metrics snapshot (§9: followers, views, retention, CTR, save/comment rate)  |
| `weekly_goals`       | `kpi.ts`     | Dashboard "今週の目標"                                                                   |
| `revenue_entries`    | `revenue.ts` | Amazon/楽天/案件/LUT販売/プリセット販売/広告 (§7)                                        |
| `ai_generations`     | `ai.ts`      | History of every AI generation, with provider recorded for future multi-provider support |

## Conventions

- Primary keys are `nanoid()` strings, not autoincrement integers — generated in the
  API layer (`packages/workers/src/api/crud.ts`), never by the database.
- Every table has `createdAt`/`updatedAt` (`integer` unix-seconds, Drizzle
  `{ mode: "timestamp" }`, so application code reads/writes native `Date`).
- Foreign keys are nullable by default (e.g. `posts.seriesId`) — this is a personal
  planning tool, not a form validator; partial data must not block saving.
- Enums (platform, post status, asset kind, revenue source, AI kind) are plain
  `text` columns constrained by TypeScript `as const` tuples in
  `packages/database/src/schema/common.ts` and mirrored in `packages/shared/src/types.ts`
  — SQLite has no native enum type, and D1 does not enforce `CHECK` constraints
  the way Drizzle's `pgEnum` would on Postgres.

## Migrations

```bash
pnpm db:generate        # drizzle-kit generate — diffs schema/ against migrations/
pnpm db:migrate:local    # wrangler d1 migrations apply --local
pnpm db:migrate:remote   # wrangler d1 migrations apply --remote
```

The initial migration (`packages/database/migrations/0000_*.sql`) creates all 19
tables and is checked into the repo — see [`docs/Deployment.md`](./Deployment.md) for
first-time D1 setup.
