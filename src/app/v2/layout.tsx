import "@/styles/v2-themes.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/v2/auth/AuthProvider"
import { ThemeProvider } from "@/lib/v2/theme/ThemeProvider"

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={300}>
      <ThemeProvider>
        <AuthProvider>
          <div className="v2-root min-h-screen bg-[var(--v2-bg)] font-[var(--v2-font)] text-[var(--v2-ink)]">{children}</div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  )
}
