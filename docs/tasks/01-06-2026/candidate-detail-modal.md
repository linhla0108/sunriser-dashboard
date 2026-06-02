# Candidate Detail Modal

Tag: candidates/feature

## Goal

Open candidate detail in a centered modal instead of the right sidebar sheet on the candidates workspace.

## Scope

- Included: swap the candidate detail container from sheet to dialog while preserving current content and edit actions
- Included: keep candidate note editing and preview actions working inside the modal
- Excluded: redesign candidate detail fields or change candidate data behavior

## Acceptance criteria

- Candidate detail opens as a modal overlay instead of a right-side sheet
- Existing detail content and note editing remain available
- Close behavior still clears the selected candidate from the page state

---

## Report

Status: Done | Commit: uncommitted

Candidate detail on `/candidates` now opens in a centered dialog instead of a right-side sheet.
The existing sections, file previews, portfolio links, and note editing remain available.
The note field now uses the shared `Textarea` primitive to stay aligned with the shadcn-first UI rule.
Follow-up polish keeps the modal scrollable by giving the dialog an explicit header/body grid and a constrained scroll region.
Second pass expands the modal width and reorganizes the content into a denser dashboard-style layout so users can scan core candidate information with less scrolling.

Remaining: none.
