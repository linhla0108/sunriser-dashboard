"use client"

import { useState } from "react"
import { Copy, Download, FileText, Keyboard, FilterX, Link2 } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { mockApplicants } from "@/lib/mockData"
import type { Applicant } from "@/lib/types"

interface WorkspaceContextMenuProps {
  children: React.ReactNode
  onCreateReport?: () => void
  onResetFilters?: () => void
}

function exportCSV(applicants: Applicant[], filename = "applicants.csv") {
  const headers = ["Name", "Email", "Position", "University", "GPA", "Batch", "PIC", "Round 1", "Round 2"]
  const rows = applicants.map(a => [
    a.name,
    a.email,
    a.position1,
    a.university,
    a.gpa,
    a.batch,
    a.pic ?? "",
    a.round1Result ?? "",
    a.round2Result ?? "",
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const SHORTCUTS = [{ label: "Focus view switcher first, then press 1-3" }, { label: "Focus table pager first, then press arrow keys" }]

export function WorkspaceContextMenu({ children, onCreateReport, onResetFilters }: WorkspaceContextMenuProps) {
  const [copied, setCopied] = useState(false)

  const [selectionText, setSelectionText] = useState("")

  function handleContextOpen() {
    // Capture selection before the menu opens (right-click can clear it)
    setSelectionText(window.getSelection()?.toString() ?? "")
  }

  function handleCopy() {
    if (selectionText) navigator.clipboard.writeText(selectionText)
  }

  function handleCopyURL() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ContextMenu
      onOpenChange={open => {
        if (open) handleContextOpen()
      }}
    >
      <ContextMenuTrigger className="contents select-text">{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={handleCopy} disabled={!selectionText}>
          <Copy />
          {selectionText ? `Copy "${selectionText.slice(0, 20)}${selectionText.length > 20 ? "…" : ""}"` : "Copy selected text"}
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={handleCopyURL}>
          <Link2 />
          {copied ? "Copied!" : "Copy page link"}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Download />
            Export data
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuGroup>
              <ContextMenuLabel>Download as</ContextMenuLabel>
              <ContextMenuItem onClick={() => exportCSV(mockApplicants, "applicants.csv")}>CSV — all applicants</ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  exportCSV(
                    mockApplicants.filter(a => a.round1Result === "Passed"),
                    "passed-applicants.csv"
                  )
                }
              >
                CSV — passed only
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {onCreateReport && (
          <ContextMenuItem onClick={onCreateReport}>
            <FileText />
            Create report
          </ContextMenuItem>
        )}

        {onResetFilters && (
          <ContextMenuItem onClick={onResetFilters}>
            <FilterX />
            Reset filters
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Keyboard />
            Keyboard shortcuts
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-52">
            <ContextMenuGroup>
              <ContextMenuLabel>Shortcuts</ContextMenuLabel>
              {SHORTCUTS.map(shortcut => (
                <ContextMenuItem key={shortcut.label} disabled>
                  {shortcut.label}
                </ContextMenuItem>
              ))}
            </ContextMenuGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}
