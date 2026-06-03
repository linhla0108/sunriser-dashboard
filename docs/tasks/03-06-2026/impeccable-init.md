# Impeccable Init

Tag: design/doc

## Goal

Set up the project-level product context for Impeccable so future UI work has a clear product register, users, purpose, brand voice, constraints, and design principles.

## Scope

- Included: root `PRODUCT.md`, Impeccable live-mode config, and dated task documentation.
- Excluded: source UI changes, behavior changes, schema changes, dependency changes, and root `DESIGN.md` generation.

## Acceptance criteria

- Root `PRODUCT.md` captures the product register and strategic context inferred from the existing codebase and confirmed by the user.
- Live mode has a first-time config for the Next.js App Router layout.
- No app source behavior changes are made.
- Task documentation records what was changed and what remains pending.

---

## Report

Status: Done

Created root `PRODUCT.md` with the product register, users, purpose, brand personality, anti-references, design principles, accessibility expectations, and current product boundaries for future design work.

Added `.impeccable/live/config.json` for the Next.js App Router layout at `src/app/layout.tsx`. CSP detection returned no policy shape, so the config is marked checked.

Remaining: root `DESIGN.md` is still pending. The current visual source of truth remains `material/DESIGN.md`, `src/app/globals.css`, and `src/styles/themes.css`.
