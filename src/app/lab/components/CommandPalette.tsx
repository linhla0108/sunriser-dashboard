"use client"

import { useEffect, useRef, useState } from "react"
import { Search, Table2, Columns3, LayoutGrid, Download, SlidersHorizontal, X, User } from "lucide-react"
import { animate } from "animejs"
import { Dialog } from "@skeletonlabs/skeleton-react"
import { Applicant } from "@/lib/types"
import { LabView } from "../lab-types"
import { getPosColor, getPosShort, prefersReducedMotion } from "../lab-utils"
import { Button } from "@/components/ui/button"

interface Cmd {
  id: string
  icon: React.ReactNode
  label: string
  description?: string
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  applicants: Applicant[]
  onViewChange: (v: LabView) => void
  onExport: () => void
  onFilterBuilder: () => void
  onOpenDetail: (a: Applicant) => void
  onClearFilters: () => void
}

export default function CommandPalette({
  open,
  onClose,
  applicants,
  onViewChange,
  onExport,
  onFilterBuilder,
  onOpenDetail,
  onClearFilters,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open || !panelRef.current || prefersReducedMotion()) return
    animate(panelRef.current, {
      scale: [0.96, 1],
      opacity: [0, 1],
      duration: 200,
      ease: "outCubic",
    })
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const commands: Cmd[] = [
    {
      id: "view-table",
      icon: <Table2 size={14} />,
      label: "Switch to Table view",
      action: () => {
        onViewChange("table")
        onClose()
      },
    },
    {
      id: "view-kanban",
      icon: <Columns3 size={14} />,
      label: "Switch to Pipeline view",
      action: () => {
        onViewChange("kanban")
        onClose()
      },
    },
    {
      id: "view-gallery",
      icon: <LayoutGrid size={14} />,
      label: "Switch to Gallery view",
      action: () => {
        onViewChange("gallery")
        onClose()
      },
    },
    {
      id: "export",
      icon: <Download size={14} />,
      label: "Export data",
      description: "Download filtered rows as CSV",
      action: () => {
        onExport()
        onClose()
      },
    },
    {
      id: "filter",
      icon: <SlidersHorizontal size={14} />,
      label: "Open filter builder",
      action: () => {
        onFilterBuilder()
        onClose()
      },
    },
    {
      id: "clear",
      icon: <X size={14} />,
      label: "Clear all filters",
      action: () => {
        onClearFilters()
        onClose()
      },
    },
  ]

  const q = query.toLowerCase().trim()
  const filteredCmds = commands.filter(c => !q || c.label.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))

  const matchedApplicants =
    q.length >= 2
      ? applicants
          .filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.university.toLowerCase().includes(q))
          .slice(0, 6)
      : []

  const noResults = filteredCmds.length === 0 && matchedApplicants.length === 0

  return (
    <Dialog
      open={true}
      onOpenChange={isOpen => {
        if (!isOpen) onClose()
      }}
    >
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />
      <Dialog.Positioner className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[25vh]">
        <Dialog.Content
          ref={panelRef}
          aria-label="Command palette"
          className="w-full max-w-[520px] overflow-hidden rounded-3xl bg-white"
          style={{ boxShadow: "0 24px 64px rgba(4,23,43,0.18)" }}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-[#f5f5f5] px-4 py-3">
            <Search size={16} className="flex-shrink-0 text-[#767676]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search actions or applicants..."
              className="flex-1 bg-transparent text-sm text-[#1b1b1b] placeholder-[#767676] outline-none"
            />
            <kbd className="hidden items-center gap-1 rounded-lg bg-[#f9f9f9] px-2 py-0.5 font-mono text-[10px] text-[#767676] sm:flex">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {noResults && <p className="py-8 text-center text-sm text-[#767676]">No results for &ldquo;{query}&rdquo;</p>}

            {filteredCmds.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Actions</p>
                {filteredCmds.map(cmd => (
                  <Button
                    variant="plain"
                    size="plain"
                    key={cmd.id}
                    onClick={cmd.action}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-[#f9f9f9]"
                  >
                    <span className="flex-shrink-0 text-[#767676]">{cmd.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1b1b1b]">{cmd.label}</p>
                      {cmd.description && <p className="text-xs text-[#767676]">{cmd.description}</p>}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {matchedApplicants.length > 0 && (
              <div>
                <p className="px-2 py-1 text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Applicants</p>
                {matchedApplicants.map(a => {
                  const posColor = getPosColor(a.position1)
                  return (
                    <Button
                      variant="plain"
                      size="plain"
                      key={a.id}
                      onClick={() => {
                        onOpenDetail(a)
                        onClose()
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-[#f9f9f9]"
                    >
                      <div
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: posColor.light, color: posColor.bg }}
                      >
                        {a.name.split(" ").slice(-1)[0]?.[0] ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#1b1b1b]">{a.name}</p>
                        <p className="truncate text-xs text-[#767676]">
                          {getPosShort(a.position1)} · {a.university}
                        </p>
                      </div>
                      <User size={12} className="ml-auto flex-shrink-0 text-[#c0c0c0]" />
                    </Button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-[#f5f5f5] px-4 py-2">
            <span className="text-[10px] text-[#767676]">↵ select</span>
            <span className="text-[10px] text-[#767676]">ESC close</span>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog>
  )
}
