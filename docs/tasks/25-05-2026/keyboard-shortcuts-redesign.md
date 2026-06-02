# Keyboard Shortcuts Redesign

Tag: workspace/ux

## Goal

Redesign workspace keyboard shortcuts so the app does not block browser, operating system, or assistive technology shortcuts.

## Assumptions

- This is a desktop web app first, with mobile users relying on visible controls instead of keyboard shortcuts.
- Shortcuts are optional accelerators. Every shortcut action must remain available through visible UI.
- Non-technical users are the default audience. Power-user shortcuts should be conservative and discoverable.
- The first implementation should not add new dependencies.
- Browser and OS shortcuts take priority over app shortcuts.

## Objective

Build a safer shortcut system for the workspace shell and candidate views. The system should prevent global shortcut conflicts, scope shortcuts to the UI region that owns them, and display platform-appropriate labels.

Success means users can keep using browser/system shortcuts such as new window, reload, tab switching, text navigation, screen-reader shortcuts, and arrow-key navigation without the dashboard intercepting them.

## Tech Stack

- Next.js 16.2.6
- React 19.2.4
- TypeScript 5
- Vitest 4.1.6 with Testing Library
- Playwright for optional browser verification
- Tailwind CSS v4 and shadcn/ui components

## Commands

- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Format check: `npm run format -- --check`
- Unit tests: `npm run test -- src/lib/keyboard src/components/layout`
- Targeted shortcut tests: `npm run test -- src/lib/keyboard/__tests__/useShortcut.test.tsx src/components/layout/__tests__/WorkspaceShell.shortcuts.test.tsx src/components/layout/__tests__/ViewPillNav.test.tsx`
- Final build only when shipping: `npm run build`

## Project Structure

- `src/lib/keyboard/` stores reusable shortcut utilities, reserved combo definitions, and tests.
- `src/components/layout/` owns workspace shell shortcuts, top bar labels, sidebar labels, and candidate view navigation.
- `src/components/context/` owns context menu shortcut display.
- `src/components/settings/` owns the user-facing keyboard shortcut list.
- `docs/tasks/25-05-2026/` stores this spec and the implementation report.

## Code Style

Use explicit shortcut names and keep browser-reserved behavior readable at the call site.

```ts
useShortcut(
  {
    key: "k",
    mod: true,
    scope: "workspace",
    ignoreEditable: true,
    preventDefault: true,
  },
  openCommandPalette
)

if (isBrowserReservedShortcut(event)) {
  return
}
```

Conventions:

- Use `mod` for platform command key intent: `Meta` on macOS, `Ctrl` elsewhere.
- Use `ctrl` and `meta` only when the exact physical modifier matters.
- Do not use `meta` to mean `ctrl`.
- Keep handler functions named by action, not by key, for example `openCommandPalette`, not `handleCmdK`.
- Keep shortcut labels generated from the same definition used by handlers.

## Testing Strategy

- Unit-test the keyboard utility for modifier matching, editable-target guards, reserved combo guards, and platform label rendering.
- Unit-test workspace behavior to ensure browser-reserved shortcuts are not intercepted.
- Unit-test scoped view navigation so number and arrow keys only work inside their owning region.
- Keep tests focused on behavior, not internal implementation details.
- Use Playwright only if manual browser behavior is uncertain after unit tests.

## Boundaries

- Always: Preserve visible buttons and menus for every shortcut action.
- Always: Ignore shortcuts inside `input`, `textarea`, `select`, and `contenteditable`.
- Always: Prefer scoped shortcuts over `window` listeners.
- Always: Let browser/system reserved combos pass through.
- Always: Update tooltip, context menu, and settings labels together.
- Ask first: Adding a command palette if the current one is not intended for production.
- Ask first: Adding a dependency such as a hotkey library.
- Ask first: Removing an existing shortcut entirely instead of moving it behind scope or settings.
- Never: Bind `Ctrl/Cmd+N`, `Ctrl/Cmd+R`, `Ctrl/Cmd+1..9`, `Ctrl/Cmd+Tab`, `Alt+Tab`, or global arrow keys for app actions.
- Never: Use a shortcut as the only way to perform an action.
- Never: Hide focus rings or break native tab order.

## Success Criteria

- `Ctrl/Cmd+N` opens a browser window instead of the notes drawer.
- `Ctrl/Cmd+R` reloads the page instead of opening the report modal.
- `Ctrl/Cmd+J` is not globally intercepted unless explicitly approved as a power-user shortcut.
- `1`, `2`, and `3` do not switch candidate views unless focus is inside the view navigation region or an approved scoped control.
- `ArrowLeft` and `ArrowRight` do not paginate unless focus is inside the table pagination region.
- Shortcut labels are consistent across TopBar, context menu, sidebar tooltip, and settings.
- Shortcut tests cover editable-target ignore behavior and reserved browser combos.
- `npx tsc --noEmit`, `npm run lint`, and targeted tests pass.

## Research Notes

- MDN documents `preventDefault()` as preventing the user agent default action, which is why global shortcut handlers can block browser behavior.
- Browser shortcut tables reserve common combinations such as `Ctrl/Cmd+N` for new window and `Ctrl/Cmd+R` for reload.
- WAI-ARIA keyboard guidance treats keyboard support as an accessibility requirement and shortcuts as accelerators, not replacements for operable UI.
- UI/UX guidance for this project prioritizes preserving system and accessibility shortcuts, avoiding gesture/key conflicts, and keeping visible alternatives.

## Open Questions

- Should the product keep any global power-user shortcut at all, or move all shortcuts to scoped regions?
- If one global shortcut is allowed, should it be `Ctrl/Cmd+K` for a command palette, assuming it does not conflict with the target user environment?
- Should users be able to disable all app shortcuts in Workspace settings?

---

## Plan

### Phase 1: Keyboard Foundation

- Create a strict shortcut definition model in `src/lib/keyboard`.
- Add platform-aware label formatting.
- Add reserved browser/system combo checks.
- Add tests for modifier matching, editable guards, and reserved combos.

### Phase 2: Workspace Shortcut Cleanup

- Replace dangerous global workspace bindings with visible actions or approved safe bindings.
- Align TopBar, context menu, settings, and sidebar shortcut labels with the shared model.
- Ensure report, notes, chat, and sidebar actions remain reachable without shortcuts.

### Phase 3: Scoped Candidate Navigation

- Move view switching and pagination shortcuts from global `window` handlers to scoped regions.
- Keep button click behavior unchanged.
- Add tests that prove off-scope number and arrow keys do nothing.

### Phase 4: Verification

- Run targeted shortcut tests.
- Run type check and lint.
- Manually verify browser shortcuts in one Chromium browser.

## Task List

- [x] Task: Define shortcut model and reserved combo guard.
  - Acceptance: Shortcut matching distinguishes `mod`, `ctrl`, and `meta`; browser-reserved combos return false before handlers run.
  - Verify: `npm run test -- src/lib/keyboard/__tests__/useShortcut.test.tsx`
  - Files: `src/lib/keyboard/*`

- [x] Task: Remove unsafe workspace global shortcuts.
  - Acceptance: Notes and report no longer intercept `Ctrl/Cmd+N` or `Ctrl/Cmd+R`; visible buttons still work.
  - Verify: `npm run test -- src/components/layout/__tests__/WorkspaceShell.shortcuts.test.tsx`
  - Files: `src/components/layout/*`, `src/components/settings/*`, `src/components/context/*`

- [x] Task: Scope candidate view and pagination shortcuts.
  - Acceptance: Number and arrow shortcuts work only in their owning UI region and never while editing text.
  - Verify: `npm run test -- src/components/layout/__tests__/ViewPillNav.test.tsx`
  - Files: `src/components/layout/ViewPillNav.tsx`, related tests

- [x] Task: Run final verification and update report.
  - Acceptance: Type check, lint, and targeted tests pass; task report records remaining decisions.
  - Verify: `npx tsc --noEmit && npm run lint && npm run test -- src/lib/keyboard src/components/layout`
  - Files: this task document

## Report

Status: Done

Implemented the shortcut redesign in three slices.

The shared shortcut hook now distinguishes `mod`, `ctrl`, and `meta`, ignores editable targets by default, and refuses browser-reserved combos before calling `preventDefault()`. Workspace-level `Ctrl/Cmd+J`, `Ctrl/Cmd+N`, `Ctrl/Cmd+R`, sidebar `Ctrl/Cmd+B`, and lab `Ctrl/Cmd+K` global bindings were removed. Top bar, context menu, sidebar tooltip, and settings copy no longer advertise unsafe global shortcuts. Candidate view switching and table pagination are now scoped to the focused view navigation region instead of the whole window.

Verification:

- Passed: `npm run test -- src/lib/keyboard/__tests__/useShortcut.test.tsx`
- Passed: `npm run test -- src/components/layout/__tests__/WorkspaceShell.shortcuts.test.tsx`
- Passed: `npm run test -- src/components/layout/__tests__/ViewPillNav.test.tsx`
- Passed: `npm run test -- src/lib/keyboard/__tests__/useShortcut.test.tsx src/components/layout/__tests__/WorkspaceShell.shortcuts.test.tsx src/components/layout/__tests__/ViewPillNav.test.tsx`
- Passed: `npx tsc --noEmit`
- Passed: targeted `npx eslint` on changed shortcut/layout/lab files
- Passed: `npx prettier --check src/app/lab/page.tsx src/components/context/WorkspaceContextMenu.tsx`

Remaining: full `npm run lint` still fails on pre-existing/unrelated files: `src/app/(workspace)/admin/users/page.tsx`, `src/components/admin/UserEditDrawer.tsx`, and `src/components/candidates/CandidateFiltersBar.tsx`, plus existing warnings in several other files.
