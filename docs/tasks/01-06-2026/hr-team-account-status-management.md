# HR Team Account Status Management

Tag: auth/feature

## Assumptions

1. The `HR Team` route stays separate and continues to use mock staff data for now.
2. New staff accounts should no longer be created from the `HR Team` UI because onboarding is now intended to happen through third-party Azure sign-in outside this mock page.
3. "Quick update status for account" means changing the mock staff member `status` inline from the table without opening the edit dialog.
4. Replacing the edit action icon means keeping the same edit behavior but using a clearer visual treatment than the current pencil icon.

If any assumption is wrong, implementation should stop and the task should be re-scoped before code changes.

## Goal

Make the HR Team experience reflect the current Microsoft-only auth model by removing manual staff creation, replacing the old active-toggle action with an inline status control, and clarifying the edit action.

## Scope

- Included: HR Team table and toolbar updates; status column redesign with an active/inactive switch and clearer state copy; quick account status mutation; removal of add-staff entry points; action icon update; supporting tests and docs.
- Excluded: changes to Azure provider setup, allowed-domain rules, role/permission model, database schema, or invitation-based onboarding outside the affected UI.

## Objective

HR users need one clear workspace to review mock staff records and change whether a staff account is active without opening the full edit dialog. The UI should also stop suggesting that staff are created manually from this page.

Success means:

- The page no longer offers manual staff creation.
- Each row shows a status control with active and inactive states instead of a separate power/toggle action.
- The active state is visually green, inactive is visually gray.
- Admins can change status inline and receive feedback.
- The edit action remains available with a clearer icon treatment.

## Tech Stack

- Next.js 16 App Router
- React 19 client components
- Local mock HR staff state in `src/lib/hr/`
- Tailwind CSS v4
- shadcn/ui primitives
- `lucide-react` icons
- Vitest for UI logic tests

## Commands

- Type check: `npx tsc --noEmit`
- Lint scoped files: `npx eslint 'src/app/(workspace)/hr/page.tsx' src/components/hr/*.tsx src/lib/hr/*.ts`
- Unit tests: `npm test -- src/components/hr/__tests__`
- Format: `npm run format`

Do not use `npm run dev` or `npm run build` for error checking.

## Project Structure

- `src/app/(workspace)/hr/page.tsx` -> HR Team route shell
- `src/components/hr/` -> HR Team table, toolbar, dialogs, stats
- `src/lib/hr/` -> HR Team local types and reducer-backed mock state
- `docs/tasks/01-06-2026/` -> plan and implementation report

## Code Style

Use shared shadcn primitives for controls and keep mutations explicit in event handlers.

```tsx
<Switch checked={row.status === "active"} onCheckedChange={checked => onSetStatus(row.id, checked ? "active" : "inactive")} />
```

Conventions:

- Prefer shared `Button`, `Badge`, `Sheet`, `Dialog`, `Input`, and related primitives over raw HTML controls.
- Keep table row actions compact and label-driven.
- Encode status presentation from the mock `status` field instead of maintaining a second derived UI-only flag.

## Testing Strategy

- Unit/UI coverage for the table state and action rendering.
- Verify status controls reflect active and inactive states correctly.
- Verify the add action is absent from the HR Team toolbar.
- Run targeted typecheck and scoped lint on touched files.

## Boundaries

- Always: use `apply_patch` for edits, state assumptions before behavior changes, update docs in the same task, verify with `npx tsc --noEmit` plus scoped lint/tests.
- Ask first: replacing mock data with Supabase-backed data, deleting the mock HR data layer entirely, changing auth onboarding behavior outside the HR page, adding new dependencies.
- Never: use `npm run dev` or `npm run build` just to find errors, write files with Node/Python scripts, add a fake create flow back into the toolbar, or expand scope into `/admin/users` without approval.

## Success Criteria

- `HR Team` no longer exposes `Add Staff`.
- The table row action set no longer includes the old activate/deactivate icon button.
- A dedicated `Status` field presents a switch with readable active/inactive state copy.
- Active renders with green emphasis, inactive renders with gray emphasis, and both remain readable in the current design system.
- Updating status changes the backing mock staff state immediately in the table.
- The edit action remains available and uses a clearer icon treatment than the current pencil-only affordance.

## Implementation Plan

1. Remove create-only UI from the HR toolbar and page wiring so the route no longer opens the add dialog.
2. Replace the reducer action and table action wiring from `TOGGLE_STATUS` to explicit status setting so the new switch can write `active` and `inactive` directly.
3. Redesign the table status cell into a compact switch row with clear state copy and green/gray styling.
4. Replace the edit action icon with a clearer glyph while preserving existing edit-dialog behavior.
5. Run targeted verification and update the task report with actual results.

## Task Slices

- [ ] Task: Remove manual create flow from the HR Team page
  - Acceptance: toolbar has no `Add Staff` action; page no longer opens the create path from the main screen
  - Verify: `npx eslint 'src/app/(workspace)/hr/page.tsx' src/components/hr/HrStaffToolbar.tsx`
- [ ] Task: Make HR mock state support explicit status updates
  - Acceptance: hook exposes a setter for `active` or `inactive` instead of toggle-only behavior
  - Verify: `npx tsc --noEmit`
- [ ] Task: Replace row status action with inline switch control and clearer edit icon
  - Acceptance: old power action is removed; status cell shows a switch with clear state copy; edit action still opens the dialog
  - Verify: `npx eslint src/components/hr/HrStaffTable.tsx src/components/hr/HrStaffFormDialog.tsx src/lib/hr/useHrStaff.ts`
- [ ] Task: Document and verify the shipped behavior
  - Acceptance: task file report updated with final behavior and verification outcome
  - Verify: task doc reflects final status and notes any residual gaps

---

## Report

Status: Done

The mock `/hr` page now reflects the new UX direction without touching the real admin user flow.

Changed behavior:

- Removed the `Add Staff` action from the HR toolbar and closed the page-level create path.
- Kept the edit dialog for existing mock staff only.
- Replaced the old power action with an inline shadcn `Switch` in the `Status` column.
- Added explicit active/inactive state text beside the switch so the state does not rely on color alone.
- Styled the active state with green emphasis and the inactive state with gray emphasis.
- Replaced the old pencil icon with `SquarePen` for a clearer edit action.
- Added targeted HR component tests for the toolbar and table behavior.

Verification:

- Passed: `npx tsc --noEmit`
- Passed: `npx eslint 'src/app/(workspace)/hr/page.tsx' src/components/hr/*.tsx src/components/hr/__tests__/*.test.tsx src/lib/hr/*.ts`
- Passed: `npm test -- src/components/hr/__tests__`

Remaining:

- The `/hr` page still uses local mock state and still allows delete/edit on mock records.
- Real Azure-backed account management remains separate in `/admin/users`.
