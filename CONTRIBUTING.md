# Contributing

## Branching model

`main` is the single default branch — always deployable, always green in CI. There
is no long-lived development branch; all work branches from `main` and merges back
into it via pull request.

Branch naming:

| Prefix                  | Use for                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `feature/<short-name>`  | New functionality (e.g. `feature/ai-provider-abstraction`) |
| `fix/<short-name>`      | Bug fixes                                                  |
| `refactor/<short-name>` | Internal restructuring with no behavior change             |
| `chore/<short-name>`    | Tooling, CI, deps, docs-only changes                       |

```bash
git checkout main
git pull origin main
git checkout -b feature/my-change
# ...work, commit...
git push -u origin feature/my-change
# open a PR against main
```

## Before opening a PR

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build
```

CI (`.github/workflows/ci.yml`) runs the same checks on every push/PR against
`main` — keep it green.

## Commit messages

Imperative mood, one logical change per commit (see
[`docs/CodingRules.md`](docs/CodingRules.md) → "Commits").

## Database schema changes

Never hand-edit a generated migration. See
[`docs/Development.md`](docs/Development.md) → "Adding a new feature" for the full
schema → API → frontend flow.

## Deployment

Merges to `main` auto-deploy to Cloudflare Pages via
`.github/workflows/deploy.yml`. See [`docs/Deployment.md`](docs/Deployment.md).
