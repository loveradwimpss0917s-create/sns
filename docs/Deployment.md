# Deployment

Target: Cloudflare Pages, with D1 / R2 / KV / Workers AI bindings, plus one
standalone Cloudflare Worker for the weekly report cron.

## Status

| Resource                             | Status               | Value                                                                                        |
| ------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------- |
| D1 database `vlog-control-room-db`   | ✅ created, migrated | `b70c6b73-979f-46d5-8fdf-a671d34f6742`                                                       |
| KV namespace (binding `CACHE`)       | ✅ created           | `3acc30fb49c94cca9c4a550b735ef64f`                                                           |
| KV namespace (binding `SESSION`)     | ✅ created           | `f020fee0ba2b4b36a8a7d4f947db8a81` — required by `@astrojs/cloudflare`'s session support     |
| R2 bucket `vlog-control-room-assets` | ✅ created           | —                                                                                            |
| D1 schema (19 tables)                | ✅ applied to remote | tracked in `d1_migrations` so future `wrangler d1 migrations apply --remote` won't re-run it |
| Cloudflare Pages project             | ✅ deployed          | `https://vlog-control-room.pages.dev`                                                        |
| GitHub Actions secrets               | ✅ set               | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`                                              |

Every push to `main` redeploys automatically via `.github/workflows/deploy.yml`.

Both `apps/web/wrangler.toml` and `packages/workers/report-worker/wrangler.toml`
already have the real `database_id` and KV `id` filled in above — nothing left to
copy-paste there.

## One-time step: get a Cloudflare API token and wire it into GitHub (✅ done)

Already completed for this repo — kept below for reference (e.g. setting up a
second environment). This is the one part of setup that only an account owner
can do — there's no way to create an API token without dashboard/account access.

1. **Create an API token** (in a mobile browser, e.g. Safari):
   - Go to `dash.cloudflare.com` → tap your profile icon (top right) → **My Profile**
     → **API Tokens**.
   - Tap **Create Token** → **Custom token** → **Get started**.
   - Name it e.g. `vlog-control-room-deploy`.
   - Under **Permissions**, add:
     - `Account` → `Cloudflare Pages` → `Edit`
     - `Account` → `Workers Scripts` → `Edit` (needed for the report worker)
   - Under **Account Resources**, select your account.
   - Tap **Continue to summary** → **Create Token**.
   - **Copy the token now** — it's shown only once.

2. **Find your Account ID**:
   - Still in the Cloudflare dashboard, go to any domain/Workers & Pages overview
     page — the **Account ID** is shown in the right-hand sidebar (or under
     **Workers & Pages** → **Overview**). It's a 32-character hex string.

3. **Add both as GitHub repo secrets**:
   - Go to `github.com/loveradwimpss0917s-create/sns` → **Settings** tab →
     **Secrets and variables** → **Actions**.
   - Tap **New repository secret**:
     - Name: `CLOUDFLARE_API_TOKEN`, Value: the token from step 1 → **Add secret**.
   - Tap **New repository secret** again:
     - Name: `CLOUDFLARE_ACCOUNT_ID`, Value: the account ID from step 2 → **Add secret**.

4. **Trigger the first deploy**:
   - Go to the **Actions** tab → **Deploy to Cloudflare Pages** (left sidebar) →
     **Run workflow** → branch `main` → **Run workflow**.
   - This runs `.github/workflows/deploy.yml`, which builds the app, runs
     `wrangler pages project create` (a no-op if the project already exists),
     then `wrangler pages deploy` from `apps/web` — wrangler reads
     `apps/web/wrangler.toml` (which has `pages_build_output_dir` plus the
     D1/KV/R2/AI bindings already filled in), so all bindings are wired up
     from the first deploy with no further dashboard configuration needed.
   - Every subsequent push to `main` redeploys automatically (the same workflow
     is also triggered by `on: push: branches: [main]`).

5. **If the deploy fails on the Workers AI binding**: your account may need
   Workers AI enabled once — Cloudflare dashboard → **Workers & Pages** → **AI**
   → follow the one-time enablement prompt, then re-run the workflow.

## Deploy the report worker (optional, for §9 weekly KPI rollups)

This is a second, separate Worker (not Pages) — deploy it once from a machine
with `wrangler` logged in (`wrangler login`), or add a small extra CI job using
the same two secrets:

```bash
cd packages/workers
pnpm deploy:report-worker
```

This deploys `report-worker/` with a Cron Trigger (`0 22 * * 6`, i.e. every
Saturday 22:00 UTC / Sunday 07:00 JST).

## GitHub Actions

- `.github/workflows/ci.yml` — lint/format/typecheck/test/build on every push and
  PR. Should stay green before merging to `main`.
- `.github/workflows/deploy.yml` — builds and deploys to Cloudflare Pages via
  `wrangler pages deploy` on every push to `main` (and on-demand via
  **Run workflow**). Needs the two secrets above.

## Local full-stack preview

`astro dev` alone does not have D1/R2/KV/AI bindings (it's plain Vite). To exercise
the real Cloudflare runtime locally:

```bash
pnpm --filter @vlog/web dev:full
# = astro build && wrangler pages dev ./dist --d1=DB --kv=CACHE --kv=SESSION --r2=ASSETS_BUCKET --ai=AI
```

See [`docs/Development.md`](./Development.md) for the day-to-day dev loop.
