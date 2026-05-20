"use client"

import { Copy, Download, FileText, Keyboard, BarChart3 } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
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
}

function exportCSV(applicants: Applicant[], filename = "applicants.csv") {
  const headers = ["Name", "Email", "Position", "University", "GPA", "Batch", "PIC", "Round 1", "Round 2"]
  const rows = applicants.map((a) => [
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
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const SHORTCUTS = [
  { label: "Open AI Chat", keys: "⌘J" },
  { label: "Open Notes", keys: "⌘N" },
  { label: "Create Report", keys: "⌘R" },
]

export function WorkspaceContextMenu({ children, onCreateReport }: WorkspaceContextMenuProps) {
  function handleCopy() {
    const selected = window.getSelection()?.toString()
    if (selected) navigator.clipboard.writeText(selected)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="contents">{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={handleCopy}>
          <Copy />
          Copy selected text
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Download />
            Export data
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuLabel>Download as</ContextMenuLabel>
            <ContextMenuItem onClick={() => exportCSV(mockApplicants, "applicants.csv")}>
              CSV — all applicants
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() =>
                exportCSV(
                  mockApplicants.filter((a) => a.round1Result === "Passed"),
                  "passed-applicants.csv"
                )
              }
            >
              CSV — passed only
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {onCreateReport && (
          <ContextMenuItem onClick={onCreateReport}>
            <FileText />
            Create report
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Keyboard />
            Keyboard shortcuts
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-52">
            <ContextMenuLabel>Shortcuts</ContextMenuLabel>
            {SHORTCUTS.map((s) => (
              <ContextMenuItem key={s.label} disabled>
                <BarChart3 className="opacity-0" />
                {s.label}
                <ContextMenuShortcut>{s.keys}</ContextMenuShortcut>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}
