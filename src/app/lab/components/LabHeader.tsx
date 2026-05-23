"use client"

import { Table2, LayoutGrid, Columns3, Search, Command, Bookmark, Download, SlidersHorizontal, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LabView } from "../lab-types"
import { Button } from "@/components/ui/button"

const VIEWS: { id: LabView; label: string; icon: typeof Table2 }[] = [
  { id: "table", label: "Table", icon: Table2 },
  { id: "kanban", label: "Pipeline", icon: Columns3 },
  { id: "gallery", label: "Gallery", icon: LayoutGrid },
]

interface LabHeaderProps {
  activeView: LabView
  onViewChange: (v: LabView) => void
  search: string
  onSearch: (s: string) => void
  filterCount: number
  selectedCount: number
  onCmdOpen: () => void
  onExport: () => void
  onSaveView: () => void
  onFilterBuilder: () => void
  totalFiltered: number
  totalAll: number
}

export default function LabHeader({
  activeView,
  onViewChange,
  search,
  onSearch,
  filterCount,
  selectedCount,
  onCmdOpen,
  onExport,
  onSaveView,
  onFilterBuilder,
  totalFiltered,
  totalAll,
}: LabHeaderProps) {
  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        {/* Left: back + title */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[#767676] transition-colors hover:bg-[#f9f9f9] hover:text-[#1b1b1b]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold tracking-tight text-[#1b1b1b]" style={{ fontSize: "var(--text-h1)" }}>
                Lab
              </h1>
              <span className="rounded-full bg-[#8d1600] px-2 py-0.5 font-bold text-[#ffdad3]" style={{ fontSize: "10px" }}>
                BETA
              </span>
            </div>
            <p className="mt-0.5 hidden truncate text-sm text-[#6B5549] sm:block">
              {totalFiltered === totalAll
                ? `${totalAll.toLocaleString()} applicants`
                : `${totalFiltered.toLocaleString()} of ${totalAll.toLocaleString()} shown`}
              {selectedCount > 0 && ` · ${selectedCount} selected`}
            </p>
          </div>
        </div>

        {/* Right: view switcher + actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center gap-0.5 rounded-2xl bg-[#f9f9f9] p-1">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <Button
                variant="plain"
                size="plain"
                key={id}
                onClick={() => onViewChange(id)}
                title={label}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${activeView === id ? "bg-white text-[#1b1b1b] shadow-sm" : "text-[#767676] hover:text-[#1b1b1b]"}`}
              >
                <Icon size={13} />
                <span className="hidden sm:block">{label}</span>
              </Button>
            ))}
          </div>

          {/* Filter button */}
          <Button
            variant="plain"
            size="plain"
            onClick={onFilterBuilder}
            className={`relative flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${filterCount > 0 ? "border-[#8d1600] bg-[#ffdad3] text-[#8d1600]" : "border-[#e5e5e5] text-[#555555] hover:bg-[#f9f9f9]"}`}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:block">Filters</span>
            {filterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#8d1600] font-bold text-white" style={{ fontSize: "10px" }}>
                {filterCount}
              </span>
            )}
          </Button>

          {/* Save view */}
          <Button
            variant="plain"
            size="plain"
            onClick={onSaveView}
            title="Save current view"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] text-[#555555] transition-colors hover:bg-[#f9f9f9]"
          >
            <Bookmark size={13} />
          </Button>

          {/* Export */}
          <Button
            variant="plain"
            size="plain"
            onClick={onExport}
            title="Export"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] text-[#555555] transition-colors hover:bg-[#f9f9f9]"
          >
            <Download size={13} />
          </Button>

          {/* Command palette */}
          <Button
            variant="plain"
            size="plain"
            onClick={onCmdOpen}
            className="hidden h-8 items-center gap-1 rounded-full border border-[#e5e5e5] px-2.5 text-[#767676] transition-colors hover:bg-[#f9f9f9] sm:flex"
          >
            <Command size={11} />
            <span style={{ fontSize: "11px" }}>K</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#767676]" />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search name, email, university..."
          className="h-9 w-full rounded-2xl border border-[#e8e8e8] bg-white pr-4 pl-9 text-sm text-[#1b1b1b] placeholder-[#767676] transition-colors focus:border-[#1b1b1b] focus:outline-none"
        />
        {search && (
          <Button
            variant="plain"
            size="plain"
            onClick={() => onSearch("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#767676] hover:text-[#1b1b1b]"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  )
}
