# Task: Vercel preview deploys only on PRs to main

## Goal
Side-branch pushes must not trigger preview deployments. Pull requests targeting `main` must still get a preview build.

## Scope
- `vercel.json` — allow all branches in `git.deploymentEnabled` and gate builds with `ignoreCommand`.
- No Dashboard changes required.

## Implementation

Updated `vercel.json`:

```json
{
  "git": { "deploymentEnabled": { "*": true } },
  "ignoreCommand": "if [ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ] || [ -n \"$VERCEL_GIT_PULL_REQUEST_ID\" ]; then exit 1; else exit 0; fi"
}
```

Logic: `exit 0` = skip build, `exit 1` = run build.

| Trigger | `VERCEL_GIT_COMMIT_REF` | `VERCEL_GIT_PULL_REQUEST_ID` | Result |
|---|---|---|---|
| Push to `main` | `main` | empty | Production build |
| Push to side branch, no PR | `feature/x` | empty | Skipped |
| Push to side branch with open PR to main | `feature/x` | set | Preview build |
| New PR opened to main | source branch | set | Preview build |

## Why this replaces the previous config
The previous `{ "*": false, "main": true }` blocked all side-branch deploys including PR previews, because `deploymentEnabled` is commit-trigger based and does not distinguish PR vs push.

## Files touched
- `vercel.json`
- `docs/tasks/23-05-2026/vercel-preview-pr-only.md`
- `docs/tasks/23-05-2026/summary.md`
