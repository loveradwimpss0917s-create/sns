# API

All endpoints are served under `/api/*` by the shared Hono app in
`packages/workers/src/api/app.ts` (see [`docs/Architecture.md`](./Architecture.md) for
why). Responses are JSON, always shaped `{ data: T }` or `{ data: T[] }`; errors are
`{ error: string, details?: unknown }` with a non-2xx status.

## Generic CRUD resources

These all follow the same 5-route shape (`crudRoutes()` in `src/api/crud.ts`),
validated against the matching zod schema in `packages/shared/src/schemas.ts`:

| Resource               | Zod schema                               |
| ---------------------- | ---------------------------------------- |
| `/api/posts`           | `postInputSchema`                        |
| `/api/series`          | `seriesInputSchema`                      |
| `/api/tags`            | `seriesInputSchema.pick({ name: true })` |
| `/api/shoots`          | `shootInputSchema`                       |
| `/api/shots`           | `shotInputSchema`                        |
| `/api/locations`       | `locationInputSchema`                    |
| `/api/equipment`       | `equipmentInputSchema`                   |
| `/api/compositions`    | `compositionInputSchema`                 |
| `/api/luts`            | `lutInputSchema`                         |
| `/api/edit-templates`  | `editTemplateInputSchema`                |
| `/api/subtitle-styles` | `subtitleStyleInputSchema`               |
| `/api/audio-assets`    | `audioAssetInputSchema`                  |
| `/api/edit-projects`   | `editProjectInputSchema`                 |
| `/api/kpi-snapshots`   | `kpiSnapshotInputSchema`                 |
| `/api/weekly-goals`    | `weeklyGoalInputSchema`                  |
| `/api/revenue-entries` | `revenueEntryInputSchema`                |

Each resource supports:

```
GET    /api/<resource>       list (newest first by id, or options.orderByColumn)
GET    /api/<resource>/:id   get one
POST   /api/<resource>       create — body validated against the full schema
PATCH  /api/<resource>/:id   update — body validated against schema.partial()
DELETE /api/<resource>/:id   delete — 204 No Content
```

## Hand-written routes

### `GET /api/dashboard/summary`

Aggregates: `upcomingPosts` (next 5 scheduled), `latestKpi` (last 9 snapshots),
`weekRevenueJpy` (sum of `revenue_entries` in the last 7 days), `currentGoal`
(latest `weekly_goals` row), `publishedThisWeek` (count of posts published in the
last 7 days). Powers the Dashboard feature end-to-end in one request.

### `POST /api/ai/generate`

Body: `{ kind: AiKind, context: string, postId?: string }` (see `AI_KINDS` in
`packages/shared/src/types.ts` for the 9 kinds from §8: planning, title,
description, ig_caption, tiktok_caption, hashtags, seo, analysis, improvement).
Calls Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`) with a kind-specific
prompt prefix plus a system prompt steering toward the brand's poetic, sparse tone
(§1-8), stores the result in `ai_generations`, and returns it. Falls back to a
readable error string in `result` if Workers AI is unavailable rather than
throwing, so the UI always has something to render.

### `GET /api/ai/generations`

Last 30 AI generations, newest first — powers the AI feature's history panel and
could back a future "reuse this prompt" action.

### `GET /api/assets`

List every row in the `assets` R2 ledger.

### `POST /api/assets/upload?kind=<AssetKind>&fileName=<name>`

Streams the request body straight into R2 (`ASSETS_BUCKET`) under
`<kind>/<nanoid>-<fileName>`, then records a row in `assets`. No presigned-URL
round trip — acceptable for a single-user tool where the browser talks to the same
origin as the binding.

### `GET /api/assets/:id/download`

Streams the R2 object back with its original content-type.

### `DELETE /api/assets/:id`

Deletes both the R2 object and the D1 row.

### `GET /api/health`

Trivial `{ ok: true }` liveness check.

## Auth

None today — this is an explicitly single-user tool (see the brief's "対象ユーザーは
私1人"). See [`docs/Roadmap.md`](./Roadmap.md) for the planned auth layer before any
multi-user rollout.
