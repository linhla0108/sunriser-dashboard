# Tailwind v4 Rules

## Never add `--spacing-N` entries to `@theme`

Defining `--spacing-4: 4px` (or any `--spacing-{n}`) in `@theme` overrides Tailwind's internal multiplier. `p-4` resolves to `4px` instead of `1rem`, breaking the entire spacing scale.

**Rule:** Never add `--spacing-*` entries to `@theme`. Let Tailwind use its default `--spacing: 0.25rem` base. Use a different prefix (e.g. `--size-card`) for custom spacing tokens.

## Type scale tokens must be `rem`, not `px`

`--text-*` tokens in `@theme` must use `rem` for browser font-size accessibility scaling.

## `calc()` output is by design — do not fight it

Tailwind v4 generates `padding: calc(var(--spacing) * 4)` instead of `padding: 1rem`. This is intentional and cannot be changed without downgrading to v3. The computed value is identical. The `gap: .75rem` style visible in DevTools from shadcn's stylesheet is pre-compiled Tailwind v3 output — a different source.
