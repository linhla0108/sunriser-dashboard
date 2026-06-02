# Remove v2 Naming

Tag: repo/refactor

## Goal

Remove all v2/ folder naming from src/components/ and src/lib/, flatten one level, rename V2-prefixed identifiers.

## Scope

- Included: flatten src/components/v2/_ and src/lib/v2/_, rename V2WorkspaceShell/V2Sidebar/V2TopBar, rename v2-themes.css, update all import paths
- Excluded: logic changes, V2-prefixed type names, lab page

## Acceptance criteria

- Zero grep results for "components/v2" or "lib/v2" or "v2-themes" in src/
- V2WorkspaceShell → WorkspaceShell, V2Sidebar → Sidebar, V2TopBar → TopBar
- No broken imports, lint passes

---

## Report

Status: Done | Commit: uncommitted

Flattened 13 subdirs from components/v2/ and lib/v2/ using git mv. Renamed 3 component files and identifiers. Renamed v2-themes.css to themes.css. Fixed shadcn Sidebar import collision with alias SidebarRoot. Restored DrawerShell.tsx after git mv staging gap. Zero v2 import refs remaining.
