"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { anonymize } from "@/lib/public/anonymize"
import type { ReportSnapshot } from "@/lib/report/types"

const SHARES_KEY = "v2.report.shares"

function readShare(shareId: string): ReportSnapshot | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(SHARES_KEY)
    if (!raw) return null
    const map = JSON.parse(raw) as Record<string, ReportSnapshot>
    return map[shareId] ?? null
  } catch {
    return null
  }
}

// `storage` only fires cross-tab; same-tab writes don't need to invalidate
// since the URL/shareId is stable for the page lifetime.
function subscribeShares(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

export function PublicReport({ shareId }: { shareId: string }) {
  const found = useSyncExternalStore(
    subscribeShares,
    () => readShare(shareId),
    () => null
  )
  const snapshot = found ? anonymize(found) : null

  if (!snapshot) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-heading text-foreground text-2xl font-semibold">Report not found</h1>
        <p className="text-muted-foreground mt-2 text-sm">This share link is invalid or has expired on this device.</p>
        <Link href="/login" className="bg-primary text-primary-foreground mt-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold">
          Return to login
        </Link>
      </section>
    )
  }

  const generated = new Date(snapshot.generatedAt).toLocaleString()
  const candidateCount = snapshot.aliases?.length ?? snapshot.sourceApplicants.length

  return (
    <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
      <header className="mb-6">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Shared report</p>
        <h1 className="font-heading text-foreground mt-1 text-2xl font-semibold">
          {candidateCount} candidate{candidateCount === 1 ? "" : "s"} reviewed
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">Generated {generated}</p>
      </header>

      <div className="space-y-4">
        {snapshot.sections.map(section => (
          <article key={section.id} className="border-foreground/10 bg-card rounded-2xl border p-5">
            <h2 className="font-heading text-foreground text-base font-semibold">{section.title}</h2>
            <p className="text-foreground/85 mt-2 text-sm whitespace-pre-line">{section.content}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
