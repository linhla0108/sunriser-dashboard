import Link from "next/link"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-background via-background to-primary/10 text-foreground min-h-screen bg-gradient-to-br">
      <nav className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/login" className="font-heading text-foreground text-lg font-semibold">
          SUN.RISER
        </Link>
        <Link href="/login" className="text-muted-foreground hover:text-foreground text-xs font-medium">
          Back to login →
        </Link>
      </nav>
      {children}
      <footer className="text-muted-foreground mt-12 px-4 py-6 text-center text-xs sm:px-6">
        © {new Date().getFullYear()} SUN.RISER · Internship Recruitment 2026
      </footer>
    </div>
  )
}
