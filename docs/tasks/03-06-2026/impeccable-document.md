# Impeccable Document

Tag: design/doc

## Goal

Create a root `DESIGN.md` and Impeccable design sidecar that capture the current SUN.RISER Dashboard visual system for future UI generation.

## Scope

- Included: scan existing runtime tokens, themes, root product context, and representative UI primitives; write root `DESIGN.md`; write `.impeccable/design.json`; update task documentation.
- Excluded: app UI source changes, token value changes, behavior changes, dependency changes, and live browser review.

## Acceptance criteria

- `DESIGN.md` follows the Impeccable document command structure with YAML frontmatter and the six required markdown sections.
- `.impeccable/design.json` includes sidecar metadata and representative component snippets for the live panel.
- The document reflects the actual product UI baseline: light canvas, restrained SUN orange, compact shadcn primitives, Geist-backed current runtime typography, and optional glass themes.
- Formatting checks pass for the generated documentation files.

---

## Report

Status: Done

Created root `DESIGN.md` using scan mode from the current runtime theme, global CSS, theme CSS, root product context, and representative shadcn/ui primitives.

Added `.impeccable/design.json` sidecar with color metadata, tonal ramps, typography metadata, shadow and motion extensions, breakpoints, and self-contained component snippets for buttons, input, metric card, badge, sidebar item, and segmented tabs.

Decision update: current UI work should rely on the Impeccable-generated root `DESIGN.md` and `.impeccable/design.json`. Legacy `material/` files are archival references only and should not drive new design decisions.

Remaining: no UI source changes were made. A future cleanup can remove or relabel legacy material assets if the team wants to reduce documentation drift further.
