# Required Skills

For **any** task in this repo (feature, fix, refactor, UI change), invoke the core skills **before** writing code:

| Skill | Purpose | When it matters most |
| --- | --- | --- |
| `karpathy-guidelines` | Code discipline: surgical changes, no over-engineering, no premature abstraction | All tasks |
| `impeccable` | Polish and refine: visual hierarchy, spacing, micro-interactions | UI/layout work |
| `frontend-design` | Production-grade UI: distinctive, consistent design system usage | New components, visual changes |
| `ui-ux-pro-max` | UX patterns: accessibility, responsive behavior, interaction design | Any user-facing work |
| `tailwind-css-patterns` | Tailwind v4 utility patterns, responsive layout, design-token usage | Any styling or layout work |
| `performance-optimization` | Measure-first performance review, Core Web Vitals, render/load risks | Perf-sensitive UI, charts, tables, large datasets |

**Why:** This repo has a strict design system (Proxima Nova, `#FF5533` primary, Tailwind v4 config-less, shadcn/ui base-nova). Skipping these skills causes inconsistency and overbuilt code.

**How to apply:**

1. Before any implementation, invoke the core skills above.
2. `karpathy-guidelines` shapes HOW you code: minimal, clean, no hallucinated abstractions.
3. `frontend-design` + `impeccable` + `ui-ux-pro-max` shape WHAT you build: design decisions, spacing, interaction.
4. `tailwind-css-patterns` keeps Tailwind v4 usage aligned with repo tokens and responsive rules.
5. `performance-optimization` applies when a change could affect render cost, table responsiveness, bundle size, charts, or Core Web Vitals.
6. Do not skip even for "small" tasks: padding changes and color tweaks still need design discipline.

## Codex Skill Aliases

The following Claude Code style slash names should map to Codex skill names in this repo:

| Requested name | Codex skill(s) to use | Notes |
| --- | --- | --- |
| `/karpathy-guidelines` | `karpathy-guidelines` | Global Codex skill copied from Claude Code |
| `/frontend-design` | `frontend-design` | Global Codex skill copied from Claude Code |
| `/ui-ux-pro-max` | `ui-ux-pro-max` | Global Codex skill copied from Claude Code |
| `/impeccable` | `impeccable` | Global Codex skill copied from Claude Code |
| `/performance-optimization` | `performance-optimization` | Agent skill copied into Codex |
| `/tailwind-css-patterns` | `tailwind-css-patterns` | Global Codex skill copied from Claude Code |
| `/agent-skills:build` | `incremental-implementation`, `test-driven-development`, `frontend-ui-engineering` | `build` is a Claude slash workflow, not a single Codex skill |
| `/agent-skills:code-simplify` | `code-simplification` | Behavior-preserving simplification |
| `/agent-skills:review` | `code-review-and-quality` | Five-axis review before merge |

For implementation work, use the build aliases as a workflow: make small verified slices, cover behavior with tests when logic changes, and keep user-facing UI production quality. For review work, lead with defects and risks before summaries.
