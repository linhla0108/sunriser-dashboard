# AGENTS.md

All project guidance is in `CLAUDE.md`. Read that file first.

Before any code edit, the agent must explicitly check these mandatory keywords and constraints in `CLAUDE.md`:

- `READ FIRST`
- `APPLY_PATCH_ONLY`
- `NO_NODE_WRITE`
- `NO_PYTHON_WRITE`
- `NO_NPM_RUN_DEV_FOR_ERRORS`
- `NO_NPM_RUN_BUILD_FOR_ERRORS`
- `DOCS_REQUIRED`
- `STATE_ASSUMPTIONS_FIRST`

Hard pre-edit checklist for every non-trivial task:

1. Read `CLAUDE.md` completely, including linked docs that affect the task.
2. Confirm the edit method: manual file changes must use `apply_patch`.
3. Confirm verification method: use `npx tsc --noEmit`, scoped lint, and tests before considering `npm run dev` or `npm run build`.
4. Confirm documentation impact: if behavior, data contracts, types, or workflow change, create/update task docs in `docs/tasks/DD-MM-YYYY/` during the same task.
5. Surface any major data or mapping assumptions to the user before implementing them.

If any item above is not checked, stop and do not edit files.

@CLAUDE.md
