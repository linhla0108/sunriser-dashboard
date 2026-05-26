# Loading Screen Redesign

Tag: ui/refactor

## Goal

Redesign the SUN.RISER loading screen with a more distinctive, polished UI and motion system.

## Scope

- Included: boot, auth, and route loading screen visual treatment.
- Included: CSS-only loading animation that respects reduced motion.
- Included: focused tests for visible copy and structure.
- Excluded: artificial loading delays, new routing behavior, and data skeleton redesign.

## Acceptance criteria

- Loading screen feels branded and premium without becoming a marketing splash.
- Animation uses lightweight CSS and does not require client state.
- Boot/auth/route variants keep their current accessible copy.
- Existing loading tests pass after the redesign.

---

## Report

Status: Done

Reworked the loading screen into a minimal brand handoff. The screen now uses the SUN wordmark asset, removes the visible `SUN.RISER` text label, enlarges the status copy, restores the original rounded progress pill, and keeps the animation lightweight with a gentle wordmark bounce and progress movement. Workspace sidebar, topbar, and content animate into their own positions with small staggered transforms, closer to an iOS-style transition than a single-direction page slide. Removed the fake workspace loading overlay so Next owns loading screen unmount cleanly. Set the initial server-rendered theme attributes to `main` and `light`, and made the loading progress bar use brand orange directly so it does not flash black before hydration.

Verification:

- `npx vitest run src/components/common/__tests__/AppLoadingScreen.test.tsx src/components/auth/__tests__/RequireAuth.test.tsx src/components/auth/__tests__/LoginForm.test.tsx`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Browser smoke render at desktop and mobile sizes using the app CSS.
- Browser computed-style check for initial `data-theme="main"` and `rgb(255, 85, 51)` progress color.
- Focused WorkspaceShell test for region animation classes and absence of a fake loading overlay.

Remaining: Next.js `loading.tsx` still unmounts immediately when route content is ready, so true loading exit animation needs a transition owner above the route boundary.
