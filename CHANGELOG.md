# Changelog

## 0.1.0 — Fleet maintenance (WR #16828)

- Rename package to `neighborly-services` and replace Lovable boilerplate docs
- Add CONTRIBUTING.md, OVERVIEW.md, and a real README
- Add review jury workflows: CI, OpenRouter, Jules, Semgrep, CodeQL + Dependabot
- Extract pure domain helpers (`categories`, `pricing`, `profile`) with Vitest coverage
- Remove committed `.env`; add `.env.example` and tighten `.gitignore`
- Harden Supabase client so production builds work when env is injected at deploy time
