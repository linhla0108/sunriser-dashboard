# Glassmorphism Themes
Tag: themes/feature

## Goal
Add selectable Glass Orange and Glass Blue themes to the workspace using the existing theme provider.

## Scope
- Included: main/glass-orange/glass-blue theme values, glass CSS tokens, theme selection in settings, glass treatment across shell/sidebar/topbar/cards/charts/drawers/auth
- Excluded: changing legacy dashboard, adding new theme stack, copying Dribbble layout exactly

## Acceptance criteria
- Users can select Main, Glass Orange, or Glass Blue in settings
- Glass themes apply consistently across all workspace surfaces
- Table remains readable with near-solid row surfaces
- Theme persists through refresh

---

## Report
Status: Done | Commit: d0bae68

Added glass theme tokens in themes.css sampled from Dribbble CDN images. Updated ThemeProvider, AppearanceTab, and ~25 component files with data-v2-* hooks. Replaced use-mobile.ts synchronous effect with useSyncExternalStore.

Sampled colors — orange: #d26c30, #efc385, #da8f48; blue: #7bbfe7, #8dd1f6, #bce3fb.
