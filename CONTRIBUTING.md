# Contributing to Neighborly Services

Thanks for helping improve NeighborHub. Keep changes small, tested, and reviewable.

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (or shared staging credentials from the maintainer)

## Setup

```bash
npm install
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

## Branch + commit style

- Branch from `main`: `feat/…`, `fix/…`, `chore/…`, `docs/…`
- Conventional Commits required in PR titles and commits:
  - `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:`, `refactor:`
- One logical change per PR. No drive-by refactors in bugfix PRs.

## Quality gates (must pass before review)

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

CI runs the same sequence via `.github/workflows/ci.yml`. Non-draft PRs also get
the review jury (OpenRouter, Jules, Semgrep, CodeQL).

## What to test

- Pure helpers under `src/lib/` must have unit tests in `src/lib/__tests__/`.
- UI changes that alter category labels, rate formatting, or profile display
  should update the shared helpers — do not re-implement formatting inline.
- Do not commit secrets, `.env`, or service-role keys.

## PR checklist

- [ ] Conventional commit title
- [ ] Tests added/updated for behavior changes
- [ ] `npm run check` and `npm run build` pass locally
- [ ] No secrets in the diff
- [ ] Draft until ready; mark ready for review to invoke the full jury

## Reporting issues

Open an issue on this repo with reproduction steps, expected vs actual behavior,
and browser/Node versions when relevant.
