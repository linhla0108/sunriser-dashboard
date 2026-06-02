# GitHub Copilot Instructions

Use the repo guidance in `CLAUDE.md` and `AGENTS.md`.

Key rules:

- Read `CLAUDE.md` before non-trivial work.
- Prefer shared shadcn/ui primitives from `src/components/ui/` for product UI.
- Use `npx tsc --noEmit`, `npm run lint`, and focused tests for error checking.
- Do not run `npm run dev` or `npm run build` just to check errors.
- Document non-trivial tasks in `docs/tasks/DD-MM-YYYY/`.
- Keep changes surgical and avoid unrelated refactors.
