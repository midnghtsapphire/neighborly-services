# Neighborly Services (NeighborHub)

Local neighborhood services marketplace — hire a neighbor for pet care, lawn & garden,
handyman work, tutoring, cleaning, and more. Built with Vite, React, TypeScript,
shadcn/ui, Tailwind CSS, and Supabase.

## Live Deployment

> Add the verified Vercel (or Lovable publish) URL here once the production host is
> confirmed. Until then, run locally with the steps below.

## Features

- Browse service categories and nearby helper listings
- Provider profiles with ratings and hourly rates
- Auth (sign-up / sign-in) via Supabase
- Messaging between neighbors and providers
- Post jobs and offer services
- Installable PWA (vite-plugin-pwa)

## Stack

| Layer | Tech |
| --- | --- |
| UI | React 18, TypeScript, Tailwind, shadcn/ui |
| Build | Vite 5 |
| Data / Auth | Supabase (`@supabase/supabase-js`) |
| State | TanStack Query, React Context |
| CI jury | OpenRouter AI review, Jules, Semgrep, CodeQL |

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env (never commit real secrets)
cp .env.example .env
# edit .env with your Supabase project URL + anon/publishable key

# 3. Dev server (default http://localhost:8080)
npm run dev

# 4. Checks
npm test
npm run lint
npm run typecheck
npm run build
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production build → `dist/` |
| `npm run check` | typecheck + lint + test |

## Environment

See [`.env.example`](./.env.example). Only the **public** Supabase URL and
anon/publishable key belong in the frontend. Service-role keys must never ship
in this repo or any client bundle.

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | yes (runtime) | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes (runtime) | Anon / publishable key |
| `VITE_SUPABASE_PROJECT_ID` | optional | Convenience id |

## Project layout

```text
src/
  components/     # UI + marketplace widgets
  contexts/       # AuthProvider
  hooks/          # messaging, mobile, toast
  integrations/   # Supabase client + generated types
  lib/            # pure helpers (categories, pricing, profile) + unit tests
  pages/          # route screens
supabase/         # migrations + config
.github/workflows # CI + full review jury
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Overview and architecture notes live in
[OVERVIEW.md](./OVERVIEW.md).

## Security

- `.env` is gitignored. A previously committed `.env` was removed in fleet maintenance.
- Rotate any keys that were ever committed to git history.
- Review jury on every non-draft PR: OpenRouter, Jules, Semgrep, CodeQL.

## License

See [LICENSE](./LICENSE).
