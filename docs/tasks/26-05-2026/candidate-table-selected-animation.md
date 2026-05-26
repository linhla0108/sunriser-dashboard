# Candidate Table Selected Section Animation

Tag: candidates/ui

## Goal

Make selected-section collapse and expand feel smooth without invalid table layout or row-by-row flicker.

## Scope

- Included: measured selected-section panel animation, reduced-motion handling, collapse/expand test updates.
- Excluded: new dependencies, shadcn/Radix Collapsible, broader table architecture changes.

## Acceptance criteria

- Expanding the section shows a smooth reveal.
- Collapsing keeps rows visible until the close animation finishes.
- The `Filtered results` divider moves with the panel instead of jumping first.
- Reduced-motion users see the same final states without animation.
- Existing selected-section collapse/filter tests continue to pass.

---

## Report

Status: Done | Commit: current commit

Selected-section collapse now animates a measured panel wrapper with `animejs` instead of mounting or unmounting selected `<tr>` elements directly. The ordering test asserts behavior around the divider rather than internal row indices because the animation panel adds a wrapper row.

Browser polish check confirmed the selected section stays hidden until a filter/search is active. Close animation now uses a balanced easing so the panel is still around half height midway through the transition instead of disappearing almost immediately.
