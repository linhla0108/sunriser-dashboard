# Loading System

Tag: ui/feature

## Goal

Add a fast-feeling SUN.RISER loading system for app boot, auth handoff, and workspace route content.

## Scope

- Included: branded loading screen for boot/auth states.
- Included: post-login loading handoff after successful sign-in.
- Included: workspace route fallback and candidates skeleton placeholders.
- Excluded: new routing architecture, artificial loading delays, and marketing-style splash screens.

## Acceptance criteria

- Protected routes show a premium restrained loading screen instead of a blank page while auth resolves.
- Successful sign-in transitions to the loading screen before entering the workspace.
- Workspace route loading keeps the shell visible when possible and uses compact content skeletons.
- Loading UI uses semantic theme tokens and respects the existing custom accent color.

---

## Report

Status: Done

Added a reusable SUN.RISER loading screen for boot, auth, and route states. Protected routes now show loading UI while auth resolves. Successful sign-in transitions to the loading screen before workspace navigation. Workspace route fallbacks and candidates skeletons now provide compact placeholders instead of blank content.

Verification:

- `npx vitest run src/components/common/__tests__/AppLoadingScreen.test.tsx src/components/auth/__tests__/RequireAuth.test.tsx src/components/auth/__tests__/LoginForm.test.tsx src/components/views/__tests__/CandidatesViewSkeleton.test.tsx`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Browser smoke screenshots for `/login` and protected `/dashboard`.

Remaining: full `npm test` still has one unrelated existing failure in `src/components/layout/__tests__/TopBar.test.tsx` where the account dropdown content is not found in jsdom.
