import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import "@/styles/themes.css"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth/AuthProvider"
import { ThemeProvider } from "@/lib/theme/ThemeProvider"

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
    <html lang="en" data-theme="main" data-mode="light" suppressHydrationWarning className={cn("h-full font-sans", geist.variable)}>
      <body className="bg-background text-foreground h-full antialiased">
        <TooltipProvider delay={300}>
          <AuthProvider>
            <ThemeProvider>
              <div data-workspace="" className="bg-background text-foreground min-h-screen font-sans">
                {children}
              </div>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
