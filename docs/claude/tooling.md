# Tooling

## Prettier

Installed: `prettier`, `prettier-plugin-tailwindcss` (both `devDependencies`).

Config (`.prettierrc`):

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 150,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Run:

```bash
npm run format         # writes formatted files and sorts Tailwind classes
npx prettier . --check # dry-run check, no writes
```

Do not use `npm run format -- --check`. The `format` script is `prettier --write .`, so forwarding `--check` still starts from a write-mode script.

## Scripts

```bash
npm run dev       # dev server at localhost:3000
npm run build     # production build
npm run lint      # ESLint
npm run format    # Prettier (sorts Tailwind classes)
```

## Tests

Vitest is configured for unit tests. Playwright is configured for e2e tests.

```bash
npm test                         # Vitest run
npm run test:watch               # Vitest watch mode
npx playwright test path/to.spec # Targeted e2e spec
```

## Error Checking Rules

**NEVER run `npm run dev` or `npm run build` to check for errors.** These are slow and start servers.

Use these instead:

```bash
npx tsc --noEmit          # TypeScript type checking (fast, no output files)
npm run lint              # ESLint for lint errors
npx prettier . --check    # Prettier dry-run to check formatting
```

The build (`npm run build`) is only for final verification before shipping. The dev server (`npm run dev`) is never needed for error checking.

## Playwright / Browser Rules

- Default Playwright runs must stay **headless** so they do not steal window focus from the person using the machine.
- Prefer shell-run Playwright (`npx playwright test ...`) over interactive browser-control plugins for routine verification.
- Only use interactive browser-control tools when visual/manual inspection is explicitly required, and say so before doing it.
- If a browser-based check is needed for a small change, prefer one targeted page/spec instead of opening live tabs and switching focus repeatedly.
