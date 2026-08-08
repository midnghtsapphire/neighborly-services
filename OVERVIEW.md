# Neighborly Services — Overview

## Product

**NeighborHub** connects neighbors who need help with neighbors who offer local
services (pet care, lawn care, handyman, tutoring, cleaning, babysitting, etc.).
Providers list services with hourly rates; seekers browse categories, view
profiles/ratings, message providers, and post jobs.

## Architecture

```text
Browser (Vite/React PWA)
        │
        ▼
  Supabase (Auth + Postgres + RLS)
        │
        ├── profiles
        ├── services / reviews
        ├── jobs
        └── conversations / messages
```

- **Frontend:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui
- **Auth:** Supabase email/password via `AuthContext`
- **Data:** Supabase JS client (`src/integrations/supabase/client.ts`) with
  generated types in `types.ts`
- **Realtime messaging:** `useMessaging` hook over conversation tables
- **PWA:** `vite-plugin-pwa` with offline asset caching

## Domain modules (pure)

| Module | Responsibility |
| --- | --- |
| `src/lib/categories.ts` | Canonical category slugs + labels |
| `src/lib/pricing.ts` | Hourly rate format/parse |
| `src/lib/profile.ts` | Initials + display name |
| `src/lib/utils.ts` | `cn()` className merge |

Keep domain rules in these modules so UI stays thin and unit tests stay fast.

## Review jury

Fleet-standard workflows under `.github/workflows/`:

| Workflow | Role |
| --- | --- |
| `ci.yml` | install, typecheck, lint, test, build |
| `ai-pr-review-openrouter.yml` | OpenRouter model review comment |
| `jules-pr-reviewer.yml` | Jules PR review |
| `semgrep.yml` | SAST + secrets (ERROR gate) |
| `codeql.yml` | CodeQL JS/TS + Actions |
| Dependabot | weekly npm + GitHub Actions updates |

Required secrets on the repo (optional for skip-with-warning paths):

- `OPENROUTER_API_KEY` — AI PR review
- `JULES_API_KEY` — Jules reviewer

## Monetization path (fleet context)

Local services marketplaces monetize via featured listings, lead fees, or
subscription tiers for providers. This codebase is the product surface; billing
integration is out of scope for fleet-maintenance but the category/pricing
helpers are the right seam for paid placement later.

## Related

- Fleet WR: `midnghtsapphire/revvel-standards#16828`
- Standards: `docs/DEFINITION_OF_DONE.md`, `docs/AGENTS.md` in revvel-standards
