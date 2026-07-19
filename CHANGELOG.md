# Changelog

All notable changes to this project are documented in this file.
The format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] — Initial build

### Added

- Monorepo scaffold (pnpm workspaces): `apps/web`, `packages/database`,
  `packages/shared`, `packages/workers`.
- Drizzle ORM schema for Cloudflare D1 covering all 19 entities from the design
  doc (posts, series, tags, locations, equipment, compositions, shoots, shots,
  luts, edit templates, subtitle styles, audio assets, edit projects, assets, KPI
  snapshots, weekly goals, revenue entries, AI generations).
- Shared TypeScript types + zod validation schemas (`packages/shared`).
- Hono API app (`@vlog/workers`) with generic CRUD routes, a dashboard aggregation
  endpoint, an AI generation endpoint (Cloudflare Workers AI), and an R2-backed
  assets upload/download endpoint.
- Standalone scheduled report worker (`packages/workers/report-worker`) for weekly
  KPI rollups via Cron Trigger.
- Astro + React PWA (`apps/web`) with all 8 features: Dashboard, 投稿管理, 撮影管理,
  編集管理, AI, KPI, アセット, 収益 — mobile-first, dark mode, glass/film design
  system, Command Palette (⌘K), toasts, skeleton loading states, offline support
  via Workbox.
- Full tooling: ESLint (flat-adjacent `.eslintrc.cjs` covering `.ts`/`.tsx`/`.astro`),
  Prettier (+ Astro/Tailwind plugins), Vitest unit tests, Playwright E2E scaffold,
  GitHub Actions CI (`lint`/`format:check`/`typecheck`/`test`/`build`) and a
  Cloudflare Pages deploy workflow.
- Documentation set: Architecture, Database, API, Deployment, Development, Roadmap,
  CodingRules, Proposal, plus the source design doc under `docs/`.
