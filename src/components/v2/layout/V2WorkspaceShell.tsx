"use client"

import { useCallback, useState } from "react"
import { AiDrawer } from "@/components/v2/chat/AiDrawer"
import { RequireAuth } from "@/components/v2/auth/RequireAuth"
import { NotesDrawer } from "@/components/v2/notes/NotesDrawer"
import { PinnedToolbar } from "@/components/v2/pin/PinnedToolbar"
import { ReportModal } from "@/components/v2/report/ReportModal"
import { V2Sidebar } from "@/components/v2/layout/V2Sidebar"
import { V2TopBar } from "@/components/v2/layout/V2TopBar"
import { DrawerRegistryProvider, useDrawerRegistry } from "@/lib/v2/drawer/DrawerRegistry"
import { useShortcut } from "@/lib/v2/keyboard/useShortcut"

export function V2WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DrawerRegistryProvider>
        <WorkspaceShellInner>{children}</WorkspaceShellInner>
      </DrawerRegistryProvider>
    </RequireAuth>
  )
}

function WorkspaceShellInner({ children }: { children: React.ReactNode }) {
  const registry = useDrawerRegistry()
  const [reportOpen, setReportOpen] = useState(false)
  const toggleChat = useCallback(() => registry.toggle("chat"), [registry])
  const toggleNotes = useCallback(() => registry.toggle("notes"), [registry])
  const openReport = useCallback(() => setReportOpen(true), [])

  useShortcut({ key: "j", meta: true }, toggleChat)
  useShortcut({ key: "n", meta: true }, toggleNotes)
  useShortcut({ key: "r", meta: true }, openReport)

  return (
    <div className="flex h-screen bg-[var(--v2-bg)]">
      <V2Sidebar />
      <main
        className="min-w-0 flex-1 overflow-y-auto transition-[margin] duration-200 lg:mr-[var(--v2-docked-width)]"
        style={{ "--v2-docked-width": `${registry.dockedWidth}px` } as React.CSSProperties}
      >
        <V2TopBar onOpenChat={toggleChat} onOpenNotes={toggleNotes} onCreateReport={openReport} />
        <PinnedToolbar />
        {children}
      </main>
      <AiDrawer />
      <NotesDrawer />
      <ReportModal open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  )
}
