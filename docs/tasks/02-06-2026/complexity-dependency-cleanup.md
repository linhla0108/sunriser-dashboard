# Complexity And Dependency Cleanup

Tag: repo/chore

## Goal

Reduce maintenance debt by removing disposable lab code, disabling vulnerable XLSX parsing, and splitting oversized active files without changing retained product behavior.

## Scope

- Included: delete `/lab`, remove unused/lab-only packages, support only CSV/TSV/JSON candidate uploads, and split active source files over 500 lines.
- Excluded: Supabase migrations, Vercel deploys, `npm run dev`, `npm run build`, XLSX replacement parser, and product behavior changes outside the approved cleanup.

## Acceptance criteria

- `/lab` source and tests are removed.
- Candidate upload parsing accepts `.csv`, `.tsv`, and `.json`; `.xls` and `.xlsx` are unsupported.
- No source or test imports `xlsx`.
- Package cleanup removes unused/lab-only dependencies from `package.json` and lockfile.
- Active source TS/TSX files are under 500 lines, except data fixture modules if needed to preserve exported data shape.
- Verification commands are recorded in the report.

---

## Report

Status: Done

## Changes completed

- Deleted `src/app/lab/**`, including lab page, components, utilities, types, and tests.
- Removed the lab/unused packages from `package.json` and `package-lock.json`:
  - `@skeletonlabs/skeleton-react`
  - `@radix-ui/react-navigation-menu`
  - `@radix-ui/react-context-menu`
  - `papaparse`
  - `xlsx`
- Removed `/lab` from public route prefixes in `src/proxy.ts`.
- Deleted unreferenced `src/components/upload/UploadZone.tsx`.
- Candidate upload parsing now accepts only `.csv`, `.tsv`, and `.json`.
- Candidate upload `.xls` and `.xlsx` inputs now fail as unsupported parser types.
- Announcement attachments and candidate file preview metadata still allow spreadsheet attachment/link metadata as non-parser flows.
- Split active oversized implementation files:
  - `DraggableRow.tsx` into row chips, context menu, and CSV export helpers.
  - `ApplicantTable.tsx` into header, pagination, and sort/reorder helpers.
  - `CandidatePreviewDialog.tsx` into binary preview, delayed text preview, types, and helpers.
  - `AnnouncementManagementPage.tsx` into composer, managed list, drop overlay, and utilities.
  - `GlobalDropZone.tsx` into overlay, toast stack, and utility modules.
  - `src/components/ui/sidebar.tsx` into sidebar context/provider and menu primitives while preserving `@/components/ui/sidebar`.

## Verification

| Command                            | Result                                                                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`                 | Passed                                                                                                                                                                                |
| `npm run lint`                     | Passed                                                                                                                                                                                |
| `npm test`                         | Passed: 63 files, 246 tests                                                                                                                                                           |
| `npx prettier . --check`           | Passed                                                                                                                                                                                |
| `npm audit --audit-level=moderate` | Failed with 3 existing moderate issues: `postcss` via `next`, and `qs`; no `xlsx` advisory remains                                                                                    |
| `npx depcheck --json`              | Exited 255 with known findings: false-positive unused `shadcn`, `tw-animate-css`, Tailwind/PostCSS/Prettier tooling; missing `server-only` package remains a separate dependency task |

## Static scan results

- Removed package/import scan:
  - `rg -n "@skeletonlabs/skeleton-react|@radix-ui/react-navigation-menu|@radix-ui/react-context-menu|papaparse|from ['\"]xlsx|require\\(['\"]xlsx|import\\(['\"]xlsx" src package.json package-lock.json`
  - Result: no matches.
- Broad `xlsx` content references still exist only in intentional non-parser places:
  - Unsupported `.xlsx` parser test assertions.
  - Announcement attachment extension allow-list.
  - Candidate file preview metadata.
- Largest active implementation TS/TSX files after refactor:
  - `src/components/candidates/CandidateFiltersBar.tsx`: 486
  - `src/components/upload/GlobalDropZoneOverlay.tsx`: 454
  - `src/components/views/ChartView.tsx`: 452
  - `src/components/candidates/CandidateBinaryPreview.tsx`: 437
  - `src/components/views/PipelineView.tsx`: 434
- Remaining >500 files are data fixtures kept as shape-preserving exceptions:
  - `src/lib/mockData.ts`: 942
  - `src/lib/candidateTypeformSupplement.ts`: 742, generated from Typeform TSV.

## Follow-up backlog

1. Resolve `npm audit` moderate items as a separate dependency task: `postcss` via `next`, and `qs`.
2. Decide whether to install or remove `server-only`; `depcheck` reports it as missing because several server modules import it.
3. Optional data-fixture cleanup: split `mockData.ts` and `candidateTypeformSupplement.ts` into chunk modules if strict line-count compliance should include fixture data.
