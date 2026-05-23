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
        <div data-v2-glass-glow="" className="mb-4 inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
          SUN.RISER V2
        </div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>
      <div data-v2-card="" className="rounded-2xl border border-foreground/10 bg-card/85 p-5 shadow-sm">{children}</div>
    </section>
  )
}
