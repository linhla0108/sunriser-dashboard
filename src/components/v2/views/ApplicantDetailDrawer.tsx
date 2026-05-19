"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { Applicant } from "@/lib/types"

interface ApplicantDetailDrawerProps {
  applicant: Applicant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ResultBadge({ result }: { result: string }) {
  if (result === "Passed") {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Passed</Badge>
  }
  if (result === "Failed") {
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed</Badge>
  }
  if (result === "Waiting list") {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Waiting list</Badge>
  }
  return <Badge variant="secondary">{result}</Badge>
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-1.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground text-sm">{children}</span>
    </div>
  )
}

export function ApplicantDetailDrawer({ applicant, open, onOpenChange }: ApplicantDetailDrawerProps) {
  const displayed = applicant

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-v2-glass-panel="strong" className="overflow-y-auto bg-card/90 backdrop-blur-xl">
        {displayed && (
          <>
            <SheetHeader>
              <SheetTitle>{displayed.name}</SheetTitle>
              <SheetDescription>{displayed.position1}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-4">
              <section>
                <h3 className="text-foreground mb-2 text-sm font-medium">Details</h3>
                <div data-v2-card="" className="border-border bg-card/80 rounded-lg border p-3">
                  <DetailRow label="University">{displayed.university}</DetailRow>
                  <DetailRow label="Year of Study">{displayed.yearOfStudy}</DetailRow>
                  <DetailRow label="GPA">{displayed.gpa.toFixed(1)}</DetailRow>
                  <DetailRow label="Batch">{displayed.batch}</DetailRow>
                </div>
              </section>

              <section>
                <h3 className="text-foreground mb-2 text-sm font-medium">Assessment</h3>
                <div data-v2-card="" className="border-border bg-card/80 rounded-lg border p-3">
                  <DetailRow label="Round 1">
                    {displayed.round1Result ? <ResultBadge result={displayed.round1Result} /> : <span className="text-muted-foreground">—</span>}
                  </DetailRow>
                  {displayed.round2Result && (
                    <DetailRow label="Round 2">
                      <ResultBadge result={displayed.round2Result} />
                    </DetailRow>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-foreground mb-2 text-sm font-medium">Contact</h3>
                <div data-v2-card="" className="border-border bg-card/80 rounded-lg border p-3">
                  <DetailRow label="Email">{displayed.email}</DetailRow>
                  {displayed.pic && <DetailRow label="PIC">{displayed.pic}</DetailRow>}
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
