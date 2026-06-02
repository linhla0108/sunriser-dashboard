# Project Cleanup

Tag: repo/chore

## Goal

Delete stale src/app/v2/ duplicate routes and move unused legacy components to \_unused/.

## Scope

- Included: delete src/app/v2/ (13 duplicate route files), move dead legacy components to src/\_unused/
- Excluded: deleting shared components still used by workspace views

## Acceptance criteria

- src/app/v2/ directory no longer exists
- Dead legacy components confirmed by zero active importers
- No broken imports after cleanup

---

## Report

Status: Done | Commit: uncommitted

Deleted src/app/v2/ (13 files). Moved 7 dead legacy components to src/\_unused/: FloatingChat, Sidebar, TopBar, MobileBottomNav, GlobalDropZone, UploadZone, FloatingChat.test.
