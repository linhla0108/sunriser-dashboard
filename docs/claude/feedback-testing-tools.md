# Testing Tool Rules — Cost & Speed

## Priority order

> **Text output = cheap. Image output = expensive. Browser = only when static is not enough.**

```
What changed?
│
├── Logic / Type / Data flow
│   └── tsc --noEmit + npm run lint        ✅ STOP — no browser needed
│
├── UI only (class, spacing, color)
│   └── tsc --noEmit                       ✅ STOP — no browser needed
│
├── Need to verify DOM / behavior / text
│   └── browser_snapshot                   ✅ cheap, fast
│
├── Need to verify JS error / API call
│   ├── browser_console_messages           (runtime errors)
│   └── browser_network_requests           (API status, payload)
│
├── Need to verify visual / layout break
│   └── browser_take_screenshot            ⚠️ one shot only
│
└── Critical feature needing reusable test
    └── Write to tests/e2e/*.spec.ts        (commit, run in CI)
        Never run the full suite to verify one small change.
```

---

## By situation

| Situation                                    | Tool                              |
| -------------------------------------------- | --------------------------------- |
| Fix type, interface, logic                   | `tsc --noEmit`                    |
| Add / change Tailwind class                  | `tsc --noEmit`                    |
| New component — does it render correct text? | `browser_snapshot`                |
| Button click → state change                  | `browser_snapshot` before + after |
| Form submit → correct API call?              | `browser_network_requests`        |
| Any JS console error?                        | `browser_console_messages`        |
| Chart / layout suspected broken              | `browser_take_screenshot` (once)  |
| Auth flow login / redirect                   | `browser_snapshot` step by step   |
| Write test for critical path                 | `tests/e2e/*.spec.ts` (CI)        |
| Full regression before merge                 | `npm run test:e2e` (CI only)      |

---

## Hard rules

- **Never** run `npm run dev` or `npm run build` to check errors — use `tsc --noEmit` + `lint`.
- **Never** open a browser just to verify a logic or type fix.
- **Never** take multiple screenshots in a loop — navigate → act → one snapshot → done.
- **Never** run `npm run test:e2e` to verify a CSS or spacing tweak.
- Screenshots (`browser_take_screenshot`, `preview_screenshot`) are last resort — pixel-level visual only.
- Chrome `computer` / `gif_creator` — avoid entirely.
