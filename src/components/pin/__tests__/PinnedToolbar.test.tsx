import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PinnedToolbar } from "../PinnedToolbar"

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
    return <div data-testid="pinned-dnd-context">{children}</div>
  },
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PointerSensor: vi.fn(),
  closestCenter: vi.fn(() => []),
  pointerWithin: vi.fn(() => []),
  useDroppable: vi.fn(() => ({
    isOver: false,
    setNodeRef: vi.fn(),
  })),
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
    setActivatorNodeRef: vi.fn(),
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

function Providers({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delay={0}>{children}</TooltipProvider>
}

function seedPinned(ids: string[]) {
  localStorage.setItem("v2.pinned", JSON.stringify(ids))
}

function readPinned() {
  return JSON.parse(localStorage.getItem("v2.pinned") ?? "[]") as string[]
}

describe("PinnedToolbar", () => {
  beforeEach(() => {
    localStorage.clear()
    dndKit.latestContext = null
  })

  it("renders pinned candidates without the sticky tab toggle", () => {
    seedPinned(["001", "002"])

    render(<PinnedToolbar />, { wrapper: Providers })

    expect(screen.getByText("Nguyễn Minh Khoa")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /use sticky tab/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /use sticky bar/i })).not.toBeInTheDocument()
  })

  it("reorders pinned candidates from the drag end target", async () => {
    seedPinned(["001", "002", "003"])

    render(<PinnedToolbar />, { wrapper: Providers })

    act(() => dndKit.latestContext?.onDragEnd?.({ active: { id: "003" }, over: { id: "001" } }))

    await waitFor(() => expect(readPinned()).toEqual(["003", "001", "002"]))
  })

  it("shows the delete zone while dragging and removes a chip dropped there", async () => {
    seedPinned(["001", "002"])

    render(<PinnedToolbar />, { wrapper: Providers })

    act(() => dndKit.latestContext?.onDragStart?.({ active: { id: "001" } }))

    expect(await screen.findByText("Drop here to delete")).toBeInTheDocument()

    act(() => dndKit.latestContext?.onDragEnd?.({ active: { id: "001" }, over: { id: "pinned-delete-zone" } }))

    await waitFor(() => expect(readPinned()).toEqual(["002"]))
    expect(screen.queryByText("Nguyễn Minh Khoa")).not.toBeInTheDocument()
  })
})
