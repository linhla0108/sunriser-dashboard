# Button Normalization
Tag: ui/refactor

## Goal
Normalize every clickable button-like surface to use the shared shadcn Button component with correct cursor states.

## Scope
- Included: convert raw <button> tags to Button, add plain variant/size, cursor states for select/dropdown/tabs/checkbox/radio/switch/slider/input
- Excluded: test files, DropdownMenuItem/Dialog.Backdrop/pagination triggers (own their accessibility behavior)

## Acceptance criteria
- Zero raw <button> tags in non-test source files
- All interactive controls show pointer cursor when enabled, not-allowed when disabled
- No layout or behavior regressions

---

## Report
Status: Done | Commit: d0bae68

Added plain variant and plain size to Button. Converted all raw buttons across ~20 files. Added cursor states to 8 shadcn UI primitives. Plan was written after implementation.
