# Deployment

Target: Cloudflare Pages, with D1 / R2 / KV / Workers AI bindings, plus one
standalone Cloudflare Worker for the weekly report cron.

## 1. One-time Cloudflare setup

```bash
npm i -g wrangler
wrangler login

# D1
wrangler d1 create vlog-control-room-db
# → copy the returned database_id into:
#   - apps/web/wrangler.toml            [[d1_databases]] database_id
#   - packages/workers/report-worker/wrangler.toml

# KV
wrangler kv namespace create CACHE
# → copy the returned id into the same two files' [[kv_namespaces]] id

# R2
wrangler r2 bucket create vlog-control-room-assets
```

Workers AI needs no separate resource — the `[ai]` binding in
`apps/web/wrangler.toml` is enough as long as the Cloudflare account has Workers AI
enabled.

## 2. Apply migrations

```bash
pnpm db:migrate:remote   # applies packages/database/migrations/*.sql to the remote D1 DB
```

## 3. Create the Pages project

```bash
cd apps/web
pnpm build
wrangler pages project create vlog-control-room
wrangler pages deploy ./dist --project-name vlog-control-room
```

After the first deploy, add the bindings to the Pages project (Dashboard → Pages →
vlog-control-room → Settings → Functions), matching `apps/web/wrangler.toml`:

- D1 database binding: `DB` → `vlog-control-room-db`
- KV namespace binding: `CACHE`
- R2 bucket binding: `ASSETS_BUCKET` → `vlog-control-room-assets`
- Workers AI binding: `AI`

(Cloudflare Pages currently requires bindings to be set once via the dashboard or
`wrangler pages deploy --binding` flags in addition to `wrangler.toml`, since Pages
projects don't yet read `[[d1_databases]]` etc. from `wrangler.toml` the same way
plain Workers do — check the Cloudflare docs for the current state before your first
deploy, since this is an area Cloudflare has iterated on.)

## 4. Deploy the report worker (optional, for §9 weekly KPI rollups)

```bash
cd packages/workers
pnpm deploy:report-worker
```

This deploys `report-worker/` as its own Worker with a Cron Trigger
(`0 22 * * 6`, i.e. every Saturday 22:00 UTC / Sunday 07:00 JST).

## 5. GitHub Actions (automatic deploys)

`.github/workflows/deploy.yml` runs on every push to `main` and deploys via
`cloudflare/pages-action`. It needs two repo secrets:

- `CLOUDFLARE_API_TOKEN` — a token with "Cloudflare Pages: Edit" permission
- `CLOUDFLARE_ACCOUNT_ID`

`.github/workflows/ci.yml` runs lint/format/typecheck/test/build on every push and
PR and should stay green before merging to `main`.

## Local full-stack preview

`astro dev` alone does not have D1/R2/KV/AI bindings (it's plain Vite). To exercise
the real Cloudflare runtime locally:

```bash
pnpm --filter @vlog/web dev:full
# = astro build && wrangler pages dev ./dist --d1=DB --kv=CACHE --r2=ASSETS_BUCKET --ai=AI
```

See [`docs/Development.md`](./Development.md) for the day-to-day dev loop.
