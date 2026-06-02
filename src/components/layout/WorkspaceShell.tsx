"use client"

import { useCallback, useState } from "react"
import { usePathname } from "next/navigation"
import { AiDrawer } from "@/components/chat/AiDrawer"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { NotesDrawer } from "@/components/notes/NotesDrawer"
import { PinnedToolbar } from "@/components/pin/PinnedToolbar"
import { ReportModal } from "@/components/report/ReportModal"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DrawerRegistryProvider, useDrawerRegistry } from "@/lib/drawer/DrawerRegistry"
import { AnnouncementProvider } from "@/lib/announcements/AnnouncementProvider"
import { UploadSessionProvider } from "@/lib/upload/UploadSessionContext"
import { WorkspaceContextMenu } from "@/components/context/WorkspaceContextMenu"

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AnnouncementProvider>
        <DrawerRegistryProvider>
          <UploadSessionProvider>
            <WorkspaceShellInner>{children}</WorkspaceShellInner>
          </UploadSessionProvider>
        </DrawerRegistryProvider>
      </AnnouncementProvider>
    </RequireAuth>
  )
}

function WorkspaceShellInner({ children }: { children: React.ReactNode }) {
  const registry = useDrawerRegistry()
  const pathname = usePathname()
  const [reportOpen, setReportOpen] = useState(false)
  const toggleChat = useCallback(() => registry.toggle("chat"), [registry])
  const toggleNotes = useCallback(() => registry.toggle("notes"), [registry])
  const openReport = useCallback(() => setReportOpen(true), [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "15rem",
          "--sidebar-width-icon": "4rem",
          "--sidebar-icon-button-size": "calc(var(--sidebar-width-icon) - 1rem)",
        } as React.CSSProperties
      }
    >
      <WorkspaceContextMenu>
        <div data-workspace="" className="bg-background relative flex h-screen w-full overflow-hidden">
          <div className="motion-safe:animate-[workspaceSidebarIn_680ms_cubic-bezier(0.16,1,0.3,1)_backwards]">
            <Sidebar />
          </div>
          <SidebarInset
            className="min-w-0 overflow-y-auto transition-[width] duration-200 lg:w-[calc(100vw-var(--sidebar-width)-var(--v2-docked-width))]"
            style={{ "--v2-docked-width": `${registry.dockedWidth}px` } as React.CSSProperties}
          >
            <div className="sticky top-0 z-30 motion-safe:animate-[workspaceTopbarIn_720ms_cubic-bezier(0.16,1,0.3,1)_80ms_backwards]">
              <TopBar onOpenChat={toggleChat} onOpenNotes={toggleNotes} onCreateReport={openReport} />
            </div>
            <div className="motion-safe:animate-[workspaceContentIn_760ms_cubic-bezier(0.16,1,0.3,1)_140ms_backwards]">
              {pathname === "/candidates" ? <PinnedToolbar /> : null}
              {children}
            </div>
          </SidebarInset>
          <AiDrawer />
          <NotesDrawer />
          <ReportModal open={reportOpen} onOpenChange={setReportOpen} />
        </div>
      </WorkspaceContextMenu>
    </SidebarProvider>
  )
}
