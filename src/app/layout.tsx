import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SUN.RISER 2026 Dashboard',
  description: 'Recruitment dashboard for SUN.RISER 2026 internship program',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#f7f7f8] antialiased">
        {children}
      </body>
    </html>
  )
}
