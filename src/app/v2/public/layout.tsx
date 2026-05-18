import Link from "next/link"

export default function V2PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="v2-root min-h-screen bg-gradient-to-br from-[var(--v2-bg)] via-[var(--v2-bg)] to-[var(--v2-primary)]/10 text-[var(--v2-ink)]">
      <nav className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/v2/login" className="font-heading text-lg font-semibold text-[var(--v2-ink)]">
          SUN.RISER
        </Link>
        <Link href="/v2/login" className="text-xs font-medium text-[var(--v2-muted)] hover:text-[var(--v2-ink)]">
          Back to login →
        </Link>
      </nav>
      {children}
      <footer className="mt-12 px-4 py-6 text-center text-xs text-[var(--v2-muted)] sm:px-6">
        © {new Date().getFullYear()} SUN.RISER · Internship Recruitment 2026
      </footer>
    </div>
  )
}
