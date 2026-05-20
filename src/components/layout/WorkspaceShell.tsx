"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { AiDrawer } from "@/components/chat/AiDrawer"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { NotesDrawer } from "@/components/notes/NotesDrawer"
import { PinnedToolbar } from "@/components/pin/PinnedToolbar"
import { ReportModal } from "@/components/report/ReportModal"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import GlobalDropZone from "@/components/upload/GlobalDropZone"
import { DrawerRegistryProvider, useDrawerRegistry } from "@/lib/drawer/DrawerRegistry"
import { useShortcut } from "@/lib/keyboard/useShortcut"
import { WorkspaceContextMenu } from "@/components/context/WorkspaceContextMenu"

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
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
  const router = useRouter()
  const [reportOpen, setReportOpen] = useState(false)
  const toggleChat = useCallback(() => registry.toggle("chat"), [registry])
  const toggleNotes = useCallback(() => registry.toggle("notes"), [registry])
  const openReport = useCallback(() => setReportOpen(true), [])
  const analyzeUpload = useCallback(() => router.push("/candidates"), [router])

  useShortcut({ key: "j", meta: true }, toggleChat)
  useShortcut({ key: "n", meta: true }, toggleNotes)
  useShortcut({ key: "r", meta: true }, openReport)

  return (
    <SidebarProvider style={{ "--sidebar-width": "15rem", "--sidebar-width-icon": "4rem", "--sidebar-icon-button-size": "calc(var(--sidebar-width-icon) - 1rem)" } as React.CSSProperties}>
      <GlobalDropZone onAnalyze={analyzeUpload}>
        <WorkspaceContextMenu onCreateReport={openReport}>
          <div data-v2-workspace="" className="bg-background flex h-screen w-full">
            <Sidebar />
            <SidebarInset
              className="min-w-0 overflow-y-auto transition-[width] duration-200 lg:w-[calc(100vw-var(--sidebar-width)-var(--v2-docked-width))]"
              style={{ "--v2-docked-width": `${registry.dockedWidth}px` } as React.CSSProperties}
            >
              <TopBar onOpenChat={toggleChat} onOpenNotes={toggleNotes} onCreateReport={openReport} />
              <PinnedToolbar />
              {children}
            </SidebarInset>
            <AiDrawer />
            <NotesDrawer />
            <ReportModal open={reportOpen} onOpenChange={setReportOpen} />
          </div>
        </WorkspaceContextMenu>
      </GlobalDropZone>
    </SidebarProvider>
  )
}
