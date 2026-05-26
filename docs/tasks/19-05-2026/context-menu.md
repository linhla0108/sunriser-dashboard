# Context Menu

Tag: ui/feature

## Goal

Override browser right-click with a custom context menu — global workspace menu and per-row applicant menu.

## Scope

- Included: global menu (copy text, export CSV, create report, keyboard shortcuts ref), row menu (view detail, copy name/email/phone, quick Round 1 change, export row CSV)
- Excluded: context menu on gallery/pipeline cards, backend persistence, paste action

## Acceptance criteria

- Right-click anywhere in workspace shows global context menu
- Right-click on a table row shows row-specific context menu
- No layout disruption from menu trigger wrapper
- No hydration error from wrapper inside table

---

## Report

Status: Done | Commit: uncommitted

Added shadcn context-menu (radix primitive). Created WorkspaceContextMenu with className="contents" trigger. Added row-level menu via onContextMenu + createPortal to avoid table DOM nesting issues. Wired into WorkspaceShell with openReport callback.
