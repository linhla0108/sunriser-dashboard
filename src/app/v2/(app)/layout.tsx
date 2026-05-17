import { RequireAuth } from "@/components/v2/auth/RequireAuth"
import { V2Sidebar } from "@/components/v2/layout/V2Sidebar"
import { V2TopBar } from "@/components/v2/layout/V2TopBar"

export default function V2AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex h-screen bg-[var(--v2-bg)]">
        <V2Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <V2TopBar />
          {children}
        </main>
      </div>
    </RequireAuth>
  )
}
