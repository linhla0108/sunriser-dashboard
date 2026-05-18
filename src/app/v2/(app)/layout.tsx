import { V2WorkspaceShell } from "@/components/v2/layout/V2WorkspaceShell"

export default function V2AppLayout({ children }: { children: React.ReactNode }) {
  return <V2WorkspaceShell>{children}</V2WorkspaceShell>
}
