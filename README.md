# Vlog管制室 | Vlog Control Room

An AI operations OS for running a faceless ("顔出し・声出しゼロ") lifestyle vlog brand
across YouTube, Instagram, and TikTok — built from a single source of truth,
[`docs/SNSブランド設計書.md`](docs/SNSブランド設計書.md). Personal-use PWA, installable,
offline-capable, dark-mode-aware.

## What it does

| Feature   | Route      | Covers                                                                   |
| --------- | ---------- | ------------------------------------------------------------------------ |
| Dashboard | `/`        | 今日やること・投稿予定・KPI・週間進捗・収益・今週の目標・AI提案          |
| 投稿管理  | `/posts`   | YouTube/Instagram/TikTok横断の下書き/予約/公開管理、検索、タグ、シリーズ |
| 撮影管理  | `/shoots`  | ショットリスト、場所・機材・構図マスタ、生活音/B-rollメモ                |
| 編集管理  | `/editing` | 編集プロジェクト進捗、LUT/テンプレート/字幕/BGM・SEライブラリ            |
| AI        | `/ai`      | 企画・タイトル・概要欄・IG/TikTok本文・ハッシュタグ・SEO・分析・改善提案 |
| KPI       | `/kpi`     | プラットフォーム別 登録者/再生/維持率/CTR/保存率/コメント率、週間目標    |
| アセット  | `/assets`  | 動画・写真・LUT・プリセット・サムネ・BGM(R2保管)                         |
| 収益      | `/revenue` | Amazon/楽天/案件/LUT販売/プリセット販売/広告収益                         |

## Stack

Astro (server output) + React islands + TypeScript + Tailwind CSS, deployed to
Cloudflare Pages with D1 (Drizzle ORM) / R2 / KV / Workers AI bindings. See
[`docs/Architecture.md`](docs/Architecture.md) for the full rationale.

## Monorepo

```
apps/web/         Astro + React PWA (the only deployable — API included via Pages Functions)
packages/database/ Drizzle schema + migrations for D1
packages/shared/    Cross-cutting types, zod schemas, brand constants
packages/workers/   Hono API app (@vlog/workers) + standalone weekly-report cron worker
docs/               Architecture, Database, API, Deployment, Development, Roadmap, CodingRules, Proposal, and the design doc itself
```

## Getting started

```bash
pnpm install
pnpm dev              # UI-only dev server (no D1/R2/KV/AI — see docs/Development.md)
pnpm --filter @vlog/web dev:full   # full Cloudflare runtime via wrangler pages dev
```

Then:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Full setup (D1/R2/KV creation, first deploy, CI secrets) is in
[`docs/Deployment.md`](docs/Deployment.md).

## Docs

- [`docs/Architecture.md`](docs/Architecture.md) — how the pieces fit together
- [`docs/Database.md`](docs/Database.md) — schema / ER overview
- [`docs/API.md`](docs/API.md) — every `/api/*` route
- [`docs/Deployment.md`](docs/Deployment.md) — Cloudflare setup, CI/CD
- [`docs/Development.md`](docs/Development.md) — day-to-day dev loop
- [`docs/CodingRules.md`](docs/CodingRules.md) — conventions
- [`docs/Roadmap.md`](docs/Roadmap.md) — what's next (platform APIs, AI provider swap, multi-user)
- [`docs/Proposal.md`](docs/Proposal.md) — design-doc gaps and the calls made to fill them
- [`docs/SNSブランド設計書.md`](docs/SNSブランド設計書.md) — the source requirements doc

## License

MIT — see [`LICENSE`](LICENSE).
