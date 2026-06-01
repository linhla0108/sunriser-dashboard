# Tooling

## Prettier

Installed: `prettier`, `prettier-plugin-tailwindcss` (both `devDependencies`).

Config (`.prettierrc`):

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Run: `npm run format` — formats all files and sorts Tailwind classes automatically.

## Scripts

```bash
npm run dev       # dev server at localhost:3000
npm run build     # production build
npm run lint      # ESLint
npm run format    # Prettier (sorts Tailwind classes)
```

## No test runner configured.

## Error Checking Rules

**NEVER run `npm run dev` or `npm run build` to check for errors.** These are slow and start servers.

Use these instead:

```bash
npx tsc --noEmit          # TypeScript type checking (fast, no output files)
npm run lint              # ESLint for lint errors
npm run format -- --check # Prettier dry-run to check formatting
```

The build (`npm run build`) is only for final verification before shipping. The dev server (`npm run dev`) is never needed for error checking.

## Playwright / Browser Rules

- Default Playwright runs must stay **headless** so they do not steal window focus from the person using the machine.
- Prefer shell-run Playwright (`npx playwright test ...`) over interactive browser-control plugins for routine verification.
- Only use interactive browser-control tools when visual/manual inspection is explicitly required, and say so before doing it.
- If a browser-based check is needed for a small change, prefer one targeted page/spec instead of opening live tabs and switching focus repeatedly.
