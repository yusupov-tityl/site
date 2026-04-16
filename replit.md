# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Spam protection on contact form

- Layered: Zod validation, hidden honeypot (`website` field), per-IP rate limit (5/hour), Cloudflare Turnstile.
- Turnstile is optional: set both keys to enable, otherwise the form falls back to honeypot+rate-limit.
  - Frontend: `VITE_TURNSTILE_SITE_KEY` (built into the itityl bundle).
  - Backend: `TURNSTILE_SECRET_KEY` (used by api-server to verify the token via Cloudflare siteverify).
- Widget runs in `interaction-only` mode — invisible for legit users, challenge appears on suspicion.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
