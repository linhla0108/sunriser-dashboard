# Design System Reference

## Colors

| Token         | Hex       | Usage                                   |
| ------------- | --------- | --------------------------------------- |
| Primary       | `#FF5533` | Buttons, active states, accents         |
| Primary hover | `#E63D1F` | Hover on primary buttons                |
| Ink           | `#1b1b1b` | Headings, body text                     |
| Muted stone   | `#555555` | Secondary text                          |
| Light steel   | `#6B5549` | Hints, subtitles (WCAG AA: 5.1:1)       |
| Hint of grey  | `#767676` | Placeholders, disabled (WCAG AA: 4.6:1) |
| Fog           | `#f9f9f9` | Backgrounds, dividers                   |
| Warm mist     | `#ffdad3` | Primary tint, assistant avatar bg       |
| Canvas        | `#FCFCFC` | Page background                         |

## Typography (in `globals.css` `@theme`)

```css
--text-display: 2.25rem; /* stat values */
--text-h1: 1.375rem; /* page titles */
--text-h2: 0.9375rem; /* card titles */
--text-label: 0.6875rem; /* uppercase labels */
--text-body: 0.875rem; /* body text */
--text-small: 0.75rem; /* captions */
--text-mono: 0.75rem; /* mono/code */
```

Font: `Proxima Nova` (loaded via Cloudinary CDN in `globals.css`).

## Spacing — Compact Preference

Use one step tighter than "comfortable" defaults at every breakpoint:

| Context              | Use                 | Avoid                |
| -------------------- | ------------------- | -------------------- |
| Main content wrapper | `p-3 sm:p-4 lg:p-6` | `p-4 sm:p-6 lg:p-10` |
| Card inner padding   | `p-4`               | `p-6`                |
| Section gaps/margins | `gap-4 mb-4`        | `gap-6 mb-6`         |
| Modal/popup          | `p-4 space-y-4`     | `p-6 space-y-5`      |
| Empty states         | `py-10`             | `py-16`              |

## Border Radius

- Cards: `rounded-3xl`
- Buttons/pills: `rounded-full`
- Inputs/selects: `rounded-2xl`
- Small chips: `rounded-xl`

## Shadows

```js
// Standard card shadow — use inline style, not Tailwind
boxShadow: 'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px'
```

## Responsive Layout

- Sidebar: `hidden sm:flex`, `w-16 lg:w-[240px]`
- Main content offset: `ml-0 sm:ml-16 lg:ml-[240px]`
- Mobile bottom nav: `sm:hidden`, fixed at bottom
- Floating chat button: `fixed bottom-6 right-6`
- Table columns: `hidden lg:table-cell` (University, Year, PIC), `hidden sm:table-cell` (GPA, Batch, Round 2)
