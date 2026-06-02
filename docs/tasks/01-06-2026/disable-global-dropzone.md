# Disable Global Dropzone

Tag: workspace/fix

## Goal

Disable the app-wide drag and drop upload overlay so normal workspace interaction is no longer intercepted globally.

## Scope

- Included: stop mounting the global dropzone wrapper in the workspace shell
- Included: update affected automated coverage to match the disabled global behavior
- Excluded: redesign local upload surfaces or replace the upload flow with a new entry point

## Acceptance criteria

- Dragging a file over the general workspace does not open the fullscreen drop overlay
- Dropping a file on the general workspace does not trigger the upload review popup
- Workspace layout and existing routes still render normally without the global wrapper

---

## Report

Status: Done | Commit: uncommitted

Removed the `GlobalDropZone` wrapper from the workspace shell so document-level drag and drop no longer mounts in the protected app frame. Updated the upload e2e spec to assert that dropping a file on the general workspace does not open the review popup.

Remaining: Playwright coverage still requires `E2E_EMAIL` and `E2E_PASSWORD`, so the targeted spec was skipped in this environment after the assertion update.
