# Candidate Option Constants

Tag: candidates/refactor

## Goal

Create one shared source of truth for candidate round, batch, and PIC options used across candidates and lab features.

## Scope

- Included: shared constants and shared style maps for duplicated candidate option chips
- Included: replacing repeated local option arrays in candidates and lab components
- Excluded: changing option labels, business rules, or adding new candidate states

## Acceptance criteria

- Candidate and lab components import shared round, batch, and PIC options instead of redefining them locally
- Shared option style maps live in one reusable module
- Typecheck and targeted tests pass after the refactor

---

## Report

Status: Done | Commit: None

Shared candidate option constants now live in `src/lib/candidates/constants.ts` and are reused by candidates and lab components for round, batch, PIC, and shared chip or badge styles.

Verification: `npx tsc --noEmit`, `npx eslint` on changed files, and targeted Vitest coverage for lab option consumers passed.

Remaining: some candidate-specific labels and unrelated status visuals still live locally where they encode view-specific presentation rather than shared domain options.
