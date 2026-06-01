# Hover Preview Regression Report

Tag: candidates/report

## Goal

Record the regressions introduced during the recent hover-preview stabilization work so another engineer can triage, revert, or re-implement safely.

## Scope

- Included: factual summary of the broken behavior, likely causes, impacted files, and recommended recovery path
- Excluded: new code changes, rollback execution, or further bug fixing

## Acceptance criteria

- The report clearly states what was changed and what is currently broken.
- The report identifies the main files touched by the failed iteration.
- The report gives a concrete next step for rollback or re-implementation.

## Commands

- Review touched docs: `sed -n '1,220p' docs/tasks/29-05-2026/hover-preview-regression-report.md`
- Inspect current hover code: `sed -n '1,260p' src/components/candidates/PortfolioLinkPopover.tsx`
- Inspect text hover code: `sed -n '430,620p' src/components/candidates/CandidatePreviewDialog.tsx`

## Project structure

- `src/components/candidates/PortfolioLinkPopover.tsx` → portfolio hover preview trigger and popup
- `src/components/candidates/CandidatePreviewDialog.tsx` → academic trigger and delayed text popovers for description/message
- `src/components/ui/popover.tsx` → shared popover wrapper and arrow styling
- `src/components/ui/tooltip.tsx` → shared tooltip wrapper
- `docs/tasks/29-05-2026/` → task history and this regression report

## Code style

Keep this report factual. No speculative cleanup disguised as completed work.

## Testing strategy

- No new feature verification in this task
- Browser behavior should be re-tested from scratch after any revert or replacement implementation

## Boundaries

- Always: document the regression plainly
- Ask first: any code revert or new implementation attempt
- Never: claim the hover system is stable in its current state

## Success criteria

- Future work can start from this report without reconstructing the failed iteration from chat history

## Assumptions

1. The current hover behavior is not acceptable for production use.
2. A targeted revert may be safer than incremental patching on top of the current hover stack.

---

## Report

Status: Done

Summary:

Recent changes to candidate-table hover previews introduced regressions instead of stabilizing the feature. The user reported repeated hover/focus issues across `academic`, `portfolio`, `description`, and `message` cells, including flicker after hover exit and stale focus-ring state on previously hovered triggers.

What was changed during the failed iteration:

- Added and modified custom hover lifecycle logic for portfolio and text popovers.
- Changed popover trigger semantics between native and non-native button modes.
- Adjusted shared popover arrow styling.
- Changed portfolio rows from a single trigger plus `+N` badge to multiple per-link triggers.
- Changed invalid portfolio metadata requests to degrade into empty metadata responses.
- Added `pointer-events-none`, zero-close-delay behavior, and manual `blur()` handling in another attempt to suppress hover/focus regressions.

What is currently considered broken:

- Candidate-table hover interactions are not trusted to be stable.
- Focus-ring state can remain on previously hovered triggers after the pointer moves elsewhere.
- Multiple overlapping attempts to suppress reopen/focus behavior have increased complexity without producing reliable UX.
- The current implementation has a high risk of hidden regressions because the hover lifecycle is now split across multiple components and ad hoc timing rules.

Primary files involved:

- [PortfolioLinkPopover.tsx](/Users/home/Documents/work-space/sunriser-dashboard/src/components/candidates/PortfolioLinkPopover.tsx:1)
- [CandidatePreviewDialog.tsx](/Users/home/Documents/work-space/sunriser-dashboard/src/components/candidates/CandidatePreviewDialog.tsx:1)
- [useHoverPopoverInteraction.ts](/Users/home/Documents/work-space/sunriser-dashboard/src/components/candidates/useHoverPopoverInteraction.ts:1)
- [popover.tsx](/Users/home/Documents/work-space/sunriser-dashboard/src/components/ui/popover.tsx:1)
- [tooltip.tsx](/Users/home/Documents/work-space/sunriser-dashboard/src/components/ui/tooltip.tsx:1)
- [DraggableRow.tsx](/Users/home/Documents/work-space/sunriser-dashboard/src/components/table/DraggableRow.tsx:1)
- [ApplicantDetailDrawer.tsx](/Users/home/Documents/work-space/sunriser-dashboard/src/components/views/ApplicantDetailDrawer.tsx:1)
- [portfolio-metadata route](/Users/home/Documents/work-space/sunriser-dashboard/src/app/api/candidates/portfolio-metadata/route.ts:1)

Recommended recovery path:

1. Revert the hover-preview stabilization work as a unit instead of stacking more patches on top.
2. Restore the last known-good candidate table behavior, even if that means simpler previews or fewer hover affordances.
3. Re-spec the hover behavior from first principles before re-implementation.
4. Rebuild one preview type at a time with explicit browser checks after each step.

Owner note:

This regression report is being written because the recent implementation attempts made the hover-preview code worse rather than better. The safe assumption is that the current hover stack should not be trusted without either a revert or a clean rework.
