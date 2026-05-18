# Plans Documentation Rule

## Rule: Every plan must be documented in `docs/plans/`

After completing a plan, create a dated folder inside `docs/plans/` using the format `DD-MM-YYYY` (e.g. `18-05-2026`). If a folder for today's date already exists, use it — do not create duplicates.

```
docs/plans/
└── 18-05-2026/
    ├── plan.md      ← written before implementation
    └── report.md   ← updated after implementation is complete
```

This rule applies to **all agents** (Claude Code, Codex, OpenCode, GitHub Copilot). Never create standalone plan or report files scattered across the source tree.

**Language:** All plans and reports must be written in **English**. Use clear, simple, and direct language that is easy for LLMs to parse — short sentences, concrete nouns, no ambiguous pronouns, no filler phrases.

---

## `plan.md` — written before implementation

```markdown
# Plan: <feature or fix title>

## Goal
One sentence describing what this plan achieves.

## Scope
- What is included
- What is explicitly out of scope

## Steps
1. Step one
2. Step two
3. ...

## Files to touch
List the files expected to be created or modified.
```

---

## `report.md` — updated after implementation is complete

```markdown
# Report: <feature or fix title>

## Status
Completed / Partial / Abandoned

## Changes

| File | Description |
| ---- | ----------- |
| `src/components/Foo.tsx` | Added X to handle Y |
| `src/lib/utils.ts` | Extracted helper Z |

## Notes
Any deviations from the plan, edge cases found, or follow-up tasks.
```

The report must use **relative file paths from the repo root** and keep descriptions brief (one sentence per file).

---

## When to apply

- Any task that requires a plan step before implementation.
- Multi-file changes, new features, refactors, bug fixes with non-trivial scope.
- Skip for trivial single-line edits or typo fixes.
