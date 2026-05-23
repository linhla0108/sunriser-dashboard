# Sidebar Account Menu

Tag: layout/feature

## Goal

Move the existing account popup from the header avatar to the existing sidebar profile icon, then remove the account avatar from the header.

## Scope

- Included: reuse the existing sidebar profile icon as the account dropdown trigger.
- Included: copy the current header popup behavior: signed-in user details, role badge, and sign out action.
- Included: reuse the current auth state, dropdown menu primitives, avatar styling, and sidebar collapsed behavior.
- Included: update focused layout tests for header and sidebar behavior.
- Excluded: new profile menu items, theme selector, profile page design, backend profile editing, new theme tokens, and settings page tab routing.

## Acceptance criteria

- The header keeps its existing title and action buttons but no longer renders the user avatar or account dropdown.
- The sidebar footer user icon opens a popup from the sidebar in both expanded and collapsed sidebar states.
- The popup shows the signed-in user's name, email, and role.
- The popup includes the same sign out action that currently exists in the header popup.
- Logout uses the existing `signOut` handler.
- Keyboard and screen-reader access remain available through the dropdown trigger and menu items.

## Verification

- Focused tests pass for `TopBar` and `Sidebar`.
- `npm run lint` passes.
- Manual check: open the sidebar account icon, sign out, and confirm the header avatar is gone.

---

## Report

Status: Done | Commit: uncommitted

Moved the account dropdown out of the header and onto the existing sidebar profile icon. The popup keeps the same account summary and sign out action.

Verification:
- Focused tests passed: `npm test -- --fileParallelism=false src/components/layout/__tests__/TopBar.test.tsx src/components/layout/__tests__/Sidebar.test.tsx`
- Targeted lint passed with one existing sidebar logo warning: `npm run lint -- src/components/layout/TopBar.tsx src/components/layout/Sidebar.tsx src/components/layout/__tests__/TopBar.test.tsx src/components/layout/__tests__/Sidebar.test.tsx`
- Browser smoke passed on `http://localhost:3000/dashboard`: sidebar profile icon opened the account popup; header account avatar was gone.

Remaining: full `npm run lint` is blocked by unrelated existing issues in `src/components/pin/ComparePage.tsx` and `src/components/table/__tests__/ApplicantTable.sort.test.tsx`.
