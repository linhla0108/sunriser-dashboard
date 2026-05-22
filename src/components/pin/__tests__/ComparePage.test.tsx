import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CompareDialog } from "../ComparePage"

const dndKit = vi.hoisted(() => ({
  latestContext: null as null | {
    onDragStart?: (event: { active: { id: string } }) => void
    onDragEnd?: (event: { active: { id: string }; over?: { id: string } | null }) => void
    onDragCancel?: () => void
  },
}))

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragCancel,
    onDragEnd,
    onDragStart,
  }: {
    children: React.ReactNode
    onDragStart?: (event: { active: { id: string } }) => void
    onDragEnd?: (event: { active: { id: string }; over?: { id: string } | null }) => void
    onDragCancel?: () => void
  }) => {
    dndKit.latestContext = { onDragCancel, onDragEnd, onDragStart }
    return <div data-testid="compare-dnd-context">{children}</div>
  },
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PointerSensor: vi.fn(),
  closestCenter: vi.fn(() => []),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}))

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  arrayMove: (items: string[], from: number, to: number) => {
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
  },
  horizontalListSortingStrategy: {},
  useSortable: vi.fn(() => ({
    attributes: {},
    isDragging: false,
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
  })),
}))

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => undefined,
    },
  },
}))

vi.mock("@/components/common/ActionTooltip", () => ({
  ActionTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function seedPinned(ids: string[]) {
  localStorage.setItem("v2.pinned", JSON.stringify(ids))
}

function readPinned() {
  return JSON.parse(localStorage.getItem("v2.pinned") ?? "[]") as string[]
}

describe("CompareDialog", () => {
  beforeEach(() => {
    localStorage.clear()
    dndKit.latestContext = null
  })

  it("reorders compare columns through the shared pinned order", async () => {
    seedPinned(["001", "002", "003"])

    render(<CompareDialog open onOpenChange={vi.fn()} />, { wrapper: Providers })

    act(() => dndKit.latestContext?.onDragEnd?.({ active: { id: "003" }, over: { id: "001" } }))

    await waitFor(() => expect(readPinned()).toEqual(["003", "001", "002"]))
  })

  it("sorts compare candidates by GPA high first", async () => {
    seedPinned(["003", "001", "004"])

    render(<CompareDialog open onOpenChange={vi.fn()} />, { wrapper: Providers })

    fireEvent.change(screen.getByLabelText(/sort compare/i), { target: { value: "gpa" } })

    await waitFor(() => expect(readPinned()).toEqual(["004", "001", "003"]))
  })

  it("filters compare rows and highlights search matches", () => {
    seedPinned(["001", "002"])

    render(<CompareDialog open onOpenChange={vi.fn()} />, { wrapper: Providers })

    fireEvent.change(screen.getByLabelText(/search compare/i), { target: { value: "Full" } })

    expect(screen.getByText("Full")).toBeInTheDocument()
    expect(screen.getByText("time")).toBeInTheDocument()
    expect(screen.queryByText("Major")).not.toBeInTheDocument()
  })
})
