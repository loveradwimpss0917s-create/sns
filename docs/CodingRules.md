# Coding Rules

## General

- TypeScript everywhere, `strict: true` (see `tsconfig.base.json`). No `any` without
  a `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment
  explaining why (the one deliberate exception today is the generic table plumbing
  in `packages/workers/src/api/crud.ts` — Drizzle's per-table generics don't
  specialize through a shared helper).
- Feature-First: code for one feature lives under one `features/<name>/` folder.
  Don't reach into another feature's `components/`/`hooks/` — go through
  `packages/shared` or a documented API route instead.
- No comments explaining _what_ code does — name things well instead. Comments are
  reserved for _why_ (a §-reference to the design doc, a non-obvious constraint, a
  workaround).
- Don't add abstractions, config flags, or "just in case" fields for requirements
  that aren't in `docs/SNSブランド設計書.md`. If something's missing, it goes in
  `docs/Proposal.md`, not into the code.

## Frontend (apps/web)

- One Astro page per feature; the page itself does nothing but mount exactly one
  `<FeaturePage client:load />` island (e.g. `DashboardPage`, `PostsPage`) that
  internally renders `<AppShell><FeatureView /></AppShell>` as one real React
  tree. **Never** write `<AppShell client:load><FeatureView client:load /></AppShell>`
  directly in an `.astro` file — each `client:*` directive is an independent
  hydration root, so a nested island does not share `AppShell`'s
  `QueryClientProvider` (or any other context) and every `useQuery` call in it
  throws `No QueryClient set` server-side, silently truncating the SSR output
  to a near-empty `<body>`. All real UI logic lives in
  `src/features/<name>/components`.
- Data fetching goes through `src/lib/use-resource.ts` (generic CRUD) or a
  feature-specific hook in `src/features/<name>/hooks/` — never `fetch()` directly
  inside a component body except for the two special cases that don't fit the JSON
  CRUD shape (file upload/download in `AssetsView.tsx`).
- Every mutation shows a toast (success or error) via `sonner` — silent failures are
  not acceptable in a tool with no other feedback loop.
- Tailwind only; no CSS-in-JS. Compose with the existing `film-card` / `glass-panel`
  / `kicker` utility classes in `src/styles/global.css` before inventing new ones.
- Respect the 4-color brand palette (`cream`/`moss`/`ember`/`ink` from
  `@vlog/shared`'s `BRAND_COLORS`) — don't introduce ad-hoc colors in features.
- Video processing (`src/lib/ffmpeg.ts`, `VideoEditor.tsx`) runs entirely client-side
  via ffmpeg.wasm — never add server-side video encoding to a Worker. The ffmpeg
  core is lazy-loaded from a CDN on first export (not bundled), so keep any new
  editing feature behind the same lazy `getFFmpeg()` singleton rather than loading
  it eagerly on page mount.

## Backend (packages/workers, packages/database)

- Every mutating route validates its body with a zod schema from
  `packages/shared/src/schemas.ts` before touching the database.
- IDs are `nanoid()`, generated server-side, never trusted from the client.
- New simple resources should use `crudRoutes()` before writing a bespoke route —
  only reach for a hand-written route (`src/api/routes/*.ts`) when the operation
  isn't plain CRUD (aggregation, file I/O, external API calls).
- Database schema changes always go through Drizzle (`pnpm db:generate`) — never
  hand-edit a generated migration file, and never run raw ALTER TABLE against the
  remote D1 database outside of a migration.

## Commits

- Small, meaningful commits: one feature/fix per commit, imperative mood
  ("Add posts CRUD routes", not "posts stuff").
- Every feature commit should leave `pnpm lint && pnpm typecheck && pnpm test &&
pnpm build` green.
