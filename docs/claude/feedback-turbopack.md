# Turbopack / Next.js App Router Rules

## No multiline `className` strings

Turbopack's parser rejects newlines inside JSX string attributes. Always write `className` as a single line.

```tsx
// ❌ Breaks Turbopack build
className="
  bg-white w-full
  rounded-3xl p-6
"

// ✅ Fine
className="bg-white w-full rounded-3xl p-6"
```

## No `<style jsx>` or `<style jsx global>`

styled-jsx is not supported in the App Router. Put all global keyframes and animations in `src/app/globals.css`.

```tsx
// ❌ Breaks — styled-jsx not supported in App Router
<style jsx global>{`@keyframes foo { ... }`}</style>

// ✅ Fine — put in globals.css
// @keyframes slideUpFade { from { ... } to { ... } }
```

Current keyframes in `globals.css`: `slideUpFade`, `slideInRight`.
