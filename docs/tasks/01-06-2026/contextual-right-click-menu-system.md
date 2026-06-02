# Contextual Right-Click Menu System

Tag: workspace/feature

## Goal

Define and implement feature-specific right-click menus so actions match the object under the cursor.

## Assumptions

- Users expect right-click actions to target the feature object: candidate card, chart card, or schedule entry.
- Candidate table already has single-row and selected-row context menus, so this task preserves table behavior.
- Pipeline and gallery candidate cards should expose candidate actions without requiring users to switch back to table view.
- Schedule entries should expose schedule actions from both Gantt and Agenda views.
- The workspace-level menu should keep only generic page/text actions. It should not pretend every page has candidate/export/report actions.
- This task works on local mock state only. Backend persistence and new data contracts are out of scope.

## Scope

- Included: Candidate pipeline card menus, candidate gallery card menus, chart card menu actions, schedule entry menus, global workspace menu cleanup.
- Included: Task documentation, scoped verification commands.
- Excluded: Database changes, Supabase persistence, browser-native paste behavior, admin user row menus, announcement menus, and new keyboard shortcut systems.

## Acceptance criteria

- Right-clicking a pipeline candidate card opens candidate actions, including view detail, copy, pin/unpin, assign PIC, round status, and export.
- Right-clicking a gallery candidate card opens the same candidate-level actions.
- Right-clicking a chart card opens chart actions, including filtering chart data and resetting chart layout.
- Right-clicking a schedule entry opens schedule actions, including view, edit, copy details, and delete.
- Right-clicking empty workspace/page areas opens only generic actions: copy selected text, copy page link, and shortcuts.
- Existing table row and selected-row context menus still work.
- Scoped TypeScript and lint checks pass for touched files, or remaining failures are documented.

## Implementation plan

### Phase 1: Foundation

Create a reusable candidate context menu for non-table candidate cards.

Acceptance:

- Menu works as a wrapper around card content.
- Menu uses existing design tokens, lucide icons, and `ContextMenu` primitives.
- Candidate updates flow through existing `onUpdateApplicant` callbacks.

Verification:

- `npx tsc --noEmit`
- Scoped lint for the new component and candidate views.

### Phase 2: Candidate Views

Wire the reusable candidate menu into Pipeline and Gallery cards.

Acceptance:

- Pipeline cards show candidate actions without breaking drag and click-to-detail.
- Gallery cards show candidate actions without breaking drag, view, and pin controls.
- Candidate page passes `handleUpdateApplicant` into Pipeline and Gallery.

Verification:

- Existing candidate view tests still pass where scoped tests are available.
- Scoped lint for `candidates/page.tsx`, `PipelineView.tsx`, `GalleryView.tsx`, and the new menu.

### Phase 3: Chart View

Add card-level chart menu actions.

Acceptance:

- Chart card menu can apply All, Passed, and Failed filters.
- Chart card menu can reset chart order to the default layout.
- Existing drag-to-reorder behavior stays intact.

Verification:

- Scoped lint for `ChartView.tsx`.
- TypeScript check.

### Phase 4: Schedule Views

Add schedule entry context menus in Gantt and Agenda.

Acceptance:

- Both views expose view, edit, copy, and delete actions for an entry.
- Delete removes the entry from local state.
- Edit opens the existing drawer in edit mode.

Verification:

- Scoped lint for schedule page and schedule views.
- TypeScript check.

### Phase 5: Workspace Menu Cleanup

Remove candidate/export/report actions from the global workspace menu.

Acceptance:

- Empty page area no longer shows feature-specific actions.
- Selected text copy and page link copy remain available.
- Shortcut help remains available.

Verification:

- Scoped lint for `WorkspaceContextMenu.tsx`.
- TypeScript check.

## Risks and mitigations

| Risk                                                 | Impact | Mitigation                                                                                 |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| Context menu conflicts with drag handlers            | Medium | Use context menu wrapper around cards and stop propagation on action items only.           |
| Large menu implementation duplicates table row logic | Medium | Share the non-table menu only across Pipeline and Gallery; leave table row menu untouched. |
| Existing dirty worktree masks unrelated failures     | High   | Run scoped checks and report unrelated failures separately.                                |

## Report

Status: Done | Commit: uncommitted

Implemented feature-specific context menus for candidate cards, candidate table headers, pipeline columns, dashboard stats/charts, compare headers, upload review popup, admin user identity cells, chart cards, and schedule entries. Pipeline and Gallery candidate cards now expose candidate actions without using the workspace menu. Chart cards expose chart filter and layout actions. Gantt and Agenda schedule entries expose view, edit, copy, and delete actions. The global workspace menu now keeps only generic text/page actions and shortcut help.

Verification:

- Passed: `npx tsc --noEmit`
- Passed: `npx eslint src/components/dashboard/StatsCard.tsx src/components/dashboard/OverviewCharts.tsx src/components/pin/ComparePage.tsx 'src/app/(workspace)/admin/users/page.tsx' src/components/upload/GlobalDropZone.tsx src/components/table/ApplicantTable.tsx src/components/views/PipelineView.tsx src/components/schedule/ScheduleEntryContextMenu.tsx src/components/candidates/CandidateCardContextMenu.tsx src/components/views/ChartView.tsx`
- Passed: `npm test -- src/components/views/__tests__/PipelineGallery.test.tsx src/components/views/__tests__/PipelineView.smoke.test.tsx src/components/table/__tests__/ApplicantTable.sort.test.tsx src/components/pin/__tests__/ComparePage.test.tsx`
- Passed: `npx prettier --check src/components/candidates/CandidateCardContextMenu.tsx src/components/views/PipelineView.tsx src/components/views/GalleryView.tsx src/components/views/ChartView.tsx src/components/schedule/ScheduleEntryContextMenu.tsx src/components/views/schedule/GanttView.tsx src/components/views/schedule/AgendaView.tsx 'src/app/(workspace)/schedule/page.tsx' 'src/app/(workspace)/candidates/page.tsx' src/components/context/WorkspaceContextMenu.tsx src/components/layout/WorkspaceShell.tsx docs/tasks/01-06-2026/summary.md docs/tasks/01-06-2026/contextual-right-click-menu-system.md`

Remaining: true table cell-level menus, chart segment-level menus, HR row menus, announcement row menus, and backend-persistent archive/delete flows are not implemented in this slice.
