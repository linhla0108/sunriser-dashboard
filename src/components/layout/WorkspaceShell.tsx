"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
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
  const pathname = usePathname()
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
          <div data-workspace="" className="bg-background relative flex h-screen w-full overflow-hidden">
            <div className="motion-safe:animate-[workspaceSidebarIn_680ms_cubic-bezier(0.16,1,0.3,1)_both]">
              <Sidebar />
            </div>
            <SidebarInset
              className="min-w-0 overflow-y-auto transition-[width] duration-200 lg:w-[calc(100vw-var(--sidebar-width)-var(--v2-docked-width))]"
              style={{ "--v2-docked-width": `${registry.dockedWidth}px` } as React.CSSProperties}
            >
              <div className="motion-safe:animate-[workspaceTopbarIn_720ms_cubic-bezier(0.16,1,0.3,1)_80ms_both]">
                <TopBar onOpenChat={toggleChat} onOpenNotes={toggleNotes} onCreateReport={openReport} />
              </div>
              <div className="motion-safe:animate-[workspaceContentIn_760ms_cubic-bezier(0.16,1,0.3,1)_140ms_both]">
                {pathname === "/candidates" ? <PinnedToolbar /> : null}
                {children}
              </div>
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
