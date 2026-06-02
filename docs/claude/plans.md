# Task Documentation Rule

## Rule: Every task must be documented in `docs/tasks/`

Create a dated folder inside `docs/tasks/` using the format `DD-MM-YYYY`. If a folder for today's date already exists, use it.

```
docs/tasks/
└── 19-05-2026/
    ├── summary.md              ← agent reads this FIRST and ONLY by default
    ├── dnd-pipeline-kanban.md  ← one file per task (plan + report)
    ├── editable-chips.md
    └── ...
```

This rule applies to **all agents** (Claude Code, Codex, Copilot). Never create standalone plan or report files scattered across the source tree.

**Language:** English. Clear, simple, direct. Short sentences, concrete nouns, no filler.

---

## `summary.md` — the only file agents read by default

```markdown
# Tasks — 19 May 2026

| #   | Task                      | Tag                | Status      | Note                        |
| --- | ------------------------- | ------------------ | ----------- | --------------------------- |
| 1   | DnD Fix + Pipeline Kanban | candidates/fix     | Done        |                             |
| 2   | Editable Chips            | candidates/feature | In Progress | chips render, data flow WIP |
```

**Tag format:** `area/type` — e.g. `candidates/fix`, `ui/refactor`, `auth/feature`, `repo/chore`.

Agents should only drill into a task file when they need goal, scope, or acceptance criteria details.

---

## Task file — plan + report in one file

```markdown
# Task Title

Tag: area/type

## Goal

One sentence describing what this task achieves.

## Scope

- Included: what is in scope
- Excluded: what is explicitly out of scope

## Acceptance criteria

- Criterion one
- Criterion two

---

## Report

Status: Done | Commit: abc1234

Brief description of what changed (behavior, not file list).
Use git log --stat <commit> for file-level details.

Remaining: any deviations or follow-up items.
```

---

## What NOT to put in task files

- **Steps** (1. do X, 2. do Y) — execution detail, agent decides its own path
- **Files to touch** — goes stale after refactors, agent finds files via grep/read
- **File-by-file change tables** — duplicate of git log
- **Risks and mitigations** — relevant only during planning, not after
- **Open questions** — if still open, create a new task

---

## When to apply

- Multi-file changes, new features, refactors, bug fixes with non-trivial scope.
- Skip for trivial single-line edits or typo fixes.
- Write the plan section **before** implementation. Add the report section **after**.
