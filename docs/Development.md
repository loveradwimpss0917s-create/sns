# Development

## Prerequisites

- Node.js ≥ 20
- pnpm (`corepack enable` or `npm i -g pnpm`)
- A Cloudflare account (for `wrangler` commands — not required just to run `astro dev`)

## Setup

```bash
pnpm install
```

## Day-to-day

```bash
pnpm dev              # astro dev — fast iteration on UI, no D1/R2/KV/AI (see below)
pnpm --filter @vlog/web dev:full   # full Cloudflare runtime via wrangler pages dev
pnpm lint             # eslint . --ext .ts,.tsx,.astro
pnpm format           # prettier --write .
pnpm format:check     # prettier --check .
pnpm typecheck        # astro check + tsc --noEmit across every workspace
pnpm test             # vitest run (unit tests: packages/shared, packages/workers)
pnpm test:watch       # vitest (watch mode)
pnpm test:e2e         # playwright test (spins up dev:full automatically)
pnpm build            # astro build (apps/web)
```

`pnpm dev` alone is enough for pure UI work, but every fetch to `/api/*` will 404
since Astro's plain dev server has no Cloudflare bindings. Use `dev:full` whenever
you're touching anything backed by D1/R2/KV/AI.

## Adding a new feature

Follow the Feature-First layout already used by `posts`, `shoots`, etc.:

1. **Schema** (if new data): add a table to `packages/database/src/schema/<domain>.ts`,
   export it from `schema/index.ts`, run `pnpm db:generate`, then
   `pnpm db:migrate:local` / `:remote`.
2. **Shared contract**: add the TS type to `packages/shared/src/types.ts` and the
   zod input schema to `packages/shared/src/schemas.ts`.
3. **API route**: if it's plain CRUD, one line in `packages/workers/src/api/app.ts`
   via `crudRoutes(table, schema)`. Otherwise add a file under
   `packages/workers/src/api/routes/`.
4. **Frontend**: create `apps/web/src/features/<feature>/{components,hooks}` and an
   Astro page at `apps/web/src/pages/<feature>.astro` that mounts
   `<AppShell><YourView client:load /></AppShell>`. Reuse `useResource()` from
   `src/lib/use-resource.ts` for standard list/create/update/delete, and
   `EntityPanel`/`ReferenceManager` from `src/components/ui` for simple
   master-data screens instead of hand-rolling another CRUD form.
5. **Nav**: add the route to the `NAV` array in both
   `src/components/layout/AppShell.tsx` and `src/components/ui/CommandPalette.tsx`.

## Code style

See [`docs/CodingRules.md`](./CodingRules.md).

## Testing philosophy

- **Unit tests** (`vitest`) cover pure logic with no Cloudflare runtime dependency:
  zod schemas, brand constants, future pure helpers. They live next to the code as
  `*.test.ts`.
- **E2E tests** (`playwright`) drive the real app through `wrangler pages dev`,
  because that's the only way to exercise D1/R2/KV/AI-backed behavior faithfully.
  Keep these to smoke-level assertions (page loads, nav works, command palette
  opens) — deep business-logic testing belongs in unit tests closer to the code.
- There is intentionally no test database seeding pipeline yet; D1's local SQLite
  file starts empty on every `wrangler pages dev` run unless you apply migrations
  first (`pnpm db:migrate:local`).
