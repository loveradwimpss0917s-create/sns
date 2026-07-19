# Architecture

Vlog管制室 is a personal-use (single-user, multi-user-ready) operations OS for a
faceless lifestyle vlog brand, built to satisfy [`SNSブランド設計書.md`](./SNSブランド設計書.md).
This document explains how the pieces fit together and why.

## Monorepo layout (Feature-First)

```
apps/
  web/                  Astro + React + Tailwind PWA — the only deployable app
    src/
      components/       Shared, feature-agnostic UI (Button, Card, CommandPalette, ...)
      features/         One folder per feature (dashboard, posts, shoots, editing, ai, kpi, assets, revenue)
        <feature>/
          components/   React views for that feature
          hooks/        React Query hooks for that feature
      hooks/            Cross-feature hooks (useDarkMode, ...)
      lib/               api-client, query-client, use-resource (generic CRUD hook)
      layouts/          BaseLayout.astro (head, PWA meta, dark-mode bootstrap)
      pages/            Astro file-based routes, one per feature + api/[...path].ts
      styles/           global.css (Tailwind + glass/film design tokens)
packages/
  database/             Drizzle ORM schema for Cloudflare D1 (source of truth for all tables)
  shared/                Cross-cutting TS types, zod schemas, brand constants
  workers/               The Hono API app (@vlog/workers) + a standalone scheduled report worker
scripts/                 One-off scripts (seed.ts)
docs/                    This documentation set
.github/                 CI, deploy workflow, issue templates
```

Every top-level feature named in the design doc's §Dashboard/§投稿管理/.../§収益 sections
maps 1:1 to a folder under `apps/web/src/features/`. There is no shared "god" store —
each feature owns its API resource(s) and hooks.

## Why Astro + React islands (not a pure SPA)

- Astro's `output: "server"` + `@astrojs/cloudflare` adapter turns every page into a
  Cloudflare Pages Function automatically, so **the web app and the API are one
  deployable unit** — no separate backend to stand up for personal use.
- Each page mounts exactly one `client:load` React island (e.g. `<DashboardView />`),
  keeping JS shipped per-route small — important for "高速表示" on mobile.
- Islands share the design system in `src/components/ui` and a single React Query
  client (`src/lib/query-client.ts`) via `<AppProviders>`.

## Why a shared Hono app instead of routes scattered across Pages Functions

All API logic lives in `packages/workers/src/api/app.ts` as a single Hono app
(`apiApp`). `apps/web/src/pages/api/[...path].ts` is a **2-line adapter** that forwards
every `/api/*` request into `apiApp.fetch(request, env, ctx)` using the Cloudflare
runtime bindings Astro exposes on `Astro.locals.runtime`.

This keeps "Workers" a first-class architectural layer (as the brief requires) while
still deploying as Pages Functions:

- `packages/workers/src/api/app.ts` — routes, mounted by resource
- `packages/workers/src/api/crud.ts` — a generic list/get/create/update/delete
  factory over a Drizzle table + zod schema, used by every simple resource
  (posts, shoots, shots, locations, equipment, compositions, luts, edit templates,
  subtitle styles, audio assets, edit projects, kpi snapshots, weekly goals,
  revenue entries)
- `packages/workers/src/api/routes/*.ts` — hand-written routes for things that
  aren't plain CRUD: `dashboard.ts` (cross-table aggregation), `ai.ts` (Workers AI
  call + history), `assets.ts` (R2 upload/download)
- `packages/workers/report-worker/` — a **second, independently deployable** Worker
  with its own `wrangler.toml` and a Cron Trigger, reusing the same `@vlog/database`
  and `Env` types. It exists for the weekly KPI rollup described in §9, decoupled
  from request/response latency.

## Data flow

```
React island → src/lib/api-client.ts (fetch) → /api/* → apiApp (Hono)
  → packages/workers/src/api/{crud,routes}/* → @vlog/database (Drizzle) → D1
                                              → R2 (assets)
                                              → Workers AI (ai routes)
report-worker (Cron) → @vlog/database → D1 → KV (weekly-report:latest cache)
```

## Design tokens

`packages/shared/src/brand.ts` is the single source of truth for the 4 brand colors
from §1-5 (`cream`, `moss`, `ember`, `ink`). `apps/web/tailwind.config.mjs` mirrors
those exact hex values so Tailwind classes (`bg-cream`, `text-ember`, ...) and any
future thumbnail/export tooling never drift from the brand palette.

## PWA & offline

- `@vite-pwa/astro` generates the manifest and a Workbox service worker at build time.
- API responses are cached `StaleWhileRevalidate` so the dashboard/posts/etc. still
  render with the last-known data when offline; images are `CacheFirst`.
- `src/pages/offline.astro` is the Workbox `navigateFallback` shown for uncached
  navigations while offline.
- Dark mode uses a `class` strategy toggled by `useDarkMode` and bootstrapped by an
  inline `<script>` in `BaseLayout.astro` to avoid a flash of the wrong theme.

## Multi-user readiness

The schema and API are already user-agnostic (no `userId` foreign keys yet, because
today's brief is explicitly single-user). Adding multi-tenancy later is additive, not
a rewrite — see [`docs/Roadmap.md`](./Roadmap.md) for the planned `users` /
`sessions` tables and how every existing table would gain a `userId` column plus a
Cloudflare Access or D1-backed auth check in `apps/web/src/middleware.ts`.
