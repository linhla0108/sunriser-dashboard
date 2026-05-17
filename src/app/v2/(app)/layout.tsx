import { RequireAuth } from "@/components/v2/auth/RequireAuth"

export default function V2AppLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>
}
