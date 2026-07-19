# @vlog/database

Drizzle ORM schema for Cloudflare D1, modeling every entity in `SNSブランド設計書.md`.

- `src/schema/*` — table definitions, grouped by feature (content, shoots, editing, assets, kpi, revenue, ai)
- `src/client.ts` — `createDb(d1)` typed Drizzle client factory
- `drizzle.config.ts` — drizzle-kit config (D1 dialect)

## Commands

```bash
pnpm db:generate        # generate SQL migrations from schema changes
pnpm db:migrate:local    # apply migrations to local D1 (wrangler)
pnpm db:migrate:remote   # apply migrations to the remote D1 database
```

See `docs/Database.md` for the full ER overview.
