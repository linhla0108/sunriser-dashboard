"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { anonymize } from "@/lib/v2/public/anonymize"
import type { ReportSnapshot } from "@/lib/v2/report/types"

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
        <h1 className="font-heading text-2xl font-semibold text-[var(--v2-ink)]">Report not found</h1>
        <p className="mt-2 text-sm text-[var(--v2-muted)]">This share link is invalid or has expired on this device.</p>
        <Link
          href="/v2/login"
          className="mt-6 inline-flex items-center rounded-full bg-[var(--v2-primary)] px-4 py-2 text-sm font-semibold text-white"
        >
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
        <p className="text-xs tracking-widest text-[var(--v2-muted)] uppercase">Shared report</p>
        <h1 className="font-heading mt-1 text-2xl font-semibold text-[var(--v2-ink)]">
          {candidateCount} candidate{candidateCount === 1 ? "" : "s"} reviewed
        </h1>
        <p className="mt-1 text-xs text-[var(--v2-muted)]">Generated {generated}</p>
      </header>

      <div className="space-y-4">
        {snapshot.sections.map(section => (
          <article key={section.id} className="rounded-2xl border border-[var(--v2-ink)]/10 bg-[var(--v2-surface)] p-5">
            <h2 className="font-heading text-base font-semibold text-[var(--v2-ink)]">{section.title}</h2>
            <p className="mt-2 text-sm whitespace-pre-line text-[var(--v2-ink)]/85">{section.content}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
