# @dnd-kit Table Placement Rule

`DndContext` renders a wrapper `<div>` in the DOM. Placing it inside a `<table>` causes a React hydration error: "table cannot contain a nested div."

**Always put `DndContext` outside the entire table card. `SortableContext` is safe inside `<table>` because it renders no DOM element.**

```tsx
// ✅ Correct
<DndContext ...>
  <div className="...card...">
    <table>
      <thead>...</thead>
      <SortableContext ...>
        <tbody>...</tbody>
      </SortableContext>
    </table>
  </div>
</DndContext>

// ❌ Wrong — DndContext renders a <div> inside <table>
<table>
  <thead>...</thead>
  <DndContext ...>
    <SortableContext ...>
      <tbody>...</tbody>
    </SortableContext>
  </DndContext>
</table>
```
