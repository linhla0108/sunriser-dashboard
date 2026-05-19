import Link from "next/link"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 text-foreground">
      <nav className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/login" className="font-heading text-lg font-semibold text-foreground">
          SUN.RISER
        </Link>
        <Link href="/login" className="text-xs font-medium text-muted-foreground hover:text-foreground">
          Back to login →
        </Link>
      </nav>
      {children}
      <footer className="mt-12 px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} SUN.RISER · Internship Recruitment 2026
      </footer>
    </div>
  )
}
