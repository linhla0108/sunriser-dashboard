# Host-Based Preview Strategy

Tag: candidates/spec

## Goal

Define a stable preview strategy for candidate academic and portfolio links so the dashboard stops behaving like a generic mini browser and instead chooses the safest, most reliable preview path per host and file type.

## Scope

- Included: preview classification rules, host policy groups, UI fallback behavior, verification strategy, and implementation slices for the existing candidate preview dialog flow
- Excluded: Electron/Tauri desktop shell, authenticated Google Drive API integration, archive content inspection, full remote browser emulation, and changes outside candidate preview surfaces

## Acceptance criteria

- The specification defines which links render inline, which links show a rich preview card, and which links open externally.
- The specification replaces generic iframe-first behavior with explicit host-based rules.
- The specification names the files, tests, and docs that implementation must update.
- The specification includes commands, boundaries, and measurable success criteria.

---

## Specification

### Assumptions

1. This is a Next.js web application, not a desktop app with native webview privileges.
2. Product value is fast candidate review, not universal support for every third-party document host.
3. Reliability is more important than maximizing in-app embeds.
4. The current preview entry points remain the candidate table and applicant detail drawer.
5. Existing secure proxy and OG preview routes stay in place unless implementation proves they need small targeted changes.

### Objective

Build a host-based preview policy for candidate links.

The user is a recruiter or reviewer who wants to inspect a candidate's academic file or portfolio quickly without being trapped in blank iframes, infinite loading states, or misleading partial renders.

Success means:

- Known safe file types render inline with dedicated viewers.
- Known unreliable web hosts do not default to iframe embed.
- The dialog always communicates what happened and what the reviewer can do next.
- Preview behavior is predictable enough that new links can be classified by rule rather than by one-off workaround.

### Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Vitest
- Existing preview helpers in `src/lib/candidates/`
- Existing dialog UI in `src/components/candidates/`

### Commands

Type-check:

```bash
npx tsc --noEmit
```

Scoped lint for preview files:

```bash
npm run lint -- src/components/candidates/CandidatePreviewDialog.tsx src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/lib/candidates/candidateLinks.ts src/lib/candidates/__tests__/candidateLinks.test.ts src/app/api/candidates/og-preview/route.ts src/app/api/candidates/preview-file/route.ts
```

Scoped tests:

```bash
npm test -- src/lib/candidates/__tests__/candidateLinks.test.ts src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/app/api/candidates/preview-file/__tests__/route.test.ts
```

Optional focused browser verification after code is stable:

```bash
npx playwright test tests/e2e --grep "candidate preview"
```

Do not use these only to check errors:

```bash
npm run dev
npm run build
```

### Project structure

```text
src/components/candidates/                Candidate preview dialog and specialized preview UI
src/components/views/ApplicantDetailDrawer.tsx
                                         Candidate detail drawer entry point
src/components/table/DraggableRow.tsx    Candidate table preview entry point
src/lib/candidates/candidateLinks.ts     URL normalization, host classification, embed policy helpers
src/lib/candidates/filePreview.ts        Binary preview type detection
src/app/api/candidates/preview-file/     Public file proxy for inline previewable binaries
src/app/api/candidates/og-preview/       Server-side OG metadata fetch for non-embeddable links
src/components/candidates/__tests__/     Dialog behavior tests
src/lib/candidates/__tests__/            URL classification tests
docs/tasks/28-05-2026/                   Task spec and follow-up report
```

### Code style

Prefer explicit policy code over permissive heuristics. The classification should read like a table of product decisions, not a set of accidental fallthroughs.

```ts
const EXTERNAL_CARD_HOSTS = new Set(["drive.google.com", "docs.google.com", "notion.so", "www.notion.so"])

export function getCandidatePreviewPolicy(url: string): CandidatePreviewPolicy {
  if (isPdfPreviewUrl(url)) return { mode: "inline-binary", reason: "pdf" }
  if (isImagePreviewUrl(url)) return { mode: "inline-binary", reason: "image" }

  const host = previewHost(url)
  if (EXTERNAL_CARD_HOSTS.has(host)) return { mode: "external-card", reason: "host-rule" }

  return { mode: "external-card", reason: "default-safe" }
}
```

Conventions:

- Put host policy names in uppercase `Set`s or typed maps.
- Prefer a structured `policy` return object over many loosely related booleans.
- Keep UI copy direct: `Preview not available in-app for this host. Open original link.`
- Keep fallback states explicit. Do not hide policy decisions behind timeout-only behavior.

### Preview policy

#### Policy modes

- `inline-binary`: render through existing proxy-backed image, PDF, or DOCX viewers
- `inline-specialized`: render through a dedicated in-app component such as GitHub repo/profile preview or LinkedIn badge preview
- `external-card`: show OG or host card with clear actions instead of iframe-first
- `external-only`: show explicit open/copy actions when no useful metadata is available

#### Initial host strategy

Always `inline-binary`:

- Public image URLs
- Public PDF URLs
- Public DOCX URLs
- Public Typeform file URLs that the preview proxy already supports

Always `inline-specialized`:

- `github.com/<owner>/<repo>`
- `github.com/<login>`
- `linkedin.com/in/<slug>`

Default to `external-card`, not iframe:

- `drive.google.com`
- `docs.google.com`
- `notion.so`
- `www.notion.so`
- `behance.net`
- `dribbble.com`
- `artstation.com`
- `kaggle.com`
- `surl.li` and other redirecting short links after OG resolution

Allow iframe/embed only when there is a known stable embed transform and manual verification proves it is reliable:

- `youtube.com`
- `youtu.be`

Default fallback for uncategorized public hosts:

- `external-card`

Escalate to `external-only` when:

- OG fetch fails
- Content is blocked by policy
- The URL is unsupported binary content such as `.zip`, `.rar`, `.doc`, `.ppt`, `.xls`

### Testing strategy

Unit tests:

- `candidateLinks` tests cover host-to-policy mapping, file-type detection, and transform helpers
- dialog tests cover each policy mode and action state

Route tests:

- preview proxy tests keep SSRF blocking, `HEAD`, `GET`, `Range`, and MIME normalization behavior intact
- OG route tests cover redirect resolution and metadata fallback behavior if implementation touches the route

Manual/browser checks:

- one Google Drive file link should show host-card fallback immediately
- one Google Sheets link with embedded images should show host-card fallback immediately
- one YouTube link should still embed
- one PDF, one image, and one DOCX academic file should still render inline
- one unsupported archive should show explicit external fallback

Coverage expectation:

- Every new host rule must have at least one unit test
- Every new preview mode must have at least one dialog test

### Boundaries

- Always: use `apply_patch` for edits, update task docs in the same task, run `npx tsc --noEmit`, scoped lint, and scoped tests before calling the work done
- Ask first: adding a new third-party dependency, introducing authenticated Google or Microsoft APIs, changing preview proxy trust boundaries, or expanding preview to non-candidate surfaces
- Never: rely on `npm run dev` or `npm run build` only to discover type or lint errors, silently broaden third-party embed permissions, or treat the dashboard as a generic browser shell

### Success criteria

- No Google Drive or Google Sheets candidate link enters a long iframe loading state by default.
- The preview dialog exposes a deterministic policy for every supported link.
- Reviewers always see one of these outcomes within one interaction: inline content, rich host card, or explicit external action.
- Host additions become a policy-table change plus tests, not a new chain of ad hoc conditionals.
- Existing stable academic previews for PDF, image, and DOCX remain unchanged.

### Implementation plan

Phase 1: Policy model

- Introduce a typed preview policy model in `candidateLinks.ts`
- Replace `embeddable-web` as the main decision API with policy-first classification
- Keep compatibility helpers during migration

Phase 2: Dialog behavior

- Update `CandidatePreviewDialog.tsx` to render by policy mode
- Remove iframe-first behavior for `drive.google.com` and `docs.google.com`
- Make fallback copy immediate and explicit

Phase 3: Test and documentation updates

- Rewrite affected tests around policy modes
- Add host-rule regression tests for Google Drive and Google Sheets
- Update this task file with a final report after implementation

## Detailed implementation plan

### Overview

This change replaces the current loose `preview kind + maybe embed URL` model with a stricter preview policy model. The policy becomes the source of truth. UI branches render from that policy instead of guessing that a host is safe to iframe and only falling back after a timeout.

### Architecture decisions

- Keep binary file handling separate from host handling.
  Rationale: academic file reliability is already improved by the preview proxy and custom viewers; this task should not regress that path.
- Add a typed preview policy helper instead of expanding `CandidatePreviewKind`.
  Rationale: the current kind enum mixes file type, UI mode, and embed behavior in one concept. Policy makes the decision explicit.
- Preserve existing specialized renderers for GitHub and LinkedIn.
  Rationale: those are already deliberate product treatments, not generic embeds.
- Restrict iframe embedding to known-good hosts only.
  Rationale: the bug class comes from optimistic embedding of third-party sites that do not behave like stable embed targets.

### Dependency graph

```text
Preview policy rules in candidateLinks.ts
    │
    ├── Dialog render branching in CandidatePreviewDialog.tsx
    │       │
    │       ├── Existing specialized previews stay intact
    │       └── Existing binary preview pipeline stays intact
    │
    └── Unit tests for policy classification
            │
            └── Dialog tests for visible fallback behavior
```

### Task list

#### Phase 1: Foundation

##### Task 1: Introduce typed preview policy helper

**Description:** Add a new URL-to-policy helper that returns both the preview mode and its reason. Keep the current helpers available during migration so downstream code can change incrementally.

**Acceptance criteria:**

- [ ] `candidateLinks.ts` exports a typed preview policy helper.
- [ ] Google Drive and Google Docs URLs classify to `external-card`.
- [ ] YouTube URLs still classify to an iframe-capable policy.

**Verification:**

- [ ] Tests pass: `npm test -- src/lib/candidates/__tests__/candidateLinks.test.ts`

**Dependencies:** None

**Files likely touched:**

- `src/lib/candidates/candidateLinks.ts`
- `src/lib/candidates/__tests__/candidateLinks.test.ts`

**Estimated scope:** Small

##### Task 2: Add policy regression tests for risky hosts

**Description:** Expand helper tests so the new host rules are locked down before the dialog is rewired.

**Acceptance criteria:**

- [ ] Tests cover `drive.google.com/file/...`, `drive.google.com/drive/folders/...`, and `docs.google.com/spreadsheets/...`.
- [ ] Tests cover default fallback behavior for uncategorized public hosts.

**Verification:**

- [ ] Tests pass: `npm test -- src/lib/candidates/__tests__/candidateLinks.test.ts`

**Dependencies:** Task 1

**Files likely touched:**

- `src/lib/candidates/__tests__/candidateLinks.test.ts`

**Estimated scope:** Small

### Checkpoint: Foundation

- [ ] Policy helper tests pass
- [ ] Google host decisions are explicit and stable

#### Phase 2: Core dialog behavior

##### Task 3: Rewire preview dialog to policy modes

**Description:** Update the preview dialog to branch on the new policy helper instead of optimistic iframe behavior for most web hosts.

**Acceptance criteria:**

- [ ] Google Drive and Google Docs no longer start in iframe loading mode.
- [ ] Existing GitHub and LinkedIn specialized previews still render.
- [ ] Existing binary preview pipeline is unchanged for image/PDF/DOCX.

**Verification:**

- [ ] Tests pass: `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx`

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `src/components/candidates/CandidatePreviewDialog.tsx`

**Estimated scope:** Medium

##### Task 4: Tighten fallback copy and actions

**Description:** Make fallback behavior immediate and explicit so reviewers understand whether they are seeing a rich host card or an external-only action state.

**Acceptance criteria:**

- [ ] `external-card` paths show a useful host/OG card without waiting for iframe timeout.
- [ ] `external-only` paths show direct open/copy style actions.

**Verification:**

- [ ] Tests pass: `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx`

**Dependencies:** Task 3

**Files likely touched:**

- `src/components/candidates/CandidatePreviewDialog.tsx`
- `src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx`

**Estimated scope:** Small

### Checkpoint: Core features

- [ ] Dialog tests pass
- [ ] Google links no longer behave like mini-browser embeds
- [ ] Stable academic previews still work

#### Phase 3: Verification and close-out

##### Task 5: Run scoped verification

**Description:** Run type-check, scoped lint, and focused tests for the preview flow.

**Acceptance criteria:**

- [ ] `npx tsc --noEmit` passes
- [ ] Scoped lint passes on changed preview files
- [ ] Focused tests pass

**Verification:**

- [ ] `npx tsc --noEmit`
- [ ] `npm run lint -- src/components/candidates/CandidatePreviewDialog.tsx src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/lib/candidates/candidateLinks.ts src/lib/candidates/__tests__/candidateLinks.test.ts src/app/api/candidates/og-preview/route.ts src/app/api/candidates/preview-file/route.ts`
- [ ] `npm test -- src/lib/candidates/__tests__/candidateLinks.test.ts src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/app/api/candidates/preview-file/__tests__/route.test.ts`

**Dependencies:** Tasks 1-4

**Files likely touched:** None

**Estimated scope:** Small

##### Task 6: Update task report

**Description:** Record the implementation result and verification summary in this task doc.

**Acceptance criteria:**

- [ ] Report section reflects shipped behavior
- [ ] Remaining follow-ups are called out explicitly

**Verification:**

- [ ] Manual doc review

**Dependencies:** Task 5

**Files likely touched:**

- `docs/tasks/28-05-2026/host-based-preview-strategy.md`

**Estimated scope:** Small

### Checkpoint: Complete

- [ ] All scoped verification passes
- [ ] Task report is updated
- [ ] Implementation matches the approved host-based strategy

### Risks and mitigations

| Risk                                                               | Impact | Mitigation                                                                 |
| ------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------- |
| Existing code still depends on `getCandidatePreviewKind` semantics | Medium | Keep old helper during migration and convert dialog first                  |
| Some hosts currently rely on timeout fallback for usable OG cards  | Medium | Route those hosts directly to `external-card` instead of waiting on iframe |
| Test expectations may encode old iframe-first behavior             | Low    | Update helper tests before dialog tests so policy changes are intentional  |

### Open questions

- None for this implementation slice. Authenticated provider integrations remain out of scope by prior decision.

### Task slices

- [ ] Task: Add a typed preview policy helper
  - Acceptance: one function maps URL to policy mode and reason
  - Verify: `npm test -- src/lib/candidates/__tests__/candidateLinks.test.ts`

- [ ] Task: Rewire dialog rendering to policy modes
  - Acceptance: dialog behavior no longer depends on generic iframe-first fallback for Google hosts
  - Verify: `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx`

- [ ] Task: Preserve binary preview behavior
  - Acceptance: PDF, image, DOCX, and unsupported archive handling stays correct
  - Verify: `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/app/api/candidates/preview-file/__tests__/route.test.ts`

- [ ] Task: Final verification and report
  - Acceptance: docs updated with implementation report and verification summary
  - Verify: `npx tsc --noEmit` and scoped lint/tests above

## Report

Status: Done

Implemented the host-based preview strategy for candidate links.

Behavior changes:

- Candidate preview now classifies URLs through a typed host-based policy helper instead of assuming most web links should try iframe first.
- Google Drive file links, Google Drive folders, and Google Sheets links now go directly to the OG/host-card path instead of entering the old loading iframe state.
- YouTube remains on the verified iframe embed path.
- Existing binary preview behavior for image, PDF, DOCX, and unsupported archive files remains unchanged.
- Specialized GitHub and LinkedIn previews remain unchanged.
- External-only fallback now supports both opening the original link and copying the link.

Verification:

- `npm test -- src/lib/candidates/__tests__/candidateLinks.test.ts`
- `npm test -- src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx`
- `npm test -- src/app/api/candidates/preview-file/__tests__/route.test.ts`
- `npx tsc --noEmit`
- `npm run lint -- src/components/candidates/CandidatePreviewDialog.tsx src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx src/lib/candidates/candidateLinks.ts src/lib/candidates/__tests__/candidateLinks.test.ts src/app/api/candidates/og-preview/route.ts src/app/api/candidates/preview-file/route.ts`

Remaining:

- Other public hosts still depend on OG metadata quality. This task removes the worst Google iframe failures, but it does not add authenticated provider integrations.
