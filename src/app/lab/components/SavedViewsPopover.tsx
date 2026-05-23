"use client"

import { useRef, useState, useEffect } from "react"
import { Bookmark, Check, Trash2, Table2, Columns3, LayoutGrid } from "lucide-react"
import { SavedView, LabView } from "../lab-types"
import { Button } from "@/components/ui/button"

const VIEW_ICONS: Record<LabView, typeof Table2> = {
  table: Table2,
  kanban: Columns3,
  gallery: LayoutGrid,
}

interface SavedViewsPopoverProps {
  open: boolean
  onClose: () => void
  savedViews: SavedView[]
  onLoad: (v: SavedView) => void
  onDelete: (id: string) => void
  onSaveCurrent: (name: string) => void
  anchorRef: React.RefObject<HTMLElement | null>
}

export default function SavedViewsPopover({ open, onClose, savedViews, onLoad, onDelete, onSaveCurrent, anchorRef }: SavedViewsPopoverProps) {
  const [newName, setNewName] = useState("")
  const [saved, setSaved] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, onClose, anchorRef])

  if (!open) return null

  function handleSave() {
    if (!newName.trim()) return
    onSaveCurrent(newName.trim())
    setNewName("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      ref={popoverRef}
      className="absolute top-full right-0 z-50 mt-2 w-[280px] overflow-hidden rounded-3xl bg-white"
      style={{ boxShadow: "rgba(4,23,43,0.05) 0px 0px 0px 1px, rgba(0,0,0,0.14) 0px 16px 40px" }}
    >
      <div className="p-3">
        <p className="mb-2 px-1 text-[10px] font-semibold tracking-widest text-[#6B5549] uppercase">Saved Views</p>

        {savedViews.length === 0 ? (
          <p className="py-4 text-center text-xs text-[#767676]">No saved views yet</p>
        ) : (
          <div className="mb-3 space-y-1">
            {savedViews.map(v => {
              const Icon = VIEW_ICONS[v.view]
              return (
                <div key={v.id} className="group flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-[#f9f9f9]">
                  <Icon size={13} className="flex-shrink-0 text-[#767676]" />
                  <Button
                    variant="plain"
                    size="plain"
                    onClick={() => {
                      onLoad(v)
                      onClose()
                    }}
                    className="flex-1 truncate text-left text-sm font-medium text-[#1b1b1b]"
                  >
                    {v.name}
                  </Button>
                  <Button
                    variant="plain"
                    size="plain"
                    onClick={() => onDelete(v.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-[#c0c0c0] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#fef2f2] hover:text-[#ef4444]"
                  >
                    <Trash2 size={11} />
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <div className="border-t border-[#f5f5f5] pt-3">
          <p className="mb-2 px-1 text-[10px] font-semibold tracking-widest text-[#6B5549] uppercase">Save current view</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder="View name..."
              className="h-8 flex-1 rounded-2xl border border-[#e8e8e8] bg-[#f9f9f9] px-3 text-xs text-[#1b1b1b] placeholder-[#767676] transition-colors focus:border-[#8d1600] focus:outline-none"
            />
            <Button
              variant="plain"
              size="plain"
              onClick={handleSave}
              disabled={!newName.trim()}
              className={`flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-all ${saved ? "bg-[#22c55e] text-white" : "bg-[#8d1600] text-white hover:bg-[#7a1200] disabled:cursor-not-allowed disabled:opacity-40"}`}
            >
              {saved ? <Check size={12} /> : <Bookmark size={12} />}
              {saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
