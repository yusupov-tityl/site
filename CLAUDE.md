# CLAUDE.md — Project Configuration

## Project
Ай-Титул (itityl.ru) — AI consulting company corporate website.

## Source of Truth
**This repo is a pnpm monorepo that mirrors the Replit project "Itityl Design Clone".**
Replit Agent owns design/UI. Claude Code owns deployment, wiki, and custom tweaks.

## Repository Structure
```
artifacts/
  itityl/         — THE SITE (Vite + React + TS) — deployed to production
  api-server/     — Backend API (Express)
  mockup-sandbox/ — Design sandbox
lib/
  api-client-react/ — Shared API client
  api-spec/         — OpenAPI spec
  api-zod/          — Zod validation schemas
  db/               — Database schema
scripts/          — Utility scripts
attached_assets/  — Replit-attached images/files
wiki/             — LLM Wiki (Karpathy pattern) — persistent knowledge
raw/              — Immutable source docs (PDF, XLSX, DOCX)
.github/workflows/deploy.yml  — Build artifacts/itityl → GitHub Pages
.claude/commands/             — Claude Code slash-commands
```

## Branch Strategy — CRITICAL

### Two sources of change
1. **Replit** → pushes to `origin/replit-version` branch
2. **Claude Code (here)** → pushes to `origin/main` branch

### Main = Replit-version + our customizations
`main` is always built as: latest `replit-version` files, PLUS our protected customizations layered on top.

### Protected files (NEVER overwrite from Replit sync)
- `CLAUDE.md`
- `wiki/**`
- `.github/workflows/deploy.yml`
- `.claude/commands/**`
- `raw/**`

### Sync Workflow
When user says «подтяни Replit» / «синк с Replit» / «обнови дизайн»:
```bash
git fetch origin
git checkout main
git checkout origin/replit-version -- .        # pull all Replit files
# Restore protected customizations from main:
git checkout HEAD -- CLAUDE.md wiki/ .github/workflows/deploy.yml .claude/commands/
git add -A
git commit -m "Sync: pull Replit design updates from replit-version"
git push
```

## Dev Commands
```bash
pnpm install
pnpm -C artifacts/itityl dev           # frontend
pnpm -C artifacts/api-server dev       # backend
```

## Build (what CI runs)
```bash
pnpm install --frozen-lockfile
pnpm -r --filter ./artifacts/itityl run build
# Output: artifacts/itityl/dist
```

## Slash Commands
- `/update-hero-video` — Find newest video in project root, copy to `artifacts/itityl/public/hero-bg.mp4`

## Wiki (Karpathy LLM Wiki Pattern)
Persistent knowledge base at `wiki/`. Read `wiki/index.md` at session start.

### Wiki Rules
1. **Read before work**: scan `wiki/index.md` to understand current state.
2. **Update after changes**: update relevant wiki pages after significant work.
3. **Log everything**: append entries to `wiki/log.md` for major decisions / structural changes.
4. **Keep index current**: update `wiki/index.md` when adding new pages.
5. **File answers back**: save valuable analyses as new wiki pages.

### Wiki Structure
```
wiki/
  index.md          — Master catalog
  log.md            — Chronological operation log
  overview.md       — Project overview
  design-system.md  — Colors, typography, patterns
  decision-log.md   — Key decisions with rationale
```

## Design Reference
Based on miquido.com visual language. See `wiki/design-system.md`.
- Inter font, dark theme, brand yellow `#FFE600`
- Two-column headers, numbered lists, gap-px grids
