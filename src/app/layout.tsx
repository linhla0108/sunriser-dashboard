import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import "@/styles/v2-themes.css"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/v2/auth/AuthProvider"
import { ThemeProvider } from "@/lib/v2/theme/ThemeProvider"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "SUN.RISER 2026 Dashboard",
  description: "Recruitment dashboard for SUN.RISER 2026 internship program",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("h-full font-sans", geist.variable)}>
      <body className="bg-background text-foreground h-full antialiased">
        <TooltipProvider delay={300}>
          <ThemeProvider>
            <AuthProvider>
              <div data-v2-workspace="" className="min-h-screen bg-background font-sans text-foreground">
                {children}
              </div>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
