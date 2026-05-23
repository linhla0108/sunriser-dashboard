# HR Staff + Custom Color
Tag: hr/feature

## Goal
Add an HR staff management route with mock CRUD, and a custom accent color option reusable across workspace.

## Scope
- Included: /hr route with list/search/filter/create/edit/delete/status, sidebar nav entry, custom color picker in settings, CSS variable propagation to --primary and --ring
- Excluded: real backend, role-based auth, import/export, full settings redesign

## Acceptance criteria
- /hr route available inside authenticated workspace
- Sidebar includes HR Team item with active state
- User can create, edit, delete, and toggle staff status
- Custom color selectable in Appearance settings and reset to default
- Custom color persists through refresh
- Custom color affects primary surfaces without adding a second token layer

---

## Report
Status: Done | Commit: 75c43ba

Added HrStaff types, 8 mock records, useHrStaff reducer hook, 5 HR UI components, and /hr page. Added HR Team nav to Sidebar. Extended ThemeProvider with customColor (hex→HSL→CSS vars). Added color picker + reset in AppearanceTab. HR data is session-local only.
