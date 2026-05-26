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
        <div
          data-v2-glass-glow=""
          className="bg-primary text-primary-foreground mb-4 inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold"
        >
          SUN.RISER V2
        </div>
        <h1 className="text-foreground text-2xl font-semibold tracking-normal">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">{subtitle}</p>
      </div>
      <div data-v2-card="" className="border-foreground/10 bg-card/85 rounded-2xl border p-5 shadow-sm">
        {children}
      </div>
    </section>
  )
}
