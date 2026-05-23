# Sidebar — Profile & Settings Cleanup
Tag: ui/fix

## Goal
Clean up the sidebar footer: remove "Mock workspace", move Settings to the footer as a gear icon, and place Profile + Settings in a single row.

## Scope
- Included: nav item height, gap between items, footer layout, Settings relocation, Profile icon
- Excluded: route changes, auth integration, real user data

## Acceptance criteria
- "Mock workspace" chip removed
- Settings removed from nav items list
- Nav items use fit-height (no `size="lg"`) with `gap-0.5` between items
- Footer has one row: Profile avatar on the left, Settings gear icon on the right (`justify-between`)
- In icon-collapsed mode: footer items stack vertically with `gap-1`
- Settings gear icon reflects active state when on `/settings` route

---

## Report
Status: Done

Changes in `src/components/layout/Sidebar.tsx`:
- Removed `{ href: "/settings", label: "Settings", icon: Settings }` from `NAV_ITEMS`
- Removed `size="lg"` from `SidebarMenuButton`; added `gap-0.5` to `SidebarMenu` for tight item spacing
- Removed "Mock workspace" `SidebarFooter` block entirely
- Added footer row with `justify-between`: Profile avatar (`<span>` with initials) on left, Settings `<Link>` with `<Settings />` icon on right
- Collapsed mode: footer switches to `flex-col gap-1` via `group-data-[collapsible=icon]`
