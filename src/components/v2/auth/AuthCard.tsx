import type { ReactNode } from "react"

interface AuthCardProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="mb-4 inline-flex h-10 items-center rounded-full bg-[var(--v2-primary)] px-4 text-sm font-semibold text-white">
          SUN.RISER V2
        </div>
        <h1 className="text-2xl font-semibold tracking-normal text-[var(--v2-ink)]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--v2-muted)]">{subtitle}</p>
      </div>
      <div className="rounded-[var(--v2-radius-card)] border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] p-5 shadow-sm">{children}</div>
    </section>
  )
}
